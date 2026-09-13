data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# **********************************
#          EMAIL SQS QUEUE *
# **********************************

module "email_sqs_queue" {
  source = "terraform-aws-modules/sqs/aws"

  name                      = "email_service_sqs_queue"
  message_retention_seconds = 86400 # 24 hours retention
  delay_seconds             = 0
  max_message_size          = 262144
  receive_wait_time_seconds = 20
  tags = {
    Name = "email_service_sqs_queue"
  }
}



# **********************************
#          EMAIL SERVICE LAMBDA *
# **********************************
module "email_service_lambda" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "agroshare_email_service"
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  environment_variables = {
    AWS_SES_ENDPOINT = var.NODE_ENV == "dev" ? "http://localhost:4566" : null
    AWS_REGION       = data.aws_region.current.region
  }
  source_path                       = "${path.module}/../dist"
  artifacts_dir                     = "${path.module}/lambda-builds/"
  cloudwatch_logs_retention_in_days = 3
  create_lambda_function_url        = true
  allowed_triggers = {
    SESInvokeTrigger = {
      principal  = "sqs.amazonaws.com"
      source_arn = module.email_sqs_queue.queue_arn
    }
  }
  event_source_mapping = {
    sqs_queue_trigger = {
      event_source_arn = module.email_sqs_queue.queue_arn
      batch_size       = 8
      enabled          = true
    }
  }
  attach_policy_statements = true
  policy_statements = {
    "cloudwatch_logs" = {
      actions = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
      effect    = "Allow"
      resources = ["arn:aws:logs:*:*:*"]
    },
    "ses_send_email" = {
      effect    = "Allow"
      actions   = ["ses:SendRawEmail", "ses:SendEmail", "ses:SendTemplatedEmail", "ses:SendBulkTemplatedEmail"]
      resources = ["*"] # Restrict to your domain identity ARN variable in production if needed
    },
    "sqs_receive_delete" = {
      effect    = "Allow"
      actions   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
      resources = [module.email_sqs_queue.queue_arn]
    },
  }
  role_name = "agroshare_email_service_lambda_role"

}


# **********************************
#          EMAIL SERVICE MODULE
# **********************************

module "ses" {
  source  = "clouddrove/ses/aws"
  version = "1.3.4"

  name          = "agroshare_email_service"
  environment   = var.NODE_ENV
  enable_domain = var.NODE_ENV == "production"
  enable_email  = var.NODE_ENV == "dev"
  domain        = var.NODE_ENV == "dev" ? "" : var.domain_name
  emails        = var.NODE_ENV == "dev" ? ["developer@local.test"] : []
  managedby     = "Terraform"
  //Only if we are using Route53 domain
  //enable_spf_domain = var.NODE_ENV == "production"   
  //zone_id = "value"
}

module "ssm-parameter-store" {
  source  = "cloudposse/ssm-parameter-store/aws"
  version = "0.13.0"

  parameter_write = [
    {
      name  = "/agroshare/${var.NODE_ENV}/ses/domain_identity_arn"
      type  = "String"
      value = module.ses.domain_identity_arn != "" ? module.ses.domain_identity_arn : "arn:aws:ses:us-east-1:000000000000:identity/local-agroshare-mock"


      overwrite = "true"
    },
    {
      name      = "/agroshare/${var.NODE_ENV}/sqs/email_queue_url"
      type      = "String"
      value     = module.email_sqs_queue.queue_url
      overwrite = "true"
    }
  ]
}

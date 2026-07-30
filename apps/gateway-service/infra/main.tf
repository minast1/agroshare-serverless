resource "terraform_data" "lambda_esbuild_compiler" {
  triggers_replace = {
    code_hash = sha1(join("", [for f in fileset("${path.module}/..", "src/**/*.ts") : filesha1("${path.module}/../${f}")]))
  }

  provisioner "local-exec" {
    command = "cd ${path.module}/../../.. &&pnpm turbo run build:lambda --filter @repo/gateway-service"
    //working_dir = "${path.module}/.."
  }
}

data "archive_file" "custom_email_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../dist"
  output_path = "${path.module}/../.terraform_artifacts/lambda.zip"
  depends_on  = [terraform_data.lambda_esbuild_compiler]
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}


module "kms_key" {
  source      = "cloudposse/kms-key/aws"
  namespace   = "agroshare"
  stage       = var.environment
  name        = "gateway_service"
  description = "KMS key for gateway service"
}

# **********************************
#          CUSTOM EMAIL SENDING LAMBDA *
# **********************************
module "custom_email_lambda" {
  source        = "terraform-aws-modules/lambda/aws"
  function_name = "custom_email_lambda"
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  environment_variables = {
    AWS_ACCESS_KEY_ID     = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    AWS_SES_ENDPOINT      = var.environment == "dev" ? "http://localhost:4566" : null
    AWS_REGION            = data.aws_region.current.name
    RESEND_API_KEY        = var.resend_api_key
    //FROM_EMAIL_ADDRESS    = var.from_email_address
    //EMAIL_SENDING_ACCOUNT = var.email_sending_account
    //DOMAIN                = var.domain
  }
  create_package          = false
  local_existing_package  = "${path.module}/../.terraform_artifacts/lambda.zip"
  ignore_source_code_hash = true
  allowed_triggers = {
    Cognito = {
      principal  = "cognito-idp.amazonaws.com"
      source_arn = "arn:aws:cognito-idp:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:userpool/*"
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
    "ses_send_raw_email" = {
      effect    = "Allow"
      actions   = ["ses:SendRawEmail"]
      resources = ["*"]
    },
    "kms_decrypt" = {
      effect    = "Allow"
      actions   = ["kms:Decrypt", "kms:CreateGrant"]
      resources = ["*"]
    }
  }
  role_name = "custom_email_lambda_role"
  assume_role_policy_statements = {
    lambda_service = {
      effect  = "Allow"
      actions = ["sts:AssumeRole"]
      principals = {
        service_principal = {
          type        = "Service"
          identifiers = ["lambda.amazonaws.com"]
        }
      }
    }
  }
}


module "cognito_config" {
  source  = "clouddrove/cognito/aws"
  version = "1.0.2"

  label_order              = ["name", "environment"] //userpool naming convension name-environment
  environment              = var.environment
  name                     = "agroshare-userpool"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  # Password Policy 
  minimum_length    = 8
  require_lowercase = true
  require_uppercase = true
  require_numbers   = true
  require_symbols   = true

  #User Pool Clients (SuperAdmin Client & Admin Client) 
  clients = [
    {
      name                                 = "super_admin_client"
      generate_secret                      = false
      allowed_oauth_flows_user_pool_client = var.environment == "dev" ? false : true
      refresh_token_validity               = 30
      allowed_oauth_flows                  = ["code"]
      allowed_oauth_scopes                 = ["email", "openid", "profile"]
      supported_identity_providers         = ["COGNITO"]
      prevent_user_existence_errors        = "ENABLED"
      enable_token_revocation              = true
      explicit_auth_flows = [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH"
      ]
      callback_urls = ["https://localhost:3000"]
      logout_urls   = ["https://localhost:3000"]

    },
    {
      name                                 = "admin_client"
      generate_secret                      = false
      allowed_oauth_flows_user_pool_client = var.environment == "dev" ? false : true
      allowed_oauth_flows                  = ["code"]
      allowed_oauth_scopes                 = ["email", "openid", "profile"]
      prevent_user_existence_errors        = "ENABLED"
      enable_token_revocation              = true
      explicit_auth_flows = [
        "ALLOW_CUSTOM_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH"
      ]
      supported_identity_providers = ["COGNITO", "GOOGLE"]
      client_id                    = var.google_oauth_client_id
      client_secret                = var.google_oauth_client_secret

    }
  ]
  schema_attributes = [
    {
      name     = "role"
      type     = "String"
      mutable  = true
      required = true
    },
    {
      name     = "tenant_id"
      type     = "String"
      mutable  = false
      required = true
    },
    {
      name     = "tenant_type"
      type     = "String"
      mutable  = false
      required = true
    }
  ]
  lambda_custom_message = module.custom_email_lambda.lambda_function_arn
}

data "aws_cognito_user_pool_clients" "all_clients" {
  user_pool_id = module.cognito_config.user_pool_id
}

# # Google Identity Provider 
# resource "aws_cognito_identity_provider" "google" {
#   provider_details = {
#     "client_id"        = var.google_oauth_client_id,
#     "client_secret"    = var.google_oauth_client_secret,
#     "authorize_scopes" = "openid email profile https://www.googleapis.com/auth/youtube.readonly",
#   }
#   provider_name = "Google"
#   provider_type = "Google"
#   user_pool_id  = module.cognito_config.id

#   attribute_mapping = {
#     email       = "email"
#     given_name  = "given_name"
#     family_name = "family_name"
#     picture     = "picture"
#     username    = "sub"
#   }
# }

# **********************************
#          API GATEWAY             *
# **********************************

module "api_gateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "6.1.0"

  name          = "http_api"
  description   = "Central HTTP Gateway for all agroshare serverless microservices"
  protocol_type = "HTTP"

  cors_configuration = {
    allowed_origins = ["*"],
    allowed_methods = ["*"],
    allowed_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
  }

  create_domain_name    = var.environment == "dev" ? false : true
  create_domain_records = var.environment == "dev" ? false : true
  create_certificate    = var.environment == "dev" ? false : true
  stage_name            = var.environment

  authorizers = {
    "cognito" = {
      name            = "cognito_authorizer"
      authorizer_type = "JWT"
      identity_sources = [
        "$request.header.Authorization"
      ]
      jwt_configuration = {
        audience = data.aws_cognito_user_pool_clients.all_clients.client_ids
        issuer   = var.environment == "dev" ? "http://localhost:4566/${module.cognito_config.user_pool_id}" : "https://cognito-idp.${data.aws_region.current.region}.amazonaws.com/${module.cognito_config.user_pool_id}"
      }
    }
  }
  # routes = {
  #   "$default" = {
  #     authorizer_key = "cognito"
  #     integration = {
  #       // uri                    = module.payment_lambda.lambda_function_invoke_arn
  #       type                   = "AWS_PROXY"
  #       payload_format_version = "2.0"
  #     }
  #   }

  # }

  tags = {
    terraform = "true"

  }
}
//Write geteway_id, gateway_arn and authroizer_id to aws ssm parameter store

# module "ssm_iam_role" {
#   source           = "git::https://github.com/cloudposse/terraform-aws-ssm-iam-role.git?ref=master"
#   namespace        = "agroshare"
#   stage            = var.environment
#   name             = "api_gateway"
#   attributes       = ["all"]
#   account_id       = data.aws_caller_identity.current.account_id
#   kms_key_arn      = aws_kms_key.cognito.arn
#   ssm_parameters   = ["*"]
#   ssm_actions      = ["ssm:GetParametersByPath", "ssm:GetParameters"]
# }

module "ssm-parameter-store" {
  source  = "cloudposse/ssm-parameter-store/aws"
  version = "0.13.0"

  parameter_write = [
    {
      name      = "/agroshare/${var.environment}/api_gateway_id"
      type      = "String"
      value     = module.api_gateway.api_id
      overwrite = "true"
    },
    {
      name      = "/agroshare/${var.environment}/api_gateway_arn"
      type      = "String"
      value     = module.api_gateway.api_execution_arn
      overwrite = "true"
    },
    {
      name      = "/agroshare/${var.environment}/api_gateway_authorizer_id"
      type      = "String"
      value     = module.api_gateway.authorizers["cognito"].id
      overwrite = "true"
    }
  ]
}

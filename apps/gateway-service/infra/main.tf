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


# **********************************
#          CUSTOM EMAIL SENDING LAMBDA *
# **********************************
module "custom_email_lambda" {
  source                  = "terraform-aws-modules/lambda/aws"
  function_name           = "custom_email_lambda"
  handler                 = "index.handler"
  runtime                 = "nodejs22.x"
  create_package          = false
  local_existing_package  = "${path.module}/../.terraform_artifacts/lambda.zip"
  ignore_source_code_hash = true
  allowed_triggers = {
    Cognito = {
      principal  = "cognito-idp.amazonaws.com"
      source_arn = "arn:aws:cognito-idp:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:userpool/*"
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


module "kms_key" {
  source      = "cloudposse/kms-key/aws"
  namespace   = "agroshare"
  stage       = var.environment
  name        = "gateway_service"
  description = "KMS key for gateway service"
}


module "cognito_config" {
  source  = "SevenPico/cognito/aws"
  version = "1.0.0"

  environment = var.environment
  #Enable Pools
  enable_user_pool = true
  //enable_identity_pool = true
  user_pool_name = "agro-share-user-pool"
  stage          = var.environment

  # Custom email sender
  lambda_config_custom_email_sender = {
    lambda_arn     = module.custom_email_lambda.lambda_function_arn
    lambda_version = "V1_0"
  }

  # KMS key for encrypting email
  lambda_config_kms_key_id = module.kms_key.key_id


  #Advanced Security 
  //user_attribute_update_settings_require_verification_before_update = ["email"]

  #Basic Configuration
  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  #Password Policy
  password_policy_minimum_length    = 12
  password_policy_require_lowercase = true
  password_policy_require_uppercase = true
  password_policy_require_numbers   = true
  password_policy_require_symbols   = true

  #User Pool Clients (SuperAdmin Client & Admin Client)
  clients = [
    {
      client_name            = "super_admin_client"
      client_generate_secret = false
      client_explicit_auth_flows = [
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ]
      # callback_urls = [
      #   "${var.website_url}/admin/auth/callback"
      # ]
      logout_urls = [
        "${var.website_url}/admin/auth/logout"
      ]
    },
    {
      client_name            = "admin_client"
      client_generate_secret = false
      client_explicit_auth_flows = [
        "ALLOW_CUSTOM_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ]
      callback_urls = [
        "${var.website_url}/auth/callback"
      ]
      logout_urls = [
        "${var.website_url}/auth/logout"
      ]
    }
  ]
  # Custom Attributes
  schemas = [
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
}

# Google Identity Provider 
resource "aws_cognito_identity_provider" "google" {
  provider_details = {
    "client_id"        = var.google_oauth_client_id,
    "client_secret"    = var.google_oauth_client_secret,
    "authorize_scopes" = "openid email profile https://www.googleapis.com/auth/youtube.readonly",
  }
  provider_name = "Google"
  provider_type = "Google"
  user_pool_id  = module.cognito_config.id

  attribute_mapping = {
    email       = "email"
    given_name  = "given_name"
    family_name = "family_name"
    picture     = "picture"
    username    = "sub"
  }
}

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
        audience = [module.cognito_config.client_ids]
        issuer   = module.cognito_config.endpoint,
      }
    }
  }
  routes = {
    "$default" = {
      authorizer_key = "cognito"
      integration = {
        //uri = module.payment_lambda.invoke_arn
        uri                    = module.payment_lambda.lambda_function_invoke_arn
        type                   = "AWS_PROXY"
        payload_format_version = "2.0"
      }
    }

  }

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

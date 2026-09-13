
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_ssm_parameter" "ses_arn" {
  count = var.environment == "dev" ? 0 : 1
  name  = "/agroshare/${var.environment}/ses/domain_identity_arn"
}

# **********************************
#          COGNITO AUTHENTICATION LAMBDA *
# **********************************
module "cognito_auth_lambda" {
  source        = "terraform-aws-modules/lambda/aws"
  function_name = "cognito_auth_lambda"
  handler       = "index.handler"
  runtime       = "nodejs22.x"
  environment_variables = {
    AWS_SES_ENDPOINT = var.environment == "dev" ? "http://localhost:4566" : null
    AWS_REGION       = data.aws_region.current.region
    RESEND_API_KEY   = var.resend_api_key
  }
  source_path   = "${path.module}/../dist"
  artifacts_dir = "${path.module}/lambda-builds/"
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
      actions   = ["ses:SendRawEmail", "ses:SendEmail", "ses:SendTemplatedEmail", "ses:SendBulkTemplatedEmail"]
      resources = ["*"]
    },
    # "kms_decrypt" = {
    #   effect    = "Allow"
    #   actions   = ["kms:Decrypt", "kms:CreateGrant"]
    #   resources = ["*"]
    # },
    "cognito_user_profile_update_policy" = {
      effect = "Allow"
      actions = [
        "cognito-idp:AdminUpdateUserAttributes",
      ]
      resources = ["*"]
    }
  }
  role_name = "cognito_unified_auth_lambda_role"
}


resource "aws_cognito_user_pool" "main" {
  name                     = "agroshare-userpool"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  username_configuration {
    case_sensitive = false
  }
  #user_pool_tier           = "PLUS"
  # Password Policy 
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }


  #Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  schema {
    name                = "tenant_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }
  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      min_length = 0
      max_length = 30
    }
  }
  schema {
    name                = "tenant_type"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {
      min_length = 0
      max_length = 50
    }
  }


  #Email Configuration
  email_configuration {
    email_sending_account  = var.environment == "dev" ? "COGNITO_DEFAULT" : "DEVELOPER"
    from_email_address     = var.environment == "dev" ? "Agroshare Ghana <no-reply@agroshare.gh>" : "${var.domain}"
    reply_to_email_address = "support@agroshare.gh"
    source_arn             = var.environment == "dev" ? null : one(data.aws_ssm_parameter.ses_arn[*].value)
  }

  #Lambda Configurations 
  lambda_config {
    custom_message       = module.cognito_auth_lambda.lambda_function_arn
    post_confirmation    = module.cognito_auth_lambda.lambda_function_arn
    pre_token_generation = module.cognito_auth_lambda.lambda_function_arn
    pre_token_generation_config {
      lambda_arn     = module.cognito_auth_lambda.lambda_function_arn
      lambda_version = "V2_0"
    }
    user_migration                 = module.cognito_auth_lambda.lambda_function_arn
    pre_sign_up                    = module.cognito_auth_lambda.lambda_function_arn
    verify_auth_challenge_response = module.cognito_auth_lambda.lambda_function_arn
    define_auth_challenge          = module.cognito_auth_lambda.lambda_function_arn
    create_auth_challenge          = module.cognito_auth_lambda.lambda_function_arn
  }
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

}

# SuperAdmin Client
resource "aws_cognito_user_pool_client" "super_admin" {
  name                                 = "super_admin_client"
  user_pool_id                         = aws_cognito_user_pool.main.id
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  allowed_oauth_flows_user_pool_client = false
  allowed_oauth_flows                  = ["code"]
  generate_secret                      = false
  #Token Validity 
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
  prevent_user_existence_errors = "ENABLED"
  allowed_oauth_scopes          = ["email", "openid"]
  supported_identity_providers  = ["COGNITO"]
  read_attributes               = ["email", "custom:tenant_id", "custom:role", "custom:tenant_type"]
  write_attributes              = ["email", "custom:tenant_id", "custom:role", "custom:tenant_type"]
  enable_token_revocation       = true

}

# # Google Identity Provider 
resource "aws_cognito_identity_provider" "google" {
  provider_details = {
    "client_id"        = var.google_oauth_client_id,
    "client_secret"    = var.google_oauth_client_secret,
    "authorize_scopes" = "openid email profile",
  }
  provider_name = "Google"
  provider_type = "Google"
  user_pool_id  = aws_cognito_user_pool.main.id

  attribute_mapping = {
    email       = "email"
    given_name  = "given_name"
    family_name = "family_name"
    picture     = "picture"
    username    = "sub"
  }
}

# Tenant Admin Client
resource "aws_cognito_user_pool_client" "admin" {
  name                                 = "tenant_admin_client"
  user_pool_id                         = aws_cognito_user_pool.main.id
  explicit_auth_flows                  = ["ALLOW_CUSTOM_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = ["http://localhost:3000"]
  logout_urls                          = ["http://localhost:3000"]
  generate_secret                      = false
  #Token Validity 
  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
  prevent_user_existence_errors = "ENABLED"

  supported_identity_providers = ["COGNITO", aws_cognito_identity_provider.google.provider_name]
  read_attributes              = ["email", "custom:tenant_id", "custom:role", "custom:tenant_type"]
  write_attributes             = ["email", "custom:tenant_id", "custom:role", "custom:tenant_type"]
  enable_token_revocation      = true

}

data "aws_cognito_user_pool_clients" "all_clients" {
  user_pool_id = aws_cognito_user_pool.main.id
}

locals {
  target_users = {
    "default_admin" = {
      email    = var.super_admin_email
      tenant   = "default_tenant"
      type     = "vendor"
      role     = "admin"
      password = var.super_admin_password
    }
  }
}

resource "aws_cognito_user" "custom_users" {
  for_each = local.target_users

  user_pool_id = aws_cognito_user_pool.main.id
  username     = each.value.email
  attributes = {
    "custom:tenant_id"   = each.value.tenant
    "custom:role"        = each.value.role
    "custom:tenant_type" = each.value.type
    "email"              = each.value.email
    "email_verified"     = "true"
  }

  depends_on = [
    aws_cognito_user_pool.main
  ]
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
        audience = data.aws_cognito_user_pool_clients.all_clients.client_ids
        issuer   = var.environment == "dev" ? "http://localhost:4566/${aws_cognito_user_pool.main.id}" : "https://cognito-idp.${data.aws_region.current.region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
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

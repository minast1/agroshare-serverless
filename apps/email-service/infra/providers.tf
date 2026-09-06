
provider "aws" {
  region                      = "us-east-1"
  access_key                  = var.NODE_ENV == "dev" ? "test" : var.aws_access_key_id
  secret_key                  = var.NODE_ENV == "dev" ? "test" : var.aws_secret_access_key
  skip_metadata_api_check     = var.NODE_ENV == "dev" ? true : false
  skip_credentials_validation = var.NODE_ENV == "dev" ? true : false

  default_tags {
    tags = {
      Environment = var.NODE_ENV
      ManagedBy   = "Terraform"
      Project     = "Email-Service"
    }
  }


  dynamic "endpoints" {
    for_each = var.NODE_ENV == "dev" ? [1] : []
    content {
      // s3             = "http://localhost:4566"
      dynamodb = "http://localhost:4566"
      sqs      = "http://localhost:4566"
      sns      = "http://localhost:4566"
      lambda   = "http://localhost:4566"
      iam      = "http://localhost:4566"
      ses      = "http://localhost:4566"
      // ec2            = "http://localhost:4566"
      // ecs            = "http://localhost:4566"
      cloudformation = "http://localhost:4566"
      //route53        = "http://localhost:4566"
      cloudwatch     = "http://localhost:4566"
      cloudwatchlogs = "http://localhost:4566"
      secretsmanager = "http://localhost:4566"
      cognitoidp     = "http://localhost:4566"
      ssm            = "http://localhost:4566"
      kms            = "http://localhost:4566"
      // rds            = "http://localhost:4566"
      sts             = "http://localhost:4566"
      cognitoidentity = "http://localhost:4566"
      apigatewayv2    = "http://localhost:4566"
    }
  }
}


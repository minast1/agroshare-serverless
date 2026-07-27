provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_metadata_api_check     = true
  skip_credentials_validation = true


  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Project     = "Gateway-Auth"
    }
  }


  dynamic "endpoints" {
    for_each = var.environment == "dev" ? [1] : []
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
      sts          = "http://localhost:4566"
      apigatewayv2 = "http://localhost:4566"
    }
  }
}


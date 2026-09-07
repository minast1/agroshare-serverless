output "ses_domain_identity_arn" {
  value = module.ses.domain_identity_arn
}

output "ses_domain_identity_dns_records" {
  value = module.ses.id
}


output "email_service_url" {
  value       = module.email_service_lambda.lambda_function_url
  description = "The Email Service URL"
}

output "email_service_lambda_role_arn" {
  value       = module.email_service_lambda.role_arn
  description = "The Email Service Lambda Role ARN"
}

output "lambda_function_last_modified" {
  value       = module.email_service_lambda.lambda_function_last_modified
  description = "The last modified time of the Email Service Lambda"
}

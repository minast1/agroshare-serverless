output "local_api_url" {
  value       = "http://localhost:4566/_aws/execute-api/${module.api_gateway.api_id}/${module.api_gateway.stage_id}/"
  description = "The local HTTP API Gateway base URL on MiniStack"
}

output "user_pool_id" {
  value       = aws_cognito_user_pool.main.id
  description = "Cognito User Pool ID"
}

output "user_pool_arn" {
  value       = aws_cognito_user_pool.main.arn
  description = "Cognito User Pool ARN"
}

output "tenant_admin_client_id" {
  value       = aws_cognito_user_pool_client.admin.id
  description = "Cognito Tenant Admin Client ID"
}

output "super_admin_client_id" {
  value       = aws_cognito_user_pool_client.super_admin.id
  description = "Cognito Super Admin Client ID"
}

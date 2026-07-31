output "local_api_url" {
  value       = "http://localhost:4566/_aws/execute-api/${module.api_gateway.api_id}/${module.api_gateway.stage_id}/"
  description = "The local HTTP API Gateway base URL on MiniStack"
}

output "nextjs_user_pool_client_id" {
  value       = data.aws_cognito_user_pool_clients.all_clients
  description = "Inject this into NEXT_PUBLIC_USER_POOL_CLIENT_ID"
}

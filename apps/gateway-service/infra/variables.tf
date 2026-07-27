variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "The environment must be one of dev, test, or prod"
  }
}

variable "website_url" {
  type        = string
  description = "The URL of the frontend application (e.g., http://localhost:3000)"
}

variable "from_email_address" {
  type        = string
  description = "The from email address"
}

variable "email_sending_account" {
  type        = string
  description = "The email sending account"
}

variable "domain" {
  type        = string
  description = "The domain name"
}

variable "google_oauth_client_id" {
  type        = string
  description = "Google OAuth 2.0 Client ID for Cognito identity provider"
  sensitive   = true
}

variable "google_oauth_client_secret" {
  type        = string
  description = "Google OAuth 2.0 Client Secret for Cognito identity provider"
  sensitive   = true
}



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
      name      = "/agroshare/${var.NODE_ENV}/ses/domain_identity_arn"
      type      = "String"
      value     = module.ses.domain_identity_arn
      overwrite = "true"
    },
  ]
}

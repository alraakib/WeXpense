# Terraform Reference

## Core Concepts
- **IaC**: Declaratively define infrastructure in HCL
- **State**: `terraform.tfstate` tracks real-world resources
- **Provider**: Plugin that manages resources (AWS, GCP, Azure, K8s)
- **Module**: Reusable configuration package
- **Backend**: State storage location (S3, GCS, Azure Storage, Terraform Cloud)

## Key Commands
- `terraform init` — Initialize providers and backend
- `terraform plan` — Preview changes
- `terraform apply` — Apply changes
- `terraform destroy` — Destroy managed infrastructure
- `terraform fmt` — Format configuration files
- `terraform validate` — Validate configuration syntax
- `terraform state list` — List resources in state
- `terraform import <address> <id>` — Import existing resources

## HCL Syntax
```hcl
terraform {
  required_version = ">= 1.5"
  backend "s3" {
    bucket = "my-state-bucket"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"
  name = "my-vpc"
  cidr = "10.0.0.0/16"
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  subnet_id     = module.vpc.public_subnets[0]

  tags = {
    Name = "web-server"
  }
}
```

## Best Practices
- Use remote state with locking (DynamoDB, Consul)
- Never edit state files manually
- Use workspaces or directories for environments
- Pin provider versions with `~>` or `>=` constraints
- Use modules from registry with pinned versions
- Prefer `count`/`for_each` over duplicating resources
- Use `outputs` for cross-module references
- Store secrets in Vault or encrypted vars, not plaintext
- Use `terraform_remote_state` for cross-project dependencies
- Implement policy-as-code with Sentinel or OPA
- Use `prevent_destroy = true` on critical resources
- Use `lifecycle` blocks for `create_before_destroy` or `ignore_changes`

## State Management
- **Backends**: s3, gcs, azurerm, consul, terraform cloud
- **Locking**: Prevents concurrent modifications
- **State Migration**: `terraform init -migrate-state`
- **Sensitive Data**: Enable encryption at rest

## Testing
- `terraform validate` — Syntax checking
- `terraform plan` — Dry-run validation
- `terratest` — Go-based test framework
- `tfsec` / `checkov` — Security scanning
- `terraform-compliance` — BDD-style testing

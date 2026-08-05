# Cloud Provider Reference

## AWS
### Core Services
- **Compute**: EC2, ECS, EKS, Lambda, Fargate
- **Storage**: S3, EBS, EFS, Glacier
- **Database**: RDS, Aurora, DynamoDB, ElastiCache
- **Networking**: VPC, CloudFront, Route53, ELB/ALB/NLB
- **CI/CD**: CodePipeline, CodeBuild, CodeDeploy, CodeCommit
- **Monitoring**: CloudWatch, X-Ray, CloudTrail
- **Security**: IAM, KMS, WAF, Shield, Secrets Manager
- **Containers**: ECR, EKS, ECS

### Best Practices
- Use least-privilege IAM roles (instance profiles, IRSA for EKS)
- Enable S3 bucket versioning and encryption
- Use VPC endpoints for private connectivity to AWS services
- Enable CloudTrail for audit logging
- Use AWS Backup for automated backups
- Implement cost allocation tags
- Use ASG with multi-AZ for HA
- Enable termination protection on production resources

## GCP
### Core Services
- **Compute**: Compute Engine, GKE, Cloud Run, Cloud Functions
- **Storage**: Cloud Storage, Persistent Disk, Filestore
- **Database**: Cloud SQL, Cloud Spanner, Firestore, Memorystore
- **Networking**: VPC, Cloud CDN, Cloud DNS, Cloud Load Balancing
- **CI/CD**: Cloud Build, Cloud Deploy, Artifact Registry
- **Monitoring**: Cloud Monitoring, Cloud Logging, Cloud Trace
- **Security**: IAM, Cloud KMS, Cloud Armor, Secret Manager

### Best Practices
- Use GKE Workload Identity for fine-grained access
- Enable VPC Service Controls for data exfiltration prevention
- Use Cloud Armor for WAF and DDoS protection
- Use Cloud NAT for private cluster egress
- Enable Org Policies for governance

## Azure
### Core Services
- **Compute**: VMs, AKS, App Service, Azure Functions
- **Storage**: Blob Storage, Disk Storage, Files
- **Database**: Azure SQL, Cosmos DB, Redis Cache
- **Networking**: VNet, CDN, DNS, Load Balancer, Application Gateway
- **CI/CD**: Azure DevOps, Azure Pipelines, Container Registry
- **Monitoring**: Azure Monitor, Application Insights, Log Analytics
- **Security**: Entra ID, Key Vault, WAF, Defender for Cloud

### Best Practices
- Use Managed Identity instead of service principals
- Use Azure Policy for governance
- Enable Defender for Cloud for threat protection
- Use Availability Zones for HA
- Implement Azure Blueprints for environment standardization

## Multi-Cloud
- Use Terraform for consistent IaC across providers
- Use service mesh for multi-cloud connectivity
- Use cloud-agnostic monitoring (Prometheus + Grafana)
- Consider data residency and compliance requirements
- Use cloud-agnostic CI/CD tools (GitHub Actions, GitLab CI)

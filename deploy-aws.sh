#!/bin/bash
set -e

echo "🚀 EU AI Use Case Risk Classifier — AWS One-Click Deploy"
echo ""

# Configuration
STACK_NAME="eu-ai-use-case-risk-classifier"
AWS_REGION="${AWS_REGION:-ap-southeast-2}"
DOMAIN_NAME="${1:-}"

if [ -z "$DOMAIN_NAME" ]; then
  echo "Usage: ./deploy-aws.sh <domain-name>"
  echo "Example: ./deploy-aws.sh scanner.yourdomain.com"
  exit 1
fi

echo "Stack: $STACK_NAME"
echo "Region: $AWS_REGION"
echo "Domain: $DOMAIN_NAME"
echo ""

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI required. Install: https://docs.aws.amazon.com/cli/"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required. Install: https://docs.docker.com/get-docker/"; exit 1; }

# Get AWS account ID
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $AWS_ACCOUNT"

# Build and push backend container
echo ""
echo "🔨 Building backend Docker image..."
cd backend
docker build -t $STACK_NAME-backend:latest .
docker tag $STACK_NAME-backend:latest $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$STACK_NAME-backend:latest
cd ..

# Create ECR repo if not exists
echo ""
echo "📦 Setting up ECR..."
aws ecr describe-repositories --repository-names $STACK_NAME-backend --region $AWS_REGION >/dev/null 2>&1 || \
  aws ecr create-repository --repository-name $STACK_NAME-backend --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com

# Push image
docker push $AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$STACK_NAME-backend:latest

echo ""
echo "☁️  Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file aws/template.yaml \
  --stack-name $STACK_NAME \
  --region $AWS_REGION \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    DomainName=$DOMAIN_NAME \
    AwsAccountId=$AWS_ACCOUNT \
  --no-fail-on-empty-changeset

echo ""
echo "🌐 Getting CloudFront distribution ID..."
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text \
  --region $AWS_REGION)

# Build and deploy frontend
echo ""
echo "🔨 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Upload to S3
echo ""
echo "📤 Uploading frontend to S3..."
S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text \
  --region $AWS_REGION)

aws s3 sync frontend/dist s3://$S3_BUCKET/ --delete

# Invalidate CloudFront cache
echo ""
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --region $AWS_REGION

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 URLs:"
echo "  Frontend: https://$DOMAIN_NAME"
echo "  API: https://api.$DOMAIN_NAME"
echo ""

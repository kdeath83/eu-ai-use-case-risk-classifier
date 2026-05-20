# Deployment Guide

## Option 1: GitHub Pages (Static Demo)

The fastest way to see the scanner in action. Auto-deploys on every push to `main`.

### What you get
- Static frontend with mock API responses
- Full wizard works without a backend
- Classification reports with realistic simulated data
- Updated automatically via GitHub Actions

### How it works
The static build swaps the real API client for a mock classifier that runs the same logic locally in the browser. All 5 wizard steps work identically to the full-stack version.

### Manual build
```bash
cd frontend
npm ci
VITE_STATIC_BUILD=true npm run build
```

Output goes to `frontend/dist/` — ready for any static host.

### GitHub Actions
Already configured in `.github/workflows/deploy.yml`. Just push to `main` and the demo updates at:
`https://YOUR_USERNAME.github.io/ai-risk-scanner/`

---

## Option 2: AWS (Full Stack)

One-click production deployment to AWS ECS Fargate + S3/CloudFront.

### What you get
- **Backend:** Dockerized Node.js API running on ECS Fargate behind an Application Load Balancer
- **Frontend:** Static files served via CloudFront CDN backed by S3
- **Auto-scaling:** ECS service scales between 2–10 tasks based on CPU/memory
- **HTTPS:** CloudFront + ALB with automatic redirects
- **Cost:** ~$15–30/month for light usage (2 Fargate tasks + ALB + CloudFront + S3)

### Prerequisites
- AWS CLI installed and configured (`aws configure`)
- Docker installed and running
- A domain name (or use the ALB DNS name directly)
- Route 53 hosted zone for your domain (optional but recommended)

### One-Click Deploy
```bash
./deploy-aws.sh scanner.yourdomain.com
```

This script:
1. Builds and pushes the backend Docker image to ECR
2. Deploys the CloudFormation stack (VPC, ALB, ECS, S3, CloudFront)
3. Builds the frontend and uploads to S3
4. Invalidates the CloudFront cache

### CloudFormation Resources
The template (`aws/template.yaml`) creates:

| Resource | Purpose |
|----------|---------|
| VPC + 2 AZs | High-availability networking |
| Application Load Balancer | Routes traffic to ECS tasks |
| ECS Fargate Cluster | Container orchestration |
| ECR Repository | Docker image storage |
| S3 Bucket | Frontend static files |
| CloudFront Distribution | Global CDN + HTTPS |
| CloudWatch Logs | Container logging |

### DNS Setup
Point your domain's A/AAAA records to the CloudFront distribution:

```
scanner.yourdomain.com → CloudFront Distribution Domain
```

Or use Route 53 alias records for automatic failover.

### API Endpoint
The backend API is available at:
```
http://<ALB_DNS_NAME>/api
```

Update the frontend `VITE_API_URL` environment variable to point to your ALB before building:
```bash
VITE_API_URL=https://api.scanner.yourdomain.com npm run build
```

### Tear Down
```bash
aws cloudformation delete-stack --stack-name ai-risk-classifier
```

---

## Option 3: Docker Compose (Local/Private)

For self-hosted deployments or private networks.

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

```bash
docker-compose up --build
```

---

## Environment Variables

### Frontend
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000/api` | Backend API endpoint |
| `VITE_STATIC_BUILD` | `false` | Enable mock API for static hosting |

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

---

## Troubleshooting

### GitHub Pages 404 on refresh
CloudFront/S3 SPA routing is configured to serve `index.html` for all 404s. If using a different host, ensure similar fallback behavior.

### AWS deploy fails on ECR push
Make sure your IAM user/role has `ecr:CreateRepository`, `ecr:PutImage`, and `ecr:GetAuthorizationToken` permissions.

### ECS tasks keep restarting
Check CloudWatch Logs (`/ecs/ai-risk-classifier`) for startup errors. Common issue: Docker image not found in ECR.

### Frontend can't reach backend
Verify `VITE_API_URL` points to the correct ALB DNS or custom domain. CORS must be configured on the backend to allow the frontend origin.

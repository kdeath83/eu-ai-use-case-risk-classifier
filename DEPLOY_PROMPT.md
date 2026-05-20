You are adding deployment infrastructure to the AI Risk Classification Scanner project.

WORKSPACE: C:\Users\vasuk\.openclaw\workspace\ai-risk-classifier

## CONTEXT

This is a React + TypeScript frontend app that runs entirely client-side (no backend needed for the demo). It already uses HashRouter and has all classification logic in the frontend. The vite.config.ts already has `base: '/ai-risk-classifier/'` for GitHub Pages repo path.

## FILES TO CREATE

### 1. GitHub Pages Deployment

Create `.github/workflows/pages.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Build
        run: cd frontend && npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. AWS CDK Infrastructure

Create `infra/` directory with full AWS CDK TypeScript project for deploying:
- Frontend: S3 bucket + CloudFront distribution
- Backend: ECS Fargate + Application Load Balancer (optional — the demo doesn't need backend)

Files needed:
- `infra/package.json` with CDK deps
- `infra/tsconfig.json`
- `infra/cdk.json`
- `infra/bin/infra.ts` — CDK app entry point
- `infra/lib/frontend-stack.ts` — S3 + CloudFront stack
- `infra/lib/backend-stack.ts` — ECS Fargate stack (optional, for full deployment)

### 3. GitHub Actions for AWS

Create `.github/workflows/aws.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ap-southeast-2
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install CDK
        run: npm install -g aws-cdk
      - name: Install dependencies
        run: cd infra && npm ci
      - name: Deploy stack
        run: cd infra && cdk deploy --require-approval never
```

### 4. One-Click Deploy Script

Create `deploy-aws.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 AI Risk Classifier - AWS Deploy"
echo ""

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "❌ AWS CLI required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required"; exit 1; }
command -v cdk >/dev/null 2>&1 || { echo "Installing AWS CDK..."; npm install -g aws-cdk; }

# Bootstrap CDK if needed
echo "📦 Bootstrapping CDK..."
cdk bootstrap || true

# Deploy
echo "🚀 Deploying stack..."
cd infra && cdk deploy --require-approval never

echo "✅ Done! Check AWS CloudFormation console for outputs."
```

### 5. Update README

Update the README with:
- Clear "Deploy to GitHub Pages" button/instructions
- Clear "Deploy to AWS" button/instructions
- Prerequisites for each deployment path
- After-deploy URLs
- Architecture diagram (ASCII or description)

### 6. Update frontend/package.json

- Remove `gh-pages` from dependencies/scripts (GitHub Actions handles this now)
- Add `"homepage": "https://kdeath83.github.io/ai-risk-classifier"` field

### 7. Update vite.config.ts

Make `base` configurable via environment variable:
```typescript
base: process.env.VITE_BASE_PATH || '/ai-risk-classifier/',
```

## COMPLETION CHECKLIST

- [ ] `.github/workflows/pages.yml` exists
- [ ] `.github/workflows/aws.yml` exists
- [ ] `infra/` directory with full CDK project
- [ ] `deploy-aws.sh` exists and is executable
- [ ] `README.md` updated with deploy buttons
- [ ] `frontend/package.json` updated (gh-pages removed, homepage added)
- [ ] `frontend/vite.config.ts` has configurable base path
- [ ] All TypeScript compiles cleanly (frontend + infra)

Report back with: what was created, how to deploy, and any setup requirements.
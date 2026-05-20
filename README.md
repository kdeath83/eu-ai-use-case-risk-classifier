# EU AI Use Case Risk Classifier

EU AI Act Article 6 Compliance Assessment Tool for Financial Services Institutions.

## What It Does

This tool helps EU FSIs determine whether their AI system is **high-risk** under the EU AI Act Article 6 draft guidelines (May 2026). The entire frontend runs client-side — no backend server required for the GitHub Pages demo. It performs:

1. **Annex III Classification** — Parses system descriptions against 8 sectoral use cases with keyword-based confidence scoring
2. **Material Influence Scoring** — Assesses whether the system materially influences decision outcomes (0-100 scale)
3. **Profiling Detection** — Checks if the system processes personal data to evaluate personal aspects (GDPR Art 4(4) cross-check)
4. **Article 6(3) Filter Wizard** — Navigates the 5 cumulative filter conditions with guided decision logic
5. **Classification Report** — Generates a downloadable JSON report suitable for EU database registration (Article 6(4))

## One-Click Deployment

### GitHub Pages (Free Static Hosting)

The frontend can be deployed as a static site to GitHub Pages with zero backend required — all classification logic runs client-side.

**Prerequisites:**
- GitHub repository with this code
- GitHub Pages enabled in repo settings (Source: GitHub Actions)

**Deploy:**
1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys to `https://yourusername.github.io/ai-risk-classifier/`

**Or manually:**
```bash
cd frontend
npm install
npm run build
# Then push the dist/ folder to gh-pages branch, or use:
npm run deploy  # requires gh-pages npm package
```

### AWS (Full Stack with Backend)

Deploy the complete application (frontend + backend) to AWS using the provided CloudFormation template.

**Prerequisites:**
- AWS CLI configured with credentials
- Docker installed (for container build)

**One-click deploy:**
```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

This creates:
- Amazon ECS Fargate cluster (backend API)
- Amazon S3 + CloudFront (frontend static hosting)
- Application Load Balancer
- VPC with public/private subnets

**Or manual CloudFormation:**
```bash
aws cloudformation create-stack \
  --stack-name eu-ai-use-case-risk-classifier \
  --template-body file://aws/template.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=DomainName,ParameterValue=your-domain.com
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + React Router + Lucide React icons
- **Backend:** Node.js + Express + TypeScript + Zod validation (optional — frontend runs standalone)
- **Styling:** Custom CSS (no framework dependency)
- **Deployment:** GitHub Actions (GitHub Pages) or AWS CloudFormation (ECS Fargate + S3/CloudFront)

## Prerequisites

- Node.js 18+ and npm
- (For AWS deploy) AWS CLI + Docker

## Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000` (proxies `/api` to backend)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/classify` | Run full classification |
| POST | `/api/report/export` | Export JSON report (download) |
| POST | `/api/report/preview` | Preview report summary |

## Usage

1. Open `http://localhost:3000`
2. Click "Start Assessment"
3. Fill in system information (name, description, intended purpose, sector, autonomy level)
4. Complete the material influence questionnaire
5. Check profiling indicators
6. Review the Article 6(3) filter assessment
7. View the classification report and export as JSON

## Key Features

- **Anti-circumvention detection** — Flags broad marketing language that triggers "intended purpose" construction (para 12)
- **Live material influence score** — Visual score bar that updates as you answer questions
- **Profiling red flags** — Absolute exclusion warning if GDPR profiling indicators are detected
- **Decision-tree filter logic** — Clear visualization of which Article 6(3) conditions are satisfied
- **JSON export** — Machine-readable report format for compliance documentation

## Disclaimer

This tool provides automated analysis based on the EU AI Act draft guidelines (May 2026). It does **not** constitute legal advice. Always consult qualified legal counsel for definitive classification.

## License

MIT

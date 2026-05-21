# EU AI Use Case Risk Classifier

**EU AI Act Article 6 Compliance Assessment Tool for Financial Services Institutions**

An automated classifier that determines whether your AI system qualifies as **high-risk** under the EU AI Act, with specific support for **banking, insurance, superannuation/pension, credit scoring, wealth management, underwriting, lending, and other essential financial services** (Annex III, point 5). Built to help compliance teams, legal advisors, and risk officers in EU-regulated financial institutions navigate the Article 6 classification process, including the material influence assessment, profiling detection, and the Article 6(3) exemption filter.

## What It Does

This tool helps EU-regulated financial services institutions determine whether their AI system is **high-risk** under Regulation (EU) 2024/1689 (the EU AI Act), specifically focusing on **Article 6 classification** and the **Article 6(3) exemption filter**. It covers:

- **Banking** — credit scoring, loan approval, mortgage assessment, lending decisions
- **Insurance** — underwriting, claims processing, risk assessment, policy pricing
- **Superannuation / Pensions** — retirement fund management, pension eligibility, contribution assessment
- **Wealth Management** — investment advisory, portfolio management, financial planning
- **Essential Services** — access to emergency services, social benefits, public services

The entire frontend can run client-side — no backend server required for the GitHub Pages demo. It performs:

1. **Annex III Classification** — Parses system descriptions against 8 sectoral use cases with keyword-based confidence scoring, including point 5 (access to essential services) for financial institutions
2. **Material Influence Scoring** — Assesses whether the system materially influences decision outcomes (0-100 scale) per Article 6(3), with clear guidance that human oversight is a compliance requirement (Art. 14), not a classification avoidance mechanism
3. **Profiling Detection** — Checks if the system processes personal data to evaluate personal aspects (GDPR Art. 4(4) cross-check), which absolutely excludes the Art. 6(3) filter
4. **Article 6(3) Filter Wizard** — Navigates the 5 alternative filter conditions with guided decision logic
5. **Classification Report** — Generates a downloadable JSON report with **verified EU AI Act article citations**, priority-ranked next steps, and timeline context (high-risk obligations enter into force **2 August 2026**)
6. **Next Steps & Compliance Actions** — Provides article-cited action items for both providers and deployers, including critical items like risk management system (Art. 9), data governance (Art. 10), conformity assessment (Art. 43), CE marking (Art. 48), and EU database registration (Art. 49)

## One-Click Deployment

### GitHub Pages (Free Static Hosting)

The frontend can be deployed as a static site to GitHub Pages with zero backend required — all classification logic runs client-side.

**Prerequisites:**
- GitHub repository with this code
- GitHub Pages enabled in repo settings (Source: GitHub Actions)

**Deploy:**
1. Push to the `main` branch
2. GitHub Actions automatically builds and deploys to `https://yourusername.github.io/eu-ai-use-case-risk-classifier/`

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

- **Verified Article Citations** — Next steps include specific Regulation (EU) 2024/1689 article references with deadline context (e.g., Art. 9 risk management, Art. 10 data governance, Art. 43 conformity assessment, Art. 48 CE marking)
- **Provider vs. Deployer Role Separation** — Action items tagged for providers, deployers, or both, reflecting that most financial services institutions are deployers rather than providers
- **Conditional FRIA Flagging** — Fundamental Rights Impact Assessment (Art. 27) automatically flagged for public bodies, public service providers, and insurance/credit systems
- **Live material influence score** — Visual score bar that updates as you answer questions, with clear guidance on the distinction between compliance and classification
- **Profiling red flags** — Absolute exclusion warning if GDPR profiling indicators are detected, with explicit note that Art. 6(3) filter is INAPPLICABLE
- **Decision-tree filter logic** — Clear visualization of which Article 6(3) conditions are satisfied, with narrow interpretation guidance per draft guidelines
- **JSON export** — Machine-readable report format for compliance documentation and EU database registration (Art. 49(1) for high-risk, Art. 49(2) for filtered systems)
- **Circumvention awareness** — Warning that split architectures are assessed as a whole per draft guidelines para 75
- **Natural person scope check** — Credit scoring systems flagged with reminder that point 5(b) only applies to natural persons, not legal entities (draft guidelines paras 73-74)

## Disclaimer

This tool provides automated analysis based on **Regulation (EU) 2024/1689** (the EU AI Act) and the Commission's draft guidelines on high-risk AI classification. It does **not** constitute legal advice. Always consult qualified legal counsel for definitive classification.

Key limitations:
- **Classification depends on intended purpose**, not marketing language or technical architecture (Draft Guidelines para 77)
- **Human oversight does not affect Article 6(2) classification** — it is a compliance requirement for high-risk systems, not a classification avoidance mechanism (Draft Guidelines para 70)
- **Credit scoring (point 5b)** only applies when evaluating **natural persons** (individuals, sole traders, self-employed), not legal entities or companies (Draft Guidelines paras 73-74)
- **Broad marketing language** (e.g., "comprehensive," "all-in-one") is **not** a classification criterion — verify that the stated intended purpose matches actual use (Draft Guidelines para 77)

## License

MIT

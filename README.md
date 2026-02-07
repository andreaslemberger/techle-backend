# techle-backend

A serverless backend for the [Techle](../techle) web component that provides a daily word API — enabling a shared "word of the day" mode like NYT Wordle.

## Features

- **Daily word rotation** — A new tech word is served every 24 hours, switching at midnight Berlin time (CET/CEST)
- **Deterministic selection** — Everyone gets the same word on the same day
- **125 curated tech words** — Programming languages, frameworks, tools, DevOps concepts, and more — each with an explanatory description
- **Zero-database architecture** — Words are bundled with the function code, keeping costs near zero
- **Multi-cloud ready** — Core logic is cloud-agnostic; only the adapter layer is provider-specific

## Architecture

```
src/
├── core/           # Cloud-agnostic business logic (types, daily word algorithm)
├── data/           # Shared word data (used by all adapters)
└── aws/            # AWS adapter (CDK infrastructure + Lambda handler)
```

The `core/` and `data/` directories contain pure TypeScript with no cloud dependencies. Each cloud adapter imports from these shared modules and adds its own infrastructure and handler code.

## Adapters

Currently available:

| Adapter | Directory | Services |
|---------|-----------|----------|
| **AWS** | `src/aws/` | API Gateway HTTP API + Lambda |

### Contributing an adapter

The project is designed for additional cloud adapters. To add one (e.g. Azure, GCP), create a new directory under `src/` with:

1. A **handler** that imports `getDailyWord` from `core/daily-word` and `WORDS` from `data/words`, then returns the result as JSON
2. **Infrastructure-as-code** for the cloud provider (e.g. Bicep, Terraform, Pulumi)

The handler only needs to call:

```typescript
import { getDailyWord } from "../../core/daily-word.js";
import { WORDS } from "../../data/words.js";

const result = getDailyWord(WORDS);
// result: { word: "react", description: "A JavaScript library by...", date: "2026-02-05" }
```

Contributions are welcome!

## AWS Adapter

### Prerequisites

- Node.js 22+
- An AWS account with credentials configured (`aws configure` or environment variables)
- AWS CDK bootstrapped in your target account/region:
  ```bash
  npx cdk bootstrap aws://ACCOUNT_ID/eu-central-1
  ```

### Setup

```bash
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

```env
HOSTED_ZONE_ID=Z0123456789ABCDEFGHIJ   # Your Route53 hosted zone ID
DOMAIN_NAME=example.com                 # The hosted zone's domain name
API_SUBDOMAIN=techle-api                # Subdomain for the API
```

This configures a custom domain (`techle-api.example.com`) with an ACM certificate and Route53 alias record.

### Testing

```bash
npm test
```

### Deploy

```bash
npx cdk deploy
```

The `.env` file is loaded automatically. On completion, the stack outputs the API URL:

```
Outputs:
TechleStack.ApiUrl = https://techle-api.example.com
```

### API

#### `GET /daily-word`

Returns the daily tech word and its description.

**Example request:**

```bash
curl https://abc123.execute-api.eu-central-1.amazonaws.com/daily-word
```

**Example response:**

```json
{
  "word": "react",
  "description": "A JavaScript library by Meta for building user interfaces with components.",
  "date": "2026-02-05"
}
```

**Headers:**
- `Cache-Control: public, max-age=60`
- CORS enabled for all origins (`*`)

### Configuration

All configuration is done via the `.env` file (see `.env.example` for reference):

| Variable | Description | Example |
|----------|-------------|---------|
| `HOSTED_ZONE_ID` | Route53 hosted zone ID | `Z0123456789ABCDEFGHIJ` |
| `DOMAIN_NAME` | The hosted zone's domain name | `example.com` |
| `API_SUBDOMAIN` | Subdomain prefix for the API | `techle-api` |

The stack deploys to `eu-central-1` (Frankfurt) by default. Override via environment variable:

```bash
CDK_DEFAULT_REGION=us-east-1 npx cdk deploy
```

### Infrastructure

| Resource | Details |
|----------|---------|
| Lambda | Node.js 22, 128 MB memory, 10s timeout |
| API Gateway | HTTP API (v2) — ~70% cheaper than REST API |
| ACM Certificate | DNS-validated via the hosted zone |
| Route53 | A record alias pointing to the API Gateway custom domain |
| CORS | `GET` from all origins, 24h preflight cache |

### Teardown

```bash
npx cdk destroy
```

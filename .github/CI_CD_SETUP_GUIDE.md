# CI/CD Setup Guide for RemoteHire.io

This guide walks through setting up GitHub Actions CI/CD for the RemoteHire.io project.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [GitHub Secrets Configuration](#github-secrets-configuration)
3. [Branch Protection Rules](#branch-protection-rules)
4. [Workflow Overview](#workflow-overview)
5. [Running Workflows Locally](#running-workflows-locally)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### GitHub Repository Setup
1. Push code to GitHub
2. Ensure `.github/workflows/` directory is committed
3. Have owner/admin access to the repository

### External Services Required
- **Docker Hub** (for pushing images): https://hub.docker.com
- **Snyk** (for dependency scanning): https://snyk.io
- **SonarQube** (for code quality): https://sonarcloud.io
- **AWS Account** (for S3/CloudFront deployment)
- **PostgreSQL Database** (Supabase recommended)

---

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Database Secrets
```
DB_HOST              # Supabase or remote PostgreSQL host
DB_NAME              # Database name
DB_USER              # Database user
DB_PASSWORD          # Database password
DB_PORT              # Usually 5432
```

### AWS Credentials
```
AWS_ACCESS_KEY_ID       # AWS IAM access key
AWS_SECRET_ACCESS_KEY   # AWS IAM secret key
AWS_REGION              # e.g., eu-north-1
S3_STAGING_BUCKET       # S3 bucket name for staging
S3_PRODUCTION_BUCKET    # S3 bucket name for production
CLOUDFRONT_STAGING_ID   # CloudFront distribution ID
CLOUDFRONT_PRODUCTION_ID # CloudFront distribution ID
```

### Docker Hub Credentials (Optional)
```
DOCKER_USERNAME         # Docker Hub username
DOCKER_PASSWORD         # Docker Hub access token
```

### Third-Party Services
```
SNYK_TOKEN              # Snyk API token
SONAR_TOKEN             # SonarQube token
GITGUARDIAN_API_KEY     # GitGuardian API key (optional)
```

### OAuth Credentials (from .env)
```
GOOGLE_OAUTH_CLIENT_SECRET
GITHUB_OAUTH_CLIENT_SECRET
LINKEDIN_OAUTH_CLIENT_SECRET
GEMINI_API_KEY
```

### Setup Steps in GitHub UI

1. Go to: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add each secret with its value
4. Verify secrets are marked as masked in logs

---

## Branch Protection Rules

### Configure Main Branch Protection

1. Go to: **Settings → Branches → Add rule**
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require code reviews before merging (2 approvals)
   - ✅ Require conversation resolution before merging

4. Select required status checks:
   - `lint` (Backend)
   - `test` (Backend)
   - `security` (all)
   - `build` (Backend)
   - `backend` / `frontend` / `integration-tests`

5. Require code owners review: ✅

### Configure Dev Branch Protection

1. Branch name pattern: `dev` / `develop`
2. Similar settings but allow single approval
3. Status checks: same as main

---

## Workflow Overview

### 1. Backend CI/CD (`backend.yml`)

**Triggers**: Pushes to `main`/`dev`, PRs

**Pipeline**:
```
Lint (Black, isort, Flake8)
    ↓
Unit Tests (pytest)
    ↓
Security Scan (Safety, Bandit)
    ↓
Docker Build & Push
    ↓
Deploy to Staging/Production
```

**Status Checks**: `lint`, `test`, `security`, `build`

### 2. Frontend CI/CD (`frontend.yml`)

**Triggers**: Changes in `remotehire-frontend/`

**Pipeline**:
```
Lint & Format Check
    ↓
Build (Vite)
    ↓
Security Scan (npm audit, Snyk)
    ↓
Docker Build & Push
    ↓
Deploy to S3 + CloudFront Invalidation
```

**Status Checks**: `lint`, `build`, `security`

### 3. Integration Tests (`integration-tests.yml`)

**Triggers**: After backend/frontend workflows

**Tests**:
- API endpoint health checks
- E2E tests (Playwright/Cypress)
- Docker Compose integration
- Deepfake model validation

### 4. Security Scanning (`security.yml`)

**Scheduled**: Daily at 2 AM UTC

**Scans**:
- Dependency vulnerabilities (Safety, npm audit)
- Code analysis (Bandit, SonarQube)
- Secret detection (GitGuardian, TruffleHog)
- Container image scanning (Trivy)

---

## Running Workflows Locally

### Install Act (GitHub Actions Simulator)

```bash
# Windows (using Chocolatey)
choco install act

# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash
```

### Run a Specific Workflow

```bash
# Run backend workflow
act -j lint -f .github/workflows/backend.yml

# Run with secrets
act -s GITHUB_TOKEN=<your_token> -f .github/workflows/backend.yml

# Run all workflows on push event
act push
```

### List Available Jobs

```bash
act -l
```

---

## Troubleshooting

### Workflow Not Running

**Problem**: Workflow not triggering on push

**Solution**:
1. Check workflow file syntax (copy from templates)
2. Verify branch name matches trigger conditions
3. Check `.github/workflows/` is committed to main/dev
4. View workflow file in GitHub UI to see syntax errors

### Tests Failing in CI

**Problem**: Tests pass locally but fail in GitHub Actions

**Solutions**:
1. Use same Python/Node versions locally and in CI
2. Check `.env` file setup in workflow
3. Verify database connection in test environment
4. Check for environment-specific code paths

### Secret Not Found

**Problem**: `Error: secret 'X' not found`

**Solutions**:
1. Verify secret exists in GitHub Settings
2. Check secret name spelling (case-sensitive)
3. Reload page if just added
4. Use `${{ secrets.SECRET_NAME }}` format

### Docker Build Fails

**Problem**: Docker image build fails in CI

**Solutions**:
1. Test build locally: `docker build ./remotehire_backend`
2. Verify Dockerfile path is correct
3. Check base image availability
4. Verify all dependencies in requirements.txt

### Deployment Fails

**Problem**: Deployment to AWS/S3 fails

**Solutions**:
1. Verify AWS credentials are valid
2. Check S3 bucket exists and is accessible
3. Verify IAM user has S3 permissions
4. Test AWS CLI locally with same credentials

### Coverage Not Uploading

**Problem**: Codecov reports not uploading

**Solutions**:
1. Ensure coverage reports are generated
2. Verify codecov.yml configuration
3. Check repository is public or has Codecov access

---

## Monitoring Workflows

### View Workflow Status

1. Go to: **Actions tab** in GitHub
2. Select workflow from left sidebar
3. View recent runs

### View Workflow Logs

1. Click on a run
2. Click on a job
3. Expand step details

### Create Status Badge

Add to README.md:
```markdown
[![Backend CI/CD](https://github.com/YOUR_ORG/RemoteHire.io/actions/workflows/backend.yml/badge.svg)](https://github.com/YOUR_ORG/RemoteHire.io/actions/workflows/backend.yml)

[![Frontend CI/CD](https://github.com/YOUR_ORG/RemoteHire.io/actions/workflows/frontend.yml/badge.svg)](https://github.com/YOUR_ORG/RemoteHire.io/actions/workflows/frontend.yml)
```

---

## Next Steps

1. ✅ Add all required GitHub Secrets
2. ✅ Configure branch protection rules
3. ✅ Test workflows with a dummy PR
4. ✅ Monitor first deployment
5. ✅ Set up notifications (Slack integration)
6. ✅ Document deployment runbook

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Act - Local Workflow Tester](https://github.com/nektos/act)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Django Testing Guide](https://docs.djangoproject.com/en/5.2/topics/testing/)


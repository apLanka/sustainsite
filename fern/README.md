# SustainSite Fern documentation

This folder hosts [Fern](https://buildwithfern.com/) docs for **SE3040** submission: deployment, testing, test report, assignment PDF, and API reference material.

**Published site:** [https://sustain-site-api.docs.buildwithfern.com/](https://sustain-site-api.docs.buildwithfern.com/)

## Prerequisites

- Node.js ≥ 18 (same as the monorepo)
- [Fern CLI](https://buildwithfern.com/learn/cli-api-reference/cli-reference/overview): `npm i -g fern-api` (CLI command is typically `fern`)

## First-time setup

1. Edit **`fern.config.json`**: set `"organization"` to your Fern dashboard org (alphanumeric + hyphens).
2. Edit **`docs.yml`**: set `instances[0].url` to `{your-subdomain}.docs.buildwithfern.com` (must match the dashboard; no `https://` prefix). This repo uses `sustain-site-api.docs.buildwithfern.com`.

## Sync report pages from `docs/`

When `docs/DEPLOYMENT.md`, `docs/TESTING.md`, or `docs/TEST_REPORT.md` change, refresh the Fern MDX copies:

```bash
cd "$(git rev-parse --show-toplevel)"

prepend() { out="$1"; title="$2"; shift 2; {
  echo '---'
  echo "title: \"$title\""
  echo 'subtitle: "SE3040 — SustainSite"'
  echo '---'
  echo ''
  cat "$@"
} > "$out"; }

prepend fern/docs/pages/se3040/deployment-report.mdx "Deployment Report" docs/DEPLOYMENT.md
prepend fern/docs/pages/se3040/testing-instructions.mdx "Testing Instruction Report" docs/TESTING.md
prepend fern/docs/pages/se3040/test-report.mdx "Test Report" docs/TEST_REPORT.md
```

## Regenerate OpenAPI JSON

From the repo root:

```bash
npm run docs:export-openapi
```

Or from `apps/backend`:

```bash
npm run export-openapi-for-fern
```

REST paths are defined in `apps/backend/src/config/openapi.paths.ts` and merged in `swagger.ts`. Commit `fern/openapi/openapi.json` after you change that map or regenerate.

## Preview locally

```bash
cd fern
npx fern-api@0.56.12 docs dev
```

## Validate

From the repo root:

```bash
npm run docs:fern-check
npm run docs:fern-check-links
```

Or from `fern`:

```bash
npx fern-api@0.56.12 check --local
```

## Publish

```bash
fern login          # once
fern generate --docs
```

In CI, use `FERN_TOKEN` and `fern generate --docs --no-prompt` (see Fern publishing docs).

# @hmorix/cli – Official HMorix Command Line Interface

The official CLI tool for interacting with the **HMorix Enterprise Cloud Platform** (`https://hmorix.in`). Script workflows, inspect OpenAPI specs, and invoke autonomous AI agents directly from your shell or CI/CD pipelines.

## Installation

### Run instantly with npx:
```bash
npx @hmorix/cli status
```

### Install globally via npm:
```bash
npm install -g @hmorix/cli
```

## Available Commands

- `hmorix status` – Retrieve live platform component latencies and uptime.
- `hmorix health` – Check database and gateway health.
- `hmorix services` – List enterprise software packages and rates.
- `hmorix openapi` – Download or stream the OpenAPI 3.0 specification.
- `hmorix agent "<prompt>"` – Run an AI prompt through HMorix AI orchestration.
- `hmorix docs` – Print discoverable URLs for developer resources and machine interfaces.

## Environment Variables

- `HMORIX_API_KEY` – Pass your developer API key (`hm_live_...`).
- `HMORIX_API_URL` – Target a custom API gateway (defaults to `https://hmorix.in/api`).

## Links

- Homepage: [https://hmorix.in](https://hmorix.in)
- Developer Portal: [https://hmorix.in/developers](https://hmorix.in/developers)
- Public API Docs: [https://hmorix.in/docs](https://hmorix.in/docs)
- OpenAPI Specification: [https://hmorix.in/openapi.json](https://hmorix.in/openapi.json)

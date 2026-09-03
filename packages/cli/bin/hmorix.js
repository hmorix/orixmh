#!/usr/bin/env node

const https = require('https');
const http = require('http');

const API_BASE = process.env.HMORIX_API_URL || 'https://hmorix.in/api';
const API_KEY = process.env.HMORIX_API_KEY || '';

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'status': {
      console.log('Fetching HMorix platform status...');
      const res = await request(`${API_BASE}/status`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'health': {
      console.log('Probing HMorix health...');
      const res = await request(`${API_BASE}/health`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'services': {
      console.log('Fetching HMorix enterprise services...');
      const res = await request(`${API_BASE}/services`);
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'openapi': {
      console.log('Fetching HMorix OpenAPI 3.0 specification...');
      const res = await request('https://hmorix.in/openapi.json');
      console.log(JSON.stringify(res.data, null, 2));
      break;
    }
    case 'agent': {
      const prompt = args.slice(1).join(' ');
      if (!prompt) {
        console.error('Error: Please provide a prompt. Example: hmorix agent "Explain BillingFlow"');
        process.exit(1);
      }
      console.log(`Querying HMorix AI Agent: "${prompt}"...`);
      const res = await request(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      if (res.data && res.data.reply) {
        console.log('\nAI Response:\n', res.data.reply);
      } else {
        console.log(JSON.stringify(res.data, null, 2));
      }
      break;
    }
    case 'docs': {
      console.log('\nHMorix API Documentation: https://hmorix.in/docs');
      console.log('Developer Portal: https://hmorix.in/developers');
      console.log('OpenAPI Specification: https://hmorix.in/openapi.json');
      console.log('Pricing & Quotas: https://hmorix.in/pricing.md');
      console.log('Agent Instructions: https://hmorix.in/llms.txt\n');
      break;
    }
    case '-v':
    case '--version':
    case 'version': {
      console.log('@hmorix/cli v1.0.0');
      break;
    }
    case 'help':
    case '--help':
    case '-h':
    default: {
      console.log(`
HMorix Enterprise CLI Tool (@hmorix/cli)
Version: 1.0.0 | Website: https://hmorix.in

USAGE:
  hmorix <command> [arguments]
  npx @hmorix/cli <command>

COMMANDS:
  status            Check live platform uptime, metrics & component latencies
  health            Run a connectivity health check against database clusters
  services          List active enterprise software packages and base pricing
  openapi           Fetch and display the OpenAPI 3.0 specification (JSON)
  agent <prompt>    Submit an autonomous reasoning prompt to HMorix AI Assistant
  docs              Print public URLs for documentation and developer portal
  version           Show CLI version
  help              Show this help manual

ENVIRONMENT VARIABLES:
  HMORIX_API_KEY    Developer API key for authenticated operations
  HMORIX_API_URL    Custom API gateway URL (default: https://hmorix.in/api)
`);
      break;
    }
  }
}

main().catch(err => {
  console.error('CLI Error:', err.message);
  process.exit(1);
});

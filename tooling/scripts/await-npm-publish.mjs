#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const intervalMs = Number(process.env.NPM_PUBLISH_POLL_INTERVAL_MS ?? 15_000);
const timeoutMs = Number(process.env.NPM_PUBLISH_TIMEOUT_MS ?? 10 * 60_000);
const publishedPackagesJson = process.env.PUBLISHED_PACKAGES_JSON ?? '[]';

let publishedPackages;

try {
  publishedPackages = JSON.parse(publishedPackagesJson);
} catch (error) {
  console.error('Failed to parse PUBLISHED_PACKAGES_JSON as JSON.');
  console.error(error);
  process.exit(1);
}

if (!Array.isArray(publishedPackages) || publishedPackages.length === 0) {
  console.log(
    'No published packages reported by changesets. Skipping npm propagation wait.'
  );
  process.exit(0);
}

const packages = publishedPackages
  .filter(
    (pkg) =>
      pkg &&
      typeof pkg === 'object' &&
      typeof pkg.name === 'string' &&
      typeof pkg.version === 'string'
  )
  .map((pkg) => ({ name: pkg.name, version: pkg.version }));

if (packages.length === 0) {
  console.log(
    'No valid published packages found in changesets output. Skipping npm propagation wait.'
  );
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isPublished(pkg) {
  try {
    const { stdout } = await execFileAsync(
      'npm',
      ['view', `${pkg.name}@${pkg.version}`, 'version', '--json'],
      {
        env: {
          ...process.env,
          NO_UPDATE_NOTIFIER: '1',
          npm_config_fund: 'false',
          npm_config_loglevel: 'error',
        },
      }
    );

    const output = stdout.trim();

    if (!output) return false;

    try {
      const parsed = JSON.parse(output);

      return Array.isArray(parsed)
        ? parsed.includes(pkg.version)
        : parsed === pkg.version;
    } catch {
      return output.replace(/^"|"$/g, '') === pkg.version;
    }
  } catch {
    return false;
  }
}

const deadline = Date.now() + timeoutMs;
let attempt = 1;

while (Date.now() <= deadline) {
  const pendingPackages = [];

  for (const pkg of packages) {
    if (!(await isPublished(pkg))) {
      pendingPackages.push(pkg);
    }
  }

  if (pendingPackages.length === 0) {
    console.log('All published packages are available on npm.');
    process.exit(0);
  }

  console.log(
    `Attempt ${attempt}: waiting for npm propagation for ${pendingPackages
      .map((pkg) => `${pkg.name}@${pkg.version}`)
      .join(', ')}`
  );

  await sleep(intervalMs);
  attempt += 1;
}

console.error(
  `Timed out after ${timeoutMs}ms waiting for npm propagation for ${packages
    .map((pkg) => `${pkg.name}@${pkg.version}`)
    .join(', ')}`
);
process.exit(1);

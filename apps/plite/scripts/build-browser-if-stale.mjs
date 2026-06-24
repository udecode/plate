import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const browserRoot = path.join(repoRoot, 'packages/browser');

const sourceEntries = [
  path.join(browserRoot, 'src'),
  path.join(browserRoot, 'package.json'),
  path.join(browserRoot, 'tsconfig.json'),
  path.join(browserRoot, 'tsdown.config.mts'),
];

const requiredOutputs = [
  'core/index.js',
  'core/index.d.ts',
  'browser/index.js',
  'browser/index.d.ts',
  'playwright/index.js',
  'playwright/index.d.ts',
  'transports/index.js',
  'transports/index.d.ts',
].map((outputPath) => path.join(browserRoot, 'dist', outputPath));

const latestMtimeMs = (entryPath) => {
  const stat = fs.statSync(entryPath);

  if (!stat.isDirectory()) return stat.mtimeMs;

  let latest = stat.mtimeMs;

  for (const entry of fs.readdirSync(entryPath, { withFileTypes: true })) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue;

    latest = Math.max(latest, latestMtimeMs(path.join(entryPath, entry.name)));
  }

  return latest;
};

const outputsAreFresh = () => {
  if (requiredOutputs.some((outputPath) => !fs.existsSync(outputPath))) {
    return false;
  }

  const latestSourceMtime = Math.max(...sourceEntries.map(latestMtimeMs));
  const oldestOutputMtime = Math.min(
    ...requiredOutputs.map((outputPath) => fs.statSync(outputPath).mtimeMs)
  );

  return oldestOutputMtime >= latestSourceMtime;
};

if (outputsAreFresh()) {
  console.log('@platejs/browser dist is fresh');
  process.exit(0);
}

const result = spawnSync('pnpm', ['--filter', '@platejs/browser', 'build'], {
  cwd: repoRoot,
  shell: true,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);

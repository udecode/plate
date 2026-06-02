import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const topic = 'editor-frameworks';
const args = parseArgs(process.argv.slice(2));
const configPath = path.resolve(
  args.config || `research/${topic}-sources.json`
);
const cacheRoot = path.resolve(args.cache || `research/repos/${topic}`);
const dataRoot = path.resolve(args.data || `benchmarks/data/${topic}`);
const manifestPath = path.join(cacheRoot, 'manifest.json');
const timeoutMs = readInt(args.timeoutMs || args.timeout, 120_000);
const config = readConfig(configPath);
const manifest = {
  version: 1,
  topic: config.topic || topic,
  generatedAt: new Date().toISOString(),
  configPath: path.relative(process.cwd(), configPath),
  cacheRoot: path.relative(process.cwd(), cacheRoot),
  dataRoot: path.relative(process.cwd(), dataRoot),
  sources: [],
};

fs.mkdirSync(cacheRoot, { recursive: true });
fs.mkdirSync(dataRoot, { recursive: true });

for (const source of config.sources || []) {
  manifest.sources.push(await fetchSource(source));
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('wrote ' + path.relative(process.cwd(), manifestPath));
for (const source of manifest.sources) {
  console.log(
    `${source.name} ${source.type} ${source.status} ${source.localPath || source.error || ''}`
  );
}
if (manifest.sources.length === 0) {
  console.log(
    'no sources configured in ' + path.relative(process.cwd(), configPath)
  );
}

async function fetchSource(source) {
  const name = sanitizeName(
    source.name || source.package || source.url || source.path || 'source'
  );
  const type = source.type || inferType(source);
  try {
    if (type === 'git') return fetchGitSource(source, name);
    if (type === 'url') return await fetchUrlSource(source, name);
    if (type === 'npm') return await fetchNpmSource(source, name);
    if (type === 'file') return fetchFileSource(source, name);
    if (type === 'inline') return fetchInlineSource(source, name);
    return {
      name,
      type,
      status: 'unsupported',
      error: 'unknown source type: ' + type,
    };
  } catch (error) {
    return {
      name,
      type,
      url: source.url || null,
      status: 'error',
      error: error && error.stack ? error.stack : String(error),
    };
  }
}

function fetchGitSource(source, name) {
  if (!source.url) throw new Error('git source requires url');
  const localDir = path.join(cacheRoot, source.localName || name);
  if (!fs.existsSync(localDir)) {
    run('git', [
      'clone',
      '--filter=blob:none',
      '--depth',
      String(source.depth || 1),
      source.url,
      localDir,
    ]);
  } else if (args.update) {
    run('git', ['fetch', '--depth', String(source.depth || 1), 'origin'], {
      cwd: localDir,
    });
  }
  if (source.ref) run('git', ['checkout', source.ref], { cwd: localDir });
  const commit = run('git', ['rev-parse', 'HEAD'], {
    cwd: localDir,
    capture: true,
  }).stdout.trim();
  return {
    name,
    type: 'git',
    url: source.url,
    ref: source.ref || null,
    status: 'ok',
    commit,
    localPath: path.relative(process.cwd(), localDir),
  };
}

async function fetchUrlSource(source, name) {
  if (!source.url) throw new Error('url source requires url');
  const response = await fetch(source.url);
  if (!response.ok)
    throw new Error(source.url + ' returned HTTP ' + response.status);
  const bytes = Buffer.from(await response.arrayBuffer());
  const fileName =
    source.fileName ||
    path.basename(new URL(source.url).pathname) ||
    `${name}.bin`;
  const outPath = path.join(dataRoot, sanitizeFileName(fileName));
  fs.writeFileSync(outPath, bytes);
  return {
    name,
    type: 'url',
    url: source.url,
    status: 'ok',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    localPath: path.relative(process.cwd(), outPath),
  };
}

async function fetchNpmSource(source, name) {
  const packageName = source.package || source.name;
  if (!packageName) throw new Error('npm source requires package');
  const url = 'https://registry.npmjs.org/' + encodeURIComponent(packageName);
  const response = await fetch(url);
  if (!response.ok) throw new Error(url + ' returned HTTP ' + response.status);
  const text = await response.text();
  const outPath = path.join(
    dataRoot,
    sanitizeFileName(packageName) + '.npm.json'
  );
  fs.writeFileSync(outPath, text);
  return {
    name,
    type: 'npm',
    package: packageName,
    url,
    status: 'ok',
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
    localPath: path.relative(process.cwd(), outPath),
  };
}

function fetchFileSource(source, name) {
  if (!source.path) throw new Error('file source requires path');
  const from = path.resolve(source.path);
  const to = path.join(
    dataRoot,
    source.fileName ? sanitizeFileName(source.fileName) : path.basename(from)
  );
  fs.copyFileSync(from, to);
  const bytes = fs.readFileSync(to);
  return {
    name,
    type: 'file',
    status: 'ok',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    localPath: path.relative(process.cwd(), to),
  };
}

function fetchInlineSource(source, name) {
  const text = String(source.text || '');
  const outPath = path.join(
    dataRoot,
    sanitizeFileName(source.fileName || name + '.txt')
  );
  fs.writeFileSync(outPath, text);
  return {
    name,
    type: 'inline',
    status: 'ok',
    bytes: Buffer.byteLength(text),
    sha256: createHash('sha256').update(text).digest('hex'),
    localPath: path.relative(process.cwd(), outPath),
  };
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    timeout: timeoutMs,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      command +
        ' ' +
        commandArgs.join(' ') +
        ' failed with status ' +
        result.status +
        '\n' +
        (result.stderr || '')
    );
  }
  return result;
}

function readConfig(file) {
  if (!fs.existsSync(file)) return { version: 1, topic, sources: [] };
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function inferType(source) {
  if (source.package) return 'npm';
  if (source.path) return 'file';
  if (source.text) return 'inline';
  if (/\.git$|github\.com[:/]/.test(String(source.url || ''))) return 'git';
  return 'url';
}

function sanitizeName(value) {
  return (
    String(value || 'source')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^-|-$/g, '') || 'source'
  );
}

function sanitizeFileName(value) {
  return (
    String(value || 'source')
      .replace(/[/\\:]+/g, '-')
      .replace(/^-|-$/g, '') || 'source'
  );
}

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;
    const key = arg
      .slice(2)
      .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    if (key === 'update') out.update = true;
    else {
      out[key] = argv[i] || true;
      i++;
    }
  }
  return out;
}

function readInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

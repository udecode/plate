#!/usr/bin/env node
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { prove } from '../../.agents/pstack/proof.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const CATALOGS = 'docs/editor-behavior/scenarios';
const ENGINES = ['chromium', 'firefox', 'webkit'];
const LISTS = ['routes', 'paths', 'www-specs', 'plite-specs'];
const REQUIRED = ['feature', 'reference', ...LISTS];
const RUN_BUDGET_MS = 55 * 60_000;
const STEP_SECONDS = 3000;
const READY_MS = 15 * 60_000;
const SERVER_ATTEMPTS = 2;
const WWW_ENV = [
  'PLATE_WWW_PLITE=1',
  'PLATE_WWW_DYNAMIC_DOCS=1',
  'PLATE_WWW_DEV_SOURCE=1',
  'NEXT_PUBLIC_PLATE_WWW_NO_SYSTEM_THEME=1',
];
const USAGE =
  'usage: playtest.mjs scope [--root <checkout>] <file...> | specs <feature> --dir <run dir> [--base <commit>] [--engines chromium,firefox,webkit] [--port <port>]';

const git = (cwd, args) =>
  execFileSync('git', args, { cwd, encoding: 'utf-8' }).trim();

function parseCatalog(text, file) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: no front matter`);
  const fields = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (field) fields[field[1]] = field[2].trim();
  }
  for (const key of REQUIRED) {
    if (!fields[key]) throw new Error(`${file}: front matter lacks ${key}`);
  }
  for (const key of LISTS) {
    const list = fields[key].match(/^\[(.*)\]$/);
    if (!list) throw new Error(`${file}: ${key} must be a [a, b] list`);
    fields[key] = list[1]
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (
    fields.routes.length === 0 ||
    fields.routes.some((route) => !route.startsWith('/'))
  ) {
    throw new Error(`${file}: routes must list paths that start with /`);
  }
  if (!/^\|\s*S\d+\s*\|/m.test(match[2])) {
    throw new Error(`${file}: no scenario rows`);
  }
  return {
    feature: fields.feature,
    file,
    paths: fields.paths,
    pliteSpecs: fields['plite-specs'],
    routes: fields.routes,
    wwwSpecs: fields['www-specs'],
  };
}

export function readCatalogs(root) {
  return git(root, [
    'ls-files',
    '--cached',
    '--others',
    '--exclude-standard',
    '--',
    CATALOGS,
  ])
    .split('\n')
    .filter((file) => file.endsWith('.md') && existsSync(path.join(root, file)))
    .map((file) => {
      const catalog = parseCatalog(
        readFileSync(path.join(root, file), 'utf-8'),
        file
      );
      const missing = [
        ...catalog.wwwSpecs.map((spec) => `apps/www/${spec}`),
        ...catalog.pliteSpecs.map((spec) => `apps/plite/${spec}`),
        ...catalog.paths,
      ].filter((entry) => !existsSync(path.join(root, entry)));
      if (missing.length > 0) {
        throw new Error(`${file}: names missing paths ${missing.join(', ')}`);
      }
      return catalog;
    });
}

export function scope(root, files) {
  const relative = files.map((file) =>
    path.relative(root, path.resolve(root, file))
  );
  return readCatalogs(root).filter((catalog) =>
    catalog.paths.some((entry) =>
      relative.some((file) => file === entry || file.startsWith(`${entry}/`))
    )
  );
}

const SUMMARY_LINE = /^\s{4}\[([\w-]+)\] › (.+?):\d+:\d+ › (.+?)\s*$/;
const FAILURE_HEADER = /^\s+\d+\) \[([\w-]+)\] › (.+?):\d+:\d+ › (.+?)\s*$/;
const PASS_LINE =
  /^\s+✓\s+\d+ \[([\w-]+)\] › (.+?):\d+:\d+ › (.+?)(?: \(\d+(?:\.\d+)?(?:ms|s|m)\))?\s*$/;
const ERROR_LINE = /^\s+(\w*Error\b.*)$/;

const keyOf = (engine, file, title) => `${engine} › ${file} › ${title}`;

export function parseRun(log) {
  const lines = log.split('\n');
  const failures = new Map();
  const errors = new Map();
  const passes = new Set();
  let passed = 0;
  lines.forEach((line, index) => {
    const pass = line.match(PASS_LINE);
    if (pass) passes.add(keyOf(pass[1], pass[2], pass[3]));
    const count = line.match(/^\s+(\d+) passed\b/);
    if (count) passed += Number(count[1]);
    const header = line.match(FAILURE_HEADER);
    if (header) {
      const error = lines
        .slice(index + 1, index + 30)
        .map((next) => next.match(ERROR_LINE)?.[1])
        .find(Boolean);
      errors.set(keyOf(header[1], header[2], header[3]), error ?? '');
    }
    const summary = line.match(SUMMARY_LINE);
    if (summary) {
      const [, engine, file, title] = summary;
      failures.set(keyOf(engine, file, title), { engine, file, title });
    }
  });
  return {
    failures: [...failures].map(([key, failure]) => ({
      ...failure,
      error: errors.get(key)?.slice(0, 200) ?? '',
      key,
    })),
    passed,
    passes,
  };
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const grepFor = (failures) =>
  failures
    .map((failure) => escapeRegex(failure.title.replaceAll(' › ', ' ')))
    .join('|');

const portFree = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });

const stopGroup = (server) => {
  if (server.pid === undefined) return;
  try {
    process.kill(-server.pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
};

const answers = (url) =>
  fetch(url).then(
    (response) => response.ok,
    () => false
  );

function option(argv, name, fallback) {
  const index = argv.indexOf(name);
  return index === -1 ? fallback : argv[index + 1];
}

function pliteNode(root) {
  const wanted = readFileSync(path.join(root, '.nvmrc'), 'utf-8').trim();
  if (process.versions.node.split('.')[0] === wanted.replace(/^v/, '')) {
    return [];
  }
  if (spawnSync('fnm', ['--version']).status !== 0) {
    throw new Error(
      `Plite browser proof needs Node ${wanted} from .nvmrc and fnm is missing`
    );
  }
  return ['fnm', 'exec', `--using=${wanted}`, '--'];
}

function createRun({ dir, deadline }) {
  const servers = new Set();
  const stopAll = () => {
    for (const server of servers) stopGroup(server);
    servers.clear();
  };
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      stopAll();
      process.exit(1);
    });
  }
  process.on('exit', stopAll);

  const step = ({ name, cwd, command }) => {
    const left = Math.floor((deadline - Date.now()) / 1000) - 60;
    if (left < 60) return { exit: 'not run: time budget', parsed: null };
    const result = prove({
      command,
      cwd,
      dir,
      name,
      timeout: Math.min(STEP_SECONDS, left),
    });
    return {
      exit: result.exit,
      parsed: parseRun(readFileSync(result.path, 'utf-8')),
      path: result.path,
    };
  };

  const serve = async ({ checkout, port, prefix, route }) => {
    const www = path.join(checkout, 'apps/www');
    const built = step({
      command: ['env', 'PLATE_WWW_DYNAMIC_DOCS=1', 'pnpm', 'build:source:dev'],
      cwd: www,
      name: `${prefix}build-source`,
    });
    if (built.exit !== 0) {
      throw new Error(`build:source:dev ${built.path ?? built.exit}`);
    }
    const log = openSync(path.join(dir, `${prefix}server.log`), 'a');
    for (let attempt = 1; attempt <= SERVER_ATTEMPTS; attempt++) {
      const server = spawn(
        'env',
        [...WWW_ENV, 'pnpm', 'exec', 'next', 'dev', '--port', String(port)],
        { cwd: www, detached: true, stdio: ['ignore', log, log] }
      );
      servers.add(server);
      server.once('exit', () => servers.delete(server));
      const until = Math.min(Date.now() + READY_MS, deadline);
      while (servers.has(server) && Date.now() < until) {
        if (await answers(`http://localhost:${port}${route}`)) {
          return () => {
            servers.delete(server);
            stopGroup(server);
          };
        }
        await sleep(5000);
      }
      if (servers.has(server)) break;
    }
    throw new Error(
      `www on port ${port} never answered ${route}; see ${prefix}server.log`
    );
  };

  return { serve, step };
}

async function matrix(run, { catalog, checkout, engines, port, prefix, only }) {
  const runs = [];
  const www = path.join(checkout, 'apps/www');
  const wanted = engines.filter((engine) => !only || only.www.has(engine));
  if (wanted.length > 0) {
    const stop = await run.serve({
      checkout,
      port,
      prefix,
      route: catalog.routes[0],
    });
    for (const engine of wanted) {
      const failing = only?.www.get(engine);
      runs.push({
        engine,
        runner: 'www',
        ...run.step({
          command: [
            'env',
            `PLAYWRIGHT_BASE_URL=http://localhost:${port}`,
            'pnpm',
            'exec',
            'playwright',
            'test',
            '--config',
            'playwright.config.ts',
            `--project=${engine}`,
            '--retries=0',
            ...(failing ? ['--grep', grepFor(failing)] : []),
            ...(failing
              ? [...new Set(failing.map((failure) => failure.file))]
              : catalog.wwwSpecs),
          ],
          cwd: www,
          name: `${prefix}www-${engine}`,
        }),
      });
    }
    stop();
  }
  const pliteFiles = only
    ? [...new Set(only.plite.map((failure) => failure.file))]
    : catalog.pliteSpecs;
  if (pliteFiles.length > 0) {
    runs.push({
      engine: 'chromium',
      runner: 'plite',
      ...run.step({
        command: [
          ...pliteNode(checkout),
          'env',
          'PLITE_BROWSER_FORCE_PROOF=1',
          'pnpm',
          '--filter',
          'plite',
          'test:plite-browser:chromium',
          ...pliteFiles,
        ],
        cwd: checkout,
        name: `${prefix}plite-chromium`,
      }),
    });
  }
  return runs;
}

function failingOnly(failures) {
  const www = new Map();
  const plite = [];
  for (const failure of failures) {
    if (failure.runner === 'plite') plite.push(failure);
    else www.set(failure.engine, [...(www.get(failure.engine) ?? []), failure]);
  }
  return { plite, www };
}

export function verdict(failure, control) {
  if (!control.runs) return control.note;
  const run = control.runs.find(
    (each) => each.runner === failure.runner && each.engine === failure.engine
  );
  if (!run?.parsed) return run ? String(run.exit) : 'not run';
  const same = run.parsed.failures.find((each) => each.key === failure.key);
  if (same) {
    return same.error === failure.error
      ? 'fails the same'
      : `fails differently: ${same.error}`;
  }
  if (run.parsed.passes.has(failure.key)) return 'passes';
  return failure.runner === 'plite' ? 'passes or missing' : 'not found';
}

const cell = (text) =>
  String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');

function report({ catalog, controls, runs, tree }) {
  const failures = runs.flatMap((run) =>
    (run.parsed?.failures ?? []).map((failure) => ({
      ...failure,
      runner: run.runner,
    }))
  );
  const lines = [
    `# Spec matrix: ${catalog.feature}`,
    '',
    `Tree: ${tree}. Controls: ${
      controls.length > 0
        ? controls
            .map((control) => `${control.label} ${control.sha}`)
            .join(', ')
        : 'none'
    }.`,
    '',
    '| Run | Ref | Passed | Failed | Exit | Log |',
    '| --- | --- | --- | --- | --- | --- |',
    ...[
      ...runs.map((run) => ({ ...run, ref: 'tree' })),
      ...controls.flatMap((control) =>
        (control.runs ?? []).map((run) => ({ ...run, ref: control.label }))
      ),
    ].map(
      (run) =>
        `| ${run.runner} ${run.engine} | ${run.ref} | ${run.parsed?.passed ?? ''} | ${
          run.parsed?.failures.length ?? ''
        } | ${cell(run.exit)} | ${run.path ? `\`${path.basename(run.path)}\`` : ''} |`
    ),
  ];
  if (failures.length > 0) {
    lines.push(
      '',
      '## Failures',
      '',
      `| Runner | Engine | Spec | Test | Error |${controls
        .map((control) => ` ${control.label} |`)
        .join('')}`,
      `| --- | --- | --- | --- | --- |${controls.map(() => ' --- |').join('')}`,
      ...failures.map(
        (failure) =>
          `| ${failure.runner} | ${failure.engine} | ${cell(failure.file)} | ${cell(
            failure.title
          )} | ${cell(failure.error)} |${controls
            .map((control) => ` ${cell(verdict(failure, control))} |`)
            .join('')}`
      )
    );
  }
  return { failures, text: `${lines.join('\n')}\n` };
}

async function specs(argv) {
  const feature = argv[0];
  const dir = option(argv, '--dir');
  if (!feature || !dir) throw new Error(USAGE);
  const catalog = readCatalogs(ROOT).find((each) => each.feature === feature);
  if (!catalog) {
    throw new Error(
      `no catalog for ${feature} in ${CATALOGS}; write one as verify's playtest reference says`
    );
  }
  const engines = option(argv, '--engines', ENGINES.join(',')).split(',');
  const unknown = engines.filter((engine) => !ENGINES.includes(engine));
  if (unknown.length > 0) {
    throw new Error(`unknown engines ${unknown.join(', ')}`);
  }
  const port = Number(option(argv, '--port', '3611'));
  for (const each of [port, port + 1]) {
    if (!(await portFree(each))) {
      throw new Error(`port ${each} is in use; pass another --port`);
    }
  }
  const base = option(argv, '--base');
  const runDir = path.resolve(ROOT, dir);
  const run = createRun({ deadline: Date.now() + RUN_BUDGET_MS, dir: runDir });
  const head = git(ROOT, ['rev-parse', 'HEAD']);
  const dirty = git(ROOT, ['status', '--porcelain'])
    .split('\n')
    .filter(Boolean);
  const tree =
    dirty.length > 0
      ? `${head} plus ${dirty.length} uncommitted paths`
      : `${head}, clean`;

  const runs = await matrix(run, {
    catalog,
    checkout: ROOT,
    engines,
    port,
    prefix: '',
  });
  const treeFailures = report({ catalog, controls: [], runs, tree }).failures;
  const controls = [];
  if (treeFailures.length > 0) {
    if (dirty.length > 0) controls.push({ label: 'HEAD', sha: head });
    if (base) {
      controls.push({ label: base, sha: git(ROOT, ['rev-parse', base]) });
    }
  }
  for (const control of controls) {
    const prefix = `${control.label.replace(/[^\w.-]/g, '-')}-`;
    const worktree = path.join(
      tmpdir(),
      `playtest-${feature}-${prefix}${process.pid}`
    );
    const made = run.step({
      command: [
        'node',
        'tooling/scripts/proof-worktree.mjs',
        '--install',
        worktree,
        control.sha,
      ],
      cwd: ROOT,
      name: `${prefix}worktree`,
    });
    if (made.exit !== 0) {
      control.note = `worktree failed: ${made.path ?? made.exit}`;
      continue;
    }
    try {
      control.runs = await matrix(run, {
        catalog,
        checkout: worktree,
        engines,
        only: failingOnly(treeFailures),
        port: port + 1,
        prefix,
      });
    } catch (error) {
      control.note = `control failed: ${error.message}`;
    } finally {
      spawnSync('git', ['worktree', 'remove', '--force', worktree], {
        cwd: ROOT,
      });
    }
  }
  const { failures, text } = report({ catalog, controls, runs, tree });
  const attempt =
    Math.max(
      0,
      ...readdirSync(runDir).map((file) =>
        Number(file.match(/^specs-a(\d+)\.md$/)?.[1] ?? 0)
      )
    ) + 1;
  writeFileSync(path.join(runDir, `specs-a${attempt}.md`), text);
  console.info(text);
  const incomplete = runs.some(
    (each) => each.exit !== 0 && (each.parsed?.failures.length ?? 0) === 0
  );
  return failures.length > 0 || incomplete ? 1 : 0;
}

async function main(argv) {
  const [command, ...rest] = argv;
  if (command === 'scope') {
    const root = path.resolve(option(rest, '--root', ROOT));
    const files = rest.filter(
      (arg, index) => arg !== '--root' && rest[index - 1] !== '--root'
    );
    const found = scope(root, files);
    console.info(
      found.length > 0
        ? found
            .map((catalog) => `${catalog.feature}  ${catalog.file}`)
            .join('\n')
        : 'none: no scenario catalog covers these files'
    );
    return 0;
  }
  if (command === 'specs') return specs(rest);
  throw new Error(USAGE);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message);
      process.exit(2);
    }
  );
}

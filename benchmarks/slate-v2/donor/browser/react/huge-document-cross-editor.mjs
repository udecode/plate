import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { cpus, platform, release, totalmem } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { chromium, firefox, webkit } from '@playwright/test';

import { getWorkspaceSourceEntries } from '../../../../../config/workspace-source-entries.mjs';
import {
  adapterHelpers,
  adapterSource,
  surfaces as knownSurfaces,
} from './cross-editor-adapters.mjs';

import {
  extraOperations,
  runExtraOperation,
} from './cross-editor-extra-operations.mjs';

const runner = fileURLToPath(import.meta.url);
const repo = resolve(dirname(runner), '../../../../..');
const deps = resolve(
  process.env.CROSS_EDITOR_HUGE_DEPS ??
    resolve(dirname(runner), 'cross-editor-fixture'),
);
const wordgard = resolve(
  process.env.CROSS_EDITOR_HUGE_WORDGARD_REPO ?? resolve(repo, '../wordgard'),
);
const prosekit = resolve(
  process.env.CROSS_EDITOR_HUGE_PROSEKIT_REPO ?? resolve(repo, '../prosekit'),
);
const lexical = resolve(
  process.env.CROSS_EDITOR_HUGE_LEXICAL_REPO ?? resolve(repo, '../lexical'),
);
const slate = resolve(
  process.env.CROSS_EDITOR_HUGE_SLATE_REPO ?? resolve(repo, '../slate'),
);
const quill = resolve(
  process.env.CROSS_EDITOR_HUGE_QUILL_REPO ?? resolve(repo, '../quill'),
);
const temp = resolve(
  repo,
  process.env.CROSS_EDITOR_HUGE_TEMP ?? 'tmp/cross-editor-human-operations',
);
const output = resolve(
  repo,
  process.env.CROSS_EDITOR_HUGE_ARTIFACT ??
    'tmp/cross-editor-human-operations.json',
);
const split = (value) =>
  value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const selected = split(
  process.env.CROSS_EDITOR_HUGE_SURFACES ?? knownSurfaces.join(','),
);
const cohorts = split(process.env.CROSS_EDITOR_HUGE_BLOCKS ?? '100').map(
  Number,
);
const iterations = Number(process.env.CROSS_EDITOR_HUGE_ITERATIONS ?? 15);
const warmups = Number(process.env.CROSS_EDITOR_HUGE_WARMUPS ?? 3);
const chars = Number(process.env.CROSS_EDITOR_HUGE_CHARS ?? 80);
const counters = process.env.CROSS_EDITOR_HUGE_COUNTERS === '1';
const retained = process.env.CROSS_EDITOR_HUGE_RETAINED === '1';
const selectionIdle = process.env.CROSS_EDITOR_HUGE_SELECTION_IDLE === '1';
const defaultCompiler = process.env.CROSS_EDITOR_HUGE_COMPILER ?? '8';
const browserName = process.env.CROSS_EDITOR_HUGE_BROWSER ?? 'chromium';
const allOperations = [
  'first-type',
  'type-burst',
  'replace-selection',
  'backspace',
  'delete-forward',
  'split',
  'join',
  'move-left',
  'extend-selection',
  'bold-type',
  'undo',
  'redo',
  'paste-text',
  'paste-multiline',
  'paste-html',
  'cut',
  'scroll',
  'resize',
  'serialize',
  ...extraOperations,
];
const operations = split(
  process.env.CROSS_EDITOR_HUGE_OPERATIONS ?? allOperations.join(','),
);
const sourceSnapshot = new Map();
const sourceAfter = new Map();
const compilerEvents = new Map();
const bundles = new Map();
const sha = (value) => createHash('sha256').update(value).digest('hex');
const readFrozen = async (path) => {
  if (!sourceSnapshot.has(path)) sourceSnapshot.set(path, await readFile(path));
  return sourceSnapshot.get(path);
};
const sourceOverrides = process.env.CROSS_EDITOR_HUGE_SOURCE_OVERRIDES
  ? JSON.parse(
      (
        await readFrozen(
          resolve(process.env.CROSS_EDITOR_HUGE_SOURCE_OVERRIDES),
        )
      ).toString(),
    )
  : {};
const appliedOverrides = [];
const requireHere = createRequire(import.meta.url);
const requireDeps = createRequire(resolve(deps, 'package.json'));
const workspaceRequire = createRequire(
  resolve(repo, 'packages/plitejs/package.json'),
);
const vitestRequire = createRequire(
  workspaceRequire.resolve('vitest/package.json'),
);
const viteRequire = createRequire(vitestRequire.resolve('vite/package.json'));
const esbuild = requireHere(viteRequire.resolve('esbuild'));
const compilerPlugin = requireHere('babel-plugin-react-compiler');
const babel8 = requireHere('@babel/core');
const babel7 = requireHere(
  resolve(
    repo,
    'node_modules/.pnpm/@babel+core@7.29.0/node_modules/@babel/core/lib/index.js',
  ),
);
const typescript = requireDeps('typescript');
const lexicalVersion = JSON.parse(
  readFileSync(
    process.env.CROSS_EDITOR_HUGE_LEXICAL_REPO
      ? resolve(lexical, 'packages/lexical/package.json')
      : resolve(deps, 'node_modules/lexical/package.json'),
    'utf8',
  ),
).version;
const entries = new Map(
  getWorkspaceSourceEntries(repo).map(({ specifier, sourceEntry }) => [
    specifier,
    sourceEntry,
  ]),
);
entries.set(
  'cross-plite-dom-runtime',
  resolve(repo, 'packages/plitejs/src/react/editable/editable-dom-runtime.ts'),
);
entries.set(
  'cross-plite-kernel',
  resolve(repo, 'packages/plitejs/src/react/editable/editing-kernel.ts'),
);
entries.set(
  'cross-plite-render-profiler',
  resolve(repo, 'packages/plitejs/src/react/render-profiler.ts'),
);

assert(
  ['off', '7', '8'].includes(defaultCompiler),
  'Compiler must be off, 7, or 8',
);
for (const surface of selected) {
  const [name, variant, extra] = surface.split(':');
  assert(
    !extra &&
      (!variant ||
        ['off', 'compiler7', 'compiler8', 'retained', 'experiment'].includes(
          variant,
        )),
    `Unknown compiler/surface variant ${surface}`,
  );
  assert(
    !variant || ['plite', 'plate'].includes(name),
    `Compiler/retained variants only apply to local React source: ${surface}`,
  );
  assert(
    knownSurfaces.includes(surface.split(':')[0]),
    `Unknown surface ${surface}`,
  );
  assert(
    variant !== 'experiment' || sourceOverrides[surface]?.length > 0,
    `Missing source override for ${surface}`,
  );
}
for (const operation of operations)
  assert(allOperations.includes(operation), `Unknown operation ${operation}`);
for (const value of [...cohorts, iterations, chars])
  assert(
    Number.isInteger(value) && value > 0,
    'Cohorts, iterations and chars must be positive integers',
  );
assert(
  Number.isInteger(warmups) && warmups >= 0,
  'Warmups must be a nonnegative integer',
);
await mkdir(temp, { recursive: true });
await mkdir(dirname(output), { recursive: true });

const sourceExport = (entry) =>
  typeof entry === 'string' ? entry : (entry?.source ?? entry?.default?.source);
const lexicalPackageFiles = process.env.CROSS_EDITOR_HUGE_LEXICAL_REPO
  ? readdirSync(resolve(lexical, 'packages'), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((dir) => resolve(lexical, 'packages', dir.name, 'package.json'))
  : [
      resolve(deps, 'node_modules/lexical/package.json'),
      ...readdirSync(resolve(deps, 'node_modules/@lexical')).map((name) =>
        resolve(deps, 'node_modules/@lexical', name, 'package.json'),
      ),
    ];
for (const file of lexicalPackageFiles) {
  if (!existsSync(file)) continue;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  if (!pkg.name) continue;
  for (const [key, entry] of Object.entries(pkg.exports ?? {})) {
    const source = sourceExport(entry);
    if (source && !key.includes('*') && !source.includes('*'))
      entries.set(
        pkg.name + (key === '.' ? '' : key.slice(1)),
        resolve(dirname(file), source),
      );
  }
  if (
    !entries.has(pkg.name) &&
    existsSync(resolve(dirname(file), 'src/index.ts'))
  )
    entries.set(pkg.name, resolve(dirname(file), 'src/index.ts'));
}
for (const name of ['slate', 'slate-dom', 'slate-react', 'slate-history'])
  entries.set(name, resolve(slate, 'packages', name, 'src/index.ts'));
entries.set('quill', resolve(quill, 'packages/quill/src/quill.ts'));
entries.set('quill/core', resolve(quill, 'packages/quill/src/core.ts'));
entries.set(
  'quill/formats/bold',
  resolve(quill, 'packages/quill/src/formats/bold.ts'),
);
for (const name of [
  'doc',
  'state',
  'editor',
  'command',
  'history',
  'schema',
  'types',
  'table',
  'collab',
  'phrases',
])
  entries.set(`wordgard/${name}`, resolve(wordgard, `src/${name}/index.ts`));
for (const directory of ['core', 'basic', 'extensions', 'pm', 'react']) {
  const file = resolve(prosekit, 'packages', directory, 'package.json');
  if (!existsSync(file)) continue;
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  for (const [key, entry] of Object.entries(pkg.exports ?? {})) {
    if (typeof entry === 'string' && !key.includes('*'))
      entries.set(
        pkg.name + (key === '.' ? '' : key.slice(1)),
        resolve(dirname(file), entry),
      );
  }
}
const forceDeps =
  /^(?:react(?:-dom)?(?:\/|$)|@tiptap\/|prosemirror-|@ocavue\/|@marijn\/|orderedmap$|crelt$|style-mod$|parchment$|quill-delta$|eventemitter3$|lodash-es(?:\/|$))/;
const wordgardJavaScript = new Map();
if (selected.some((surface) => surface.split(':')[0] === 'wordgard')) {
  const roots = execFileSync('rg', ['--files', resolve(wordgard, 'src')], {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter((path) => path.endsWith('.ts'));
  const options = {
    target: typescript.ScriptTarget.ES2022,
    module: typescript.ModuleKind.ESNext,
    moduleResolution: typescript.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    types: [],
    baseUrl: wordgard,
    paths: {
      'wordgard/*': [resolve(wordgard, 'src/*')],
      '*': [resolve(deps, 'node_modules/*')],
    },
  };
  const host = typescript.createCompilerHost(options);
  const originalRead = host.readFile;
  host.readFile = (path) => {
    const text = originalRead(path);
    if (text !== undefined && !sourceSnapshot.has(path))
      sourceSnapshot.set(path, Buffer.from(text));
    return text;
  };
  const program = typescript.createProgram({ rootNames: roots, options, host });
  program.emit(undefined, (_path, contents, _bom, _error, sources) => {
    for (const source of sources ?? [])
      wordgardJavaScript.set(source.fileName, contents);
  });
  assert.equal(
    wordgardJavaScript.size,
    roots.length,
    'Wordgard TypeScript emit must cover its complete source input',
  );
}
const injected = `import {installRuntime} from ${JSON.stringify(resolve(dirname(runner), 'cross-editor-runtime.mjs'))};\ninstallRuntime(mount);\n${adapterHelpers}`;
for (const surface of selected) {
  const [name, variant] = surface.split(':');
  const compiler =
    variant && !['retained', 'experiment'].includes(variant)
      ? variant.replace('compiler', '')
      : name === 'plite' || name === 'plate'
        ? defaultCompiler
        : 'off';
  const compilerLog = [];
  const entry = resolve(temp, `${surface.replaceAll(':', '-')}.mjs`);
  await writeFile(entry, adapterSource(name) + injected);
  const build = await esbuild.build({
    absWorkingDir: repo,
    entryPoints: [entry],
    outfile: resolve(temp, 'bundle.js'),
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify: true,
    metafile: true,
    tsconfigRaw: {
      compilerOptions: { jsx: 'react-jsx', useDefineForClassFields: true },
    },
    nodePaths: [resolve(deps, 'node_modules'), resolve(repo, 'node_modules')],
    define: {
      'process.env.NODE_ENV': '"production"',
      __DEV__: 'false',
      'process.env.LEXICAL_VERSION': JSON.stringify(lexicalVersion),
    },
    plugins: [
      {
        name: 'exact-source-and-dependencies',
        setup(build) {
          build.onResolve(
            { filter: /.*/ },
            ({ path, pluginData, kind, importer }) => {
              if (pluginData?.forcedDependency) return;
              if (entries.has(path)) return { path: entries.get(path) };
              if (path.startsWith('@tiptap/'))
                return build.resolve(path, {
                  resolveDir: importer.includes('/node_modules/@tiptap/')
                    ? dirname(importer)
                    : deps,
                  kind,
                  pluginData: { forcedDependency: true },
                });
              if (forceDeps.test(path))
                return build.resolve(path, {
                  resolveDir: deps,
                  kind,
                  pluginData: { forcedDependency: true },
                });
            },
          );
          build.onLoad(
            { filter: /\.(?:[cm]?js|jsx|tsx?|json)$/ },
            async ({ path }) => {
              let contents = (await readFrozen(path)).toString();
              for (const override of sourceOverrides[surface] ?? []) {
                if (path !== resolve(repo, override.path)) continue;
                assert.equal(
                  sha(contents),
                  override.sha256,
                  `Experiment source drift: ${path}`,
                );
                const before = sha(contents);
                for (const replacement of override.replacements) {
                  assert.equal(
                    contents.split(replacement.before).length,
                    2,
                    `Experiment replacement must match exactly once: ${path}`,
                  );
                  contents = contents.replace(
                    replacement.before,
                    replacement.after,
                  );
                }
                appliedOverrides.push({
                  surface,
                  path,
                  before,
                  after: sha(contents),
                  replacements: override.replacements,
                });
              }
              const loader = path.endsWith('.tsx')
                ? 'tsx'
                : path.endsWith('.ts')
                  ? 'ts'
                  : path.endsWith('.jsx')
                    ? 'jsx'
                    : path.endsWith('.json')
                      ? 'json'
                      : 'js';
              if (path.startsWith(wordgard) && loader === 'ts') {
                assert(
                  wordgardJavaScript.has(path),
                  `Missing Wordgard emitted source ${path}`,
                );
                return { contents: wordgardJavaScript.get(path), loader: 'js' };
              }
              if (
                ['7', '8'].includes(compiler) &&
                path.startsWith(resolve(repo, 'packages')) &&
                !path.includes('/static/') &&
                ['ts', 'tsx', 'jsx', 'js'].includes(loader)
              ) {
                const babel = compiler === '7' ? babel7 : babel8;
                const result = await babel.transformAsync(contents, {
                  filename: path,
                  configFile: false,
                  babelrc: false,
                  parserOpts: {
                    sourceType: 'module',
                    plugins:
                      loader === 'tsx'
                        ? [['typescript', { isTSX: true }], 'jsx']
                        : loader === 'ts'
                          ? ['typescript']
                          : ['jsx'],
                  },
                  plugins: [
                    [
                      compilerPlugin,
                      {
                        target: '19',
                        logger: {
                          logEvent(filename, event) {
                            compilerLog.push({ filename, event });
                          },
                        },
                      },
                    ],
                  ],
                });
                contents = result.code;
              }
              return { contents, loader };
            },
          );
        },
      },
    ],
  });
  const buffer = Buffer.from(build.outputFiles[0].contents);
  await writeFile(resolve(temp, `${surface.replaceAll(':', '-')}.bundle.js`), buffer);
  bundles.set(surface, {
    buffer,
    sha256: sha(buffer),
    bytes: buffer.length,
    gzipBytes: gzipSync(buffer).length,
    compiler,
    inputs: Object.keys(build.metafile.inputs).map((p) => resolve(repo, p)),
  });
  assert(
    compiler === 'off'
      ? compilerLog.length === 0
      : compilerLog.some(({ event }) => event.kind === 'CompileSuccess'),
    `Compiler receipt does not match arm ${surface}`,
  );
  compilerEvents.set(surface, compilerLog);
  assert.equal(
    appliedOverrides.filter((item) => item.surface === surface).length,
    (sourceOverrides[surface] ?? []).length,
    `Unloaded experiment override: ${surface}`,
  );
  console.log(
    JSON.stringify({
      event: 'built',
      surface,
      compiler,
      bytes: buffer.length,
      inputs: build.metafile.inputs
        ? Object.keys(build.metafile.inputs).length
        : 0,
    }),
  );
}
for (const path of [
  runner,
  resolve(dirname(runner), 'cross-editor-adapters.mjs'),
  resolve(dirname(runner), 'cross-editor-runtime.mjs'),
  resolve(dirname(runner), 'cross-editor-extra-operations.mjs'),
  resolve(repo, 'config/workspace-source-entries.mjs'),
  resolve(repo, 'pnpm-lock.yaml'),
  resolve(deps, 'package-lock.json'),
])
  await readFrozen(path);
const identity = (path, declaredRef) => {
  const source = { path, ...(declaredRef ? { declaredRef } : {}) };
  try {
    const gitRoot = execFileSync(
      'git',
      ['-C', path, 'rev-parse', '--show-toplevel'],
      {
        encoding: 'utf8',
      },
    ).trim();
    if (realpathSync(gitRoot) !== realpathSync(path))
      return { ...source, kind: 'source-export-or-package' };
    return {
      ...source,
      kind: 'git-checkout',
      ref: execFileSync('git', ['-C', path, 'rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim(),
      remote: execFileSync('git', ['-C', path, 'remote', 'get-url', 'origin'], {
        encoding: 'utf8',
      }).trim(),
    };
  } catch {
    return { ...source, kind: 'source-export-or-package' };
  }
};
const css = `html{font:16px/24px Arial,sans-serif}body{margin:0;padding:32px}#app{width:760px;margin:0 auto}#app [contenteditable=true]{min-height:400px;outline:none;white-space:pre-wrap;overflow-wrap:break-word;tab-size:4}p{margin:0;min-height:24px}strong,b{font-weight:700}.ql-editor p{padding:0}.ProseMirror{position:relative}.wordgard-content{position:relative}`;
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const surface = url.searchParams.get('surface');
  if (url.pathname === '/bundle.js' && bundles.has(surface)) {
    res.setHeader('content-type', 'text/javascript');
    res.end(bundles.get(surface).buffer);
    return;
  }
  res.setHeader('content-type', 'text/html');
  res.end(
    `<!doctype html><meta charset="utf-8"><style>${css}</style><div id="app"></div><script type="module" src="/bundle.js?surface=${encodeURIComponent(surface ?? selected[0])}"></script>`,
  );
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browser = await { chromium, firefox, webkit }[browserName].launch({
  headless: process.env.CROSS_EDITOR_HUGE_HEADLESS !== '0',
});
const artifact = {
  schemaVersion: 2,
  startedAt: new Date().toISOString(),
  status: 'running',
  config: {
    selected,
    cohorts,
    iterations,
    warmups,
    chars,
    counters,
    retained,
    selectionIdle,
    operations,
    appliedOverrides,
    extraOperationContract: {
      payloadUTF16: 32768,
      wordKeys: 'macOS Option+Arrow; other platforms unsupported',
      lineKeys:
        'macOS Meta+ArrowLeft/Right, otherwise Home/End; exact single visual line required',
      documentKeys: 'macOS Meta+ArrowUp/Down, otherwise Control+Home/End',
      selectAllCopy:
        'unsupported: cross-paragraph clipboard separators and terminal newline policies remain unreconciled',
    },
    browserName,
    viewport: { width: 1280, height: 720 },
    dpr: 1,
    domStrategy: 'full',
    interleave: 'rotate surfaces by sample; same action sequence',
    clock:
      'First trusted event to last event-scheduled two-frame opportunity; not a verified paint or compositor timestamp. inputToVerifiedStateMs is an upper-bound snapshot-completion clock after extra settlement frames; text/format/clipboard oracles run afterward.',
    p99: 'omitted: fewer than 100 samples per cell',
  },
  identity: {
    machine: {
      platform: platform(),
      release: release(),
      cpus: cpus().map((c) => c.model),
      memory: totalmem(),
    },
    browser: browser.version(),
    node: process.version,
    repo: identity(repo),
    slate: identity(slate, process.env.CROSS_EDITOR_HUGE_SLATE_REF),
    lexical: process.env.CROSS_EDITOR_HUGE_LEXICAL_REPO
      ? identity(lexical)
      : {
          kind: 'published-source',
          version: lexicalVersion,
          packageRoot: resolve(deps, 'node_modules/lexical'),
        },
    quill: identity(quill, process.env.CROSS_EDITOR_HUGE_QUILL_REF),
    wordgard: identity(wordgard, process.env.CROSS_EDITOR_HUGE_WORDGARD_REF),
    prosekit: identity(prosekit, process.env.CROSS_EDITOR_HUGE_PROSEKIT_REF),
    dependencies: JSON.parse(
      await readFile(resolve(deps, 'package.json'), 'utf8'),
    ).dependencies,
  },
  bundles: Object.fromEntries(
    [...bundles].map(([key, { buffer, ...rest }]) => [key, rest]),
  ),
  attempts: [],
  errors: [],
};
const save = async () =>
  writeFile(output, JSON.stringify(artifact, null, 2) + '\n');
const compact = (s) => {
  const { lines, domLines, counters, ...rest } = s;
  const { events, ...counts } = counters ?? {};
  const inclusiveDurations = {};
  for (const event of events ?? []) {
    if (typeof event.duration !== 'number') continue;
    const key = `${event.kind}:${event.id ?? event.nodeKey ?? ''}`;
    const entry = (inclusiveDurations[key] ??= {
      calls: 0,
      totalMs: 0,
      maxMs: 0,
    });
    entry.calls++;
    entry.totalMs += event.duration;
    entry.maxMs = Math.max(entry.maxMs, event.duration);
  }
  return {
    ...rest,
    modelHash: sha(JSON.stringify(lines)),
    domHash: sha(JSON.stringify(domLines)),
    blockCount: lines.length,
    domBlockCount: domLines.length,
    textLength: lines.join('\n').length,
    counters: { ...counts, inclusiveDurations },
  };
};
const verify = (actual, expected, label) => {
  assert.deepEqual(actual.lines, expected, `${label}: model text differs`);
  assert.deepEqual(
    actual.domLines,
    expected,
    `${label}: rendered paragraph text differs`,
  );
};
const verifySelection = (actual, expected) => {
  assert.deepEqual(actual.selection, expected, 'Model selection differs');
  assert.deepEqual(
    {
      anchor: actual.nativeSelection.anchor,
      focus: actual.nativeSelection.focus,
    },
    expected,
    'Native paragraph/UTF-16 selection differs',
  );
  assert.equal(actual.focused, true, 'Editor is not focused');
  assert.equal(
    actual.nativeSelection.collapsed,
    expected.anchor.block === expected.focus.block &&
      expected.anchor.offset === expected.focus.offset,
    'Native selection collapsed state differs',
  );
};
const fixture = (count) =>
  Array.from({ length: count }, (_, i) =>
    `Paragraph ${String(i).padStart(6, '0')} alpha beta gamma delta. `
      .padEnd(chars, 'x')
      .slice(0, chars),
  );
const read = (page) => page.evaluate(() => crossEditor.snapshot());
const select = async (page, expected, block, from, to = from) => {
  const s = await page.evaluate(
    ([b, f, t]) => crossEditor.select(b, f, t),
    [block, from, to],
  );
  verify(s, expected, 'selection setup');
  verifySelection(s, {
    anchor: { block, offset: from },
    focus: { block, offset: to },
  });
  return s.selectionSetup;
};
const mutate = (lines, block, from, to, text) => {
  const replacement = (
    lines[block].slice(0, from) +
    text +
    lines[block].slice(to)
  ).split('\n');
  lines.splice(block, 1, ...replacement);
};
let context;
try {
  for (const count of cohorts)
    for (let sample = -warmups; sample < iterations; sample++) {
      const order = selected.map(
        (_, i) => selected[(i + sample + warmups) % selected.length],
      );
      for (const surface of order) {
        context = await browser.newContext({
          viewport: { width: 1280, height: 720 },
          deviceScaleFactor: 1,
          permissions:
            browserName === 'chromium'
              ? ['clipboard-read', 'clipboard-write']
              : [],
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.setDefaultTimeout(30000);
        const attempt = {
          surface,
          count,
          sample,
          warmup: sample < 0,
          results: [],
          status: 'running',
        };
        artifact.attempts.push(attempt);
        try {
          await page.goto(
            `http://127.0.0.1:${port}/?surface=${encodeURIComponent(surface)}`,
          );
          await page.waitForFunction(() => !!globalThis.crossEditor);
          const expected = fixture(count);
          const mounted = await page.evaluate(
            ([value, options]) => crossEditor.mount(value, options),
            [
              expected,
              {
                counters,
                retained: retained || surface.endsWith(':retained'),
                selectionIdle,
              },
            ],
          );
          verify(mounted, expected, 'mount');
          attempt.mount = compact(mounted);
          let redoExpected;
          let undoDocumentBefore, redoDocumentExpected;
          for (const operation of operations) {
            if (
              operation === 'paste-html' &&
              ['plite', 'slate'].includes(surface.split(':')[0])
            ) {
              attempt.results.push({
                operation,
                status: 'unsupported',
                kind: 'unsupported',
                reason:
                  'This minimal substrate fixture does not install an HTML mark deserializer',
              });
              continue;
            }
            if (extraOperations.includes(operation)) {
              let result;
              try {
                result = await runExtraOperation({
                  operation,
                  page,
                  expected,
                  browserName,
                  hostPlatform: platform(),
                  select,
                  verify,
                  verifySelection,
                  mutate,
                  compact,
                });
              } catch (error) {
                const failureTrace = await page.evaluate(() =>
                  crossEditor.abort(),
                );
                const state = await read(page);
                verify(
                  state,
                  expected,
                  `${operation}: state required for the next independent action`,
                );
                result = {
                  status: 'fail',
                  kind: 'failed-guard',
                  error: String(error.stack ?? error),
                  failureState: compact(state),
                  failureTrace,
                };
                console.error(
                  JSON.stringify({
                    event: 'failed-operation',
                    surface,
                    count,
                    sample,
                    operation,
                    error: error.message,
                  }),
                );
              }
              assert.equal(errors.length, 0, errors.join('\n'));
              attempt.results.push({ operation, ...result });
              continue;
            }
            const block =
              operation === 'first-type' ? 0 : Math.floor(expected.length / 2);
            const offset = Math.min(16, expected[block].length - 2);
            const cutExpected =
              operation === 'cut'
                ? expected[block].slice(offset, offset + 5)
                : null;
            let targetBlock = block;
            let from = offset,
              to = offset;
            if (operation === 'replace-selection' || operation === 'cut')
              to = offset + 5;
            if (operation === 'join') {
              targetBlock = Math.min(block + 1, expected.length - 1);
              from = 0;
              to = 0;
            }
            if (
              !['undo', 'redo', 'scroll', 'resize', 'serialize'].includes(
                operation,
              )
            )
              await select(page, expected, targetBlock, from, to);
            if (operation === 'undo') {
              await select(page, expected, block, offset);
              undoDocumentBefore = await page.evaluate(() =>
                crossEditor.documentValue(),
              );
              await page.waitForTimeout(1100);
              await page.keyboard.type('HISTORY');
              mutate(expected, block, offset, offset, 'HISTORY');
              await page.evaluate(
                () =>
                  new Promise((r) =>
                    requestAnimationFrame(() => requestAnimationFrame(r)),
                  ),
              );
              verify(await read(page), expected, 'undo preparation');
              redoExpected = [...expected];
              redoDocumentExpected = await page.evaluate(() =>
                crossEditor.documentValue(),
              );
              mutate(expected, block, offset, offset + 7, '');
            }
            if (operation.startsWith('paste')) {
              const plain =
                operation === 'paste-multiline'
                  ? 'pasted alpha\npasted beta'
                  : 'pasted text';
              await page.evaluate(
                async ({ plain, html }) => {
                  await navigator.clipboard.write([
                    new ClipboardItem({
                      'text/plain': new Blob([plain], { type: 'text/plain' }),
                      ...(html
                        ? {
                            'text/html': new Blob([html], {
                              type: 'text/html',
                            }),
                          }
                        : {}),
                    }),
                  ]);
                },
                {
                  plain,
                  html:
                    operation === 'paste-html'
                      ? '<strong>pasted text</strong>'
                      : null,
                },
              );
            }
            if (operation === 'serialize') {
              const result = await page.evaluate(() => crossEditor.serialize());
              assert.deepEqual(result.lines, expected);
              attempt.results.push({
                operation,
                durationMs: result.durationMs,
                bytes: result.bytes,
                status: 'pass',
                kind: 'command-serialization',
              });
              continue;
            }
            await page.evaluate(() => crossEditor.arm());
            if (operation === 'first-type') {
              await page.keyboard.type('Q');
              mutate(expected, block, offset, offset, 'Q');
            } else if (operation === 'type-burst') {
              await page.keyboard.type('abcdefghij');
              mutate(expected, block, offset, offset, 'abcdefghij');
            } else if (operation === 'replace-selection') {
              await page.keyboard.type('REPLACE');
              mutate(expected, block, offset, offset + 5, 'REPLACE');
            } else if (operation === 'backspace') {
              await page.keyboard.press('Backspace');
              mutate(expected, block, offset - 1, offset, '');
            } else if (operation === 'delete-forward') {
              await page.keyboard.press('Delete');
              mutate(expected, block, offset, offset + 1, '');
            } else if (operation === 'split') {
              await page.keyboard.press('Enter');
              mutate(expected, block, offset, offset, '\n');
            } else if (operation === 'join') {
              await page.keyboard.press('Backspace');
              expected[targetBlock - 1] += expected[targetBlock];
              expected.splice(targetBlock, 1);
            } else if (operation === 'move-left')
              await page.keyboard.press('ArrowLeft');
            else if (operation === 'extend-selection')
              await page.keyboard.press('Shift+ArrowRight');
            else if (operation === 'bold-type') {
              await page.keyboard.press('ControlOrMeta+b');
              await page.keyboard.type('BOLD');
              mutate(expected, block, offset, offset, 'BOLD');
            } else if (operation === 'undo')
              await page.keyboard.press('ControlOrMeta+z');
            else if (operation === 'redo') {
              assert(redoExpected, 'Redo requires undo in this sequence');
              await page.keyboard.press('ControlOrMeta+Shift+z');
              expected.splice(0, expected.length, ...redoExpected);
            } else if (
              operation === 'paste-text' ||
              operation === 'paste-html'
            ) {
              await page.keyboard.press('ControlOrMeta+v');
              mutate(expected, block, offset, offset, 'pasted text');
            } else if (operation === 'paste-multiline') {
              await page.keyboard.press('ControlOrMeta+v');
              mutate(
                expected,
                block,
                offset,
                offset,
                'pasted alpha\npasted beta',
              );
            } else if (operation === 'cut') {
              await page.keyboard.press('ControlOrMeta+x');
              mutate(expected, block, offset, offset + 5, '');
            } else if (operation === 'scroll') {
              await page.mouse.move(700, 500);
              await page.mouse.wheel(0, 3000);
            } else if (operation === 'resize')
              await page.setViewportSize({ width: 900, height: 720 });
            const expectedSelection =
              operation === 'move-left'
                ? {
                    anchor: { block, offset: offset - 1 },
                    focus: { block, offset: offset - 1 },
                  }
                : operation === 'extend-selection'
                  ? {
                      anchor: { block, offset },
                      focus: { block, offset: offset + 1 },
                    }
                  : undefined;
            const result = await page.evaluate(
              (selection) => crossEditor.finish(selection),
              expectedSelection,
            );
            verify(result, expected, operation);
            if (expectedSelection) verifySelection(result, expectedSelection);
            if (operation === 'bold-type' || operation === 'paste-html') {
              const insertedText =
                operation === 'bold-type' ? 'BOLD' : 'pasted text';
              result.format = await page.evaluate(
                ([block, from, to]) => crossEditor.format(block, from, to),
                [block, offset, offset + insertedText.length],
              );
              assert.equal(
                result.format.text,
                insertedText,
                'Format oracle targeted different text',
              );
              assert(
                result.format.modelBold,
                'Inserted text lacks the model bold mark',
              );
              assert(
                result.format.renderedBold,
                'Inserted text does not have computed bold weight',
              );
            }
            if (operation === 'undo' || operation === 'redo') {
              assert.deepEqual(
                await page.evaluate(() => crossEditor.documentValue()),
                operation === 'undo'
                  ? undoDocumentBefore
                  : redoDocumentExpected,
                'History did not restore the exact document including marks',
              );
            }
            if (operation.startsWith('paste'))
              assert(
                result.events.some((e) => e.type === 'paste' && e.isTrusted),
                'Missing trusted paste event',
              );
            if (operation === 'cut') {
              assert(
                result.events.some((e) => e.type === 'cut' && e.isTrusted),
                'Missing trusted cut event',
              );
              result.clipboardText = await page.evaluate(() =>
                navigator.clipboard.readText(),
              );
              assert.equal(
                result.clipboardText,
                cutExpected,
                'Cut clipboard text differs from the selected text',
              );
            }
            if (!['scroll', 'resize'].includes(operation))
              assert(
                result.events.some((e) => e.type === 'keydown' && e.isTrusted),
                'Missing trusted keyboard event',
              );
            if (operation === 'scroll')
              assert(
                result.scroll.outer > 0 || result.scroll.top > 0,
                'Wheel did not scroll',
              );
            assert.equal(errors.length, 0, errors.join('\n'));
            attempt.results.push({
              operation,
              ...compact(result),
              status: 'pass',
              kind: 'trusted-browser',
            });
          }
          attempt.status = attempt.results.some(
            (result) => result.status === 'fail',
          )
            ? 'fail'
            : attempt.results.some((result) => result.status === 'unsupported')
              ? 'incomplete'
              : 'pass';
        } catch (error) {
          attempt.status = 'fail';
          attempt.error = String(error.stack ?? error);
          attempt.failureState = await read(page)
            .then(compact)
            .catch(() => null);
          attempt.pageErrors = errors;
          const path = resolve(
            dirname(output),
            `${output
              .split('/')
              .at(-1)
              .replace(
                /\.json$/,
                '',
              )}-${surface.replaceAll(':', '-')}-${count}-${sample}-failure.png`,
          );
          await page.screenshot({ path, fullPage: false }).catch(() => {});
          attempt.screenshot = path;
          console.error(
            JSON.stringify({
              event: 'failed',
              surface,
              count,
              sample,
              completed: attempt.results.length,
              error: error.message,
            }),
          );
        }
        await context.close();
        context = null;
        await save();
        console.log(
          JSON.stringify({
            event: 'attempt',
            surface,
            count,
            sample,
            status: attempt.status,
            operations: attempt.results.length,
          }),
        );
      }
    }
} catch (error) {
  artifact.errors.push(String(error.stack ?? error));
} finally {
  await context?.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
for (const [path, bytes] of sourceSnapshot) {
  const after = await readFile(path).catch(() => Buffer.from('MISSING'));
  sourceAfter.set(path, {
    before: sha(bytes),
    after: sha(after),
    stable: sha(bytes) === sha(after),
  });
}
artifact.sources = Object.fromEntries(sourceAfter);
artifact.compilerEvents = Object.fromEntries(compilerEvents);
artifact.finishedAt = new Date().toISOString();
artifact.status =
  artifact.errors.length === 0 &&
  artifact.attempts.every(
    (a) => a.status === 'pass' || a.status === 'incomplete',
  ) &&
  [...sourceAfter.values()].every((v) => v.stable)
    ? artifact.attempts.some((attempt) => attempt.status === 'incomplete')
      ? 'incomplete'
      : 'pass'
    : 'fail';
const percentile = (values, p) => {
  const sorted = values
    .filter((x) => typeof x === 'number')
    .sort((a, b) => a - b);
  return sorted.length
    ? sorted[Math.min(sorted.length - 1, Math.ceil(p * sorted.length) - 1)]
    : null;
};
const stats = (values) => ({
  n: values.length,
  p50: percentile(values, 0.5),
  p75: percentile(values, 0.75),
  p95: percentile(values, 0.95),
  max: percentile(values, 1),
  iqr: percentile(values, 0.75) - percentile(values, 0.25),
});
artifact.summary = [];
for (const surface of selected)
  for (const count of cohorts) {
    const attempts = artifact.attempts.filter(
      (a) => a.surface === surface && a.count === count && !a.warmup,
    );
    artifact.summary.push({
      surface,
      count,
      operation: 'mount',
      passed: attempts.filter((a) => a.mount).length,
      attempted: attempts.length,
      twoFramesMs: stats(
        attempts.filter((a) => a.mount).map((a) => a.mount.mountToTwoFramesMs),
      ),
    });
    for (const operation of operations) {
      const rows = attempts.flatMap((a) =>
        a.results.filter((r) => r.operation === operation),
      );
      artifact.summary.push({
        surface,
        count,
        operation,
        passed: rows.filter((row) => row.status === 'pass').length,
        unsupported: rows
          .filter((row) => row.status === 'unsupported')
          .map((row) => row.reason),
        attempted: attempts.length,
        eventToFrameOpportunityMs: stats(
          rows.map((r) => r.eventToFrameOpportunityMs).filter((x) => x != null),
        ),
        verifiedStateMs: stats(
          rows.map((r) => r.inputToVerifiedStateMs).filter((x) => x != null),
        ),
        modelMs: stats(
          rows.map((r) => r.inputToModelMs).filter((x) => x != null),
        ),
        commandMs: stats(
          rows.map((r) => r.durationMs).filter((x) => x != null),
        ),
      });
    }
  }
await save();
console.log(
  JSON.stringify({
    event: 'complete',
    status: artifact.status,
    attempts: artifact.attempts.length,
    passed: artifact.attempts.filter((a) => a.status === 'pass').length,
    artifact: output,
  }),
);
process.exitCode = artifact.status === 'pass' ? 0 : 1;

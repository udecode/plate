// This iteration adapts the existing source-only compiler diagnostic and writes a separate receipt.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import compiler from 'babel-plugin-react-compiler';

const root = path.resolve(import.meta.dirname, '../../../..');
const require = createRequire(import.meta.url);
const controlVersion = process.argv
  .find((value) => value.startsWith('--control-babel='))
  ?.split('=')[1];
const babelPath = controlVersion
  ? path.join(
      root,
      `node_modules/.pnpm/@babel+core@${controlVersion}/node_modules/@babel/core`
    )
  : require.resolve('@babel/core');
const { transformSync, version: babelVersion } = require(babelPath);
const outputName = controlVersion
  ? `inventory-babel-${controlVersion}`
  : 'inventory';
const groups = [
  ['plite', 'packages/plitejs/src'],
  ['plate', 'packages/platejs/src'],
  ['registry', 'apps/www/src/registry'],
  ['www-shell', 'apps/www/src'],
];
const configs = [
  'apps/www/next.config.ts',
  'apps/plite/next.config.ts',
  'tooling/config/tsdown.config.ts',
  'oxlint.config.ts',
  'tooling/scripts/check-react-compiler-contract.mjs',
  'package.json',
  'packages/platejs/package.json',
  'packages/plitejs/package.json',
  'apps/www/package.json',
  'apps/plite/package.json',
];
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const files = execFileSync('rg', ['--files', ...groups.map(([, dir]) => dir)], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
  .filter(
    (file) =>
      !/(?:\.(?:spec|test|slow)\.[^/]+$|\/__tests__\/|\/__registry__\/)/.test(
        file
      )
  );
const rows = [];
for (const file of [...new Set(files)].sort()) {
  const source = readFileSync(path.join(root, file), 'utf8');
  const group = groups.find(([, dir]) => file.startsWith(`${dir}/`))[0];
  const events = [];
  const row = {
    file,
    group,
    sha256: sha256(source),
    lines: source.split('\n').length,
    staticBuildExcluded: file.includes('/static/'),
    noMemoDirectives: [...source.matchAll(/['"]use no memo['"]/g)].length,
    indicators: Object.fromEntries(
      [
        'useSyncExternalStore',
        'useEditorSelector',
        'useEditorState',
        'useEditorRuntimeState',
        'useNodeSelector',
        'useStateFieldValue',
        'createContext',
        'useContext',
        'useEffect',
        'useLayoutEffect',
        'useIsomorphicLayoutEffect',
        'useInsertionEffect',
        'useMemo',
        'useCallback',
        'useRef',
        'memo',
        'createPortal',
        'flushSync',
      ]
        .map((name) => [
          name,
          [
            ...source.matchAll(
              new RegExp(`\\b${name}\\s*(?:<[^;\\n]*?>)?\\s*\\(`, 'g')
            ),
          ].length,
        ])
        .filter(([, count]) => count > 0)
    ),
    events,
  };
  try {
    const result = transformSync(source, {
      filename: path.join(root, file),
      configFile: false,
      babelrc: false,
      parserOpts: {
        plugins: file.endsWith('x')
          ? [['typescript', { isTSX: true }], 'jsx']
          : ['typescript'],
        sourceType: 'module',
      },
      plugins: [
        [
          compiler,
          {
            target: '19',
            logger: { logEvent: (_filename, event) => events.push(event) },
          },
        ],
      ],
    });
    row.outputSha256 = sha256(result.code);
    row.compilerRuntimeImport = result.code.includes('react/compiler-runtime');
  } catch (error) {
    row.transformError = String(error.message);
  }
  rows.push(row);
}
const counts = {};
for (const row of rows) {
  const count = (counts[row.group] ??= {
    files: 0,
    filesWithCompilerRuntime: 0,
    filesWithEvents: 0,
    noMemoDirectives: 0,
    transformErrors: 0,
    events: {},
  });
  count.files++;
  count.filesWithCompilerRuntime += Number(row.compilerRuntimeImport === true);
  count.filesWithEvents += Number(row.events.length > 0);
  count.noMemoDirectives += row.noMemoDirectives;
  count.transformErrors += Number(Boolean(row.transformError));
  for (const event of row.events)
    count.events[event.kind] = (count.events[event.kind] ?? 0) + 1;
}
const report = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  babelVersion,
  babelPath,
  head: execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim(),
  method:
    'Babel source-only diagnostic probe with installed Compiler 1.0.0, target 19, default infer, per-file hashes. Includes static sources for inventory; tsdown excludes them. Not Next Rust Compiler output, runtime timing, AST hook counts, or proof of published artifacts.',
  configs: configs.map((file) => ({
    file,
    sha256: sha256(readFileSync(path.join(root, file))),
  })),
  inputsUnchanged: rows.every(
    (row) => sha256(readFileSync(path.join(root, row.file))) === row.sha256
  ),
  counts,
  rows,
};
writeFileSync(
  path.join(
    root,
    'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2',
    `react-compiler-${outputName}.json`
  ),
  `${JSON.stringify(report, null, 2)}\n`
);
console.log(
  JSON.stringify(
    {
      head: report.head,
      babelVersion,
      inputsUnchanged: report.inputsUnchanged,
      counts,
    },
    null,
    2
  )
);

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from '@babel/parser';

const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const capturedAt = new Date().toISOString();
const hash = (source) => createHash('sha256').update(source).digest('hex');
const run = (cwd, ...args) =>
  execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const testPattern =
  /(^|\/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(\/|$)|\.(test|spec|bench)\.[cm]?[jt]sx?$/;
const excludePattern =
  /(^|\/)(dist|build|coverage|node_modules|vendor|generated|__snapshots__)(\/|$)/;
const walk = (node, callback) => {
  if (!node || typeof node !== 'object') return;
  if (node.type) callback(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'start', 'end', 'extra', 'comments', 'tokens'].includes(key))
      continue;
    if (Array.isArray(value)) value.forEach((child) => walk(child, callback));
    else if (value && typeof value === 'object') walk(value, callback);
  }
};
const calleeParts = (node) =>
  node?.type === 'Identifier'
    ? [node.name]
    : node?.type === 'MemberExpression' ||
        node?.type === 'OptionalMemberExpression'
      ? [...calleeParts(node.object), node.property.name ?? node.property.value]
      : node?.type === 'CallExpression'
        ? calleeParts(node.callee)
        : [];

for (const name of ['wordgard', 'prosekit']) {
  const root = resolve(`../${name}`);
  const head = run(root, 'rev-parse', 'HEAD');
  const clean = run(root, 'status', '--porcelain') === '';
  if (!clean) throw new Error(`${name}: reference checkout is not clean`);
  const oldInventory = readFileSync(
    `docs/editor-test-harvester/${name}/inventory.md`,
    'utf8'
  );
  if (!oldInventory.includes(head))
    throw new Error(
      `${name}: previous inventory source pin differs; reclassify changed files first`
    );
  const classifications = new Map();
  for (const line of oldInventory.split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim());
    if (!cells[1]?.startsWith('`')) continue;
    const file = cells[1].replaceAll('`', '').replace(`../${name}/`, '');
    const categoryIndex = cells.findIndex((cell) =>
      /^(portable|portable-mixed|plate-owned|skip|harness|product-shell|uncertain)$/.test(
        cell
      )
    );
    if (categoryIndex !== -1)
      classifications.set(file, {
        category: cells[categoryIndex],
        reason: cells[categoryIndex + 1],
      });
  }
  const allFiles = execFileSync('rg', ['--files'], {
    cwd: root,
    encoding: 'utf8',
  })
    .trim()
    .split('\n');
  const files = allFiles
    .filter((file) =>
      name === 'wordgard'
        ? /^test\/.*\.ts$/.test(file)
        : testPattern.test(file) && !excludePattern.test(file)
    )
    .sort();
  const missing = files.filter((file) => !classifications.has(file));
  const removed = [...classifications.keys()].filter(
    (file) => !files.includes(file)
  );
  if (missing.length || removed.length)
    throw new Error(
      `${name}: inventory drift ${JSON.stringify({ missing, removed })}`
    );
  const records = files.map((file) => {
    const source = readFileSync(resolve(root, file), 'utf8');
    const tests = [],
      suites = [];
    let parseError = null;
    if (/\.[cm]?[jt]sx?$/.test(file)) {
      try {
        const ast = parse(source, {
          sourceType: 'unambiguous',
          plugins: [
            'typescript',
            ...(file.endsWith('x') ? ['jsx'] : []),
            'decorators-legacy',
          ],
        });
        walk(ast, (node) => {
          if (node.type !== 'CallExpression') return;
          const names = calleeParts(node.callee);
          if (!['it', 'test', 'describe', 'suite'].includes(names[0])) return;
          if (
            [
              'each',
              'extend',
              'use',
              'beforeEach',
              'afterEach',
              'beforeAll',
              'afterAll',
              'step',
              'setTimeout',
              'info',
              'skip',
            ].includes(names.at(-1)) &&
            node.arguments.length < 2
          )
            return;
          const arg = node.arguments[0];
          if (
            !arg ||
            !node.arguments.some((item) =>
              item.type.endsWith('FunctionExpression')
            )
          )
            return;
          const record = {
            line: node.loc.start.line,
            callee: names.join('.'),
            expression: source.slice(arg.start, arg.end).replace(/\s+/g, ' '),
            dynamic: !['StringLiteral', 'NumericLiteral'].includes(arg.type),
          };
          (names.includes('describe') || names[0] === 'suite'
            ? suites
            : tests
          ).push(record);
        });
      } catch (error) {
        parseError = String(error);
      }
    }
    return {
      file,
      ...classifications.get(file),
      sha256: hash(source),
      bytes: Buffer.byteLength(source),
      lines: source.split('\n').length,
      tests,
      suites,
      parseError,
      declarationOnlyReason: tests.length
        ? null
        : /harness|skip/.test(classifications.get(file).category)
          ? 'No independently executed editor test in this support/skip unit.'
          : 'Declaration or framework fixture; inspect its indexed suite and the existing behavior extraction before treating this file as runnable proof.',
    };
  });
  const problems = records.filter((record) => record.parseError);
  const result = {
    name,
    capturedAt,
    head,
    clean,
    source: root,
    mode: 'fresh full inventory with classifications retained only after exact source-pin and full file-set agreement',
    fileCount: files.length,
    classifiedCount: records.length,
    unknownCount: 0,
    parseErrors: problems,
    testCallSites: records.reduce((n, record) => n + record.tests.length, 0),
    suiteCallSites: records.reduce((n, record) => n + record.suites.length, 0),
    categories: Object.fromEntries(
      [...new Set(records.map((record) => record.category))].map((category) => [
        category,
        records.filter((record) => record.category === category).length,
      ])
    ),
    sourceFingerprint: hash(
      records.map((record) => `${record.file}\0${record.sha256}`).join('\n')
    ),
    records,
    behaviorExtraction: `docs/editor-test-harvester/${name}/report.md`,
    executionStatus:
      'inventory only; no new upstream runtime test execution claimed',
  };
  if (
    run(root, 'rev-parse', 'HEAD') !== head ||
    run(root, 'status', '--porcelain') !== ''
  )
    throw new Error(`${name}: source changed during inventory`);
  writeFileSync(
    `${artifact}/${name}-full-test-inventory.json`,
    `${JSON.stringify(result, null, 2)}\n`
  );
  writeFileSync(
    `docs/editor-test-harvester/${name}/current-inventory-receipt.json`,
    `${JSON.stringify({ ...result, records: undefined }, null, 2)}\n`
  );
  console.log(
    JSON.stringify({
      name,
      files: files.length,
      testCallSites: result.testCallSites,
      suites: result.suiteCallSites,
      parseErrors: problems.length,
      categories: result.categories,
    })
  );
  if (problems.length) process.exitCode = 1;
}

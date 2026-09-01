import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createSchemaTypecheckFixture,
  parseTypeScriptExtendedDiagnostics,
} from '../../../../benchmarks/editor/benchmarks/plite-schema-typecheck-budget.mjs';

const root = process.cwd();
const output = resolve(root, 'tmp/plite-typecheck-owner-probe');
mkdirSync(output, { recursive: true });
const variants = [
  ['plite-only', "import { createEditor } from 'plitejs'; void createEditor;\n"],
  ['plate-core-only', "import { createEditor } from '../../packages/platejs/src/core'; void createEditor;\n"],
  ['import-only', "import { createEditor } from 'platejs'; void createEditor;\n"],
  ['declarations-100', createSchemaTypecheckFixture(100).split('const plugins')[0]],
  ['declarations-1000', createSchemaTypecheckFixture(1000).split('const plugins')[0]],
  ['full-1000', createSchemaTypecheckFixture(1000)],
];
const rows = [];
for (const [name, source] of variants) {
  if (process.env.TYPECHECK_PROBE_CASE && !process.env.TYPECHECK_PROBE_CASE.split(',').includes(name)) continue;
  const fixture = resolve(output, `${name}.ts`);
  const config = resolve(output, `${name}.json`);
  writeFileSync(fixture, source);
  writeFileSync(config, JSON.stringify({
    extends: '../../tooling/config/tsconfig.type-tests.json',
    compilerOptions: { incremental: false, noEmit: true },
    include: [`${name}.ts`],
  }));
  const result = spawnSync(resolve(root, 'node_modules/.bin/tsc'), [
    '--extendedDiagnostics', '--pretty', 'false', '--project', config,
  ], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.error) throw result.error;
  const diagnostics = `${result.stdout}\n${result.stderr}`;
  writeFileSync(resolve(output, `${name}.log`), diagnostics);
  if (result.status !== 0) throw new Error(diagnostics);
  const row = { name, ...parseTypeScriptExtendedDiagnostics(diagnostics) };
  rows.push(row);
  process.stdout.write(`${JSON.stringify(row)}\n`);
}
writeFileSync(resolve(output, 'result.json'), JSON.stringify(rows, null, 2));

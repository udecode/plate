import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  benchmarkRepo,
  parsePackageManager,
} from '../../../../benchmarks/slate-v2/donor/shared/repo-compare.mjs';

const root = process.cwd();
const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const owner = resolve(
  'benchmarks/slate-v2/donor/core/compare/rich-text-operations.mjs'
);
const source = readFileSync(owner, 'utf8');
const extracted = source.match(
  /const benchmarkSource = `([\s\S]*?)`;\n\nconst currentPackageManager/
);
assert.ok(extracted, 'Canonical benchmark source template must be present');
let instrumented = extracted[1];
function replaceOnce(from, to) {
  assert.equal(
    instrumented.split(from).length,
    2,
    `Expected one instrumentation site: ${from}`
  );
  instrumented = instrumented.replace(from, to);
}
replaceOnce(
  'const measureLane = (setup, run) => {',
  'const finalStates = [];\nconst measureLane = (setup, run) => {'
);
replaceOnce(
  '    const duration = now() - start;',
  `    const duration = now() - start;
    if (iteration === iterations) {
      const selection = getSelection(editor);
      finalStates.push(JSON.parse(JSON.stringify({
        children: getChildren(editor),
        selection: selection ? { anchor: selection.anchor, focus: selection.focus } : null,
      })));
    }`
);
replaceOnce(
  'console.log(JSON.stringify({\n  iterations,',
  'console.log(JSON.stringify({\n  finalStates,\n  iterations,'
);
const inputs = {
  RICH_TEXT_OPS_COMPARE_BLOCKS: '1000',
  RICH_TEXT_OPS_COMPARE_ITERATIONS: '1',
  RICH_TEXT_OPS_COMPARE_NAVIGATION_STEPS: '200',
  RICH_TEXT_OPS_COMPARE_SELECTION_BLOCKS: '32',
  RICH_TEXT_OPS_COMPARE_TYPE_OPS: '40',
};
const engines = {};
for (const [engine, repo] of [
  ['current', root],
  ['legacy', resolve('../slate')],
]) {
  engines[engine] = await benchmarkRepo({
    benchmarkSource: instrumented,
    env: { ...inputs, BENCHMARK_ENGINE: engine },
    packageManager: await parsePackageManager(repo),
    repo,
  });
}
const canonicalize = (value) =>
  Array.isArray(value)
    ? value.map(canonicalize)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonicalize(value[key])])
        )
      : value;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const names = Object.keys(engines.current.lanes);
assert.deepEqual(names, Object.keys(engines.legacy.lanes));
assert.equal(names.length, engines.current.finalStates.length);
assert.equal(names.length, engines.legacy.finalStates.length);
const rows = names.map((name, index) => {
  const current = engines.current.finalStates[index];
  const legacy = engines.legacy.finalStates[index];
  const currentSha256 = hash(JSON.stringify(canonicalize(current)));
  const legacySha256 = hash(JSON.stringify(canonicalize(legacy)));
  return {
    name,
    equal: currentSha256 === legacySha256,
    currentSha256,
    legacySha256,
    current,
    legacy,
  };
});
const result = {
  capturedAt: new Date().toISOString(),
  owner: owner.slice(root.length + 1),
  ownerSha256: hash(source),
  instrumentedSourceSha256: hash(instrumented),
  policy:
    'Disposable full-final-state comparison of the existing benchmark recipes. One warmup and one retained execution per lane; snapshot capture occurs after the timer. All descendant properties, text, order and anchor/focus paths/offsets are compared; engine-specific selection discriminator is excluded. No timing from this verification run is promoted or pooled with the 51-sample packet. For read-only query lanes, equal editor state is not equal query-output proof.',
  config: inputs,
  runtimes: {
    current: engines.current.config.runtime,
    legacy: engines.legacy.config.runtime,
  },
  summary: {
    lanes: rows.length,
    equal: rows.filter((row) => row.equal).length,
    unequal: rows.filter((row) => !row.equal).map((row) => row.name),
  },
  rows,
};
writeFileSync(
  resolve(artifact, 'rich-text-final-state-equivalence.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(JSON.stringify(result.summary));
if (result.summary.unequal.length) process.exitCode = 1;

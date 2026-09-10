import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const here = new URL('.', import.meta.url);
const pins = JSON.parse(readFileSync(new URL('runtime-identities.json', here), 'utf8'));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const pin of pins) assert.equal(sha(readFileSync(pin.path)), pin.sha256, pin.path);
const jsondiff = await import('/Users/zbeyens/git/jsondiffpatch/packages/jsondiffpatch/src/index.ts');
const diff3 = await import('/Users/zbeyens/git/node-diff3/src/diff3.mjs');
const require = createRequire(import.meta.url);
const { diff_match_patch: DiffMatchPatch } = require('/Users/zbeyens/git/diff-match-patch/javascript/diff_match_patch_uncompressed.js');
const passed = [];
const observations = {};

const matcher = jsondiff.create({ objectHash: (item) => item.id });
const before = [{ id: 'a', text: 'Alpha' }, { id: 'b', text: 'Beta' }, { id: 'c', text: 'Gamma' }];
const after = [{ id: 'c', text: 'Gamma!' }, { id: 'a', text: 'Alpha' }, { id: 'b', text: 'Beta' }];
const delta = matcher.diff(before, after);
assert.equal(delta._2[2], 3);
assert.deepEqual(matcher.patch(structuredClone(before), delta), after);
assert.deepEqual(matcher.unpatch(structuredClone(after), delta), before);
passed.push('identified-array-move-and-interior-edit-roundtrip');
observations.identifiedMove = delta;

const positional = jsondiff.diff(structuredClone(before), structuredClone(after));
assert.ok(!Object.entries(positional).some(([key, value]) => key.startsWith('_') && Array.isArray(value) && value[2] === 3));
passed.push('unidentified-array-comparison-does-not-establish-move');
observations.unidentifiedMove = positional;

const original = [{ id: 'amber' }, { id: 'blue' }];
const inserted = [{ id: 'coral' }, ...original];
const insertion = matcher.diff(original, inserted);
const reorderedTarget = [{ id: 'amber' }, { id: 'blue' }, { id: 'coral' }];
const wrongBaseline = matcher.unpatch(structuredClone(reorderedTarget), insertion);
assert.deepEqual(wrongBaseline, [{ id: 'blue' }, { id: 'coral' }]);
passed.push('index-patch-does-not-validate-reordered-baseline');
observations.wrongBaseline = wrongBaseline;

const base = ['start', 'bridge', 'finish'];
const local = ['start-local', 'bridge', 'finish'];
const remote = ['start', 'bridge', 'finish-remote'];
const regions = diff3.diff3MergeRegions(local, base, remote);
assert.ok(regions.some((region) => region.buffer === 'a'));
assert.ok(regions.some((region) => region.buffer === 'b'));
const flattened = diff3.diff3Merge(local, base, remote);
assert.deepEqual(flattened, [{ ok: ['start-local', 'bridge', 'finish-remote'] }]);
passed.push('merge-output-erases-nonconflicting-branch-labels');
observations.branchRegions = regions;
observations.flattened = flattened;

const deletion = diff3.diff3MergeRegions(['start', 'finish'], ['start', 'removed', 'finish'], ['start', 'removed', 'finish']);
assert.ok(deletion.every((region) => region.stable && region.buffer === 'o'));
assert.equal(diff3.diffIndices(['start', 'removed', 'finish'], ['start', 'finish']).length, 1);
passed.push('merged-regions-omit-unilateral-deletion-review-row');
observations.deletionRegions = deletion;

const conflict = diff3.diff3Merge(['local'], ['base'], ['remote']);
assert.deepEqual(conflict[0].conflict.a, ['local']);
assert.deepEqual(conflict[0].conflict.o, ['base']);
assert.deepEqual(conflict[0].conflict.b, ['remote']);
passed.push('conflict-retains-three-content-alternatives');
observations.conflict = conflict;

const dmp = new DiffMatchPatch();
const patch = dmp.patch_make('The green boat moves slowly.', 'The green boat moves quickly.');
const patched = dmp.patch_apply(patch, 'The brown boat moves slowly.');
assert.deepEqual(patched, ['The brown boat moves quickly.', [true]]);
passed.push('fuzzy-text-patch-accepts-different-same-length-baseline');
observations.fuzzyPatch = patched;

for (const pin of pins) assert.equal(sha(readFileSync(pin.path)), pin.sha256, pin.path);
const receipt = {
  scope: 'Seven bounded upstream semantic witnesses, not Plite production tests or comparative quality/performance proof.',
  runtime: typeof Bun === 'undefined' ? process.version : 'bun ' + Bun.version,
  sourceFiles: pins.length,
  sourceIdentityVerifiedBeforeAndAfter: true,
  scriptSha256: sha(readFileSync(new URL(import.meta.url))),
  passed,
  observations,
};
writeFileSync(new URL('semantic-probe.json', here), JSON.stringify(receipt, null, 2) + '\n');
process.stdout.write(JSON.stringify({ passed: passed.length, sourceFiles: pins.length, scope: receipt.scope }) + '\n');

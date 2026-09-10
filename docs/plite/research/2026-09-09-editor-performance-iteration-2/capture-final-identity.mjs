import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const read = (name) => JSON.parse(readFileSync(resolve(artifact, name)));
const hash = (file) =>
  existsSync(file)
    ? createHash('sha256').update(readFileSync(file)).digest('hex')
    : null;
const initial = read('source-inventory.json');
const initialHashes = Object.fromEntries(
  initial.map((unit) => [unit.path, unit.sha256])
);
const manifest = read('local-architecture-manifest.json');
const originalOwners = new Map(
  manifest.units.map((unit) => [unit.path, unit.lane])
);
const newOwners = {
  'apps/www/src/registry/changelog/2026-09-09-find-view-ownership.json':
    'product.registry',
  'apps/www/src/registry/changelog/2026-09-09-navigation-view-feedback.json':
    'product.registry',
  'apps/www/src/registry/changelog/entries/2026-09-09-find-view-ownership.mdx':
    'product.registry',
  'apps/www/src/registry/changelog/entries/2026-09-09-navigation-view-feedback.mdx':
    'product.registry',
  'apps/www/tests/browser/navigation-feedback.spec.ts': 'product.www-host',
  'packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx':
    'proof.package-corpus',
  'packages/platejs/type-tests/navigation-feedback-contracts.tsx':
    'tooling.package-build',
  'packages/plitejs/test/react/extension-view-api.test.tsx':
    'tooling.package-build',
};
const suffixes = new Set([
  '.ts',
  '.tsx',
  '.mjs',
  '.mts',
  '.json',
  '.md',
  '.mdx',
  '.js',
  '.css',
]);
const excluded = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'public',
  '__registry__',
]);
const files = execFileSync(
  'rg',
  ['--files', 'packages', 'apps/plite', 'apps/www', 'benchmarks', 'tooling'],
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')
  .filter(
    (file) =>
      suffixes.has(extname(file)) &&
      !file.split('/').some((part) => excluded.has(part))
  )
  .sort();
const currentHashes = Object.fromEntries(
  files.map((file) => [file, hash(file)])
);
const additions = files
  .filter((file) => !(file in initialHashes))
  .map((file) => ({
    file,
    sha256: currentHashes[file],
    accountingOwner: newOwners[file] ?? null,
    disposition:
      'Concurrent source/proof addition; assigned to an existing lane. Not part of earlier frozen benchmark inputs or an additional measured feature.',
  }));
assert.ok(
  additions.every(
    (row) =>
      row.accountingOwner &&
      manifest.lanes.some((lane) => lane.id === row.accountingOwner)
  ),
  'Every new source file needs an explicit existing owner or a newly assessed lane.'
);
const removals = initial
  .filter((unit) => !(unit.path in currentHashes))
  .map((unit) => ({
    file: unit.path,
    beforeSha256: unit.sha256,
    accountingOwner: originalOwners.get(unit.path),
    disposition:
      'No longer present in the original rg inventory scope. Original captured evidence remains retained.',
  }));
const ownedHarnesses = [
  'benchmarks/slate-v2/donor/browser/react/cross-editor-adapters.mjs',
  'benchmarks/slate-v2/donor/core/current/document-change.mjs',
  'benchmarks/slate-v2/donor/core/compare/rich-text-operations.mjs',
  'benchmarks/slate-v2/donor/core/compare/normalization.mjs',
];
const changes = initial
  .filter(
    (unit) =>
      unit.path in currentHashes && unit.sha256 !== currentHashes[unit.path]
  )
  .map((unit) => ({
    file: unit.path,
    beforeSha256: unit.sha256,
    finalSha256: currentHashes[unit.path],
    accountingOwner: originalOwners.get(unit.path),
    scope: ownedHarnesses.includes(unit.path)
      ? 'This research: benchmark adapter/output repair, with scoped validation.'
      : 'Concurrent source change outside this research implementation scope; earlier packets retain their own source identities.',
  }));
const architecture = read('architecture-scores.json');
const changedRepresentativeOwners = architecture.lanes
  .filter((lane) => hash(lane.owner) !== lane.sourceSha256)
  .map((lane) => ({ id: lane.id, owner: lane.owner }));
const wwwBefore = read('www-journey-source-before.json');
const changedDuringWww = Object.entries(wwwBefore.sources)
  .filter(([file, before]) => hash(file) !== before)
  .map(([file]) => file);
const overlays = ['journey', 'www-journey'].map((label) => {
  const overlay = read(`${label}-timing-overlay.json`);
  return {
    label,
    canonicalFiles: overlay.records.length,
    capturedFingerprint: overlay.filesFingerprint,
    changedCanonicalSources: overlay.records
      .filter((record) => hash(record.file) !== record.sourceSha256)
      .map((record) => record.file),
  };
});
const references = read('reference-provenance-final.json').references.map(
  (reference) => {
    const currentHead = execFileSync(
      'git',
      ['-C', reference.path, 'rev-parse', 'HEAD'],
      { encoding: 'utf8' }
    ).trim();
    const currentStatus = execFileSync(
      'git',
      ['-C', reference.path, 'status', '--porcelain'],
      { encoding: 'utf8' }
    ).trim();
    return {
      name: reference.name,
      path: reference.path,
      expectedHead: reference.finalHead,
      currentHead,
      headUnchanged: currentHead === reference.finalHead,
      currentStatus,
      licenses: reference.licenses.map((license) => ({
        ...license,
        currentSha256: hash(license.path),
        unchanged: hash(license.path) === license.sha256,
      })),
    };
  }
);
const referenceSources = ['wordgard', 'prosekit'].map((name) => {
  const inventory = read(`${name}-source-inventory.json`);
  return {
    name,
    sourceFiles: inventory.files.length,
    changed: inventory.files
      .filter(
        (file) => hash(resolve(inventory.root, file.path)) !== file.sha256
      )
      .map((file) => file.path),
  };
});
const result = {
  capturedAt: new Date().toISOString(),
  policy:
    'This final readback does not relabel frozen packets as measurements of the final checkout. Original 4,338-unit source accounting and 93 representative-owner assessments remain immutable. Additions/removals and concurrent changes have explicit dispositions; all current discovered files have a primary accounting owner.',
  initialCount: initial.length,
  finalCount: files.length,
  additions,
  removals,
  changes,
  changedRepresentativeOwners,
  changedDuringWww,
  overlays,
  references,
  referenceSources,
  ownedHarnessHashes: Object.fromEntries(
    ownedHarnesses.map((file) => [file, hash(file)])
  ),
  currentSourceHashes: currentHashes,
  servedPliteEvidence: 'owned-host-proof-final.json',
  wwwBuildMode: wwwBefore.hostMode,
  wwwTimingHookHash: hash(
    resolve('tmp/perf-iteration-2/www-journey-timing/timing-hooks.ts')
  ),
  wwwTimingHookUnchanged:
    hash(resolve('tmp/perf-iteration-2/www-journey-timing/timing-hooks.ts')) ===
    wwwBefore.timingHookSha256,
};
writeFileSync(
  resolve(artifact, 'final-source-identity.json'),
  JSON.stringify(result, null, 2) + '\n'
);
console.log(
  JSON.stringify({
    initial: result.initialCount,
    final: result.finalCount,
    added: additions.length,
    removed: removals.length,
    changed: changes.length,
    changedRepresentativeOwners,
    changedDuringWww,
    overlayChanges: overlays.map((overlay) => ({
      label: overlay.label,
      changed: overlay.changedCanonicalSources,
    })),
    changedReferenceHeads: references
      .filter((reference) => !reference.headUnchanged)
      .map((reference) => reference.name),
    referenceSourceChanges: referenceSources,
    wwwTimingHookUnchanged: result.wwwTimingHookUnchanged,
  })
);

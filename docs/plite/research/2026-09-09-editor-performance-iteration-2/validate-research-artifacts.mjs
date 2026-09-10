import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { validateConceptMatrix } from '../../../../.agents/skills/editor-audit/scripts/validate-concept-matrix.mjs';
import { scoreArchitecture } from '../../../../tooling/scripts/plate-review-score.mjs';

const root = process.cwd();
const research = resolve(
  'docs/plite/research/2026-09-09-editor-performance-iteration-2'
);
const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const read = (name) => JSON.parse(readFileSync(resolve(artifact, name)));
const matrices = {};
for (const name of ['wordgard', 'prosekit']) {
  const ledger = readFileSync(
    resolve(artifact, `${name}-concept-matrix.md`),
    'utf8'
  );
  const manifest = read(`${name}-concept-manifest.json`);
  const checked = validateConceptMatrix({ ledger, manifest });
  const prior = read(`${name}-matrix-validation.json`);
  assert.equal(checked.rows, prior.rows);
  assert.deepEqual(checked.classifications, prior.classifications);
  assert.deepEqual(checked.priorCandidates, prior.priorCandidates);
  matrices[name] = {
    rows: checked.rows,
    integrity: checked.integrity,
    classifications: checked.classifications,
  };
}
const architecture = read('architecture-scores.json');
const manifest = read('local-architecture-manifest.json');
assert.equal(architecture.unresolved.length, 0);
assert.equal(architecture.assessedLaneCount, 93);
assert.equal(architecture.expectedLaneCount, 93);
assert.equal(manifest.expectedUnits, manifest.mappedUnits);
assert.equal(manifest.unclassifiedUnits.length, 0);
assert.equal(
  manifest.lanes.reduce((sum, lane) => sum + lane.files.length, 0),
  manifest.expectedUnits
);
assert.equal(
  new Set(manifest.lanes.flatMap((lane) => lane.files)).size,
  manifest.expectedUnits
);
for (const lane of architecture.lanes) {
  const computed = scoreArchitecture({
    axes: Object.fromEntries(
      Object.entries(lane.axes).map(([axis, value]) => [axis, value.grade])
    ),
    caps: lane.score.appliedCaps.map((cap) => cap.key),
    confidence: lane.confidenceInput,
  });
  assert.deepEqual(computed, lane.score, `Score arithmetic: ${lane.id}`);
}
const operations = read('human-operation-catalog.json');
const operationIds = operations.families.flatMap((family) =>
  family.operations.map((operation) => operation.id)
);
assert.equal(new Set(operationIds).size, operations.operationCount);
assert.equal(operationIds.length, 212);
assert.equal(
  operations.commonComparativeOperationCount +
    operations.completeOperationGaps.length,
  212
);
assert.equal(operations.completeOperationGaps.length, 178);
assert.equal(operations.unassociatedCases.length, 0);
const targets = read('registered-target-results.json');
assert.equal(targets.rows.length, targets.expected);
assert.equal(targets.attempted, 48);
assert.equal(Object.values(targets.byOutcome).flat().length, 48);
const richText = read('rich-text-final-state-equivalence.json');
assert.equal(richText.rows.length, 15);
assert.equal(richText.rows.filter((row) => row.equal).length, 12);
assert.deepEqual(
  richText.rows.filter((row) => !row.equal).map((row) => row.name),
  richText.summary.unequal
);
const browser = Object.fromEntries(
  ['journey', 'www-journey'].map((name) => {
    const packet = read(`${name}-event-timing-summary.json`);
    assert.equal(packet.rows.length, packet.summary.attempts);
    assert.equal(packet.reportErrors.length, 0);
    assert.equal(packet.summary.captureErrors, 0);
    assert.equal(
      createHash('sha256')
        .update(readFileSync(resolve(packet.source)))
        .digest('hex'),
      packet.sourceSha256
    );
    return [name, packet.summary];
  })
);
assert.deepEqual(browser.journey.status, { passed: 743, skipped: 9 });
assert.deepEqual(browser['www-journey'].status, {
  passed: 110,
  failed: 17,
  skipped: 2,
  timedOut: 1,
});
const wwwReplay = read('www-correctness-dispositions.json');
assert.equal(wwwReplay.rows.length, 18);
assert.equal(wwwReplay.replayed, wwwReplay.originalFailure);
assert.ok(
  wwwReplay.rows.every(
    (row) => row.sameStatus && row.sameAssertionSignature && row.nextOwner
  )
);
const finalIdentity = read('final-source-identity.json');
assert.equal(
  finalIdentity.finalCount,
  finalIdentity.initialCount +
    finalIdentity.additions.length -
    finalIdentity.removals.length
);
assert.equal(
  Object.keys(finalIdentity.currentSourceHashes).length,
  finalIdentity.finalCount
);
assert.ok(finalIdentity.additions.every((unit) => unit.accountingOwner));
assert.equal(finalIdentity.changedRepresentativeOwners.length, 0);
assert.equal(finalIdentity.changedDuringWww.length, 0);
assert.ok(
  finalIdentity.overlays.every(
    (overlay) => overlay.changedCanonicalSources.length === 0
  )
);
assert.equal(finalIdentity.references.length, 23);
assert.ok(
  finalIdentity.references.every(
    (reference) =>
      reference.headUnchanged &&
      reference.licenses.every((license) => license.unchanged)
  )
);
assert.ok(
  finalIdentity.referenceSources.every(
    (reference) => reference.changed.length === 0
  )
);
assert.equal(finalIdentity.wwwTimingHookUnchanged, true);
assert.equal(read('owned-host-proof-final.json').valid, true);
const auditIndex = JSON.parse(
  readFileSync(resolve('docs/editor-audits/index.json'))
).audits.find(
  (entry) => entry.id === 'editor-performance-research-iteration-2-2026-09-09'
);
assert.ok(auditIndex);
assert.ok(existsSync(resolve(auditIndex.artifact)));
assert.equal(auditIndex.references.length, 2);
for (const reference of auditIndex.references) {
  const identity = finalIdentity.references.find(
    (entry) => entry.name === reference.id
  );
  assert.equal(reference.auditedCommit, identity.currentHead);
  assert.equal(reference.testHarvestCommit, identity.currentHead);
  for (const field of ['issueLedger', 'conceptManifest', 'conceptMatrix']) {
    assert.ok(
      existsSync(resolve(reference[field])),
      `Audit index ${reference.id}: ${field}`
    );
  }
}
const common = read('common-comparison-summary.json');
assert.equal(common.summary.length, 945);
assert.equal(common.summary.filter((row) => row.passed === 31).length, 933);
const compiler = read('compiler-comparison-summary.json');
assert.equal(compiler.summary.length, 96);
assert.ok(compiler.summary.every((row) => row.passed === 31));
const control = read('react-compiler-toolchain-control.json');
assert.equal(control.sourceFiles, 1547);
assert.equal(control.sourceHashesEqual, true);
assert.equal(control.babel8DiagnosticEvents, 322);
assert.equal(control.babel7DiagnosticEvents, 68);
const prior = read('prior-candidate-reconciliation.json');
assert.equal(prior.rows.length, 65);
assert.equal(new Set(prior.rows.map((row) => row.id)).size, 65);
assert.equal(
  read('portable-invariant-reconciliation.json').families.length,
  58
);
const experiments = read('experiment-dispositions.json');
assert.equal(experiments.rows.length, 26);
assert.equal(new Set(experiments.rows.map((row) => row.id)).size, 26);
const dossiers = readFileSync(resolve(research, 'experiments.md'), 'utf8');
const virtualization = readFileSync(
  resolve(research, 'virtualization.md'),
  'utf8'
);
for (const row of experiments.rows)
  assert.ok(
    new RegExp(`(?:^## |^[-] \\*\\*|^\\*\\*)${row.id}\\b`, 'm').test(
      dossiers + '\n' + virtualization
    ),
    `Missing individual experiment discussion: ${row.id}`
  );
const files = [research, artifact].flatMap((folder) =>
  readdirSync(folder)
    .filter((name) => name.endsWith('.md'))
    .map((name) => resolve(folder, name))
);
const links = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8').replace(
    /```[^\n]*\n[\s\S]*?```/g,
    ''
  );
  for (const match of text.matchAll(/\[[^\]\n]*\]\((<[^>]+>|[^)\n]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z][a-z\d+.-]*:/i.test(target)) continue;
    const path = decodeURIComponent(target).replace(/:\d+(?:-\d+)?$/, '');
    const absolute = resolve(dirname(file), path);
    links.push({
      file: file.slice(root.length + 1),
      target,
      exists: existsSync(absolute),
    });
  }
}
const missingLinks = links.filter((link) => !link.exists);
const result = {
  checkedAt: new Date().toISOString(),
  matrices,
  architecture: {
    assessed: architecture.assessedLaneCount,
    mappedSourceUnits: manifest.mappedUnits,
    scoreArithmetic: 'pass',
  },
  operations: {
    families: operations.familyCount,
    operations: operations.operationCount,
    matchedOperations: operations.commonComparativeOperationCount,
    remainingTimingGaps: operations.completeOperationGaps.length,
  },
  registeredTargets: targets.attempted,
  richTextFinalStates: richText.summary,
  browser,
  wwwFailuresReplayed: wwwReplay.replayed,
  finalIdentity: {
    initial: finalIdentity.initialCount,
    final: finalIdentity.finalCount,
    representativeOwnersUnchanged: 93,
    referencesUnchanged: finalIdentity.references.length,
    auditIndex: auditIndex.id,
  },
  commonCells: common.summary.length,
  compilerCells: compiler.summary.length,
  compilerToolchainControl: 'same-source counts verified',
  priorCandidates: prior.rows.length,
  portableInvariantFamilies: 58,
  independentDossiers: experiments.rows.length,
  markdown: { files: files.length, localLinks: links.length, missingLinks },
  inputHashes: Object.fromEntries(
    files.map((file) => [
      file.slice(root.length + 1),
      createHash('sha256').update(readFileSync(file)).digest('hex'),
    ])
  ),
};
writeFileSync(
  resolve(artifact, 'final-artifact-validation.json'),
  JSON.stringify(result, null, 2) + '\n'
);
assert.equal(
  missingLinks.length,
  0,
  `Broken local links: ${JSON.stringify(missingLinks)}`
);
console.log(
  JSON.stringify({
    matrices: 2,
    architectureLanes: 93,
    sourceUnits: manifest.mappedUnits,
    commonCells: 945,
    compilerCells: 96,
    targets: 48,
    operations: 212,
    dossiers: 26,
    markdownFiles: files.length,
    localLinks: links.length,
    missingLinks: 0,
  })
);

#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  allDossiers,
  deferredResearchDossiers,
  materialDossiers,
} from './dossier-data.mjs';
import { matrixTruth } from './matrix-truth.mjs';
import { priorCandidates } from './prior-candidates.mjs';

const MATRIX_EVIDENCE_FILE_PATTERN = /^matrix-evidence-.+\.mjs$/;
const artifactRoot = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactRoot, '../../../..');
const generatedAt = new Date().toISOString();
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(artifactRoot, path), 'utf8'));
const readRootJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const hashText = (value) => createHash('sha256').update(value).digest('hex');
const hashFile = (path) => hashText(readFileSync(resolve(root, path)));
const repoPath = (path) => relative(root, resolve(root, path));
const evidenceModulePaths = readdirSync(artifactRoot)
  .filter((name) => MATRIX_EVIDENCE_FILE_PATTERN.test(name))
  .sort()
  .map((name) =>
    repoPath(
      `docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/${name}`
    )
  );

const wordgardCoverage = readJson('wordgard-source-coverage.json');
const wordgardSiteCoverage = readJson('wordgard-site-coverage.json');
const wordgardForumInventory = readJson('wordgard-forum-inventory.json');
const wordgardForumCoverage = readJson('wordgard-forum-coverage.json');
const pliteCoverage = readJson('plite-source-coverage.json');
const plateCoverage = readJson('plate-source-coverage.json');
const wordgardNamespaceProbe = readJson('wordgard-namespace-bundle-probe.json');
const wordgardStatePurityProbe = readJson('wordgard-state-purity-probe.json');
const wordgardValuePurityProbe = readJson('wordgard-value-purity-probe.json');
const wordgardPublicContractProbe = readJson(
  'wordgard-public-contract-probe.json'
);
const wordgardPublishedPackageProbe = readJson(
  'wordgard-published-package-probe.json'
);
const classifiedIssues = readRootJson(
  'docs/editor-issue-harvester/wordgard/full/classified-issues.json'
);
const issueCounts = {
  auditChanging: classifiedIssues.filter(({ changesAudit }) => changesAudit)
    .length,
  checked: classifiedIssues.filter(({ checkmark }) => checkmark === '[x]')
    .length,
  closed: classifiedIssues.filter(({ state }) => state === 'CLOSED').length,
  open: classifiedIssues.filter(({ state }) => state === 'OPEN').length,
  total: classifiedIssues.length,
};

const sides = ['wordgard', 'plite', 'plate'];
const dimensions = [
  'correctness',
  'api',
  'data',
  'ownership',
  'runtime',
  'proof',
];
const priorityOrder = new Map([
  ['P0', 0],
  ['P1', 1],
  ['P2', 2],
  ['P3', 3],
  ['—', 4],
]);

const ids = matrixTruth.map(({ id }) => id);
const matrixIndex = new Map(ids.map((id, index) => [id, index]));
if (new Set(ids).size !== ids.length) {
  throw new Error('matrix-truth.mjs contains duplicate concept IDs');
}

const expectedDossierIds = matrixTruth
  .filter(
    ({ localDebt, priority, proofAdaptation, referenceAdaptation }) =>
      (localDebt === 'material' ||
        proofAdaptation === 'adapt' ||
        referenceAdaptation === 'adapt') &&
      priorityOrder.has(priority) &&
      priority !== '—'
  )
  .map(({ id }) => id)
  .sort();
const actualDossierIds = materialDossiers
  .flatMap(({ rowIds }) => rowIds)
  .sort();
if (JSON.stringify(expectedDossierIds) !== JSON.stringify(actualDossierIds)) {
  throw new Error(
    `Material dossier partition mismatch: expected ${expectedDossierIds.join(', ')}, got ${actualDossierIds.join(', ')}`
  );
}
const dossierByRow = new Map(
  allDossiers.flatMap((dossier) =>
    dossier.rowIds.map((rowId) => [rowId, dossier])
  )
);

const sourceMappings = Object.fromEntries(
  sides.map((side) => [side, Object.create(null)])
);
for (const row of matrixTruth) {
  for (const side of sides) {
    const contract = row.contracts[side];
    for (const sourceConceptId of contract.sourceConceptIds ?? []) {
      const mapped = sourceMappings[side][sourceConceptId] ?? [];
      mapped.push(row.id);
      sourceMappings[side][sourceConceptId] = mapped;
    }
  }
}
for (const mappings of Object.values(sourceMappings)) {
  for (const values of Object.values(mappings)) values.sort();
}

const candidatesByConcept = new Map();
for (const candidate of priorCandidates) {
  for (const conceptId of candidate.conceptIds) {
    if (!ids.includes(conceptId)) {
      throw new Error(
        `Prior candidate ${candidate.id} maps unknown concept ${conceptId}`
      );
    }
  }
  const reconciliationConceptId =
    candidate.reconciliationConceptId ?? candidate.conceptIds[0];
  const candidates = candidatesByConcept.get(reconciliationConceptId) ?? [];
  candidates.push(candidate);
  candidatesByConcept.set(reconciliationConceptId, candidates);
}

const citationText = (values) =>
  values.map((value) => `\`${value}\``).join(', ');
const facetText = (contract, facet) =>
  `${facet}[${contract.evidenceProvenance[facet]}]=${citationText(contract[facet])}`;
const contractCell = (contract) => {
  if (contract.status === 'exact') {
    const reuse = contract.facetReuseJustification?.length
      ? `; justified reuse=${contract.facetReuseJustification
          .map(({ facets, reason }) => `${facets.join('+')}: ${reason}`)
          .join(' | ')}`
      : '';
    return `exact — ${['public', 'owner', 'consumers', 'lifecycle', 'proof'].map((facet) => facetText(contract, facet)).join('; ')}${reuse}`;
  }
  if (contract.status === 'partial') {
    return `partial — ${facetText(contract, 'covers')}; missing=${contract.missing} ${citationText(contract.missingEvidence ?? contract.proof)}; ${facetText(contract, 'proof')}`;
  }
  return `${contract.status} — ${contract.reason}; ${citationText(contract.evidence)}`;
};
const dimensionCell = ({
  claim,
  evidence,
  evidenceSelection,
  evidenceStatus,
  winner,
}) =>
  `${winner} — ${claim}; ${citationText(evidence)}; evidence=${evidenceSelection}/${evidenceStatus}`;
const candidateCell = (row) => {
  const candidates = candidatesByConcept.get(row.id) ?? [];
  if (candidates.length === 0) {
    return 'none — [hashed prior-source search](audit-report.md#prior-candidate-reconciliation) found no earlier durable decision';
  }
  return candidates
    .map((candidate) => {
      const sources = candidate.sources
        .map(
          ({ lineEnd, lineStart, path }) =>
            `\`${path}:${lineStart}-${lineEnd}\``
        )
        .join(', ');
      const claim = candidate.claim
        .replace(
          'material-dossiers.md#mobile-input-phase-proof',
          'material-dossiers.md#raw-mobile-input-proof'
        )
        .replace(
          ' ([dossier](material-dossiers.md#clipboard-benchmark-contract-repair))',
          ''
        );
      return `\`${candidate.id}\` ${candidate.disposition} — ${claim}; ${sources}`;
    })
    .join('<br>');
};
const escapeCell = (value) =>
  String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');

const headers = [
  'ID',
  'Concept',
  'Origin',
  'Reference mapping',
  'Plite mapping',
  'Plate mapping',
  'Correctness',
  'API/types',
  'Data/collab',
  'Ownership/lifecycle',
  'Runtime/perf',
  'Proof/host',
  'Classification',
  'Preferred base',
  'Reference adaptation',
  'Local debt',
  'Proof adaptation',
  'Prior candidates',
  'Verdict',
  'Priority',
];

const matrixRows = matrixTruth.map((row) => [
  `\`${row.id}\``,
  row.title,
  row.origin,
  contractCell(row.contracts.wordgard),
  contractCell(row.contracts.plite),
  contractCell(row.contracts.plate),
  ...dimensions.map((dimension) => dimensionCell(row.dimensions[dimension])),
  `${row.classification} — ${row.dimensions.correctness.claim}; ${citationText(row.dimensions.correctness.evidence)}`,
  `${row.preferred} — ${row.dimensions.ownership.claim}; ${citationText(row.dimensions.ownership.evidence)}`,
  `${row.referenceAdaptation} — ${row.dimensions.data.claim}; ${citationText(row.dimensions.data.evidence)}`,
  `${row.localDebt} — ${row.dimensions.correctness.claim}; ${row.dimensions.ownership.claim}; ${citationText([...row.dimensions.correctness.evidence, ...row.dimensions.ownership.evidence])}`,
  `${row.proofAdaptation} — ${row.dimensions.proof.claim}; ${citationText(row.dimensions.proof.evidence)}`,
  candidateCell(row),
  `${row.verdict} — ${row.dimensions.api.claim}; ${row.dimensions.ownership.claim}; ${citationText([...row.dimensions.api.evidence, ...row.dimensions.ownership.evidence])}`,
  row.priority,
]);

const matrix = `# Wordgard versus Plite/Plate atomic concept matrix

Frozen Wordgard source: \`${wordgardCoverage.authority.head}\`. Frozen official site: \`${wordgardSiteCoverage.authority.head}\`. Frozen Plate/Plite source: \`${plateCoverage.repositoryHead}\`.

Every row is one decision-atomic mechanism. A broad source concept may map to several rows; extracted local mechanisms merge into one canonical row instead of being duplicated.

| ${headers.join(' | ')} |
| ${headers.map(() => '---').join(' | ')} |
${matrixRows.map((cells) => `| ${cells.map(escapeCell).join(' | ')} |`).join('\n')}
`;

const renderCode = (code) =>
  `\n\`\`\`${code.language ?? 'ts'}\n${code.value.trim()}\n\`\`\`\n`;
const renderDossier = (dossier) => {
  if (dossier.rowIds.length !== 1) {
    throw new Error(
      `Dossier ${dossier.title} must own exactly one atomic concept`
    );
  }

  return `## ${dossier.title} (\`${dossier.rowIds[0]}\`)

<a id="${dossier.slug}"></a>

- Rows: ${dossier.rowIds.map((id) => `\`${id}\``).join(', ')}
- Priority: ${dossier.priority}
- Owner: ${dossier.owner}
- Decision: ${dossier.decision}
${dossier.disposition ? `- Disposition: ${dossier.disposition}` : ''}
${dossier.entryCondition ? `- Entry condition: ${dossier.entryCondition}` : ''}
- Sources: ${citationText(dossier.sources)}

### Current shape
${renderCode(dossier.before)}
### Final shape
${renderCode(dossier.after)}
### Delete

${dossier.deletions.map((item) => `- ${item}`).join('\n')}

### Adopt

${dossier.adoptionSurfaces.map((item) => `- ${item}`).join('\n')}

### Dependency order

${dossier.dependencyOrder.map((item, index) => `${index + 1}. ${item}`).join('\n')}

### Proof gates

${dossier.proofGates.map((item) => `- ${item}`).join('\n')}
`;
};

const dossiers = `# Material architecture dossiers

These are planning targets, not implementation. Public shapes are blank-slate endpoints; current compatibility does not constrain them.

${materialDossiers.map(renderDossier).join('\n')}

# Deferred research dossiers

These rows are not implementation backlog. Their missing evidence is the decision.

${deferredResearchDossiers.map(renderDossier).join('\n')}
`;

const groupIds = (key) => {
  const result = Object.create(null);
  for (const row of matrixTruth) {
    const value = row[key];
    const group = result[value] ?? [];
    group.push(row.id);
    result[value] = group;
  }
  return Object.fromEntries(
    Object.entries(result)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, group]) => [value, group.sort()])
  );
};
const priorDisposition = Object.create(null);
for (const candidate of priorCandidates) {
  const group = priorDisposition[candidate.disposition] ?? [];
  group.push(candidate.id);
  priorDisposition[candidate.disposition] = group;
}
for (const group of Object.values(priorDisposition)) group.sort();

const materialRows = matrixTruth
  .filter(({ id }) => expectedDossierIds.includes(id))
  .sort(
    (left, right) =>
      priorityOrder.get(left.priority) - priorityOrder.get(right.priority) ||
      matrixIndex.get(left.id) - matrixIndex.get(right.id)
  );
const deferredIds = matrixTruth
  .filter(({ verdict }) => verdict === 'defer' || verdict === 'research')
  .map(({ id }) => id);
const dimensionEvidence = dimensions.flatMap((dimension) =>
  matrixTruth.map((row) => row.dimensions[dimension])
);
const evidenceSummary = {
  automatic: dimensionEvidence.filter(
    ({ evidenceSelection }) => evidenceSelection === 'automatic'
  ).length,
  coverageOnly: dimensionEvidence.filter(
    ({ evidenceStatus }) => evidenceStatus === 'coverage-only'
  ).length,
  direct: dimensionEvidence.filter(
    ({ evidenceStatus }) => evidenceStatus === 'direct'
  ).length,
  explicit: dimensionEvidence.filter(
    ({ evidenceSelection }) => evidenceSelection === 'explicit'
  ).length,
  total: dimensionEvidence.length,
};
const summaryGroups = {
  origin: groupIds('origin'),
  classification: groupIds('classification'),
  preferred: groupIds('preferred'),
  referenceAdaptation: groupIds('referenceAdaptation'),
  localDebt: groupIds('localDebt'),
  proofAdaptation: groupIds('proofAdaptation'),
  verdict: groupIds('verdict'),
  priority: groupIds('priority'),
  priorDisposition: Object.fromEntries(
    Object.entries(priorDisposition).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  ),
  materialIds: materialRows.map(({ id }) => id),
  deferredIds,
};
const machineGroup = (groups) =>
  Object.fromEntries(
    Object.entries(groups).map(([value, group]) => [
      value,
      { count: group.length, ids: group },
    ])
  );
const machineSummary = {
  origins: machineGroup(summaryGroups.origin),
  classifications: machineGroup(summaryGroups.classification),
  preferredBases: machineGroup(summaryGroups.preferred),
  referenceAdaptations: machineGroup(summaryGroups.referenceAdaptation),
  localDebt: machineGroup(summaryGroups.localDebt),
  proofAdaptations: machineGroup(summaryGroups.proofAdaptation),
  priorCandidateDispositions: machineGroup(summaryGroups.priorDisposition),
  verdicts: machineGroup(summaryGroups.verdict),
  priorities: machineGroup(summaryGroups.priority),
  material: {
    count: summaryGroups.materialIds.length,
    ids: summaryGroups.materialIds,
  },
  deferred: {
    count: summaryGroups.deferredIds.length,
    ids: summaryGroups.deferredIds,
  },
};
const renderSummaryGroup = (title, groups) =>
  `### ${title}\n\n${Object.entries(groups)
    .map(
      ([value, group]) =>
        `- **${value} (${group.length})**: ${group.map((id) => `\`${id}\``).join(', ')}`
    )
    .join('\n')}`;

const report = `# Wordgard exhaustive architecture audit

## Verdict

Plite/Plate is the base. Wordgard is a valuable pressure oracle, not an architecture to adopt wholesale. The material transfers and local repairs are the explicitly ranked rows below; no broad subsystem wins by analogy. Its nominal document classes, global offsets, DOM-shaped schema, implicit facets, custom namespace compiler rewrite, monolithic package, and second OT stack lose.

The earlier 124-row output was invalid: 32 rows bundled mechanisms with different winners, exact mappings recycled owner citations as public API/consumer/lifecycle proof, and 122 claimed prior candidates omitted durable accepted plans. This report is generated only from the rebuilt atomic truth and hashed prior corpus.

## Source union

- Wordgard library: ${wordgardCoverage.summary.files} tracked files, ${wordgardCoverage.summary.declarations.toLocaleString()} declarations, ${wordgardCoverage.summary.concepts} declaration-derived source concepts.
- Official Wordgard site: ${wordgardSiteCoverage.summary.trackedFiles} tracked files, ${wordgardSiteCoverage.summary.mappedFiles} mapped docs/example/tooling files, ${wordgardSiteCoverage.summary.excludedFiles} explicit exclusions, and ${wordgardSiteCoverage.summary.concepts} teaching/consumer/proof concepts at \`${wordgardSiteCoverage.authority.head}\`.
- Official Wordgard forum: ${wordgardForumCoverage.summary.publicTopics} anonymously retrievable topics, ${wordgardForumCoverage.summary.visiblePosts} visible posts, and ${wordgardForumCoverage.summary.claims} reviewed architecture/requirement claims at \`${wordgardForumCoverage.retrievedAt}\`. Forum statements are intent or reported demand, never implementation proof.
- Plite family: ${pliteCoverage.summary.files.toLocaleString()} files, ${pliteCoverage.summary.declarations.toLocaleString()} declarations, ${Object.keys(pliteCoverage.concepts).length} source concepts.
- Plate/product: ${plateCoverage.summary.includedFiles.toLocaleString()} included files, ${plateCoverage.summary.declarations.toLocaleString()} declarations, ${plateCoverage.conceptIds.length} source concepts.
- Atomic symmetric union: ${matrixTruth.length} rows. Broad source concepts fan out where their mechanisms have different winners; extracted mechanisms merge into existing local rows.

## Evidence law

Source-inventory matches prove coverage only. They cannot select a winner. A non-insufficient dimension requires explicit per-row, per-dimension keys backed by direct contract facets; tradeoff/equivalence requires direct evidence from two sides, and runtime requires a benchmark or directly comparable bounded behavior. The matrix exposes ${evidenceSummary.explicit}/${evidenceSummary.total} explicitly selected dimensions, ${evidenceSummary.direct} direct conclusions, and ${evidenceSummary.coverageOnly} deliberately coverage-only conclusions. Coverage-only conclusions are automatically rendered as insufficient evidence.

## Current Wordgard integrity

Wordgard is frozen at unreleased main \`${wordgardCoverage.authority.head}\` (\`${wordgardCoverage.authority.describe}\`), not the published 0.3.1 tag; the official website predates those 18 commits. \`npm test\` returns 572/572 and the Chrome harness returns 733/733, but both resolve \`wordgard/*\` to the ignored \`dist\` directory. That 22-file output is byte-for-byte the build of \`${wordgardPublicContractProbe.distProvenance.snapshotRef}\`, ${wordgardPublicContractProbe.distProvenance.changedCommitsAfterSnapshot.length} commits and ${wordgardPublicContractProbe.distProvenance.changedSourceFilesAfterSnapshot.length} source files behind the frozen head. Those green counts prove a historical snapshot, not current source.

The release lane is worse than false-green. A clean current-head pack exits zero with only ${wordgardPublicContractProbe.currentBuildAndPack.cleanPack.files.length} files and all ${wordgardPublicContractProbe.currentBuildAndPack.cleanPack.exportTargetsMissingFromPack.length} runtime/declaration targets missing; seeding the ignored \`dist\` makes the pack silently ship stale output. \`tsc --noEmit\` fails in \`src/schema/code.ts\` and \`src/schema/index.ts\`, while \`npm run prepare\` prints the failures but exits zero because \`bin/build.ts\` does not propagate the failed build result. The emitted declarations also publish \`${wordgardPublicContractProbe.publicSurface.emittedDeclarationRuntime.missingValues[0]}\` with no runtime value. \`../wordgard/src/doc/shape.ts:224-229\` emits a duplicate opening SVG tag. Open issues 31 and 32 independently expose a range comparison omission and the broken build.

That does not retroactively break the npm artifact. The separately fetched \`${wordgardPublishedPackageProbe.package.spec}\` tarball has ${wordgardPublishedPackageProbe.pack.fileCount} files and ${wordgardPublishedPackageProbe.entries.length} declared subpath exports; after installing its production dependencies, every runtime target, declaration target, and import succeeds. Published 0.3.1 is a valid historical artifact. Current unreleased main is the broken source/publication state.

### Packed-contract findings

${wordgardPublicContractProbe.findings
  .map(
    ({ id, impacts, severity, title }) =>
      `- **${severity} — ${title}** (\`${id}\`): impacts ${impacts.map((value) => `\`${value}\``).join(', ')}.`
  )
  .join('\n')}

Two reproducible read paths also violate Wordgard's documented immutable-state model. Calling \`collab.sendableUpdate\` on one state changes a later transaction derived from that same state from \`${wordgardStatePurityProbe.collab.derivedBeforeReservation}\` to \`${wordgardStatePurityProbe.collab.derivedAfterReservation}\` because transport reservation mutates the embedded field. Serializing History preserves the field object but replaces its live \`done\` branch (${wordgardStatePurityProbe.history.branchIdentityPreserved ? 'identity preserved' : 'identity changed'}). Transport reservation belongs outside an immutable snapshot; serialization must copy/map instead of normalizing the live field.

The persistence contract fails at construction too. Plot and Slice constructors retain caller-owned arrays: appending a second text leaf changes their serialized content to \`${wordgardValuePurityProbe.plotInputAliasing.after.text}\` and \`${wordgardValuePurityProbe.sliceInputAliasing.after.text}\` while both cached lengths remain stale. Leaf construction likewise retains a caller-owned mark array, so the same node changes from \`${wordgardValuePurityProbe.markSetInputAliasing.before.text}\` to \`${wordgardValuePurityProbe.markSetInputAliasing.after.text}\`. \`Transaction.newDoc\` is publicly writable; replacing it makes the published state disagree with the canonical change (${wordgardValuePurityProbe.writableTransactionNewDoc.after.publishedStateText || 'empty'} versus \`${wordgardValuePurityProbe.writableTransactionNewDoc.after.appliedChangeText}\`). A failed lazy field update also leaves \`tr._state\` cached: the next read exposes document \`${wordgardValuePurityProbe.failedTransactionStateResolution.secondStateDocText}\` and reports \`${wordgardValuePurityProbe.failedTransactionStateResolution.secondStateFieldError}\` instead of preserving failure atomicity. Wordgard's nominal classes therefore do not currently deliver the immutable-value or publication guarantees used to justify them.

## Official site integrity

The site audit maps ${wordgardSiteCoverage.summary.mappedSections}/${wordgardSiteCoverage.summary.sections} source sections and all ${wordgardSiteCoverage.summary.declarations.toLocaleString()} declarations without an unexplained file, declaration, parse diagnostic, or unused concept. It also found these independent defects and unproved public claims:

${wordgardSiteCoverage.findings
  .map(
    ({ detail, evidence, id, severity, title }) =>
      `- **${severity} — ${title}** (\`${id}\`): ${detail} ${citationText(evidence.map((value) => `../wordgard-website/${value}`))}.`
  )
  .join('\n')}

## Official forum intent and public boundary

The forum pass reviewed every post anonymously reachable through the latest, category, category-description, and global-post Discourse JSON endpoints. It separates ${wordgardForumCoverage.summary.maintainerPosts} maintainer posts, ${wordgardForumCoverage.summary.communityPosts} community posts, and ${wordgardForumCoverage.summary.systemPosts} system posts; ${wordgardForumCoverage.summary.materialPosts} posts carry material architecture or requirement content. The live instance reports ${wordgardForumInventory.completeness.instanceTopicCount} topics and ${wordgardForumInventory.completeness.instancePostCount} posts, but only ${wordgardForumInventory.completeness.publicTopicCount}/${wordgardForumInventory.completeness.visiblePostCount} are anonymously retrievable. The remaining ${wordgardForumInventory.completeness.instanceRecordsNotAnonymousRetrievable.topics} topics and ${wordgardForumInventory.completeness.instanceRecordsNotAnonymousRetrievable.posts} posts may be private, deleted, or otherwise inaccessible and are an explicit corpus boundary, not silently treated as empty.

The public forum adds ${wordgardForumCoverage.summary.proposedMatrixRows} decision-atomic requirement rows:

${wordgardForumCoverage.mappings.proposedMatrixRows
  .map(({ id, title, whyNew }) => `- \`${id}\` — **${title}**: ${whyNew}`)
  .join('\n')}

See the [forum coverage ledger](wordgard-forum-coverage.md) for every reviewed post, author class, claim, exclusion, and matrix mapping.

## Ranked material decisions

${materialRows
  .map(
    (row) =>
      `- **${row.priority} — ${row.title}** (\`${row.id}\`): [public shape and gates](material-dossiers.md#${dossierByRow.get(row.id).slug}).`
  )
  .join('\n')}

## Namespace measurement

Wordgard's build rewrite helps bundlers discard whole unused namespace objects, not arbitrary properties inside a used namespace. In the current dist, Rolldown emits ${wordgardNamespaceProbe.results.find(({ id }) => id === 'heading.keyBindings').rolldown.bytes.toLocaleString()} bytes for \`heading.keyBindings\` and ${wordgardNamespaceProbe.results.find(({ id }) => id === 'heading.createOnHash').rolldown.bytes.toLocaleString()} for \`heading.createOnHash\`; esbuild emits ${wordgardNamespaceProbe.results.find(({ id }) => id === 'heading.keyBindings').esbuild.bytes.toLocaleString()} and ${wordgardNamespaceProbe.results.find(({ id }) => id === 'heading.createOnHash').esbuild.bytes.toLocaleString()}. Both outputs retain the other heading members' sentinels. This is consistent with the FAQ's “coherent namespace” tradeoff, but it is not property-level tree-shaking and does not rescue Plite's frozen \`*Api\` objects.

## Explicitly deferred research

${
  deferredIds.length === 0
    ? '- None.'
    : deferredIds
        .map((id) => {
          const dossier = dossierByRow.get(id);
          return dossier
            ? `- \`${id}\`: [entry condition and research shape](material-dossiers.md#${dossier.slug}).`
            : `- \`${id}\``;
        })
        .join('\n')
}

## Stronger local mechanisms

Keep Plite's structural JSON model, named and owned roots, runtime identities, anchors, canonical changes, schema fingerprints, compiled fitting, explicit extension graph, state/effect codecs, command descriptors, bounded corrections, host codecs, selection protocol, React projection, DOM scheduler, History persistence, Yjs envelope, layout, accessibility, and proof graph. Keep Plate's feature packages, RSC/static components, codecs, copied registry, and descriptor-owned capabilities.

## Attachment verdict

The persisted-identity law is right: first-party persisted AST identities should be explicit semantic names, while behavior-only plugins should have no AST type. Two attachment details lose: \`KEYS\` cannot spread \`NODES\`, and migration is a pure host persistence operation rather than an installed compatibility plugin. Its \`h1\` through \`h6\` exception survives. Plate exposes real per-level installation, component, rule, shortcut, injection, and finite-type configuration; collapsing those contracts into one \`heading + level\` plugin would trade away useful plugin granularity for prettier algebra.

## Prior-candidate reconciliation

${priorCandidates.length} normalized candidates are reconciled. Every alias preserves its source locator and digest; no prior claim cites this audit, its plan, its report, its dossiers, or its registry publication.

## Exact disposition summary

<!-- audit-summary:start -->
${JSON.stringify(machineSummary)}
<!-- audit-summary:end -->

${renderSummaryGroup('Origin', summaryGroups.origin)}

${renderSummaryGroup('Classification', summaryGroups.classification)}

${renderSummaryGroup('Preferred base', summaryGroups.preferred)}

${renderSummaryGroup('Reference adaptation', summaryGroups.referenceAdaptation)}

${renderSummaryGroup('Local debt', summaryGroups.localDebt)}

${renderSummaryGroup('Proof adaptation', summaryGroups.proofAdaptation)}

${renderSummaryGroup('Verdict', summaryGroups.verdict)}

${renderSummaryGroup('Priority', summaryGroups.priority)}

${renderSummaryGroup('Prior disposition', summaryGroups.priorDisposition)}

### Material IDs

${summaryGroups.materialIds.map((id) => `- \`${id}\``).join('\n')}

### Deferred IDs

${summaryGroups.deferredIds.length === 0 ? '- None.' : summaryGroups.deferredIds.map((id) => `- \`${id}\``).join('\n')}

## Test and issue lanes

- [Current test harvest](../../../editor-test-harvester/wordgard/report.md): current source/test inventory plus explicitly stale-dist harness results; no current-head runtime claim.
- [Current issue semantics](../../../editor-issue-harvester/wordgard/full/issue-closure-ledger.md): ${issueCounts.checked}/${issueCounts.total} issues read with full bodies and timelines, ${issueCounts.open} open, ${issueCounts.closed} closed, and ${issueCounts.auditChanging} audit-changing. Issue claims remain requirements or corroboration unless current source or tests independently prove them.

## Evidence gaps

- Wordgard has no trustworthy current-head runtime run until its harness imports current source or a clean successful build; the existing 572/733 counts execute the historical ignored dist.
- Raw iOS/Android input and native selection-handle behavior remain unproven; desktop WebKit and mobile viewports do not count.
- Wordgard's shadow-document native-input reconciliation is not an adoption candidate: Plite already owns the narrower canonical text-delta, import, dedupe, repair, composition, named-root, and virtualization contracts with stronger proof.
- Runtime API subpaths remain gated by packed-artifact Rolldown and esbuild proof for every exported method; the current source-entry sample is diagnostic evidence only.
- Issue-driven requirements without current implementation or exact proof remain deferred with their named owner; semantic hydration does not turn reports into runtime evidence.
- The forum has ${wordgardForumInventory.completeness.instanceRecordsNotAnonymousRetrievable.topics} topics and ${wordgardForumInventory.completeness.instanceRecordsNotAnonymousRetrievable.posts} posts outside anonymous retrieval, plus ${wordgardForumInventory.completeness.visiblePostNumberGaps} visible post-number gap; no claim is made about their contents.

## Official intent

[Wordgard's FAQ](https://wordgard.net/docs/faq/) calls its namespace output repair a build-system hack and does not claim reliable behavior across bundlers. The [0.1 design note](https://marijnhaverbeke.nl/blog/wordgard-0.1.html) describes experimental 0.x choices around relaxed schema, facets, selection, and \`beforeinput\`. Intent explains the design; current source and proof decide the winner.

## Publication

- [Concept manifest](concept-manifest.json)
- [Atomic matrix](concept-matrix.md)
- [Material dossiers](material-dossiers.md)
- Validation receipt is written only after semantic validation and then published into \`docs/editor-audits/index.json\`.
`;

writeFileSync(resolve(artifactRoot, 'concept-matrix.md'), matrix);
writeFileSync(resolve(artifactRoot, 'material-dossiers.md'), dossiers);
writeFileSync(resolve(artifactRoot, 'audit-report.md'), report);

const consumedArtifacts = [
  [
    'matrix truth',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/matrix-truth.mjs',
  ],
  [
    'prior candidates',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/prior-candidates.mjs',
  ],
  [
    'dossier truth',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/dossier-data.mjs',
  ],
  ...evidenceModulePaths.map((path) => ['comparison evidence', path]),
  [
    'wordgard coverage',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json',
  ],
  [
    'wordgard raw inventory',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-raw-source-inventory.json',
  ],
  [
    'wordgard official site coverage',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-site-coverage.json',
  ],
  [
    'wordgard forum inventory',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-forum-inventory.json',
  ],
  [
    'wordgard forum coverage',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-forum-coverage.json',
  ],
  [
    'wordgard forum coverage ledger',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-forum-coverage.md',
  ],
  [
    'plite coverage',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json',
  ],
  [
    'plate coverage',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json',
  ],
  [
    'runtime API probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/runtime-api-bundle-probe.json',
  ],
  [
    'wordgard namespace probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-namespace-bundle-probe.json',
  ],
  [
    'wordgard state purity probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-state-purity-probe.json',
  ],
  [
    'wordgard value purity probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-value-purity-probe.json',
  ],
  [
    'wordgard public contract probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json',
  ],
  [
    'wordgard published package probe',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-published-package-probe.json',
  ],
  ['test harvest', 'docs/editor-test-harvester/wordgard/report.md'],
  [
    'test harvest inventory',
    'docs/editor-test-harvester/wordgard/inventory.md',
  ],
  ['test harvest index', 'docs/editor-test-harvester/wordgard/test-index.md'],
  [
    'issue refresh',
    'docs/editor-issue-harvester/wordgard/full/issue-refresh.json',
  ],
  [
    'issue classification',
    'docs/editor-issue-harvester/wordgard/full/classified-issues.json',
  ],
  [
    'issue closure ledger',
    'docs/editor-issue-harvester/wordgard/full/issue-closure-ledger.md',
  ],
  [
    'matrix',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/concept-matrix.md',
  ],
  [
    'report',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/audit-report.md',
  ],
  [
    'dossiers',
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/material-dossiers.md',
  ],
].map(([role, path]) => ({
  path: repoPath(path),
  role,
  sha256: hashFile(path),
}));

const manifest = {
  schemaVersion: 4,
  kind: 'wordgard-plite-plate-atomic-symmetric-union',
  generatedAt,
  authority: {
    plateHead: plateCoverage.repositoryHead,
    pliteHead: pliteCoverage.provenance.head,
    wordgardHead: wordgardCoverage.authority.head,
    wordgardClean: wordgardCoverage.authority.clean,
    wordgardSiteHead: wordgardSiteCoverage.authority.head,
    wordgardSiteClean: wordgardSiteCoverage.authority.clean,
    wordgardForumRetrievedAt: wordgardForumCoverage.retrievedAt,
    wordgardForumPublicCorpusHash:
      wordgardForumInventory.authority.publicCorpusHash,
  },
  policy: {
    atomicity:
      'One row per decision-atomic mechanism. Source concepts may fan out; extracted mechanisms merge into existing canonical rows.',
    exactMapping:
      'Exact requires distinct public, owner, consumer, lifecycle, and proof facets backed by source inventory edges.',
    priorTruth:
      'Every durable earlier decision is immutable provenance, never inferred from or cited to this audit.',
    comparisonEvidence:
      'Inventory-selected evidence proves closure only. Non-insufficient winners require explicit dimension keys backed by direct facets; runtime requires explicit comparable evidence.',
    forumIntent:
      'Official forum posts may establish intent, reported demand, or a research requirement. They never establish implementation, correctness, runtime behavior, or proof.',
  },
  summary: {
    concepts: matrixTruth.length,
    material: materialRows.length,
    deferred: deferredIds.length,
    priorCandidates: priorCandidates.length,
    wordgardFiles: wordgardCoverage.summary.files,
    wordgardDeclarations: wordgardCoverage.summary.declarations,
    wordgardSourceConcepts: wordgardCoverage.summary.concepts,
    wordgardPublishedPackageExports:
      wordgardPublishedPackageProbe.entries.length,
    wordgardPublishedPackageFiles: wordgardPublishedPackageProbe.pack.fileCount,
    wordgardSiteFiles: wordgardSiteCoverage.summary.files,
    wordgardSiteSourceConcepts: wordgardSiteCoverage.summary.concepts,
    wordgardForumPublicTopics: wordgardForumCoverage.summary.publicTopics,
    wordgardForumVisiblePosts: wordgardForumCoverage.summary.visiblePosts,
    wordgardForumClaims: wordgardForumCoverage.summary.claims,
    pliteFiles: pliteCoverage.summary.files,
    pliteSourceConcepts: Object.keys(pliteCoverage.concepts).length,
    plateFiles: plateCoverage.summary.includedFiles,
    plateSourceConcepts: plateCoverage.conceptIds.length,
    dimensionEvidence: evidenceSummary,
  },
  concepts: matrixTruth.map((row) => ({
    ...row,
    decision: {
      classification: row.classification,
      preferredBase: row.preferred,
      referenceAdaptation: row.referenceAdaptation,
      localDebt: row.localDebt,
      proofAdaptation: row.proofAdaptation,
      verdict: row.verdict,
      priority: row.priority,
    },
    dossier: dossierByRow.get(row.id)?.slug ?? row.dossier,
    priorCandidateIds: (candidatesByConcept.get(row.id) ?? []).map(
      ({ id }) => id
    ),
  })),
  sourceMappings,
  forumMappings: wordgardForumCoverage.mappings,
  priorCandidates: priorCandidates.map((candidate) => ({
    ...candidate,
    evidence: `${candidate.sources[0].path}:${candidate.sources[0].lineStart}-${candidate.sources[0].lineEnd}`,
    provenance: candidate.sources,
  })),
  summaryGroups,
  generatedArtifacts: consumedArtifacts,
};

writeFileSync(
  resolve(artifactRoot, 'concept-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`
);

process.stdout.write(
  `Generated ${matrixTruth.length} atomic rows, ${priorCandidates.length} prior candidates, ${materialRows.length} material dossiers, and ${allDossiers.length} total dossiers at ${generatedAt}.\n`
);

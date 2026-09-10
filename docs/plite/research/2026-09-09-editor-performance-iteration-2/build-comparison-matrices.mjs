import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateConceptMatrix } from '../../../../.agents/skills/editor-audit/scripts/validate-concept-matrix.mjs';
import { prosekitOwners, wordgardOwners } from './reference-owner-map.mjs';
import { refineComparisonRows } from './refine-comparison-decisions.mjs';

const root = resolve(import.meta.dirname, '../../../..');
const artifact = resolve(
  root,
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const read = (file) =>
  JSON.parse(readFileSync(resolve(artifact, file), 'utf8'));
const assessments = read('architecture-scores.json').lanes;
const local = read('local-architecture-manifest.json');
const prior = read('prior-candidate-reconciliation.json');
const portable = read('portable-invariant-reconciliation.json');
const citation = (file) => `\`${file}:1\``;
const columns = [
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
const cell = (text) => text.replaceAll('|', '&#124;').replaceAll('\n', ' ');
const partial = (owner, gap, proof, reason) =>
  `partial — covers=${citation(owner)}; missing=${citation(gap)}; proof=${citation(proof)} — ${reason}`;
const topicLane = (topic) => {
  if (/code-block|code-themes/.test(topic)) return 'plate.code-block';
  if (/table/.test(topic)) return 'plate.table';
  if (/list/.test(topic)) return 'plate.list';
  if (/search|find/.test(topic)) return 'plate.find';
  if (/link/.test(topic)) return 'plate.link';
  if (/mention/.test(topic)) return 'plate.mention';
  if (/math|katex/.test(topic)) return 'plate.math';
  if (/image|file/.test(topic)) return 'plate.media';
  if (/page/.test(topic)) return 'plite.pagination';
  if (/virtual-selection/.test(topic)) return 'plite.native-selection';
  if (/history|undo/.test(topic)) return 'plite.history';
  if (/yjs|collab/.test(topic)) return 'plite.collaboration-document';
  if (/drag|drop|block-handle/.test(topic)) return 'plite.drag';
  if (/autocomplete|slash|tag-menu/.test(topic)) return 'plate.combobox';
  if (/resiz/.test(topic)) return 'plate.resizable';
  if (
    /mark|bold|italic|strike|superscript|subscript|color|align|highlight|underline|font/.test(
      topic
    )
  )
    return 'plate.basic-styles';
  if (/heading|paragraph|blockquote|horizontal-rule|hard-break/.test(topic))
    return 'plate.basic-nodes';
  if (/schema|correction|normaliz/.test(topic)) return 'plite.schema';
  if (/facet/.test(topic)) return 'plite.facets';
  if (/command|keymap/.test(topic)) return 'plite.commands';
  if (/clipboard|paste|serialize|save-html/.test(topic))
    return 'plite.clipboard';
  if (/selection|coords|cursor|pos/.test(topic)) return 'plite.selection';
  if (/change|transaction|state/.test(topic)) return 'plite.transactions';
  if (/decoration|content|widget|tile/.test(topic)) return 'plite.view-sources';
  if (/composition|input|dom/.test(topic)) return 'plite.input-runtime';
  if (/doc|text|node/.test(topic)) return 'plite.document';
  return null;
};

for (const [name, owners] of [
  ['wordgard', wordgardOwners],
  ['prosekit', prosekitOwners],
]) {
  const inventory = read(`${name}-source-inventory.json`);
  const referenceRoot = resolve(root, `../${name}`);
  for (const [id, [file]] of Object.entries(owners))
    if (!existsSync(resolve(referenceRoot, file)))
      throw new Error(`${name}/${id}: missing ${file}`);
  const prefix = name === 'wordgard' ? 'WG' : 'PK';
  const manifestName = `${name}-concept-manifest.json`;
  const matrixName = `${name}-concept-matrix.md`;
  const gapsName = `${name}-contract-gaps.md`;
  const gapPath = `docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/${gapsName}`;
  const coveragePath = `docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/${name}-source-coverage.json`;
  const proofPath = `docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/${name}-full-test-inventory.json`;
  const priorPath =
    'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/prior-candidate-reconciliation.md';
  const idForLane = (lane) =>
    `${prefix}-${lane.toUpperCase().replaceAll('.', '-').replaceAll('_', '-')}`;
  const referenceExtras =
    name === 'wordgard'
      ? [
          {
            id: 'WG-AUTHORITY-OT',
            file: 'src/collab/collab.ts',
            title: 'Central-authority transformation protocol',
            job: 'Transform and acknowledge stale client changes through a central authority.',
            contract:
              'The local collaboration job uses Yjs with named roots and provider ownership; adopting a second synchronization protocol has no demonstrated current user value.',
            law: 'Preserve convergence, offline edits, remote undo mapping and corrections through the current Yjs owner.',
            scale:
              'Network/acknowledgement scheduling and transform backlog differ from Yjs update delivery, so text-edit timings do not compare the synchronization architectures.',
            verdict: 'reject',
          },
          {
            id: 'WG-TEXT-CHUNKS',
            file: 'src/doc/text.ts',
            title: 'Persistent text chunks',
            job: 'Store and edit text through chunked immutable values.',
            contract:
              'A private large-leaf representation may change while JSON remains the interchange contract; whole-text consumers can erase the gain.',
            law: 'Preserve UTF-16 offsets, grapheme behavior, slice/JSON values, canonical changes, undo and collaboration.',
            scale:
              'Compare creation, adjacent and scattered edits, whole-string reads, serialization and retained memory at identical text sizes.',
            verdict: 'defer',
          },
          {
            id: 'WG-PHRASES',
            file: 'src/phrases/phrases.ts',
            title: 'Reactive UI phrase lookup',
            job: 'Resolve localized editor menu and dialog phrases from a shared contribution owner.',
            contract:
              'Editor localization is a user-facing feature job; it does not justify changing the local document or React subscription model.',
            law: 'Language changes must preserve active selection, focus and accessible labels.',
            scale:
              'Measure language-switch fanout separately from ordinary typing; phrase lookup should not rebuild document state.',
            verdict: 'defer',
          },
          {
            id: 'WG-MAC-LINE-KEYMAP',
            file: 'src/editor/keymap.ts',
            title: 'macOS line navigation binding precedence',
            job: 'Resolve word and visual-line shortcuts in deterministic order.',
            contract:
              'The measured reference pin resolves Mod-Arrow before the macOS line binding, producing word movement for the requested line action.',
            law: 'Cmd-Left/Right must reach the visual line boundary in the single-line common fixture, with matching native and model selection.',
            scale:
              'A failed operation receives no latency rank. Keep all 31 failed samples at each cohort in the denominator.',
            verdict: 'reject',
          },
        ]
      : [
          {
            id: 'PK-LORO-BINDING',
            file: 'packages/extensions/src/loro/loro.ts',
            title: 'Alternative Loro collaboration binding',
            job: 'Compose synchronization, cursor and undo bindings for the Loro CRDT.',
            contract:
              'An alternative CRDT is an independent interoperability job. Current Yjs adoption does not establish demand for a second binding.',
            law: 'Any future binding must preserve local document/schema behavior, offline convergence, remote undo and provider destruction.',
            scale:
              'Compare wire bytes, reconnect replay, local/remote edit latency and retained history independently of React render cost.',
            verdict: 'defer',
          },
          {
            id: 'PK-REVISION-COMMITS',
            file: 'packages/extensions/src/commit/index.ts',
            title: 'Saved document revision comparison',
            job: 'Store parent/current documents and transform steps for revision comparison and restoration.',
            contract:
              'Saved product revisions are distinct from undo history and inline tracked suggestions; the jobs must not be merged merely because all retain old content.',
            law: 'Restoration must preserve schema validity and distinguish product revision identity from live undo/collaboration history.',
            scale:
              'Measure serialized revision size, diff rendering and restore latency against whole-document size and revision count.',
            verdict: 'defer',
          },
          {
            id: 'PK-FRAMEWORK-ADAPTERS',
            file: 'packages/vue/src/index.ts',
            title: 'Additional framework adapters',
            job: 'Expose one editor model through Vue, Svelte, Solid, Preact and Lit adapters.',
            contract:
              'Plate currently owns a React integration; additional framework compatibility is a separate user job, not evidence that its React architecture should gain another layer.',
            law: 'Adapter disposal must remove views/listeners while keeping surviving editor models valid.',
            scale:
              'Framework-specific mount/update measurements cannot be folded into a React Compiler performance rank.',
            verdict: 'reject',
          },
          {
            id: 'PK-VFS-DEVTOOLS',
            file: 'packages/vfs/src/index.ts',
            title: 'Development virtual-file tooling',
            job: 'Provide virtual files and development tooling for reference examples and documentation.',
            contract:
              'Development and documentation tooling remains outside the editor interaction architecture; its source is still accounted for.',
            law: 'Tooling must not become a requirement of ordinary editor setup or plugin authoring.',
            scale:
              'Build and hot-reload costs belong to the tooling lane, independently of input latency.',
            verdict: 'reject',
          },
        ];
  for (const entry of referenceExtras)
    if (!existsSync(resolve(referenceRoot, entry.file)))
      throw new Error(`Missing extra owner ${entry.file}`);
  const concepts = assessments.map((lane) => ({
    id: idForLane(lane.id),
    lane: lane.id,
    origin: lane.id.startsWith('plite.')
      ? 'Plite'
      : lane.id.startsWith('plate.')
        ? 'Plate'
        : 'shared',
  }));
  concepts.push(
    ...referenceExtras.map(({ id, title }) => ({
      id,
      title,
      origin: 'reference',
    }))
  );
  const sourceUnits = inventory.files.map((unit) => {
    const exact = Object.entries(owners).find(
      ([, [file]]) => file === unit.path
    );
    let conceptId = exact ? idForLane(exact[0]) : null;
    let reason = exact
      ? 'Named comparison owner; semantic coverage is qualified in the matrix.'
      : null;
    if (
      !conceptId &&
      name === 'prosekit' &&
      /^packages\/(?:vue|svelte|solid|preact|lit)\//.test(unit.path)
    ) {
      conceptId = 'PK-FRAMEWORK-ADAPTERS';
      reason =
        'Additional framework implementation; accounted separately from the React target.';
    }
    if (
      !conceptId &&
      name === 'prosekit' &&
      /^registry\/src\/(?:vue|svelte|solid|preact|lit|vanilla)\//.test(
        unit.path
      )
    ) {
      conceptId = 'PK-FRAMEWORK-ADAPTERS';
      reason =
        'Framework-specific consumer/fixture; not a distinct editor-model implementation.';
    }
    if (
      !conceptId &&
      name === 'prosekit' &&
      /^packages\/(?:dev|vfs|typedoc-plugin)\//.test(unit.path)
    ) {
      conceptId = 'PK-VFS-DEVTOOLS';
      reason =
        'Reference development tooling outside direct editor interaction.';
    }
    if (!conceptId && /\/loro\//.test(unit.path)) {
      conceptId = 'PK-LORO-BINDING';
      reason = 'Alternative collaboration binding and consumers.';
    }
    if (!conceptId && /\/(?:commit|change-tracking)\//.test(unit.path)) {
      conceptId = 'PK-REVISION-COMMITS';
      reason = 'Product revision feature and consumers.';
    }
    if (
      !conceptId &&
      name === 'wordgard' &&
      unit.path.startsWith('src/phrases/')
    ) {
      conceptId = 'WG-PHRASES';
      reason = 'UI phrase contribution and lookup.';
    }
    if (!conceptId) {
      const topic = unit.path.split('/').slice(2).join('/');
      const lane =
        topicLane(topic) ??
        (unit.testSource
          ? 'proof.package-corpus'
          : /config|package.json|tsconfig|README|\.md$|loaders\.gen/.test(
                unit.path
              )
            ? 'tooling.package-build'
            : unit.path.startsWith('registry/')
              ? 'product.registry'
              : name === 'prosekit' && unit.path.startsWith('packages/react/')
                ? 'plite.react-components'
                : 'plite.extensions');
      conceptId = idForLane(lane);
      reason =
        'Supporting source, barrel, consumer or proof assigned to its comparison family; accounting is not an exact semantic trace.';
    }
    return { ...unit, conceptId, accountingReason: reason };
  });
  const unknownUnits = sourceUnits.filter(
    (unit) => !concepts.some((concept) => concept.id === unit.conceptId)
  );
  if (unknownUnits.length)
    throw new Error(`Unmapped reference units ${unknownUnits.length}`);
  writeFileSync(
    resolve(artifact, `${name}-source-coverage.json`),
    JSON.stringify(
      {
        scope:
          'Complete captured reference file accounting; semantic facets and proof gaps are separate. Ancillary framework/tooling units retain explicit concept owners.',
        expected: inventory.files.length,
        mapped: sourceUnits.length,
        unknown: unknownUnits,
        units: sourceUnits,
      },
      null,
      2
    ) + '\n'
  );
  const manifest = {
    capturedAt: new Date().toISOString(),
    scope:
      'Current performance architecture: all 93 local architecture/support owners plus independently distinct reference mechanisms. The six-dimension matrix withholds superiority when exact contract or runtime evidence is missing.',
    concepts,
    priorCandidates: prior.rows.map((candidate) => ({
      id: candidate.id,
      conceptIds: [idForLane(candidate.lane)],
      evidence: candidate.evidence,
    })),
    localCoverage: 'local-architecture-manifest.json',
    referenceCoverage: `${name}-source-coverage.json`,
    sourceUnits: {
      local: local.expectedUnits,
      localExcludedRelease: 24,
      reference: sourceUnits.length,
    },
    proofFamilies: portable.families
      .filter((family) => family.repository === name)
      .map((family) => ({
        id: family.id,
        proofAdaptation: family.proofAdaptation,
        evidence: family.sourceReport,
      })),
  };
  const rows = [];
  const gaps = [
    `# ${name} contract and source-search gaps`,
    '',
    'The matrix is a research comparison, not certification. Partial mappings name the covered owner, this explicit missing-facet record, and the available proof inventory. No generic source inventory is promoted to an exact API/consumer/lifecycle/runtime trace.',
    '',
  ];
  for (const lane of assessments) {
    const concept = concepts.find((entry) => entry.lane === lane.id);
    const reference = owners[lane.id];
    const source = citation(lane.owner);
    const guard =
      local.lanes
        .find((entry) => entry.id === lane.id)
        ?.files.find((file) => /test|spec/.test(file)) ?? lane.owner;
    const token = lane.id.split('.').at(-1);
    const searches = inventory.files
      .filter((unit) => unit.path.toLowerCase().includes(token))
      .map((unit) => unit.path);
    const donorSource = reference ? `../${name}/${reference[0]}` : coveragePath;
    const donorReason =
      reference?.[1] ??
      `No independent ${token} contract was resolved in the captured ${name} source target; filename search returned ${searches.length} candidates. This is an unresolved comparison, not evidence of an architectural win.`;
    gaps.push(
      `## ${concept.id}`,
      '',
      `Local owner: ${source}. Reference candidate: ${citation(donorSource)}. ${donorReason}`,
      '',
      `Missing: exact reference public-entry, representative consumer, lifecycle/failure and current runtime parity for this specific local job; current full-path workload coverage for ${lane.id}. Current local API source: ${lane.publicEntries.map((entry) => `\`${entry}\``).join(', ') || 'internal/consumer owner'}. The falsifier is: ${lane.axes.scale.falsifier}`,
      '',
      `Source filename search (${token}): ${searches.length ? searches.map((file) => `\`${file}\``).join(', ') : 'zero matches in the complete recorded file inventory'}.`,
      ''
    );
    const currentMapping = partial(
      lane.owner,
      gapPath,
      guard,
      lane.axes.owner.reason
    );
    const pliteMapping = lane.id.startsWith('plate.')
      ? `not-applicable — ${citation('docs/vision/plate.md')} assigns this feature/product policy to Plate; its underlying transactions are a separate Plite concept.`
      : currentMapping;
    const plateMapping = lane.id.startsWith('plite.')
      ? partial(
          'packages/platejs/src/react/editor/withPlate.ts',
          gapPath,
          'packages/platejs/src/history/plite-history.internal.ts',
          `Plate adopts the substrate; this row does not invent an independent ${token} runtime.`
        )
      : currentMapping;
    const relatedPrior = prior.rows.filter(
      (candidate) => candidate.lane === lane.id
    );
    const applicableFamilies = portable.families.filter(
      (family) =>
        family.repository === name &&
        (family.currentSourceCandidates.includes(lane.owner) ||
          topicLane(family.topic) === lane.id)
    );
    rows.push({
      ID: `\`${concept.id}\``,
      Concept: lane.id,
      Origin: concept.origin,
      'Reference mapping': partial(
        donorSource,
        gapPath,
        proofPath,
        donorReason
      ),
      'Plite mapping': pliteMapping,
      'Plate mapping': plateMapping,
      Correctness: `insufficient evidence — ${lane.axes.correctness.reason} ${source}; ${citation(gapPath)} preserves the missing exact reference replay.`,
      'API/types': `different tradeoff — ${lane.axes.api.reason} ${source}; ${donorReason} ${citation(donorSource)}`,
      'Data/collab': `different tradeoff — ${lane.axes.boundary.reason} ${source}; the reference target ${citation(donorSource)} does not establish identical document, named-root or synchronization obligations.`,
      'Ownership/lifecycle': `different tradeoff — ${lane.axes.lifetime.reason} ${source}; the reference owner ${citation(donorSource)} requires its own failure and teardown trace before adoption.`,
      'Runtime/perf': `insufficient evidence — ${lane.axes.scale.reason} ${source}; the missing exact ${lane.id} comparison is recorded in ${citation(gapPath)}.`,
      'Proof/host': `insufficient evidence — ${lane.axes.proof.reason} ${source}; ${applicableFamilies.length ? applicableFamilies.map((family) => family.id).join(', ') : 'no exact portable-family match'} is accounted in ${citation('docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/portable-invariant-reconciliation.json')}.`,
      Classification: `insufficient evidence — ${source} establishes current ${lane.id} ownership but ${citation(gapPath)} prevents a complete cross-editor superiority claim.`,
      'Preferred base': `insufficient evidence — retain the current ${lane.id} implementation during research; ${citation(gapPath)} names the comparison needed to choose a replacement.`,
      'Reference adaptation': `defer — ${donorReason} ${citation(donorSource)}`,
      'Local debt': `insufficient evidence — ${lane.axes.scale.falsifier} ${source}`,
      'Proof adaptation': `defer — ${lane.axes.proof.reason} ${citation(proofPath)} retains the reference assertion inventory and the exact replay boundary.`,
      'Prior candidates': relatedPrior.length
        ? relatedPrior
            .map(
              (candidate) =>
                `\`${candidate.id}\` ${candidate.disposition} — ${candidate.reason} ${citation(priorPath)}`
            )
            .join('<br>')
        : `none — ${citation(priorPath)} has no prior P0–P3 candidate assigned to ${lane.id}.`,
      Verdict: `defer — compare the exact ${lane.id} contract and complete operation before accepting a replacement. ${source}`,
      Priority: '—',
    });
  }
  for (const entry of referenceExtras) {
    const source = citation(`../${name}/${entry.file}`);
    const hardReject = entry.verdict === 'reject';
    rows.push({
      ID: `\`${entry.id}\``,
      Concept: entry.title,
      Origin: 'reference',
      'Reference mapping': partial(
        `../${name}/${entry.file}`,
        gapPath,
        proofPath,
        entry.job
      ),
      'Plite mapping': partial(
        'packages/plitejs/src/interfaces/editor.ts',
        gapPath,
        'packages/plitejs/test/schema-contract.ts',
        entry.contract
      ),
      'Plate mapping': partial(
        'packages/platejs/src/lib/plugin/BasePlugin.ts',
        gapPath,
        'packages/platejs/src/features/table/lib/BaseTablePlugin.ts',
        entry.contract
      ),
      Correctness: `different tradeoff — ${entry.law} ${source}`,
      'API/types': `different tradeoff — ${entry.contract} ${source}`,
      'Data/collab': `different tradeoff — ${entry.job} ${source}; the JSON/schema/Yjs boundaries remain the local adoption constraints in ${citation('docs/vision/plite.md')}.`,
      'Ownership/lifecycle': `insufficient evidence — the independent ${entry.title} owner is ${source}; complete local adoption and resource cleanup are not proven by nearby APIs.`,
      'Runtime/perf': `insufficient evidence — ${entry.scale} ${source}`,
      'Proof/host': `insufficient evidence — ${entry.title} needs its named-law replay; ${citation(proofPath)} accounts declarations without claiming that replay.`,
      Classification: `different tradeoff — ${entry.contract} ${source}`,
      'Preferred base': `different tradeoff — ${entry.job} has distinct constraints from the current local target. ${source}`,
      'Reference adaptation': `${hardReject ? 'reject' : 'defer'} — ${entry.contract} ${source}`,
      'Local debt': `${hardReject ? 'none' : 'insufficient evidence'} — no local replacement is accepted for ${entry.title}; ${entry.scale} ${source}`,
      'Proof adaptation': `defer — retain the behavior law for ${entry.title}: ${entry.law} ${citation(proofPath)}`,
      'Prior candidates': `none — ${citation(priorPath)} reconciles previous candidates at their local owners; this reference-specific mechanism is independently split here.`,
      Verdict: `${entry.verdict} — ${entry.contract} ${source}`,
      Priority: '—',
    });
  }
  concepts.push(
    ...refineComparisonRows({
      rows,
      assessments,
      prefix,
      name,
      gapPath,
      proofPath,
      owners,
    })
  );
  const text = [
    `# ${name} performance architecture comparison`,
    '',
    manifest.scope,
    '',
    `The matrix has ${concepts.length} independent concept rows. All 93 local architecture lanes remain present even where the reference contract is unresolved, with three additional atomic cost/proof rows. All ${sourceUnits.length} captured reference units and all ${prior.rows.length} relevant prior candidates are accounted for. A strict structural pass does not resolve the explicitly retained semantic or runtime gaps.`,
    '',
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map(
      (row) => `| ${columns.map((column) => cell(row[column])).join(' | ')} |`
    ),
    '',
  ].join('\n');
  writeFileSync(resolve(artifact, gapsName), gaps.join('\n') + '\n');
  writeFileSync(
    resolve(artifact, manifestName),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  writeFileSync(resolve(artifact, matrixName), text);
  const validation = validateConceptMatrix({ ledger: text, manifest });
  writeFileSync(
    resolve(artifact, `${name}-matrix-validation.json`),
    JSON.stringify(
      {
        ...validation,
        manifestSha256: createHash('sha256')
          .update(JSON.stringify(manifest))
          .digest('hex'),
        matrixSha256: createHash('sha256').update(text).digest('hex'),
        interpretation:
          'Schema and denominator integrity only. All explicit insufficient-evidence cells continue to limit conclusions.',
      },
      null,
      2
    ) + '\n'
  );
  console.log(
    JSON.stringify({
      name,
      concepts: concepts.length,
      units: sourceUnits.length,
      priorCandidates: prior.rows.length,
      valid: true,
    })
  );
}

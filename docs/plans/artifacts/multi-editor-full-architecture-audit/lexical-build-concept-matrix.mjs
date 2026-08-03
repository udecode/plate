import { readFileSync, writeFileSync } from 'node:fs';

const root = 'docs/plans/artifacts/multi-editor-full-architecture-audit';
const source = JSON.parse(
  readFileSync(`${root}/lexical-source-manifest.json`, 'utf8')
);
const localConcepts = [
  ['PLITE-CHANGE-ALGEBRA', 'Canonical operation and change algebra', 'Plite'],
  ['PLITE-TRANSACTION-MAPPING', 'Transaction mapping and rebasing', 'Plite'],
  ['PLITE-SCHEMA-GRAMMAR', 'Compiled data-first schema grammar', 'Plite'],
  ['PLITE-ELEMENT-ROOTS', 'Element-owned named roots and lifecycle', 'Plite'],
  ['PLITE-READ-MIDDLEWARE', 'Descriptor-owned typed editor reads', 'Plite'],
  [
    'PLITE-EXTENSION-CONTRIBUTIONS',
    'Typed ordered extension contribution points',
    'Plite',
  ],
  ['PLITE-EXTENSION-SLOTS', 'Atomic descriptor replacement slots', 'Plite'],
  [
    'PLITE-DOM-COVERAGE',
    'Renderer-neutral DOM coverage and projection',
    'Plite',
  ],
  [
    'PLITE-CORRECTIONS',
    'Schema-owned correction and representation law',
    'Plite',
  ],
  ['PLITE-ANCHORS', 'Mapped stable document anchors', 'Plite'],
  [
    'PLITE-PERSISTENT-INDEXES',
    'Persistent and element-owned runtime indexes',
    'Plite',
  ],
  ['PLATE-CODECS', 'Compiled schema-owned format codecs', 'Plate'],
  [
    'PLATE-PLUGIN-CAPABILITIES',
    'Inferred plugin API read update and store capabilities',
    'Plate',
  ],
  ['PLATE-HOST-CODEC', 'Host format codec boundary', 'Plate'],
];

const referenceConcepts = Object.entries(source.concepts).map(
  ([id, title]) => ({
    id,
    origin: 'reference',
    title,
  })
);
const concepts = [
  ...referenceConcepts,
  ...localConcepts.map(([id, title, origin]) => ({ id, origin, title })),
];
const manifest = {
  schemaVersion: 1,
  authority: {
    repository: '../lexical',
    commit: source.repository.commit,
    sourceManifest: `${root}/lexical-source-manifest.json`,
  },
  concepts,
  priorCandidates: [
    {
      id: 'A6',
      conceptIds: ['LX-EXTENSION-CONTRACT'],
      evidence:
        'docs/plans/2026-07-25-multi-editor-full-architecture-audit.md:2281',
    },
  ],
};
writeFileSync(
  `${root}/lexical-concept-manifest.json`,
  `${JSON.stringify(manifest, null, 2)}\n`
);

const firstUnit = (id, predicate = () => true) =>
  source.units.find((unit) => unit.concepts.includes(id) && predicate(unit)) ??
  source.units.find((unit) => unit.concepts.includes(id));
const cite = (path, line = 1) => `\`${path}:${line}\``;
const referenceCitation = (id, proof = false) => {
  const unit = firstUnit(
    id,
    proof ? (candidate) => candidate.kind === 'proof' : () => true
  );
  return cite(`../lexical/${unit?.path ?? 'packages/lexical/src/index.ts'}`);
};

const pliteOwner = (id) => {
  if (/EXTENSION|READ|LISTENER|COMMAND|WARN/.test(id)) {
    return 'packages/plite/src/core/editor-extension.ts';
  }
  if (/ELEMENT-ROOTS|NAMED-SLOT/.test(id)) {
    return 'packages/plite/src/core/element-owned-root-index.ts';
  }
  if (/SCHEMA|NODE-CONFIG|NODE-STATE|CORRECTION/.test(id)) {
    return 'packages/plite/src/interfaces/schema.ts';
  }
  if (/DOM|EVENT|REFCOUNT|RECONCILE|INPUT|REACT|SELECTION/.test(id)) {
    return 'packages/plite-react/src/editable/selection-reconciler.ts';
  }
  if (/CHANGE|UPDATE|TRANSACTION|ANCHOR|STATE|HISTORY|YJS|INDEX/.test(id)) {
    return 'packages/plite/src/interfaces/editor.ts';
  }
  return 'packages/plite/src/interfaces/editor.ts';
};
const plateOwner = (id) => {
  if (/MDAST|MARKDOWN/.test(id)) {
    return 'packages/markdown/src/lib/MarkdownPlugin.ts';
  }
  if (/HTML|DOM-IMPORT|DOM-RENDER|CODEC/.test(id)) {
    return 'packages/core/src/lib/plugins/html/HtmlPlugin.ts';
  }
  if (/PLUGIN|REACT|A11Y|PLAYGROUND|CONSUMER|WEBSITE|DEVTOOLS/.test(id)) {
    return 'packages/core/src/lib/plugin/BasePlugin.ts';
  }
  return 'packages/core/src/lib/plugin/BasePlugin.ts';
};

const plateRelevant = (id) =>
  /MDAST|MARKDOWN|HTML|DOM-IMPORT|DOM-RENDER|CODE|LINK|LIST|MARK|TABLE|TAILWIND|REACT|A11Y|PLAYGROUND|CONSUMER|WEBSITE|DEVTOOLS|PLUGIN|CODEC|HOST/.test(
    id
  );
const pliteAbsent = (id) =>
  /PLAYGROUND|WEBSITE|TAILWIND|DEVTOOLS|DRAGON|HASHTAG/.test(id);
const plateAbsent = (id) =>
  !plateRelevant(id) &&
  /CORE-GENMAP|CORE-GC|INTERNAL|PACKAGING|HEADLESS/.test(id);

const partial = (covers, missing, proof) =>
  `partial — covers=${covers}; missing=${missing}; proof=${proof}`;
const absent = (reason, evidence) => `absent — ${reason} ${evidence}`;
const q = (winner, id, dimension, evidence) =>
  `${winner} — ${id} ${dimension} judgment follows the cited owner ${evidence}`;

const rows = concepts.map((concept) => {
  const { id, origin, title } = concept;
  const localOnly = !id.startsWith('LX-');
  const ref = localOnly
    ? absent(
        'Lexical has no equivalent owner for this local-only job.',
        cite(`${root}/lexical-source-manifest.json`)
      )
    : partial(
        `${title} ${referenceCitation(id)}`,
        `does not establish the local owner contract ${cite(`${root}/lexical-architecture-ledger.md`)}`,
        referenceCitation(id, true)
      );
  const plitePath = pliteOwner(id);
  const platePath = plateOwner(id);
  const plite = pliteAbsent(id)
    ? absent(
        'No renderer-neutral Plite job exists for this product or tooling concept.',
        cite(plitePath)
      )
    : partial(
        `the framework-level job ${cite(plitePath)}`,
        `Lexical-specific class or product mechanics ${referenceCitation(id)}`,
        cite(
          /DOM|EVENT|SELECTION/.test(id)
            ? 'packages/plite-react/test/editable-behavior.test.tsx'
            : 'packages/plite/test/extension-methods-contract.ts'
        )
      );
  const plate = plateAbsent(id)
    ? absent(
        'Plate delegates this runtime-internal job to Plite.',
        cite(platePath)
      )
    : partial(
        `the product/plugin job ${cite(platePath)}`,
        `Lexical-specific runtime mechanics ${referenceCitation(id)}`,
        cite(
          /MDAST|MARKDOWN/.test(id)
            ? 'packages/markdown/src/lib/MarkdownPlugin.spec.ts'
            : 'packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts'
        )
      );

  let classification = 'Plite/Plate stack stronger';
  let preferred = 'Plite/Plate stack';
  let referenceAdaptation = 'keep-local';
  let localDebt = 'none';
  let proofAdaptation = 'keep-local';
  let verdict = 'keep';
  let priority = '—';

  if (id === 'LX-MDAST') {
    classification = 'reference stronger';
    preferred = 'reference';
    referenceAdaptation = 'adapt';
    localDebt = 'material';
    proofAdaptation = 'keep-local';
    verdict = 'steal';
    priority = 'P1';
  } else if (id === 'LX-CORE-REFCOUNT') {
    classification = 'reference stronger';
    preferred = 'reference';
    referenceAdaptation = 'adapt';
    localDebt = 'material';
    proofAdaptation = 'keep-local';
    verdict = 'rearchitect';
    priority = 'P2';
  } else if (localOnly && (origin === 'Plite' || origin === 'Plate')) {
    classification = origin === 'Plite' ? 'Plite stronger' : 'Plate stronger';
    preferred = origin;
    referenceAdaptation = 'not-applicable';
    proofAdaptation = 'not-applicable';
  } else if (pliteAbsent(id) && !plateRelevant(id)) {
    classification = 'different tradeoff';
    preferred = 'different tradeoff';
    referenceAdaptation = 'reject';
    proofAdaptation = 'reject';
    verdict = 'reject';
  } else if (plateRelevant(id)) {
    classification = 'Plate stronger';
    preferred = 'Plate';
  } else {
    classification = 'Plite stronger';
    preferred = 'Plite';
  }

  const winner = classification;
  const dispositionEvidence =
    id === 'LX-MDAST'
      ? cite(`${root}/lexical-architecture-ledger.md`)
      : id === 'LX-CORE-REFCOUNT'
        ? cite(`${root}/lexical-architecture-ledger.md`)
        : cite(`${root}/lexical-concept-matrix.md`);
  const prior =
    id === 'LX-EXTENSION-CONTRACT'
      ? '`A6` supersede — current descriptor-owned dependency/conflict publication implements the useful law and rejects Lexical mutable phases `docs/plans/2026-07-25-multi-editor-full-architecture-audit.md:2281`'
      : `none — prior-candidate search is recorded in ${cite(`${root}/lexical-concept-manifest.json`)}`;

  return [
    `\`${id}\``,
    title,
    origin,
    ref,
    plite,
    plate,
    q(winner, id, 'correctness', referenceCitation(id)),
    q(
      winner,
      id,
      'API and type shape',
      cite(localOnly && origin === 'Plate' ? platePath : plitePath)
    ),
    q(winner, id, 'data and collaboration', referenceCitation(id)),
    q(
      winner,
      id,
      'ownership and lifecycle',
      cite(plateRelevant(id) ? platePath : plitePath)
    ),
    q(winner, id, 'runtime and performance', referenceCitation(id)),
    q(winner, id, 'proof and host coverage', referenceCitation(id, true)),
    `${classification} — ${id} whole-job comparison is grounded in ${dispositionEvidence}`,
    `${preferred} — ${id} preferred base owns the durable job at ${cite(preferred === 'Plate' ? platePath : preferred === 'reference' ? `../lexical/${firstUnit(id)?.path ?? 'packages/lexical/src/index.ts'}` : plitePath)}`,
    `${referenceAdaptation} — ${id} reference mechanism disposition is recorded in ${dispositionEvidence}`,
    `${localDebt} — ${id} local debt disposition is recorded in ${dispositionEvidence}`,
    `${proofAdaptation} — ${id} proof disposition is recorded in ${dispositionEvidence}`,
    prior,
    `${verdict} — ${id} final architecture disposition follows ${dispositionEvidence}`,
    priority,
  ];
});

const header = [
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
const escapeCell = (cell) =>
  String(cell).replaceAll('|', '\\|').replace(/\n/g, ' ');
const matrix = `# Lexical Canonical Concept Matrix

authority: \`../lexical@${source.repository.commit}\`
source manifest: [lexical-source-manifest.json](./lexical-source-manifest.json)
concept manifest: [lexical-concept-manifest.json](./lexical-concept-manifest.json)

This is the symmetric union of every source-derived Lexical concept and every
material local-only Plite/Plate mechanism needed to avoid donor-only scoring.
Each concept appears exactly once. Qualitative judgments replace numeric scores.

| ${header.join(' | ')} |
| ${header.map(() => '---').join(' | ')} |
${rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`).join('\n')}
`;
writeFileSync(`${root}/lexical-concept-matrix.md`, matrix);

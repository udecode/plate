#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { comparisonRows } from './comparison-data.mjs';

const artifactRoot = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  fs.readFileSync(path.join(artifactRoot, 'source-manifest.json'), 'utf8')
);
const livePlite = JSON.parse(
  fs.readFileSync(
    path.join(artifactRoot, 'live-plite-source-manifest.json'),
    'utf8'
  )
);
const livePlate = JSON.parse(
  fs.readFileSync(
    path.join(artifactRoot, 'live-plate-coverage-manifest.json'),
    'utf8'
  )
);
const outputPath = path.join(artifactRoot, 'concept-matrix.md');
const dimensions = [
  ['Correctness', 'correctness'],
  ['API/types', 'api'],
  ['Data/collab', 'data'],
  ['Ownership/lifecycle', 'ownership'],
  ['Runtime/perf', 'runtime'],
  ['Proof/host', 'proof'],
];
const headers = [
  'ID',
  'Concept',
  'Reference owner/evidence',
  'Plite mapping',
  'Plate mapping',
  ...dimensions.map(([header]) => header),
  'Classification',
  'Preferred implementation',
  'Verdict',
  'Priority',
];

const cell = (value) =>
  String(value).replaceAll('\n', ' ').replaceAll('|', '\\|').trim();
const formatMapping = ({ evidence, reason, status }) =>
  `${status} — ${evidence ? `${evidence}: ` : ''}${reason}`;
const reasonForClassification = (row) => {
  if (row.classification === 'reference stronger') {
    return `${row.title} has a reference-owned capability the local stack deliberately does not centralize`;
  }
  if (row.classification === 'insufficient evidence') {
    return `${row.title} lacks the comparative runtime evidence needed to pick an implementation`;
  }
  if (row.classification === 'different tradeoff') {
    return `${row.title} serves materially different host or distribution constraints`;
  }
  if (row.classification === 'equivalent') {
    return `${row.title} has no material architectural difference`;
  }

  return `${row.title} is covered more completely under current Plite and Plate constraints`;
};

const rows = comparisonRows.map((row) => {
  const dossierAnchor =
    row.id === 'WG-VIEW-011'
      ? 'clipboard-benchmark-contract-repair'
      : 'mobile-input-phase-proof';
  const result = [
    `\`${row.id}\``,
    row.priority === '—'
      ? row.title
      : `${row.title} ([dossier](material-dossiers.md#${dossierAnchor}))`,
    `\`${row.referenceEvidence}\``,
    formatMapping(row.plite),
    formatMapping(row.plate),
    ...dimensions.map(([, key]) => {
      const [comparison, reason] = row.dimensions[key];

      return `${comparison} — ${row.title}: ${reason}`;
    }),
    `${row.classification} — ${reasonForClassification(row)}`,
    `${row.preferred} — ${reasonForClassification(row)}`,
    `${row.verdict} — ${row.verdictReason}`,
    row.priority,
  ];

  return `| ${result.map(cell).join(' | ')} |`;
});

const expected = manifest.concepts.map(({ id }) => id);
const actual = comparisonRows.map(({ id }) => id);
if (
  expected.length !== actual.length ||
  expected.some((id) => !actual.includes(id))
) {
  throw new Error(
    `matrix rows do not match manifest: expected=${expected.length} actual=${actual.length}`
  );
}
if (livePlite.provenance.head !== livePlate.repositoryHead) {
  throw new Error(
    `local inventory heads disagree: Plite=${livePlite.provenance.head} Plate=${livePlate.repositoryHead}`
  );
}

const document = `# Wordgard versus live Plite and Plate: strict concept matrix

Authority:

- Wordgard: clean \`${manifest.authority.branch}\` at \`${
  manifest.authority.head
}\`.
- Plite and Plate: current working-checkout evidence based at \`${
  livePlite.provenance.head
}\`; inventory hashes bind every inspected file.
- Inventory: ${manifest.summary.concepts} atomic concepts, ${
  manifest.summary.files
} tracked files, ${
  manifest.summary.declarations
} TypeScript declaration nodes, zero unexplained units.
- This is a whole-current-source comparison. No row inherits a verdict from the previous grouped audit or from the one-commit Wordgard delta.

Mapping terms are \`exact\`, \`partial\`, \`absent\`, or \`not-applicable\`.
Every qualitative cell independently names a comparison and reason. There is
no aggregate numeric score.

| ${headers.join(' | ')} |
| ${headers.map(() => '---').join(' | ')} |
${rows.join('\n')}
`;

fs.writeFileSync(outputPath, document);
process.stdout.write(
  `${JSON.stringify({ concepts: expected.length, rows: rows.length })}\n`
);

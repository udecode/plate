import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { matrixTruth } from './matrix-truth.mjs';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const whitespacePattern = /\s+/g;
const canonicalOutcomeIdPattern = /^C\d+/;
const conceptPatterns = Object.freeze({
  anchors: /anchor|reference|runtime id/,
  clipboard: /clipboard|paste|copy/,
  collaboration: /yjs|collab|shared/,
  commitImpact: /commit|changed region|impact|subscription/,
  defaultBlock: /default.?block|default type|textblock default/,
  documentRoots: /document root|named root|multi-root/,
  heading: /heading|\bh1\b|\bh2\b|\bh3\b/,
  history: /history|undo|redo/,
  identity: /name|type|identity|plugin reference|target plugin/,
  lifecycle: /fault|failure|rollback|afterpublish|activation|lifecycle/,
  math: /math|equation/,
  maxLength: /max.?length|insertion.limit/,
  media: /media|resiz|image/,
  nativeInput: /beforeinput|native input|mobile|composition|keyboard|pointer/,
  phrase: /phrase|locali[sz]|translat/,
  proof: /proof|browser matrix|benchmark|release gate/,
  react: /component|react|render|dom root|view/,
  registry: /registry|kit|toolbar|menu|copied ui/,
  runtimeApi: /package|barrel|export|namespace|tree.?shak|nodeapi|pathapi/,
  schema: /schema|grammar|property|markable|textblock|root wrapper/,
  schemaIdentity: /schema identity|fingerprint|schemaidentity/,
  table: /table/,
});

// The exported source digest is the digest of the exact normalized line slice.
// These whole-file locks make those slice digests immutable rather than a
// self-updating checksum of whatever happens to be on disk.
const fileSha256 = Object.freeze({
  '../wordgard-website/site/examples/translate/index.md':
    '5ef299815fa1d03a5013a1622b6484d64c573aad0f41db3e3631bff1745f93ad',
  '../wordgard-website/site/examples/translate/phrases.ts':
    '88690cfea09a6336350b46157b6ca9b2e1e8c0fcacd2e339860ca4c65a294a0a',
  'docs/analysis/best-api-review.md':
    '52ea923dbb3d61068da9e7ba056ca57d9d926cccbbb93ccfdb99e18138b2e394',
  'docs/plans/2026-05-13-plite-api-helper-namespace-rename-ralplan.md':
    '865bb5b9a41a976b6c5b51b9d67b13eaa6c544daca76561403948d024c95a841',
  'docs/plans/2026-07-02-plite-maxlength-execution.md':
    '2d3386e8ff154af20fcc67a821f6dae6aca4adfdae618b9ee1f145b1ee43daa8',
  'docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md':
    '7c7570f11d7d131938633b3bff014123fa0892f8d8fb3d5581435165db8efdd0',
  'docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md':
    'ffb179f1ccce4f9ef2c37accb79e3d10c8b3a6c9e363e8fb2165b5d42c738f98',
  'docs/plans/2026-07-20-camel-case-plugin-key-migration.md':
    'be2d738ab97ebcd4b88a31461dd56da9cf4d60c3201df58f05a87f6dfb5d625b',
  'docs/plans/2026-07-23-plate-plugin-behavior-composition-observability.md':
    'e7ccc80391bf904533f909ac3b8ea318a911de55c8abcf1eb23ceb6093190ce3',
  'docs/plans/2026-07-23-wordgard-full-architecture-audit.md':
    'c492cd6325c1f6d28a120cfa638c865971fc37d629d7e4197f901576f2d75e4d',
  'docs/plans/2026-07-25-multi-editor-full-architecture-audit.md':
    '83b31ad9710a5c902b53115caca182b8658d8a175a1728ac776f5bd6322058e3',
  'docs/plans/2026-07-27-explicit-plugin-state-contracts.md':
    'fce5e93bed263246a850609073d90054f74bc08564b933d943715e1271f2e6e6',
  'docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md':
    '54f7d6c91449c08531bcd18e5ecdb908c37ee6b878ffb3d47cf078b1ab284938',
  'docs/plans/2026-07-27-wordgard-material-packets-execution.md':
    '0024bda1d5d0540ff106e9190ae55cf6cb327fb8a5954a9f61703e389847f630',
  'docs/plans/2026-07-28-code-block-pure-utility-ownership.md':
    'b5048fe5cc00db4300d2c33a577c84efb25e7331a177503d5ed749dcac84cb7c',
  'docs/plans/2026-07-28-execute-editor-architecture-upgrades.md':
    'd17c36afc514cb60961dc34aba587add35d42127e8b5eefb41d24d755353263b',
  'docs/plans/2026-07-28-perfect-editor-extension-api.md':
    'd9aa6cb81350d42c22e630c37fea33a81338e58e6cab1d209fb749857468ab9b',
  'docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md':
    'fd92ad19d93fece01f3a935efbec8ba701826841fc86e820824954aaf22cace5',
  'docs/plans/2026-07-28-repair-media-table-list-utils-plugin-ownership.md':
    '0755631500d4659ff5bc43cd1195d91789796c72a41b36336cb4049a803661e6',
  'docs/plans/2026-07-29-colocate-markdown-feature-codecs.md':
    'ad79adc36100aa687a5a5dc25c5746afff574938b77526e25b30054297f77a7c',
  'docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md':
    'd58f624b319d06403255e47c160204c3af01dc1ad25ebe4adf328bd851af8871',
  'docs/plans/2026-07-29-plate-next-core-p0-contracts.md':
    'f4955ea17fc2ab44d465fc27d7dd148e85be8ff34c2d1532a332e8943e4e25b4',
  'docs/plans/2026-07-29-plate-next-plugin-key-to-name.md':
    '2071b6539cdbbb2088fc68826d00faba92d5f3cd3e40dee8fc8734e043aa987e',
  'docs/plans/2026-07-29-remove-plate-extension-identity-helper.md':
    '623394cb7a0f44794c7ade86aeb51165499ce622e537b57505cf2590c5ba7e9b',
  'docs/plans/2026-07-29-repair-registry-cleanup-drift.md':
    'f3b084b453a4c1163bd3535ee3d0764b441fefee0e84802e4b7b5688f5a82a25',
  'docs/plans/2026-07-29-unify-plate-plugins-over-plite-extensions.md':
    '7bb7e4adc83553c869f30609b5a93edb89a8c9b1731ebf6d4ccf145e77047787',
  'docs/plans/2026-07-30-hard-cut-markdown-codec-package.md':
    '417a1e3edf1d2a9d9eb51d87f4ecefc258b80f32697821969e34e4bc07c55a84',
  'docs/plans/2026-07-30-migrate-final-plate-plite-plugin-shape.md':
    '2d93e1eb7010eb87a16c56864c18615ae9605260ab428130dd19cebcdee72a81',
  'docs/plans/2026-07-30-unify-definecodecs-authoring.md':
    '88a17796da63457d27f5e79d196341e91541def9b55701c480beac54face88c1',
  'docs/plans/2026-07-31-full-schema-api-audit.md':
    'bd60284eae9be16997a86170ce0547981f14a7c4cf099921051e29f86bbe4045',
  'docs/plans/2026-07-31-hard-cut-parallel-plugin-lookup-apis.md':
    'd1ad369ca824ce225c540ef26b94c20c1aa6a14b0914584918685b0bdca881f7',
  'docs/plans/2026-07-31-hard-cut-plugin-name-lookup.md':
    '42fae6b0b446605ac5b215affebdd815c67b31e3365efa52826d46aa6d678d32',
  'docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md':
    '0d9aed98abe549615362990cffb5f7313aa47f4069d78c782848d56c4b68f358',
  'docs/plans/2026-07-31-restore-base-plugin-component-ownership.md':
    'a7c21d400b02465ea95d84547f51e789515498890739518fa3c3c3c3e524efd8',
  'docs/plans/2026-07-31-restore-same-family-plugin-composition.md':
    '8b478737f2c8594bfaf1baa726871957186a1f687bebab8a3142c07b5d71d15f',
  'docs/plans/2026-07-31-schema-api-hard-cut.md':
    'dc05da1c3fa3fe9b322ae6ec12585a776900998e3ed3c3793b5deb3183787380',
  'docs/plans/2026-08-01-hard-cut-plugin-name-references.md':
    'df845709c9990be615f96d3d513607bf4f903f29d1c8ec53998ed30540c41235',
  'docs/plans/2026-08-01-restore-heading-plugin-names.md':
    '062e97cccb4709bc8f85379a2c4026f62d0262caba91501d341d47000da0996c',
  'docs/plans/artifacts/plate-plite-api-convergence-audit/concept-matrix.md':
    'fd86d5984f4ed866835198628947d1e8c604b73feca5a6325b8f476ed0fd4cf1',
  'docs/plans/artifacts/plate-plite-api-convergence-audit/recommendation.md':
    'fbcb707f8a929488d951cdcb52db95afdf4c9a0a0c1a669d327f6746caeda2f5',
  'docs/plans/artifacts/unify-plate-plite-public-api/adoption-ledger.md':
    'b65c0660eb41062f9a71e37ea685b58c832409426285cbd45867f79aa4891c4f',
  'docs/plans/artifacts/wordgard-full-strict-editor-audit/concept-matrix.md':
    '56ce8fe9d1dfe4c123efb1fdc8535c042346dd7b99d919fd497bf9c1534d2716',
  'docs/plans/artifacts/wordgard-prior-inputs/2026-08-01-persisted-identity-proposal.md':
    'a48c51a43c77ecd47d8b7dd0206973c0412874ef15ab1efe6c163456c5c01c55',
});

const currentAuditPath =
  'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/';
const sourceCache = new Map();
const readSource = (path) => {
  if (
    path.startsWith(currentAuditPath) ||
    path ===
      'docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md'
  ) {
    throw new Error(`Circular prior evidence is forbidden: ${path}`);
  }
  if (!fileSha256[path]) throw new Error(`Unlocked prior source: ${path}`);
  if (!sourceCache.has(path)) {
    const bytes = readFileSync(resolve(repositoryRoot, path));
    const actual = hash(bytes);
    if (actual !== fileSha256[path]) {
      throw new Error(
        `Prior source drift for ${path}: expected ${fileSha256[path]}, got ${actual}`
      );
    }
    const text = bytes
      .toString('utf8')
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n');
    sourceCache.set(path, text.split('\n'));
  }
  return sourceCache.get(path);
};
const source = (path, lineStart, lineEnd = lineStart) => {
  const lines = readSource(path);
  if (
    !Number.isInteger(lineStart) ||
    !Number.isInteger(lineEnd) ||
    lineStart < 1 ||
    lineEnd < lineStart ||
    lineEnd > lines.length
  ) {
    throw new Error(
      `Invalid prior source range ${path}:${lineStart}-${lineEnd}`
    );
  }
  const slice = lines.slice(lineStart - 1, lineEnd).join('\n');
  if (slice.trim().length === 0) {
    throw new Error(`Empty prior source range ${path}:${lineStart}-${lineEnd}`);
  }
  return Object.freeze({
    lineEnd,
    lineStart,
    path,
    sha256: hash(slice),
  });
};

const clean = (value) => {
  const trimmed = value.trim();
  const unwrapped =
    trimmed.startsWith('`') && trimmed.endsWith('`')
      ? trimmed.slice(1, -1)
      : trimmed;
  return unwrapped.replaceAll('\\|', '|').replace(whitespacePattern, ' ');
};
const tableCells = (path, line) => {
  const value = readSource(path)[line - 1];
  if (!value?.trim().startsWith('|')) {
    throw new Error(`Expected Markdown row at ${path}:${line}`);
  }
  const cells = [];
  let cell = '';
  for (let index = 1; index < value.length - 1; index++) {
    const character = value[index];
    if (character === '|' && value[index - 1] !== '\\') {
      cells.push(clean(cell));
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(clean(cell));
  return cells;
};

const conceptIdsFor = (claim) => {
  const value = claim.toLowerCase();
  if (conceptPatterns.phrase.test(value)) {
    return ['WG-STATE-012', 'PLATE-COPIED-KITS'];
  }
  if (conceptPatterns.heading.test(value)) {
    return ['PLATE-HEADING-ONTOLOGY', 'PLATE-PLUGIN-IDENTITY'];
  }
  if (conceptPatterns.maxLength.test(value)) {
    return ['LOCAL-MAX-LENGTH-POLICY'];
  }
  if (conceptPatterns.defaultBlock.test(value)) {
    return ['LOCAL-SCHEMA-DEFAULT-SIDECHANNEL'];
  }
  if (conceptPatterns.schemaIdentity.test(value)) {
    return ['LOCAL-SCHEMA-IDENTITY'];
  }
  if (conceptPatterns.schema.test(value)) {
    return ['WG-DOC-004', 'LOCAL-SCHEMA-IDENTITY'];
  }
  if (conceptPatterns.history.test(value)) return ['WG-HIST-001'];
  if (conceptPatterns.collaboration.test(value)) return ['LOCAL-YJS'];
  if (conceptPatterns.clipboard.test(value)) return ['WG-VIEW-011'];
  if (conceptPatterns.nativeInput.test(value)) {
    return ['LOCAL-NATIVE-INPUT-RECONCILIATION'];
  }
  if (conceptPatterns.lifecycle.test(value)) {
    return ['LOCAL-LIFECYCLE-PHASE'];
  }
  if (conceptPatterns.media.test(value)) return ['LOCAL-MEDIA-KEYBOARD-RESIZE'];
  if (conceptPatterns.math.test(value)) return ['LOCAL-MATH-CSS-BOUNDARY'];
  if (conceptPatterns.registry.test(value)) {
    return ['PLATE-COPIED-KITS', 'PLATE-PRODUCT-BREADTH'];
  }
  if (conceptPatterns.react.test(value)) {
    return ['LOCAL-REACT-HOST'];
  }
  if (conceptPatterns.table.test(value)) return ['WG-TABLE-001'];
  if (conceptPatterns.documentRoots.test(value)) {
    return ['LOCAL-DOC-ROOTS'];
  }
  if (conceptPatterns.anchors.test(value)) return ['LOCAL-ANCHORS'];
  if (conceptPatterns.commitImpact.test(value)) {
    return ['LOCAL-COMMIT-IMPACT'];
  }
  if (conceptPatterns.proof.test(value)) {
    return ['LOCAL-PROOF-ORCHESTRATION'];
  }
  if (conceptPatterns.runtimeApi.test(value)) {
    return ['LOCAL-RUNTIME-API-TREESHAKING'];
  }
  if (conceptPatterns.identity.test(value)) {
    return ['PLATE-PLUGIN-IDENTITY'];
  }
  return ['LOCAL-EXTENSION-CAPABILITIES'];
};

const candidates = [];
const add = ({
  aliases,
  claim,
  conceptIds = conceptIdsFor(claim),
  disposition = 'reaffirm',
  dispositionEvidence,
  id,
  reconciliationConceptId,
  sources,
}) => {
  if (!id || !claim || !sources?.length || !conceptIds.length) {
    throw new Error(`Incomplete prior candidate ${id ?? '<missing>'}`);
  }
  candidates.push(
    Object.freeze({
      ...(aliases?.length ? { aliases: Object.freeze([...aliases]) } : {}),
      claim,
      conceptIds: Object.freeze([...new Set(conceptIds)]),
      disposition,
      dispositionEvidence: dispositionEvidence ?? {
        rationale:
          'The cited durable decision remains the prior-corpus authority pending current matrix reconciliation.',
        sources,
      },
      id,
      ...(reconciliationConceptId ? { reconciliationConceptId } : {}),
      sources: Object.freeze(sources),
    })
  );
};

const oldMatrix =
  'docs/plans/artifacts/wordgard-full-strict-editor-audit/concept-matrix.md';
const oldSuperseded = new Set([
  'WG-DOC-005',
  'WG-HIST-001',
  'WG-VIEW-009',
  'WG-VIEW-011',
]);
for (let line = 16; line <= 116; line++) {
  const cells = tableCells(oldMatrix, line);
  const sourceId = cells[0];
  const cited = [source(oldMatrix, line)];
  const typedPhraseEvidence = [
    source('../wordgard-website/site/examples/translate/index.md', 3, 63),
    source('../wordgard-website/site/examples/translate/phrases.ts', 1, 55),
  ];
  add({
    claim: `${cells[1]} — prior verdict: ${cells[13]}`,
    conceptIds: [sourceId],
    disposition: oldSuperseded.has(sourceId) ? 'supersede' : 'reaffirm',
    dispositionEvidence:
      sourceId === 'WG-STATE-012'
        ? {
            rationale:
              'Concrete Wordgard localization demand is proven. Supersede only the no-demand rationale; keep copied registry/app labels as the Plate ownership boundary.',
            sources: [...cited, ...typedPhraseEvidence],
          }
        : undefined,
    id: `OLD-${sourceId}`,
    sources: cited,
  });
}

const attachment =
  'docs/plans/artifacts/wordgard-prior-inputs/2026-08-01-persisted-identity-proposal.md';
const attachmentConcepts = {
  'ATT-AST-SEMANTIC-LOWER-CAMEL': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-AST-TYPE-EXPLICIT': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-BEHAVIOR-NO-TYPE': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-DELETE-ABBREVIATED-NODES': [
    'PLATE-PLUGIN-IDENTITY',
    'PLATE-HEADING-ONTOLOGY',
  ],
  'ATT-DYNAMIC-PORTAL-OPTIONAL-TYPE': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-EXACT-BUILTIN-MAP': ['PLATE-PLUGIN-IDENTITY', 'PLATE-HEADING-ONTOLOGY'],
  'ATT-EXACT-PORTAL-TYPE': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-FINAL-VOCABULARY-ONLY': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-HISTORY-MIGRATE-OR-INVALIDATE': ['WG-HIST-003', 'LOCAL-SCHEMA-IDENTITY'],
  'ATT-HYBRID-REGISTRY-DECOUPLING': [
    'PLATE-COPIED-KITS',
    'PLATE-PLUGIN-IDENTITY',
  ],
  'ATT-INJECT-RENDER-ONLY': ['PLATE-PLUGIN-IDENTITY', 'LOCAL-REACT-HOST'],
  'ATT-KEEP-NODES-NAME': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-KEYS-SPREAD-NODES': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-MIGRATE-ALL-ROOTS-BEFORE-FIT': [
    'LOCAL-DOC-ROOTS',
    'LOCAL-SCHEMA-IDENTITY',
  ],
  'ATT-MIGRATE-TYPES-MARKS-PROPERTIES': ['PLATE-PLUGIN-IDENTITY', 'WG-DOC-003'],
  'ATT-MIGRATION-CONFLICT-FAILS': ['LOCAL-SCHEMA-IDENTITY'],
  'ATT-MIGRATION-PLUGIN-API': ['LOCAL-SCHEMA-IDENTITY'],
  'ATT-MIGRATION-PLUGIN-INSUFFICIENT': ['WG-HIST-003', 'LOCAL-YJS'],
  'ATT-MIXED-CLIENTS-NOT-INIT-SOLVABLE': ['LOCAL-YJS'],
  'ATT-NAME-TYPE-SEPARATE-CONFIGURABLE': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-NODES-SEMANTIC-CATALOG': [
    'PLATE-PLUGIN-IDENTITY',
    'PLATE-HEADING-ONTOLOGY',
  ],
  'ATT-NO-ALIASES-DUAL-SCHEMA': ['LOCAL-SCHEMA-IDENTITY'],
  'ATT-NO-DERIVED-TYPE-FACTORY': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-NO-GENERIC-CASE-MIGRATION': ['LOCAL-SCHEMA-IDENTITY'],
  'ATT-PACKAGE-TARGET-DESCRIPTORS': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-PERSISTED-VALUES-NODES': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-PRESERVE-UNKNOWN-CUSTOM': ['LOCAL-SCHEMA-IDENTITY'],
  'ATT-REGISTRY-TARGET-STRINGS': ['PLATE-COPIED-KITS'],
  'ATT-TARGET-RESOLVES-CONFIGURED-TYPE': ['PLATE-PLUGIN-IDENTITY'],
  'ATT-YJS-OFFLINE-NEW-ROOM': ['LOCAL-YJS', 'LOCAL-SCHEMA-IDENTITY'],
};
for (let line = 13; line <= 42; line++) {
  const cells = tableCells(attachment, line);
  add({
    claim: cells[2],
    conceptIds: attachmentConcepts[cells[0]],
    disposition: cells[3],
    dispositionEvidence: {
      rationale: cells[4],
      sources: [source(attachment, line)],
    },
    id: cells[0],
    sources: [source(attachment, line)],
  });
}

const architecturePlan =
  'docs/plans/2026-07-23-wordgard-full-architecture-audit.md';
const architectureConcepts = {
  C01: ['WG-DOC-001'],
  C02: ['WG-DOC-009'],
  C03: ['WG-DOC-012'],
  C04: ['LOCAL-EXTENSION-CAPABILITIES'],
  C05: ['WG-DOC-015'],
  C06: ['LOCAL-REACT-HOST'],
  C07: ['LOCAL-REACT-HOST'],
  C08: ['LOCAL-NATIVE-INPUT-RECONCILIATION'],
  C09: ['WG-VIEW-006B'],
  C10: ['LOCAL-REACT-HOST'],
  C11: ['LOCAL-REACT-HOST'],
  C12: ['WG-STATE-011'],
  C13: ['WG-HIST-003'],
  C14: ['LOCAL-YJS'],
  C15: ['WG-HIST-001'],
  C16: ['LOCAL-YJS'],
  C17: ['LOCAL-PROOF-ORCHESTRATION'],
  C18: ['LOCAL-EXTENSION-CAPABILITIES'],
  C19: ['LOCAL-EXTENSION-CAPABILITIES'],
  C20: ['WG-VIEW-012A'],
  C21: ['WG-VIEW-012B'],
  C22: ['PLATE-COPIED-KITS'],
  C23: ['PLATE-PRODUCT-BREADTH'],
  C24: ['PLATE-PRODUCT-BREADTH'],
  C25: ['PLATE-COPIED-KITS'],
  C26: ['PLATE-COPIED-KITS'],
  C27: ['WG-TABLE-001'],
  C28: ['WG-TABLE-005'],
  C29: ['WG-TABLE-004'],
  C30: ['WG-TABLE-006'],
  C31: ['WG-TABLE-005'],
  C32: ['LOCAL-PROOF-ORCHESTRATION'],
  C33: ['WG-STATE-012', 'PLATE-COPIED-KITS'],
};
for (let line = 5816; line <= 5848; line++) {
  const cells = tableCells(architecturePlan, line);
  const id = cells[0].match(canonicalOutcomeIdPattern)?.[0];
  const cited = [source(architecturePlan, line)];
  add({
    aliases: [cells[0]],
    claim: cells[2],
    conceptIds: architectureConcepts[id],
    disposition: id === 'C33' ? 'supersede' : 'reaffirm',
    dispositionEvidence:
      id === 'C33'
        ? {
            rationale:
              'The generic Plate API remains rejected on ownership grounds, but the old no-product-evidence premise is false: Wordgard ships and teaches concrete translation demand.',
            sources: [
              ...cited,
              source(
                '../wordgard-website/site/examples/translate/index.md',
                3,
                63
              ),
              source(
                '../wordgard-website/site/examples/translate/phrases.ts',
                1,
                55
              ),
            ],
          }
        : undefined,
    id,
    sources: cited,
  });
}

const adoptionLedger =
  'docs/plans/artifacts/unify-plate-plite-public-api/adoption-ledger.md';
const adoptionLines = [
  ...Array.from({ length: 10 }, (_, index) => 9 + index),
  ...Array.from({ length: 18 }, (_, index) => 24 + index),
  ...Array.from({ length: 7 }, (_, index) => 47 + index),
  ...Array.from({ length: 10 }, (_, index) => 59 + index),
  ...Array.from({ length: 6 }, (_, index) => 74 + index),
];
const supersededAdoption = new Set(['P0.7', 'P1.11', 'P1.18', 'P2.1']);
for (const line of adoptionLines) {
  const cells = tableCells(adoptionLedger, line);
  add({
    claim: cells[1],
    disposition: supersededAdoption.has(cells[0]) ? 'supersede' : 'reaffirm',
    id: `UNIFY-${cells[0].replace('.', '-')}`,
    sources: [source(adoptionLedger, line)],
  });
}

const convergenceMatrix =
  'docs/plans/artifacts/plate-plite-api-convergence-audit/concept-matrix.md';
for (let line = 8; line <= 25; line++) {
  const cells = tableCells(convergenceMatrix, line);
  add({
    claim: `${cells[1]} — prior verdict: ${cells[18]}`,
    disposition: cells[0] === 'STACK-005' ? 'supersede' : 'reaffirm',
    id: cells[0],
    sources: [source(convergenceMatrix, line)],
  });
}

const bestApiReview = 'docs/analysis/best-api-review.md';
const bestApiRanges = [
  ['P0', 30, 39],
  ['P1', 45, 55],
  ['P2', 61, 66],
  ['P3', 72, 72],
];
for (const [priority, start, end] of bestApiRanges) {
  for (let line = start; line <= end; line++) {
    const cells = tableCells(bestApiReview, line);
    const ordinal = String(line - start + 1).padStart(2, '0');
    const id = `BA-${priority}-${ordinal}`;
    add({
      aliases: [cells[0]],
      claim: `${cells[0]} — ${cells[2]}`,
      disposition: id === 'BA-P0-06' ? 'supersede' : 'reaffirm',
      id,
      sources: [source(bestApiReview, line)],
    });
  }
}

const bestApiKeep = [
  [
    'BA-KEEP-01',
    78,
    82,
    'Keep the Markdown root capability while rejecting duplicate editor-bound free helpers.',
  ],
  [
    'BA-KEEP-02',
    83,
    87,
    'Keep Table update verbs flat; reject taxonomy nesting.',
  ],
  [
    'BA-KEEP-03',
    88,
    92,
    'Keep Plite grouped reads/updates and callable update policy as one coherent lifecycle.',
  ],
  [
    'BA-KEEP-04',
    93,
    95,
    'Keep descriptor-scoped access and installed root API groups for their distinct typing jobs.',
  ],
  [
    'BA-KEEP-05',
    96,
    97,
    'Keep one mutable Plate options channel and reject an immutable config twin.',
  ],
  [
    'BA-KEEP-06',
    98,
    98,
    'Keep ContentSlice as transport and DocumentChange as public mutation truth.',
  ],
  [
    'BA-KEEP-07',
    99,
    100,
    'Keep Plite command descriptors with handle fallback and around only for real delegation.',
  ],
  [
    'BA-KEEP-08',
    101,
    102,
    'Keep atomic validated extension reconfiguration with rollback and one publication commit.',
  ],
  [
    'BA-KEEP-09',
    103,
    103,
    'Keep large coherent owner files; file length alone is not API debt.',
  ],
];
for (const [id, start, end, claim] of bestApiKeep) {
  add({
    claim,
    disposition: id === 'BA-KEEP-05' ? 'supersede' : 'reaffirm',
    id,
    sources: [source(bestApiReview, start, end)],
  });
}
const bestApiRejected = [
  ['BA-REJECT-01', 107, 'Reject global behavior profiles.'],
  [
    'BA-REJECT-02',
    108,
    'Reject a typed TablePlugin.extensions.paste registry.',
  ],
  [
    'BA-REJECT-03',
    109,
    'Reject omitExtension and replaceExtension method families.',
  ],
  [
    'BA-REJECT-04',
    110,
    'Reject a safe runtime-toggle promise without a real runtime host.',
  ],
  ['BA-REJECT-05', 111, 'Reject diagnostics configuration on every plugin.'],
  [
    'BA-REJECT-06',
    112,
    'Reject file splitting or extraction merely because a coherent owner is large.',
  ],
];
for (const [id, line, claim] of bestApiRejected) {
  add({ claim, id, sources: [source(bestApiReview, line)] });
}

const schemaAudit = 'docs/plans/2026-07-31-full-schema-api-audit.md';
const schemaIds = [
  'SCHEMA-P0-JSON',
  'SCHEMA-P0-HIDE-MODEL',
  'SCHEMA-P0-DOCS',
  'SCHEMA-P1-TEXTBLOCK',
  'SCHEMA-P1-FLAT-ROOT',
  'SCHEMA-P1-UNKNOWN-DEFAULT',
  'SCHEMA-P1-IDENTITY',
  'SCHEMA-P1-BLOCK-CONTENT',
  'SCHEMA-P1-CREATE',
  'SCHEMA-P1-ASSERT',
  'SCHEMA-P2-METADATA-ROLE',
  'SCHEMA-P2-HANDLE-CUT',
  'SCHEMA-P2-MARKABLE-RENAME',
  'SCHEMA-P3-MIXED-NAMING-KEEP',
];
for (let line = 416; line <= 429; line++) {
  const cells = tableCells(schemaAudit, line);
  add({
    claim: cells[1],
    id: schemaIds[line - 416],
    sources: [source(schemaAudit, line)],
  });
}

const addManual = (path, entries) => {
  for (const entry of entries) {
    const [
      id,
      lineStart,
      lineEnd,
      claim,
      disposition = 'reaffirm',
      conceptIds,
    ] = entry;
    add({
      claim,
      ...(conceptIds ? { conceptIds } : {}),
      disposition,
      id,
      sources: [source(path, lineStart, lineEnd)],
    });
  }
};

addManual('docs/plans/2026-07-27-wordgard-material-packets-execution.md', [
  [
    'MATEXEC-CLIPBOARD-CALLER-CLOSED',
    196,
    196,
    'Repair the benchmark caller instead of restoring stale codec getOptions API.',
    'reaffirm',
    ['WG-VIEW-011'],
  ],
  [
    'MATEXEC-MOBILE-PROOF-ENTRYPOINT-CLOSED',
    197,
    197,
    'Make raw mobile proof runnable and fail closed without treating semantic or proxy proof as device evidence.',
    'reaffirm',
    ['LOCAL-PROOF-ORCHESTRATION'],
  ],
  [
    'MATEXEC-MOBILE-RUNTIME-KEEP',
    198,
    198,
    'Keep the current input runtime until direct-device evidence proves a defect.',
    'supersede',
    ['LOCAL-NATIVE-INPUT-RECONCILIATION'],
  ],
  [
    'MATEXEC-TYPED-PHRASES-EXCLUDED',
    199,
    199,
    'The material-packet execution excluded typed phrase localization from that task.',
    'supersede',
    ['WG-STATE-012', 'PLATE-COPIED-KITS'],
  ],
]);

addManual('docs/plans/2026-07-25-multi-editor-full-architecture-audit.md', [
  [
    'MULTI-A1',
    684,
    684,
    'Split immutable Plate plugin options from editor-local session state.',
    'supersede',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'MULTI-A2',
    685,
    685,
    'Delete global Plate plugin and Plite extension priority.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'MULTI-A3',
    686,
    686,
    'Compile schema-owned exclusive text-property groups.',
    'reaffirm',
    ['WG-DOC-004'],
  ],
  [
    'MULTI-A4',
    687,
    687,
    'Delete generic query middleware in favor of narrow policies and rename domRange to primaryRange.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'MULTI-A5',
    688,
    688,
    'Move clipboard transport and every DataTransfer contract from Plite core to Plite DOM.',
    'reaffirm',
    ['WG-VIEW-011'],
  ],
  [
    'MULTI-A6',
    689,
    689,
    'Use descriptor-owned required dependencies and conflicts instead of string graph edges.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);

addManual('docs/plans/2026-07-28-execute-editor-architecture-upgrades.md', [
  [
    'MULTI-MOBILE-PHASE',
    289,
    291,
    'Use one internal input phase selector and stop mobile behavior claims at semantic/browser proof until real devices provide raw artifacts.',
    'supersede',
    ['LOCAL-NATIVE-INPUT-RECONCILIATION'],
  ],
  [
    'MULTI-ROOT-VIEW-BINDING',
    292,
    292,
    'Bind functional extension APIs to each mounted root while preserving complete reads and exact clipboard slices.',
    'reaffirm',
    ['LOCAL-DOC-ROOTS', 'LOCAL-REACT-HOST'],
  ],
  [
    'MULTI-HISTORY-FOCUS-CANCEL',
    293,
    293,
    'Newer undo or redo cancels delayed focus restoration from an older root.',
    'reaffirm',
    ['WG-HIST-001', 'LOCAL-DOC-ROOTS'],
  ],
  [
    'MULTI-RETAINED-RENDERER-REJECT',
    294,
    294,
    'Reject and delete the retained-DOM renderer prototype after it misses the measured value gate.',
    'reaffirm',
    ['LOCAL-REACT-HOST'],
  ],
]);

addManual(schemaAudit, [
  [
    'SCHEMA-REJECT-IMPLICIT-TEXTBLOCK',
    433,
    434,
    'Reject implicit text-block content for every non-void element.',
    'reaffirm',
    ['WG-DOC-004'],
  ],
  [
    'SCHEMA-REJECT-SHORTHANDS-PRESETS',
    435,
    436,
    'Reject element true, string shorthands, and a schema preset family.',
    'reaffirm',
    ['WG-DOC-004'],
  ],
  [
    'SCHEMA-REJECT-ROOT-WRAPPER',
    437,
    438,
    'Reject keeping the one-field SchemaRoot wrapper for hypothetical future fields.',
    'reaffirm',
    ['LOCAL-DOC-ROOTS'],
  ],
  [
    'SCHEMA-REJECT-COMPAT-ALIASES',
    439,
    440,
    'Reject compatibility aliases for renamed schema methods and options.',
    'reaffirm',
    ['LOCAL-SCHEMA-IDENTITY'],
  ],
  [
    'SCHEMA-KEEP-ALGEBRA',
    441,
    443,
    'Keep schema.content.all, property.set, and target boolean combinators as one coherent tested algebra.',
    'reaffirm',
    ['WG-DOC-004'],
  ],
  [
    'SCHEMA-DEFER-ORDERED-GRAMMAR',
    444,
    445,
    'Defer ordered regular grammar until a retained Plate schema pays for the compiler and fitter expansion.',
    'reaffirm',
    ['WG-DOC-004'],
  ],
  [
    'SCHEMA-REJECT-LEXICAL-CLASSES',
    446,
    447,
    'Reject copying Lexical class and node registries into Plite portable JSON schema.',
    'reaffirm',
    ['WG-DOC-001', 'LOCAL-SCHEMA-IDENTITY'],
  ],
]);

addManual('docs/plans/2026-07-28-perfect-editor-extension-api.md', [
  [
    'EXTAPI-READ',
    138,
    138,
    'Replace bespoke read-policy roots with typed descriptor-owned read middleware.',
    'supersede',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'EXTAPI-CONTRIBUTIONS',
    139,
    139,
    'Call ordered typed cross-extension values contributions and expose them through extension points.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'EXTAPI-ON',
    140,
    140,
    'Group change callbacks under one on family.',
    'reaffirm',
    ['LOCAL-LIFECYCLE-PHASE'],
  ],
  [
    'EXTAPI-CONFIG',
    141,
    141,
    'Use immutable config as the canonical extension input channel.',
    'supersede',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'EXTAPI-REGISTRATION-NOUNS',
    142,
    142,
    'Name low-level registration slots stateFields, effectTypes, facetProviders, and selectionKinds.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'EXTAPI-AFTER-PUBLISH',
    143,
    143,
    'Name the publication callback afterPublish.',
    'reaffirm',
    ['LOCAL-LIFECYCLE-PHASE'],
  ],
  [
    'EXTAPI-FLAT-SLOTS',
    144,
    144,
    'Keep materially distinct extension capabilities flat at the descriptor root.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);

addManual(
  'docs/plans/2026-07-29-unify-plate-plugins-over-plite-extensions.md',
  [
    [
      'PLUGIN-LAYER-SUBSTRATE',
      200,
      200,
      'Plite owns descriptor identity, dependencies, lifecycle, publication, rollback, commands, corrections, and middleware; Plate compiles to it.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-NATIVE-BEHAVIOR',
      201,
      201,
      'Author ordinary Plate behavior through inferred native flat fields.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-GENUINE-DESCRIPTORS',
      202,
      202,
      'Put genuine standalone Plite descriptors in a dedicated Plate plite field.',
      'supersede',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-RUNTIME-IDENTITY',
      203,
      203,
      'Lower one resolved Plate plugin into one hidden per-plugin runtime descriptor.',
      'reaffirm',
      ['PLATE-PLUGIN-IDENTITY'],
    ],
    [
      'PLUGIN-LAYER-SCOPED-GROUPS',
      204,
      204,
      'Keep Plate api, read, and update semantics and lower them into generated descriptors.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-READ-MIDDLEWARE',
      205,
      205,
      'Name raw Plite read customization readMiddleware because Plate read already means plugin queries.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-DOM-API',
      206,
      206,
      'Keep Plate-owned DOM additions in Plate API while Plite DOM remains the substrate dependency.',
      'reaffirm',
      ['LOCAL-REACT-HOST'],
    ],
    [
      'PLUGIN-LAYER-COMBOBOX',
      207,
      207,
      'Keep trigger-combobox reuse as a Plate-owned command contribution rather than a fake substrate owner.',
      'reaffirm',
      ['PLATE-PRODUCT-BREADTH'],
    ],
    [
      'PLUGIN-LAYER-BUILDER',
      208,
      208,
      'Share native-field inference machinery between Base and React plugin builders.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
    [
      'PLUGIN-LAYER-TOOLING',
      209,
      209,
      'Tooling must reject the nested extension grammar and enforce the native authoring shape.',
      'reaffirm',
      ['LOCAL-PROOF-ORCHESTRATION'],
    ],
    [
      'PLUGIN-LAYER-DOCS',
      210,
      210,
      'Current docs teach native fields and mark raw substrate descriptors as advanced.',
      'reaffirm',
      ['PLATE-PRODUCT-BREADTH'],
    ],
    [
      'PLUGIN-LAYER-COMPAT',
      211,
      211,
      'Hard-cut the public nested extension grammar without an alias or shim.',
      'reaffirm',
      ['LOCAL-EXTENSION-CAPABILITIES'],
    ],
  ]
);

addManual('docs/plans/2026-07-30-migrate-final-plate-plite-plugin-shape.md', [
  [
    'FINAL-SHAPE-01-IDENTITY',
    45,
    46,
    'Descriptor identity is name; serialized node identity is type; exact inference preserves both.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'FINAL-SHAPE-02-NO-CONFIG',
    47,
    48,
    'Delete Plite config and its generic/context plumbing.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-03-READ-UPDATE',
    49,
    49,
    'Plite authoring uses read, update, and readMiddleware.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-04-ONE-API',
    50,
    51,
    'Project one definition-owned API through root and scoped portals; delete pluginApi.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-05-NATIVE-ROOT',
    52,
    53,
    'Plate native extension fields live at plugin root; delete nested extension.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-06-ON',
    54,
    55,
    'Use one root prefixless on family for lifecycle and React DOM observation.',
    'reaffirm',
    ['LOCAL-LIFECYCLE-PHASE'],
  ],
  [
    'FINAL-SHAPE-07-VALIDATE',
    56,
    56,
    'Validation uses validate without a fictional config argument.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-08-FULL-AUTHOR-ROOT',
    57,
    59,
    'The Plate author root owns dependencies, conflicts, middleware, capability groups, lifecycle, codecs, render, rules, and shortcuts.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-09-PRIVATE-COMPILER',
    60,
    61,
    'Delete PluginConfig, __config, parallel compiler types, and InferConfig; keep DefinitionOf.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-10-ONE-OBJECT-FACTORY',
    62,
    63,
    'Factories take one object and expose no caller-supplied generics.',
    'supersede',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-11-BUILDER-VERBS',
    64,
    65,
    'Delete clone; extend widens, configure is terminal, and toPlatePlugin preserves exact definition.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'FINAL-SHAPE-12-ADOPTION',
    66,
    67,
    'Adopt the final grammar across packages, apps, registry, tests, docs, tooling, exports, skills, Vision, and release surfaces.',
    'reaffirm',
    ['LOCAL-PROOF-ORCHESTRATION'],
  ],
  [
    'FINAL-SHAPE-STATIC-CORRECTION',
    68,
    74,
    'Base constructors stay renderer-neutral and terminal configuration binds static components only after a Plate lift.',
    'supersede',
    ['LOCAL-REACT-HOST'],
  ],
]);

addManual('docs/plans/2026-07-29-remove-plate-extension-identity-helper.md', [
  [
    'IDENTITY-HELPER-PLAIN-RETURN',
    187,
    187,
    'Plate extension callbacks return plain objects with contextual inference.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'IDENTITY-HELPER-CUT',
    188,
    188,
    'Delete the Plate-context defineEditorExtension identity helper.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'IDENTITY-STANDALONE-DEFINE-KEEP',
    189,
    189,
    'Keep standalone Plite defineEditorExtension for its distinct canonicalization job.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'IDENTITY-DOCTRINE',
    190,
    190,
    'Repair the owning generic instead of preserving same-field identity helpers.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'IDENTITY-NO-CHANGESET',
    191,
    191,
    'Do not write release prose for a branch-only helper that never shipped.',
    'reaffirm',
    ['LOCAL-PROOF-ORCHESTRATION'],
  ],
]);

addManual('docs/plans/2026-07-31-restore-base-plugin-component-ownership.md', [
  [
    'BASE-COMPONENT-NATIVE',
    208,
    208,
    'Base constructors and terminal configuration own ordinary components; extend does not replace them.',
    'reaffirm',
    ['LOCAL-REACT-HOST'],
  ],
  [
    'BASE-LOWERING',
    209,
    209,
    'Plate lifts the complete Base descriptor instead of stripping and re-adding its component.',
    'reaffirm',
    ['LOCAL-REACT-HOST'],
  ],
  [
    'BASE-COMPONENT-ONLY-ADAPTER-CUT',
    210,
    210,
    'Delete toPlatePlugin ceremony when a caller only binds a component and initial state.',
    'reaffirm',
    ['LOCAL-REACT-HOST'],
  ],
  [
    'BASE-COMPONENT-DOCTRINE',
    211,
    211,
    'Teach Base constructors as server-capable render owners; reserve adapters for Plate-only authoring.',
    'reaffirm',
    ['LOCAL-REACT-HOST'],
  ],
  [
    'BASE-COMPONENT-RELEASE',
    212,
    212,
    'Release prose must teach native Base component ownership rather than the rejected restriction.',
    'reaffirm',
    ['LOCAL-PROOF-ORCHESTRATION'],
  ],
]);

addManual('docs/plans/2026-07-31-restore-same-family-plugin-composition.md', [
  [
    'SAME-FAMILY-COMPOSE',
    199,
    199,
    'Compose same-family same-name terminal descriptors in source order while rejecting different nominal families.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'TABLE-DIRECT-CONFIG',
    200,
    200,
    'A consumer that owns final membership configures TablePlugin directly in its plugin array.',
    'reaffirm',
    ['WG-TABLE-001'],
  ],
  [
    'SAME-FAMILY-DOCTRINE',
    201,
    201,
    'Teach exact identity dedupe, ordered same-family composition, and foreign-family rejection.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
]);

addManual(
  'docs/plans/2026-07-31-plate-next-restore-ai-kit-extension-ownership.md',
  [
    [
      'AI-KIT-ONE-DESCRIPTOR',
      595,
      609,
      'AIChatKit widens AIChatPlugin directly instead of installing a duplicate runtime identity and reopening its portal.',
      'reaffirm',
      ['PLATE-PRODUCT-BREADTH', 'PLATE-PLUGIN-IDENTITY'],
    ],
  ]
);

addManual('docs/plans/2026-07-31-hard-cut-plugin-name-lookup.md', [
  [
    'LOOKUP-TYPE',
    128,
    128,
    'Plugin portal type lookup requires truthful installed-state handling and never falls back to the name.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-PORTAL-INPUT',
    129,
    129,
    'Plugin portals accept an exact descriptor or dynamic string, not a name object.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-CODEC-REGISTRY',
    130,
    130,
    'Keep codec registry getType because it is a distinct immutable format-registry job.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-DOCTRINE',
    131,
    131,
    'The string portal is the sole dynamic plugin lookup.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
]);

addManual('docs/plans/2026-07-31-hard-cut-parallel-plugin-lookup-apis.md', [
  [
    'LOOKUP-INSTALLED-PORTAL',
    193,
    193,
    'Use editor.plugin(Plugin) as the single installed descriptor/context portal.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-TYPE-PORTAL',
    194,
    194,
    'Read descriptor type through a portal and use dynamic name lookup only for actual runtime names.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-PRIVATE-REGISTRY',
    195,
    195,
    'Keep reverse, type, and container caches private; public node questions use schema predicates.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-INJECT-COMPILED',
    196,
    196,
    'Compile inject node-prop defaults and expose them through the installed portal descriptor.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-NARROW-CONSUMER',
    197,
    197,
    'Consumer portals exclude callback-only authoring fields.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'LOOKUP-MARKDOWN-REGISTRY',
    198,
    198,
    'Markdown codecs receive one registry getType/getName/has namespace.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'LOOKUP-ROOT-VS-PORTAL',
    199,
    199,
    'Keep concrete root capability discovery and exact/generic descriptor portals for distinct typing jobs.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);

addManual('docs/plans/2026-08-01-hard-cut-plugin-name-references.md', [
  [
    'PLUGINREF-NOUN',
    248,
    248,
    'Rename pluginName and pluginNames inputs to plugin and plugins and accept descriptor or string.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'PLUGINREF-NAME-TYPE',
    249,
    249,
    'Keep descriptor name and node type as distinct identities.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
  [
    'PLUGINREF-NO-WEAK-OBJECT',
    250,
    250,
    'Reject a name-object lookup alternative.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
]);

addManual('docs/plans/2026-07-29-plate-next-plugin-key-to-name.md', [
  [
    'PLUGIN-KEY-TO-NAME',
    471,
    471,
    'Use name as the sole plugin descriptor identity and keep type as separate serialized schema identity; no key alias.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
]);

const camelPlan = 'docs/plans/2026-07-20-camel-case-plugin-key-migration.md';
const camelIds = [
  'CAMEL-KEY-TYPE-OWNERSHIP',
  'CAMEL-PLUGIN-TYPE-DIVERGENCE',
  'CAMEL-PERSISTENCE',
  'CAMEL-BEHAVIOR-NO-TYPE',
  'CAMEL-TX-NAMESPACES',
  'CAMEL-CODE-DRAWING-ALIAS-CUT',
  'CAMEL-APP-MAPS',
  'CAMEL-DOCS',
  'CAMEL-NO-COMPAT',
];
for (let line = 182; line <= 190; line++) {
  const cells = tableCells(camelPlan, line);
  add({
    claim: `${cells[0]} — ${cells[2]}`,
    disposition:
      line === 182 || line === 184 || line === 188 || line === 189
        ? 'supersede'
        : 'reaffirm',
    id: camelIds[line - 182],
    sources: [source(camelPlan, line)],
  });
}

addManual('docs/plans/2026-08-01-restore-heading-plugin-names.md', [
  [
    'HEADING-H1-H6-PLUGIN-NAMES',
    239,
    241,
    'Use h1 through h6 as six heading plugin identities.',
    'reaffirm',
    ['PLATE-HEADING-ONTOLOGY'],
  ],
  [
    'HEADING-H1-H6-SERIALIZED-TYPES',
    241,
    252,
    'Persist h1 through h6 as six serialized heading element types.',
    'reaffirm',
    ['PLATE-HEADING-ONTOLOGY'],
  ],
  [
    'HEADING-KEYS-INHERIT-NODES',
    244,
    252,
    'Derive heading plugin names from the same six NODES values.',
    'reaffirm',
    ['PLATE-HEADING-ONTOLOGY', 'PLATE-PLUGIN-IDENTITY'],
  ],
]);

addManual(
  'docs/plans/2026-07-04-plate-next-block-toggle-default-type-ergonomics.md',
  [
    [
      'DEFAULT-BLOCK-EDITOR-OPTION',
      233,
      238,
      'Store the semantic block-toggle default as a Plite editor-level defaultBlockType and set it from Plate paragraph type.',
      'supersede',
      ['LOCAL-SCHEMA-DEFAULT-SIDECHANNEL'],
    ],
  ]
);

addManual('docs/plans/2026-07-02-plite-maxlength-execution.md', [
  [
    'MAXLENGTH-EDITOR-OPTION',
    79,
    79,
    'Author maxLength on Plite createEditor.',
    'supersede',
    ['LOCAL-MAX-LENGTH-POLICY'],
  ],
  [
    'MAXLENGTH-EDITABLE-PROP',
    80,
    80,
    'Allow a mounted Editable to dynamically override maxLength.',
    'supersede',
    ['LOCAL-MAX-LENGTH-POLICY'],
  ],
  [
    'MAXLENGTH-CUT-LENGTH-PLUGIN',
    81,
    83,
    'Delete the Plate LengthPlugin and keep max-length behavior in the semantic insertion owner.',
    'reaffirm',
    ['LOCAL-MAX-LENGTH-POLICY'],
  ],
]);

addManual(
  'docs/plans/2026-05-13-plite-api-helper-namespace-rename-ralplan.md',
  [
    [
      'HELPER-API-OBJECTS',
      300,
      303,
      'Rename value helpers such as Node and Scrubber to NodeApi and ScrubberApi without public aliases.',
      'supersede',
      ['LOCAL-RUNTIME-API-TREESHAKING'],
    ],
  ]
);

addManual('docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md', [
  [
    'VIEW-FAULT-BOUNDARY',
    142,
    145,
    'Share one private mapped-view-store kernel while isolating optional view-provider failures.',
    'reaffirm',
    ['LOCAL-LIFECYCLE-PHASE'],
  ],
]);
addManual(
  'docs/plans/2026-07-23-plate-plugin-behavior-composition-observability.md',
  [
    [
      'PLUGIN-LIFECYCLE-PUBLISH-THEN-ISOLATE',
      829,
      830,
      'Publish an extension candidate before isolating activation failure rather than rolling it back.',
      'supersede',
      ['LOCAL-LIFECYCLE-PHASE'],
    ],
  ]
);

addManual(architecturePlan, [
  [
    'MEDIA-A11Y-CLOSURE-CLAIM',
    1530,
    1530,
    'Treat the existing media resize architecture as the complete product owner.',
    'supersede',
    ['LOCAL-MEDIA-KEYBOARD-RESIZE'],
  ],
]);
addManual('docs/plans/2026-07-27-plate-next-sync-all-packages-v17.md', [
  [
    'MEDIA-RESIZE-POINTER-OWNER',
    1244,
    1259,
    'Keep Resizable as the coherent public wrapper, hook/store family, length algorithm, and pointer-resize proof owner.',
    'reaffirm',
    ['LOCAL-MEDIA-KEYBOARD-RESIZE'],
  ],
]);

addManual('docs/plans/2026-07-27-explicit-plugin-state-contracts.md', [
  [
    'STATE-NAMED-CONTRACT',
    299,
    301,
    'Every plugin state owner declares one named PluginState contract.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'STATE-TYPED-DEFAULT',
    302,
    303,
    'Check static defaults with a typed constant and derived defaults with an explicit factory return type.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'STATE-CONSUMER-INLINE',
    304,
    305,
    'Keep consumer initialState configuration and weak peer overrides partial and inline.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'STATE-EXTEND-VS-CONFIGURE',
    306,
    310,
    'Use configure for state overrides; keep extend only when it genuinely widens state and has an explicit contract.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);

addManual('docs/plans/2026-07-29-core-owned-markdown-codec-doctrine.md', [
  [
    'MARKDOWN-CORE-TYPES',
    179,
    197,
    'Core owns universal first-party Markdown authoring types while the optional Markdown package owns compiler/runtime behavior and feature plugins own declarations.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);
addManual('docs/plans/2026-07-29-colocate-markdown-feature-codecs.md', [
  [
    'MARKDOWN-FEATURE-CONVERSION',
    176,
    193,
    'Each feature plugin owns its text/markdown node conversion; Markdown privately compiles installed declarations.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'MARKDOWN-PRIVATE-RUNTIME',
    189,
    192,
    'Keep Markdown document orchestration private to the optional format package and delete mutable central rule state.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);
addManual('docs/plans/2026-07-30-hard-cut-markdown-codec-package.md', [
  [
    'MARKDOWN-CODEC-PACKAGE-CUT',
    297,
    320,
    'Delete the contract-only Markdown codec package and move its universal type contract and built-in MIME registration to Core.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);
addManual('docs/plans/2026-07-30-unify-definecodecs-authoring.md', [
  [
    'DEFINECODECS-ONE-MAP',
    121,
    133,
    'Use one MIME-keyed defineCodecs map and delete the merge authoring alternative.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
]);

addManual('docs/plans/2026-07-29-repair-registry-cleanup-drift.md', [
  [
    'REGISTRY-EXPLICIT-WIRING',
    280,
    295,
    'Keep feature wiring explicit in copied registry demos while moving reusable cross-layer behavior to its package owner.',
    'reaffirm',
    ['PLATE-COPIED-KITS'],
  ],
]);
addManual(
  'docs/plans/2026-07-28-repair-media-table-list-utils-plugin-ownership.md',
  [
    [
      'FEATURE-SEMANTIC-OWNER-SPLITS',
      483,
      503,
      'Split Base, React, hook, algorithm, and migration owners only at genuine semantic or runtime boundaries; inline one-owner plumbing.',
      'reaffirm',
      ['PLATE-PRODUCT-BREADTH'],
    ],
  ]
);
addManual('docs/plans/2026-07-28-code-block-pure-utility-ownership.md', [
  [
    'CODEBLOCK-PRIVATE-GRAMMAR-ADAPTER',
    322,
    330,
    'Keep the Python grammar, aliases, guard, and regex helpers as one private external-library adapter rather than generic utilities.',
    'reaffirm',
    ['PLATE-PRODUCT-BREADTH'],
  ],
]);

addManual('docs/plans/2026-07-29-plate-next-core-p0-contracts.md', [
  [
    'CORE-01',
    97,
    97,
    'Preserve exact plugin capabilities across structured runtime boundaries instead of erasing them through any.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'CORE-02',
    98,
    98,
    'Builder implementations delegate through validated unknown boundaries without consumer casts or callback annotations.',
    'reaffirm',
    ['LOCAL-EXTENSION-CAPABILITIES'],
  ],
  [
    'CORE-03',
    99,
    99,
    'Plugin lookup requires an installed descriptor; optional access uses the portal installed flag.',
    'reaffirm',
    ['PLATE-PLUGIN-IDENTITY'],
  ],
]);

const coreRepair = 'docs/plans/2026-07-28-plate-next-core-p1-p2-repair.md';
for (let line = 499; line <= 511; line++) {
  const cells = tableCells(coreRepair, line);
  add({
    claim: `${cells[0]} — ${cells[2]}`,
    id: cells[0],
    sources: [source(coreRepair, line)],
  });
}

add({
  claim:
    'Wordgard has concrete product demand for typed phrase sets, partial translations, phrase references, and translations of built-in menu/dialog labels.',
  conceptIds: ['WG-STATE-012', 'PLATE-COPIED-KITS'],
  disposition: 'reaffirm',
  dispositionEvidence: {
    rationale:
      'This proves localization demand but not a generic Plate/Core owner; copied registry and application UI remain the honest local ownership boundary.',
    sources: [
      source('../wordgard-website/site/examples/translate/index.md', 3, 63),
      source('../wordgard-website/site/examples/translate/phrases.ts', 1, 55),
    ],
  },
  id: 'WGS-TRANSLATION-DEMAND',
  sources: [
    source('../wordgard-website/site/examples/translate/index.md', 3, 63),
    source('../wordgard-website/site/examples/translate/phrases.ts', 1, 55),
  ],
});

const ids = candidates.map(({ id }) => id);
if (new Set(ids).size !== ids.length) {
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  throw new Error(`Duplicate prior candidate IDs: ${[...new Set(duplicates)]}`);
}

export const invalidPriorClaims = Object.freeze([
  {
    id: 'PRIOR-ONE-HEADING',
    reason:
      'The claim cited the current audit report, so it was circular rather than prior evidence.',
    replacementCandidateIds: [
      'ATT-NODES-SEMANTIC-CATALOG',
      'HEADING-H1-H6-PLUGIN-NAMES',
    ],
  },
  {
    id: 'PRIOR-SCHEMA-DEFAULTS',
    reason:
      'The claim cited the current audit report, so it was circular rather than prior evidence.',
    replacementCandidateIds: [
      'DEFAULT-BLOCK-EDITOR-OPTION',
      'SCHEMA-P1-UNKNOWN-DEFAULT',
    ],
  },
  {
    id: 'PRIOR-REJECT-NAMESPACES',
    reason:
      'The claim cited the current audit report, so it was circular rather than prior evidence.',
    replacementCandidateIds: ['HELPER-API-OBJECTS', 'BA-REJECT-01'],
  },
  {
    id: 'PRIOR-SELECTIVE-FAULT',
    reason:
      'The claim cited the current audit report, so it was circular rather than prior evidence.',
    replacementCandidateIds: [
      'VIEW-FAULT-BOUNDARY',
      'PLUGIN-LIFECYCLE-PUBLISH-THEN-ISOLATE',
    ],
  },
  {
    id: 'PRIOR-TYPED-PHRASES',
    reason:
      'The claim cited the current audit report, so it was circular rather than prior evidence.',
    replacementCandidateIds: [
      'OLD-WG-STATE-012',
      'C33',
      'WGS-TRANSLATION-DEMAND',
    ],
  },
]);

const canonicalConceptIds = new Set(matrixTruth.map(({ id }) => id));
const atomicChildrenByParent = new Map();
for (const { id, parent } of matrixTruth) {
  if (!parent) continue;
  const children = atomicChildrenByParent.get(parent) ?? [];
  children.push(id);
  atomicChildrenByParent.set(parent, children);
}

// These focused claims need narrower owners than their former broad matrix row.
// Keeping this explicit prevents keyword matches such as `hard-cut` from
// silently turning API-shape decisions into clipboard findings.
const focusedCandidateRemaps = Object.freeze({
  'ATT-MIGRATE-TYPES-MARKS-PROPERTIES': {
    conceptIds: ['WG-DOC-003A'],
    reconciliationConceptId: 'WG-DOC-003A',
  },
  'BA-P0-07': {
    conceptIds: ['WG-VIEW-011A', 'WG-VIEW-011B', 'WG-VIEW-010C2'],
    reconciliationConceptId: 'WG-VIEW-011B',
  },
  'BA-P0-09': {
    conceptIds: ['LOCAL-REACT-HOST', 'WG-HIST-001A'],
    reconciliationConceptId: 'LOCAL-REACT-HOST',
  },
  'BA-P2-05': {
    conceptIds: [
      'LOCAL-DOC-ROOTS',
      'LOCAL-REACT-HOST',
      'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS',
    ],
    reconciliationConceptId: 'LOCAL-DOC-ROOTS',
  },
  'BA-P3-01': {
    conceptIds: ['WG-WEB-001', 'WG-META-004D'],
    reconciliationConceptId: 'WG-WEB-001',
  },
  'BA-REJECT-02': {
    conceptIds: ['WG-TABLE-006', 'WG-VIEW-010C2'],
    reconciliationConceptId: 'WG-TABLE-006',
  },
  C01: {
    conceptIds: ['WG-DOC-001B'],
    reconciliationConceptId: 'WG-DOC-001B',
  },
  C05: {
    conceptIds: ['WG-DOC-015A', 'WG-DOC-015B', 'WG-DOC-015C'],
    reconciliationConceptId: 'WG-DOC-015A',
  },
  C12: {
    conceptIds: ['WG-STATE-011B'],
    reconciliationConceptId: 'WG-STATE-011B',
  },
  C15: {
    conceptIds: ['WG-HIST-001A'],
    reconciliationConceptId: 'WG-HIST-001A',
  },
  C17: {
    conceptIds: ['LOCAL-PROOF-BROWSER-COVERAGE', 'LOCAL-PROOF-CI-MATRIX'],
    reconciliationConceptId: 'LOCAL-PROOF-BROWSER-COVERAGE',
  },
  C20: {
    conceptIds: ['WG-VIEW-012A1B', 'WG-VIEW-012A1C'],
    reconciliationConceptId: 'WG-VIEW-012A1C',
  },
  C23: {
    conceptIds: ['WG-PRODUCT-001A2D', 'WG-PRODUCT-003A2D'],
    reconciliationConceptId: 'WG-PRODUCT-003A2D',
  },
  C24: {
    conceptIds: ['WG-PRODUCT-003C', 'PLATE-COPIED-KITS'],
    reconciliationConceptId: 'WG-PRODUCT-003C',
  },
  C29: {
    conceptIds: ['WG-TABLE-004A'],
    reconciliationConceptId: 'WG-TABLE-004A',
  },
  C32: {
    conceptIds: [
      'LOCAL-PROOF-AFFECTED-CHECKS',
      'LOCAL-PROOF-BROWSER-COVERAGE',
      'LOCAL-PROOF-CI-MATRIX',
      'LOCAL-PROOF-RELEASE-GATES',
    ],
    reconciliationConceptId: 'LOCAL-PROOF-RELEASE-GATES',
  },
  'AI-KIT-ONE-DESCRIPTOR': {
    conceptIds: ['PLATE-PLUGIN-IDENTITY', 'LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'PLATE-PLUGIN-IDENTITY',
  },
  'BASE-COMPONENT-RELEASE': {
    conceptIds: ['LOCAL-PROOF-RELEASE-GATES'],
    reconciliationConceptId: 'LOCAL-PROOF-RELEASE-GATES',
  },
  'CAMEL-NO-COMPAT': {
    conceptIds: ['PLATE-PLUGIN-IDENTITY'],
    reconciliationConceptId: 'PLATE-PLUGIN-IDENTITY',
  },
  'CAMEL-TX-NAMESPACES': {
    conceptIds: ['PLATE-PLUGIN-IDENTITY', 'LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'PLATE-PLUGIN-IDENTITY',
  },
  'CORE-04': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'CODEBLOCK-PRIVATE-GRAMMAR-ADAPTER': {
    conceptIds: ['WG-PRODUCT-003A2B'],
    reconciliationConceptId: 'WG-PRODUCT-003A2B',
  },
  'FEATURE-SEMANTIC-OWNER-SPLITS': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES', 'LOCAL-REACT-HOST'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'FINAL-SHAPE-12-ADOPTION': {
    conceptIds: ['LOCAL-PROOF-AFFECTED-CHECKS', 'LOCAL-PROOF-RELEASE-GATES'],
    reconciliationConceptId: 'LOCAL-PROOF-AFFECTED-CHECKS',
  },
  'IDENTITY-NO-CHANGESET': {
    conceptIds: ['LOCAL-PROOF-RELEASE-GATES'],
    reconciliationConceptId: 'LOCAL-PROOF-RELEASE-GATES',
  },
  'MATEXEC-CLIPBOARD-CALLER-CLOSED': {
    conceptIds: ['WG-VIEW-011B', 'LOCAL-PROOF-RELEASE-GATES'],
    reconciliationConceptId: 'WG-VIEW-011B',
  },
  'MATEXEC-MOBILE-PROOF-ENTRYPOINT-CLOSED': {
    conceptIds: ['LOCAL-PROOF-CI-MATRIX'],
    reconciliationConceptId: 'LOCAL-PROOF-CI-MATRIX',
  },
  'MULTI-A5': {
    conceptIds: ['WG-VIEW-011A', 'WG-VIEW-011B'],
    reconciliationConceptId: 'WG-VIEW-011B',
  },
  'MULTI-HISTORY-FOCUS-CANCEL': {
    conceptIds: ['WG-HIST-001A'],
    reconciliationConceptId: 'WG-HIST-001A',
  },
  'PLUGIN-LAYER-COMBOBOX': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'PLUGIN-LAYER-DOCS': {
    conceptIds: ['WG-META-004D', 'LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'WG-META-004D',
  },
  'PLUGIN-LAYER-TOOLING': {
    conceptIds: ['LOCAL-PROOF-AFFECTED-CHECKS'],
    reconciliationConceptId: 'LOCAL-PROOF-AFFECTED-CHECKS',
  },
  'SCHEMA-REJECT-LEXICAL-CLASSES': {
    conceptIds: ['WG-DOC-001A'],
    reconciliationConceptId: 'WG-DOC-001A',
  },
  'STACK-001': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'STACK-002': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'STACK-007': {
    conceptIds: ['LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-EXTENSION-CAPABILITIES',
  },
  'STACK-008': {
    conceptIds: ['WG-STATE-005A', 'WG-STATE-005C'],
    reconciliationConceptId: 'WG-STATE-005A',
  },
  'UNIFY-P0-8': {
    conceptIds: ['WG-HIST-001A'],
    reconciliationConceptId: 'WG-HIST-001A',
  },
  'UNIFY-P1-8': {
    conceptIds: ['LOCAL-REACT-HOST', 'LOCAL-EXTENSION-CAPABILITIES'],
    reconciliationConceptId: 'LOCAL-REACT-HOST',
  },
});

const broadCandidateAdditions = Object.freeze({
  'OLD-WG-HIST-001': ['LOCAL-HISTORY-IDLE-GROUP'],
  'OLD-WG-PRODUCT-001A': ['PLATE-HEADING-ONTOLOGY'],
  'OLD-WG-PRODUCT-003A': ['PLATE-HEADING-ONTOLOGY'],
  'OLD-WG-STATE-001': ['LOCAL-LIFECYCLE-PHASE'],
  'OLD-WG-VIEW-009': ['LOCAL-NATIVE-INPUT-RECONCILIATION'],
});
const broadCandidatePrimary = Object.freeze({
  'OLD-WG-DOC-001': 'WG-DOC-001A',
  'OLD-WG-PRODUCT-003A': 'PLATE-HEADING-ONTOLOGY',
  'OLD-WG-VIEW-009': 'LOCAL-NATIVE-INPUT-RECONCILIATION',
});

const reconciledCandidateIds = new Set();
const reconcileCandidate = (candidate) => {
  const focused = focusedCandidateRemaps[candidate.id];
  const removedConceptIds = candidate.conceptIds.filter(
    (id) => !canonicalConceptIds.has(id)
  );
  if (!focused && removedConceptIds.length === 0) return candidate;

  let conceptIds;
  let reconciliationConceptId;
  if (focused) {
    ({ conceptIds, reconciliationConceptId } = focused);
  } else {
    if (!candidate.id.startsWith('OLD-WG-')) {
      throw new Error(
        `Focused prior candidate ${candidate.id} needs an explicit atomic remap`
      );
    }
    conceptIds = [
      ...candidate.conceptIds.flatMap((id) => {
        if (canonicalConceptIds.has(id)) return [id];
        const children = atomicChildrenByParent.get(id);
        if (!children?.length) {
          throw new Error(`Removed prior concept ${id} has no atomic children`);
        }
        return children;
      }),
      ...(broadCandidateAdditions[candidate.id] ?? []),
    ];
    reconciliationConceptId =
      broadCandidatePrimary[candidate.id] ?? conceptIds[0];
  }

  conceptIds = [...new Set(conceptIds)];
  for (const id of conceptIds) {
    if (!canonicalConceptIds.has(id)) {
      throw new Error(`${candidate.id} remaps to unknown concept ${id}`);
    }
  }
  if (!conceptIds.includes(reconciliationConceptId)) {
    throw new Error(
      `${candidate.id} reconciles outside its remapped concept IDs`
    );
  }

  reconciledCandidateIds.add(candidate.id);
  return Object.freeze({
    ...candidate,
    conceptIds: Object.freeze(conceptIds),
    reconciliationConceptId,
  });
};

export const priorCandidates = Object.freeze(
  candidates.map(reconcileCandidate)
);
for (const candidate of priorCandidates) {
  for (const id of candidate.conceptIds) {
    if (!canonicalConceptIds.has(id)) {
      throw new Error(`${candidate.id} retains removed concept ${id}`);
    }
  }
}
for (const id of Object.keys(focusedCandidateRemaps)) {
  if (!reconciledCandidateIds.has(id)) {
    throw new Error(`Focused atomic remap does not match candidate ${id}`);
  }
}
export const priorCandidateSummary = Object.freeze({
  candidateCount: priorCandidates.length,
  dispositionCounts: Object.freeze(
    Object.fromEntries(
      [...new Set(priorCandidates.map(({ disposition }) => disposition))]
        .sort()
        .map((disposition) => [
          disposition,
          priorCandidates.filter(
            (candidate) => candidate.disposition === disposition
          ).length,
        ])
    )
  ),
  invalidCircularClaimCount: invalidPriorClaims.length,
  sourceClaimCount: priorCandidates.reduce(
    (count, candidate) => count + candidate.sources.length,
    0
  ),
  uniqueSourceFileCount: new Set(
    priorCandidates.flatMap((candidate) =>
      candidate.sources.map(({ path }) => path)
    )
  ).size,
});

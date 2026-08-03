#!/usr/bin/env node

import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_ARTIFACT =
  'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit';
const CURRENT_PLAN =
  'docs/plans/2026-08-01-wordgard-exhaustive-architecture-re-audit.md';
const REGISTRY_PATH = 'docs/editor-audits/index.json';
const RECEIPT_PATH = `${CURRENT_ARTIFACT}/validation-receipt.json`;
const AUDIT_ID = 'wordgard-exhaustive-symmetric-2026-08-01';
const SIDES = ['wordgard', 'plite', 'plate'];
const DIMENSIONS = [
  'correctness',
  'api',
  'data',
  'ownership',
  'runtime',
  'proof',
];
const EXACT_FACETS = ['public', 'owner', 'consumers', 'lifecycle', 'proof'];
const PARTIAL_FACETS = ['covers', 'proof'];
const MAPPING_STATUSES = new Set([
  'exact',
  'partial',
  'absent',
  'not-applicable',
]);
const MATERIAL_VERDICTS = new Set(['steal', 'rearchitect', 'hard-cut', 'move']);
const DIMENSION_WINNER_SIDES = {
  'Plate stronger': ['plate'],
  'Plite stronger': ['plite'],
  'Plite/Plate stack stronger': ['plite', 'plate'],
  'reference stronger': ['wordgard'],
};
const DIMENSION_WINNERS = new Set([
  ...Object.keys(DIMENSION_WINNER_SIDES),
  'equivalent',
  'different tradeoff',
  'insufficient evidence',
  'not-applicable',
]);
const EVIDENCE_PROVENANCE = new Set(['coverage-only', 'direct']);
const EVIDENCE_SELECTIONS = new Set(['automatic', 'explicit']);
const EVIDENCE_STATUSES = new Set(['coverage-only', 'direct']);
const COVERAGE_INVENTORY_PATH_PATTERN =
  /(?:source-coverage|raw-source-inventory|site-coverage)\.json$/;
const PREFERRED_BY_CLASSIFICATION = {
  'Plate stronger': 'Plate',
  'Plite stronger': 'Plite',
  'Plite/Plate stack stronger': 'Plite/Plate stack',
  'different tradeoff': 'different tradeoff',
  equivalent: 'tie',
  'insufficient evidence': 'insufficient evidence',
  'reference stronger': 'reference',
};
const PRIOR_DISPOSITIONS = new Set(['reaffirm', 'supersede', 'reject']);
const PRIOR_CIRCULAR_PREFIXES = [
  `${CURRENT_ARTIFACT}/`,
  'docs/editor-test-harvester/wordgard/',
  'docs/editor-issue-harvester/wordgard/full/',
];
const PRIOR_CIRCULAR_PATHS = new Set([CURRENT_PLAN, REGISTRY_PATH]);
const REQUIRED_GENERATED_PATHS = [
  `${CURRENT_ARTIFACT}/matrix-truth.mjs`,
  `${CURRENT_ARTIFACT}/prior-candidates.mjs`,
  `${CURRENT_ARTIFACT}/dossier-data.mjs`,
  `${CURRENT_ARTIFACT}/wordgard-source-coverage.json`,
  `${CURRENT_ARTIFACT}/wordgard-raw-source-inventory.json`,
  `${CURRENT_ARTIFACT}/wordgard-site-coverage.json`,
  `${CURRENT_ARTIFACT}/wordgard-forum-inventory.json`,
  `${CURRENT_ARTIFACT}/wordgard-forum-coverage.json`,
  `${CURRENT_ARTIFACT}/wordgard-forum-coverage.md`,
  `${CURRENT_ARTIFACT}/plite-source-coverage.json`,
  `${CURRENT_ARTIFACT}/plate-source-coverage.json`,
  `${CURRENT_ARTIFACT}/runtime-api-bundle-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-namespace-bundle-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-public-contract-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-published-package-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-state-purity-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-value-purity-probe.json`,
  'docs/editor-test-harvester/wordgard/report.md',
  'docs/editor-test-harvester/wordgard/inventory.md',
  'docs/editor-test-harvester/wordgard/test-index.md',
  'docs/editor-issue-harvester/wordgard/full/issue-refresh.json',
  'docs/editor-issue-harvester/wordgard/full/classified-issues.json',
  'docs/editor-issue-harvester/wordgard/full/issue-closure-ledger.md',
  `${CURRENT_ARTIFACT}/concept-matrix.md`,
  `${CURRENT_ARTIFACT}/audit-report.md`,
  `${CURRENT_ARTIFACT}/material-dossiers.md`,
];
const VALIDATED_PROBE_PATHS = [
  `${CURRENT_ARTIFACT}/runtime-api-bundle-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-namespace-bundle-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-public-contract-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-published-package-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-state-purity-probe.json`,
  `${CURRENT_ARTIFACT}/wordgard-value-purity-probe.json`,
];
const MATRIX_COLUMNS = [
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
const DIMENSION_COLUMNS = {
  api: 'API/types',
  correctness: 'Correctness',
  data: 'Data/collab',
  ownership: 'Ownership/lifecycle',
  proof: 'Proof/host',
  runtime: 'Runtime/perf',
};
const CONTRACT_COLUMNS = {
  plate: 'Plate mapping',
  plite: 'Plite mapping',
  wordgard: 'Reference mapping',
};
const DECISION_COLUMNS = {
  classification: 'Classification',
  localDebt: 'Local debt',
  preferredBase: 'Preferred base',
  priority: 'Priority',
  proofAdaptation: 'Proof adaptation',
  referenceAdaptation: 'Reference adaptation',
  verdict: 'Verdict',
};
const LINE_SPLIT_PATTERN = /\r?\n/;
const LEADING_VALUE_PATTERN = /\s+(?:—|-|:)\s+/u;
const CODE_EDGE_PATTERN = /^`|`$/g;
const CITATION_PATTERN = /^(.+?):(\d+)(?:-(\d+))?$/;
const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[A-Za-z]:\//;
const PRIOR_SIBLING_PATH_PATTERN = /^\.\.\/(wordgard|wordgard-website)\/(.+)$/;
const NON_LOCAL_CITATION_PATTERN = /^(?:https?:|mailto:|#)/;
const WORDGARD_PROOF_PATH_PATTERN = /(?:^|\/)(?:test|tests|spec)(?:\/|\.|-)/i;
const WORDGARD_PUBLIC_PATH_PATTERN =
  /(?:^|\/)package\.json$|(?:^|\/)README\.md$|\/index\.ts$/i;
const TEST_OR_SPEC_PATTERN = /(?:test|spec)/i;
const PACKAGE_JSON_PATTERN = /(?:^|\/)package\.json$/;
const PLATE_PUBLIC_PATH_PATTERN = /(?:^|\/)package\.json$|\/index\.tsx?$/i;
const PRIORITY_PATTERN = /^P[0-3]$/;
const ROLLDOWN_VERSION_PATTERN =
  /^rolldown@(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const SEMVER_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const SHA1_PATTERN = /^[a-f0-9]{40}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SHA512_INTEGRITY_PATTERN = /^sha512-([A-Za-z0-9+/]{86}==)$/;
const JS_EXTENSION_PATTERN = /\.js$/;
const RELEASE_VERIFICATION_COMMAND_PATTERN = /(?:build|prepare|test)/i;
const WGF_CLAIM_ID_PATTERN = /^WGF-\d{3}$/;
const WORDGARD_META_CONCEPT_PATTERN = /^WG-META-/;
const WORDGARD_EXPORT_SUBPATHS = [
  '.',
  './collab',
  './command',
  './doc',
  './editor',
  './history',
  './phrases',
  './schema',
  './state',
  './table',
  './types',
];
const RUNTIME_API_BUNDLE_TARGETS = {
  'NodeApi.isText': 'packages/plite/src/interfaces/node.ts',
  'NodeApi.string': 'packages/plite/src/interfaces/node.ts',
  'PathApi.equals': 'packages/plite/src/interfaces/path.ts',
  'PointApi.equals': 'packages/plite/src/interfaces/point.ts',
  'TextApi.isText': 'packages/plite/src/interfaces/text.ts',
};
const WORDGARD_NAMESPACE_TARGETS = {
  'Command.bind': 'dist/command.js',
  'heading.createOnHash': 'dist/schema.js',
  'heading.keyBindings': 'dist/schema.js',
  'imageResizing.keyBindings': 'dist/schema.js',
};
const WORDGARD_NAMESPACE_SENTINELS = {
  'Command.bind': ['Menu', 'toggleBlock'],
  'heading.createOnHash': ['Ctrl-Shift-1', 'heading_1'],
  'heading.keyBindings': ['^(#{1,6}) $', 'heading_1'],
  'imageResizing.keyBindings': ['resizeHandle', 'selectedImage'],
};
const WORDGARD_NAMESPACE_SENTINEL_VALUES = {
  'Command.bind': {
    esbuild: { Menu: false, toggleBlock: false },
    rolldown: { Menu: false, toggleBlock: false },
  },
  'heading.createOnHash': {
    esbuild: { 'Ctrl-Shift-1': true, heading_1: true },
    rolldown: { 'Ctrl-Shift-1': true, heading_1: true },
  },
  'heading.keyBindings': {
    esbuild: { '^(#{1,6}) $': true, heading_1: true },
    rolldown: { '^(#{1,6}) $': true, heading_1: true },
  },
  'imageResizing.keyBindings': {
    esbuild: { resizeHandle: false, selectedImage: false },
    rolldown: { resizeHandle: true, selectedImage: false },
  },
};
const WORDGARD_PUBLIC_FINDING_CONTRACTS = {
  'WG-PACK-001': {
    impacts: ['WG-PROOF-005A'],
    kind: 'proof defect',
    severity: 'P0',
  },
  'WG-PACK-002': {
    impacts: ['WG-PROOF-005A'],
    kind: 'proof defect',
    severity: 'P0',
  },
  'WG-PACK-003': {
    impacts: [
      'WG-META-003',
      'WG-PROOF-001',
      'WG-PROOF-002A',
      'WG-PROOF-002B',
      'WG-PROOF-002C',
      'WG-PROOF-003',
      'WG-PROOF-004A',
      'WG-PROOF-004B',
      'WG-PROOF-005A',
    ],
    kind: 'proof defect',
    severity: 'P0',
  },
  'WG-PACK-004': {
    impacts: ['WG-PROOF-005A', 'WG-PROOF-005B'],
    kind: 'proof defect',
    severity: 'P1',
  },
  'WG-PACK-005': {
    impacts: ['WG-PROOF-005A'],
    kind: 'proof defect',
    severity: 'P1',
  },
  'WG-PACK-006': {
    impacts: ['WG-PROOF-005A'],
    kind: 'proof gap',
    severity: 'P2',
  },
  'WG-PACK-007': {
    impacts: ['LOCAL-RUNTIME-API-TREESHAKING'],
    kind: 'proof gap',
    severity: 'P2',
  },
};
const FORUM_VALIDATION_KEYS = [
  'allVisiblePostsExplained',
  'allVisibleTopicsExplained',
  'categoryPostCountMatchesRegularTopics',
  'categoryTopicCountMatchesIndexes',
  'changedPostIds',
  'duplicateClaimIds',
  'globalPostIndexMismatch',
  'latestCategoryTopicMismatch',
  'missingReviewedPostIds',
  'postStreamsComplete',
  'staleExcludedPostIds',
  'uncategorizedPostIds',
  'unknownExistingRowIds',
  'unknownProposedRowIds',
  'unmappedClaimIds',
  'unreviewedPostIds',
];
const PUBLISHED_PACKAGE_VALIDATION_KEYS = [
  'declarationTargetsMissing',
  'dependencyInstallError',
  'importFailures',
  'runtimeTargetsMissing',
];
const REPORT_SUMMARY_PATTERN =
  /<!-- audit-summary:start -->\s*([\s\S]*?)\s*<!-- audit-summary:end -->/;
const DOSSIER_ID_PATTERN = /`([^`]+)`/g;
const HTML_ANCHOR_PATTERN = /<a\s+(?:[^>]*?\s)?id=["']([^"']+)["'][^>]*>/gi;
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+(.+?)\s*#*$/;
const MARKDOWN_LINK_PATTERN = /\[[^\]]*\]\(([^)]+)\)/g;
const LINK_TITLE_PATTERN = /\s+['"]/;
const REMOTE_LINK_PATTERN = /^(?:https?:|mailto:)/;
const CODE_CITATION_PATTERN = /`([^`\n]+:\d+(?:-\d+)?)`/g;

const fail = (message) => {
  throw new Error(message);
};
const ensure = (condition, message) => {
  if (!condition) fail(message);
};
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const hashFile = (path) => sha256(readFileSync(path));
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const sortedUnique = (values) => [...new Set(values)].sort();
const sameSet = (actual, expected, label) => {
  const left = sortedUnique(actual);
  const right = sortedUnique(expected);
  ensure(
    JSON.stringify(left) === JSON.stringify(right),
    `${label} mismatch: actual=${left.join(',')} expected=${right.join(',')}`
  );
};
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => [key, canonicalize(child)])
  );
};
const sameValue = (actual, expected, label) => {
  ensure(
    JSON.stringify(canonicalize(actual)) ===
      JSON.stringify(canonicalize(expected)),
    `${label} mismatch`
  );
};
const asArray = (value) => (Array.isArray(value) ? value : [value]);
const normalizeRepoPath = (path) => path.replaceAll('\\', '/');
const resolvePriorSourcePath = ({ label, path, root }) => {
  const normalized = normalizeRepoPath(path);
  ensure(
    normalized &&
      !normalized.startsWith('/') &&
      !WINDOWS_ABSOLUTE_PATH_PATTERN.test(normalized),
    `${label} is not repo-relative`
  );
  const sibling = normalized.match(PRIOR_SIBLING_PATH_PATTERN);
  let allowedRoot;
  let relativePath;
  if (sibling) {
    allowedRoot = resolve(root, '..', sibling[1]);
    relativePath = sibling[2];
  } else {
    ensure(!normalized.startsWith('../'), `${label} is not repo-relative`);
    allowedRoot = root;
    relativePath = normalized;
  }
  const segments = relativePath.split('/');
  ensure(
    segments.length > 0 &&
      segments.every(
        (segment) => segment && segment !== '.' && segment !== '..'
      ),
    `${label} is not repo-relative`
  );
  const absolutePath = resolve(allowedRoot, relativePath);
  const child = relative(allowedRoot, absolutePath);
  ensure(
    child !== '..' && !child.startsWith('../') && !child.startsWith('..\\'),
    `${label} is not repo-relative`
  );
  return { absolutePath, path: normalized };
};
const lineSliceDigest = (text, lineStart, lineEnd) =>
  sha256(
    text
      .split(LINE_SPLIT_PATTERN)
      .slice(lineStart - 1, lineEnd)
      .join('\n')
  );
const leadingValue = (value) => value.split(LEADING_VALUE_PATTERN)[0].trim();
const stripCode = (value) => value.replace(CODE_EDGE_PATTERN, '').trim();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseMarkdownRow = (line) => {
  const cells = [];
  let cell = '';
  let escaped = false;
  let inCode = false;
  for (const character of line.trim()) {
    if (escaped) {
      cell += character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
      cell += character;
    } else if (character === '`') {
      inCode = !inCode;
      cell += character;
    } else if (character === '|' && !inCode) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  if (cells[0] === '') cells.shift();
  if (cells.at(-1) === '') cells.pop();
  return cells;
};

const parseMatrixRows = (matrix) => {
  const lines = matrix.split(LINE_SPLIT_PATTERN);
  const headerIndex = lines.findIndex(
    (line) =>
      line.trim().startsWith('|') &&
      JSON.stringify(parseMarkdownRow(line)) === JSON.stringify(MATRIX_COLUMNS)
  );
  ensure(headerIndex >= 0, 'matrix header is missing or reordered');
  const rows = new Map();
  for (let index = headerIndex + 2; index < lines.length; index++) {
    if (!lines[index].trim().startsWith('|')) break;
    const cells = parseMarkdownRow(lines[index]);
    ensure(
      cells.length === MATRIX_COLUMNS.length,
      `matrix line ${index + 1} has ${cells.length} cells`
    );
    const row = Object.fromEntries(
      MATRIX_COLUMNS.map((column, cellIndex) => [column, cells[cellIndex]])
    );
    const id = stripCode(row.ID);
    ensure(!rows.has(id), `matrix repeats ${id}`);
    rows.set(id, row);
  }
  return rows;
};

const resolveCitation = (raw, context, label) => {
  ensure(typeof raw === 'string' && raw.trim(), `${label} citation is empty`);
  const value = raw.trim().replace(CODE_EDGE_PATTERN, '');
  const match = value.match(CITATION_PATTERN);
  ensure(match, `${label} needs path:start-end: ${value}`);
  const [, path, startText, endText] = match;
  ensure(
    !path.startsWith('/') && !NON_LOCAL_CITATION_PATTERN.test(path),
    `${label} is not a portable local citation: ${value}`
  );
  const lineStart = Number(startText);
  const lineEnd = Number(endText ?? startText);
  ensure(
    Number.isInteger(lineStart) && lineStart > 0 && lineEnd >= lineStart,
    `${label} has invalid line bounds: ${value}`
  );
  const absolutePath = resolve(context.root, path);
  const allowedRoots = context.allowedRoots ?? [context.root];
  ensure(
    allowedRoots.some((allowedRoot) => {
      const child = relative(allowedRoot, absolutePath);
      return (
        child !== '..' && !child.startsWith('../') && !child.startsWith('..\\')
      );
    }),
    `${label} escapes the audited repositories: ${path}`
  );
  ensure(existsSync(absolutePath), `${label} path does not exist: ${path}`);
  let lineCount = context.lineCounts.get(absolutePath);
  if (!lineCount) {
    lineCount = readFileSync(absolutePath, 'utf8').split(
      LINE_SPLIT_PATTERN
    ).length;
    context.lineCounts.set(absolutePath, lineCount);
  }
  ensure(
    lineEnd <= lineCount,
    `${label} line ${lineEnd} exceeds ${path} (${lineCount})`
  );
  return {
    absolutePath,
    lineEnd,
    lineStart,
    path: normalizeRepoPath(path),
    raw: value,
  };
};

const validateCitationList = (values, context, label) => {
  ensure(Array.isArray(values) && values.length > 0, `${label} is empty`);
  return values.map((value, index) =>
    resolveCitation(value, context, `${label}[${index}]`)
  );
};

const addMetadata = (metadata, absolutePath, next) => {
  const current = metadata.get(absolutePath) ?? {
    consumer: false,
    entrypoint: false,
    exportedLines: new Set(),
    owner: false,
    proof: false,
    public: false,
  };
  metadata.set(absolutePath, {
    consumer: current.consumer || Boolean(next.consumer),
    entrypoint: current.entrypoint || Boolean(next.entrypoint),
    exportedLines: new Set([
      ...current.exportedLines,
      ...(next.exportedLines ?? []),
    ]),
    owner: current.owner || Boolean(next.owner),
    proof: current.proof || Boolean(next.proof),
    public: current.public || Boolean(next.public),
  });
};

export const buildInventoryIndex = ({
  plate,
  plite,
  root,
  siteRoot,
  wordgard,
  wordgardRaw,
  wordgardRoot,
  wordgardSite,
}) => {
  const filesBySource = {
    plate: new Map(),
    plite: new Map(),
    wordgard: new Map(),
  };
  const metadata = new Map();
  const add = (side, sourceId, absolutePath, flags) => {
    const files = filesBySource[side].get(sourceId) ?? new Set();
    files.add(absolutePath);
    filesBySource[side].set(sourceId, files);
    addMetadata(metadata, absolutePath, flags);
  };
  const wordgardRawByPath = new Map(
    wordgardRaw.files.map((file) => [file.path, file])
  );
  for (const file of wordgard.files) {
    const absolutePath = resolve(wordgardRoot, file.path);
    const declarations = wordgardRawByPath.get(file.path)?.declarations ?? [];
    const flags = {
      consumer: ['product-shell', 'test'].includes(file.category),
      entrypoint: WORDGARD_PUBLIC_PATH_PATTERN.test(file.path),
      exportedLines: declarations
        .filter(({ exported }) => exported)
        .map(({ line }) => line),
      owner: file.category === 'source',
      proof:
        file.category === 'proof' ||
        WORDGARD_PROOF_PATH_PATTERN.test(file.path),
      public: declarations.some(({ exported }) => exported),
    };
    for (const sourceId of file.conceptIds ?? []) {
      add('wordgard', sourceId, absolutePath, {
        ...flags,
        owner:
          flags.owner ||
          (['metadata', 'tooling'].includes(file.category) &&
            WORDGARD_META_CONCEPT_PATTERN.test(sourceId)),
      });
    }
  }
  for (const file of wordgardSite.files) {
    const absolutePath = resolve(siteRoot, file.path);
    const flags = {
      consumer:
        file.path.startsWith('site/') || file.path.startsWith('template/'),
      entrypoint:
        file.path.startsWith('site/docs/') ||
        file.path === 'README.md' ||
        file.path.startsWith('template/'),
      exportedLines: [],
      owner: file.path.startsWith('src/'),
      proof:
        file.path.includes('/examples/') ||
        file.path === 'package.json' ||
        TEST_OR_SPEC_PATTERN.test(file.path),
      public:
        file.path.startsWith('site/docs/') ||
        file.path === 'README.md' ||
        file.path.startsWith('template/'),
    };
    for (const sourceId of file.conceptIds ?? []) {
      add('wordgard', sourceId, absolutePath, flags);
    }
  }
  const plitePublic = new Set(
    (plite.publicEntrypoints ?? []).map(({ path }) => resolve(root, path))
  );
  for (const file of plite.entries) {
    const absolutePath = resolve(root, file.path);
    const flags = {
      consumer: ['documentation', 'test'].includes(file.role),
      entrypoint:
        plitePublic.has(absolutePath) || PACKAGE_JSON_PATTERN.test(file.path),
      exportedLines: file.declarations
        .filter(({ exported }) => exported)
        .map(({ line }) => line),
      owner: file.role === 'source',
      proof: ['proof-tooling', 'test'].includes(file.role),
      public:
        plitePublic.has(absolutePath) ||
        file.declarations.some(({ exported }) => exported) ||
        PACKAGE_JSON_PATTERN.test(file.path),
    };
    for (const sourceId of file.conceptIds) {
      add('plite', sourceId, absolutePath, flags);
    }
  }
  for (const file of plate.files) {
    if (file.exclusion) continue;
    const absolutePath = resolve(root, file.path);
    const flags = {
      consumer: ['documentation', 'product', 'proof'].includes(file.kind),
      entrypoint: PLATE_PUBLIC_PATH_PATTERN.test(file.path),
      exportedLines: file.declarations
        .filter(({ exported }) => exported)
        .map(({ line }) => line),
      owner: file.kind === 'source',
      proof: file.kind === 'proof',
      public:
        file.declarations.some(({ exported }) => exported) ||
        PLATE_PUBLIC_PATH_PATTERN.test(file.path),
    };
    for (const sourceId of file.concepts) {
      add('plate', sourceId, absolutePath, flags);
    }
  }
  for (const path of VALIDATED_PROBE_PATHS) {
    addMetadata(metadata, resolve(root, path), { proof: true });
  }
  return {
    filesBySource,
    metadata,
    sourceIds: {
      plate: plate.conceptIds,
      plite: Object.keys(plite.concepts),
      wordgard: [
        ...wordgard.concepts.map(({ id }) => id),
        ...wordgardSite.concepts.map(({ id }) => id),
      ],
    },
  };
};

const contractCitationFields = (contract) => {
  if (contract.status === 'exact') return EXACT_FACETS;
  if (contract.status === 'partial') {
    return [
      ...PARTIAL_FACETS,
      ...(contract.missingEvidence ? ['missingEvidence'] : []),
    ];
  }
  return ['evidence'];
};

export const validateContractEvidenceProvenance = ({
  concept,
  context,
  contract,
  side,
}) => {
  const fields = contractCitationFields(contract);
  ensure(
    contract.evidenceProvenance &&
      typeof contract.evidenceProvenance === 'object' &&
      !Array.isArray(contract.evidenceProvenance),
    `${concept.id} ${side} lacks evidenceProvenance`
  );
  sameSet(
    Object.keys(contract.evidenceProvenance),
    fields,
    `${concept.id} ${side}.evidenceProvenance keys`
  );
  return Object.fromEntries(
    fields.map((field) => {
      const provenance = contract.evidenceProvenance[field];
      ensure(
        EVIDENCE_PROVENANCE.has(provenance),
        `${concept.id} ${side}.${field} has invalid evidence provenance ${provenance}`
      );
      const citations = validateCitationList(
        contract[field],
        context,
        `${concept.id} ${side}.${field}`
      );
      if (provenance === 'direct' && field !== 'missingEvidence') {
        ensure(
          citations.every(
            ({ path }) => !COVERAGE_INVENTORY_PATH_PATTERN.test(path)
          ),
          `${concept.id} ${side}.${field} promotes closure-only inventory evidence to direct`
        );
      }
      return [field, citations];
    })
  );
};

const validateNoSelfNaming = (value, concept, label) => {
  ensure(
    typeof value === 'string' && value.trim().length >= 12,
    `${label} is thin`
  );
  ensure(
    !new RegExp(`\\b${escapeRegExp(concept.id)}\\b`, 'i').test(value),
    `${label} embeds row ID ${concept.id}`
  );
  ensure(
    !value.toLowerCase().includes(concept.title.toLowerCase()),
    `${label} embeds row title`
  );
};

export const validateExactContract = ({ concept, context, contract, side }) => {
  const facets = validateContractEvidenceProvenance({
    concept,
    context,
    contract,
    side,
  });
  const isDirect = (facet) => contract.evidenceProvenance[facet] === 'direct';
  const ownerCitations = new Set(facets.owner.map(({ raw }) => raw));
  if (isDirect('owner') && isDirect('consumers')) {
    ensure(
      facets.consumers.some(({ raw }) => !ownerCitations.has(raw)),
      `${concept.id} ${side} consumer is not distinct from its owner`
    );
  }

  const facetsByCitation = new Map();
  for (const [facet, citations] of Object.entries(facets)) {
    for (const { raw } of citations) {
      const used = facetsByCitation.get(raw) ?? new Set();
      used.add(facet);
      facetsByCitation.set(raw, used);
    }
  }
  const repeatedGroups = [...facetsByCitation.values()]
    .filter((used) => used.size > 1)
    .map((used) => [...used].sort().join('+'));
  const justifications = contract.facetReuseJustification ?? [];
  ensure(
    Array.isArray(justifications),
    `${concept.id} ${side}.facetReuseJustification must be an array`
  );
  const justifiedGroups = [];
  for (const [index, justification] of justifications.entries()) {
    ensure(
      justification && Array.isArray(justification.facets),
      `${concept.id} ${side} reuse ${index} lacks facets`
    );
    const names = sortedUnique(justification.facets);
    ensure(
      names.length >= 2 && names.every((facet) => EXACT_FACETS.includes(facet)),
      `${concept.id} ${side} reuse ${index} names invalid or wildcard facets`
    );
    validateNoSelfNaming(
      justification.reason,
      concept,
      `${concept.id} ${side} reuse ${index} reason`
    );
    justifiedGroups.push(names.join('+'));
  }
  sameSet(
    justifiedGroups,
    repeatedGroups,
    `${concept.id} ${side} exact facet reuse`
  );
  return Object.values(facets).flat();
};

const validateContract = ({ concept, context, contract, inventory, side }) => {
  ensure(
    contract && typeof contract === 'object',
    `${concept.id} lacks ${side} contract`
  );
  ensure(
    MAPPING_STATUSES.has(contract.status),
    `${concept.id} ${side} has invalid status ${contract.status}`
  );
  if (contract.status === 'exact') {
    return validateExactContract({
      concept,
      context,
      contract,
      inventory,
      side,
    });
  }
  if (contract.status === 'partial') {
    ensure(
      typeof contract.missing === 'string' &&
        contract.missing.trim().length >= 12,
      `${concept.id} ${side} partial contract lacks missing behavior`
    );
  } else {
    ensure(
      typeof contract.reason === 'string' &&
        contract.reason.trim().length >= 12,
      `${concept.id} ${side}.${contract.status} lacks a reason`
    );
  }
  return Object.values(
    validateContractEvidenceProvenance({ concept, context, contract, side })
  ).flat();
};

export const validateMappingGraph = ({
  concepts,
  context,
  forumCoverage,
  inventory,
  sourceMappings,
}) => {
  const conceptIds = new Set(concepts.map(({ id }) => id));
  const forumProposedIds =
    forumCoverage?.mappings?.proposedMatrixRows?.map(({ id }) => id) ?? [];
  ensureUniqueValues(forumProposedIds, 'forum proposed-row provenance');
  ensure(
    forumProposedIds.every((id) => conceptIds.has(id)),
    'forum proposed-row provenance cites an unknown concept'
  );
  const mappedUnion = new Set();
  const reverse = Object.fromEntries(
    SIDES.map((side) => [side, new Map(concepts.map(({ id }) => [id, []]))])
  );
  for (const side of SIDES) {
    const mappings = sourceMappings[side];
    ensure(
      mappings && typeof mappings === 'object',
      `sourceMappings.${side} is missing`
    );
    sameSet(
      Object.keys(mappings),
      inventory.sourceIds[side],
      `${side} source mapping keys`
    );
    for (const [sourceId, unionIds] of Object.entries(mappings)) {
      ensure(
        Array.isArray(unionIds) && unionIds.length > 0,
        `${side} ${sourceId} has no union edge`
      );
      ensure(
        new Set(unionIds).size === unionIds.length,
        `${side} ${sourceId} repeats a union edge`
      );
      for (const conceptId of unionIds) {
        ensure(
          conceptIds.has(conceptId),
          `${side} ${sourceId} maps unknown ${conceptId}`
        );
        reverse[side].get(conceptId).push(sourceId);
        mappedUnion.add(conceptId);
      }
    }
  }
  sameSet(
    [...mappedUnion, ...forumProposedIds],
    conceptIds,
    'union source provenance'
  );
  for (const concept of concepts.filter(({ id }) => !mappedUnion.has(id))) {
    ensure(
      forumProposedIds.includes(concept.id) &&
        SIDES.every((side) => concept.contracts?.[side]?.status === 'absent'),
      `${concept.id} lacks implementation provenance or an absent-only forum proposal`
    );
  }

  for (const concept of concepts) {
    ensure(
      concept.contracts && concept.dimensions,
      `${concept.id} lacks structured truth`
    );
    for (const side of SIDES) {
      const contract = concept.contracts[side];
      validateContract({
        concept,
        context,
        contract,
        inventory,
        side,
      });
      const edgeIds = reverse[side].get(concept.id);
      const positive = ['exact', 'partial'].includes(contract.status);
      ensure(
        positive === edgeIds.length > 0,
        `${concept.id} ${side} ${contract.status} contradicts reverse edges ${edgeIds.join(',')}`
      );
      sameSet(
        contract.sourceConceptIds ?? [],
        edgeIds,
        `${concept.id} ${side}.sourceConceptIds`
      );
      for (const sourceId of edgeIds) {
        const sourceFiles =
          inventory.filesBySource[side].get(sourceId) ?? new Set();
        ensure(
          sourceFiles.size > 0,
          `${side} ${sourceId} has no inventory files`
        );
      }
    }
  }
};

export const normalizeQualitativeClaim = (value, concept = {}) => {
  let normalized = String(value)
    .normalize('NFKD')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/`[^`]+`/g, ' ');
  for (const token of [concept.id, concept.title].filter(Boolean)) {
    normalized = normalized.replace(new RegExp(escapeRegExp(token), 'gi'), ' ');
  }
  return normalized
    .replace(/\b(?:WG|WGS|PL|LOCAL)-[A-Z0-9-]+\b/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
};

export const deriveEffectiveComparison = (winners) => {
  const votes = new Set(
    winners.filter(
      (winner) =>
        winner !== 'insufficient evidence' && winner !== 'not-applicable'
    )
  );
  let classification;
  const hasLocal = [
    'Plate stronger',
    'Plite stronger',
    'Plite/Plate stack stronger',
  ].some((winner) => votes.has(winner));
  const hasReference = votes.has('reference stronger');
  if (votes.size === 0) {
    classification = 'insufficient evidence';
  } else if (votes.has('different tradeoff') || (hasReference && hasLocal)) {
    classification = 'different tradeoff';
  } else if (hasReference) {
    classification = 'reference stronger';
  } else if (
    votes.has('Plite/Plate stack stronger') ||
    (votes.has('Plate stronger') && votes.has('Plite stronger'))
  ) {
    classification = 'Plite/Plate stack stronger';
  } else if (votes.has('Plate stronger')) {
    classification = 'Plate stronger';
  } else if (votes.has('Plite stronger')) {
    classification = 'Plite stronger';
  } else {
    classification = 'equivalent';
  }
  return {
    classification,
    preferred: PREFERRED_BY_CLASSIFICATION[classification],
  };
};

export const validateProfileAssignments = (source) => {
  ensure(
    typeof source === 'string' && source.length > 0,
    'matrix truth source is empty'
  );
  const rejectDuplicates = (ids, label) => {
    const counts = new Map();
    for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
    const duplicates = [...counts]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
      .sort();
    ensure(
      duplicates.length === 0,
      `duplicate ${label} assignments: ${duplicates.join(', ')}`
    );
  };

  const semanticIds = [
    ...source.matchAll(/^\s*(['"])([A-Z][A-Z0-9-]+)\1\s*:\s*semantic\s*\(/gm),
  ].map((match) => match[2]);
  rejectDuplicates(semanticIds, 'semantic profile');

  const winnerIds = [
    ...source.matchAll(/setWinnerProfile\(\s*(['"])([A-Z][A-Z0-9-]+)\1\s*,/g),
  ].map((match) => match[2]);
  for (const match of source.matchAll(
    /assignWinners\(\s*(['"])[^'"]*\1\s*,\s*\[([\s\S]*?)\]\s*\)/g
  )) {
    winnerIds.push(
      ...[...match[2].matchAll(/(['"])([A-Z][A-Z0-9-]+)\1/g)].map(
        (idMatch) => idMatch[2]
      )
    );
  }
  rejectDuplicates(winnerIds, 'winner profile');
};

export const validateDimensionTruth = ({ concepts, context }) => {
  const profiles = new Map();
  for (const concept of concepts) {
    const normalizedClaims = [];
    const effectiveWinners = [];
    for (const dimension of DIMENSIONS) {
      const truth = concept.dimensions?.[dimension];
      ensure(
        truth && typeof truth === 'object',
        `${concept.id} lacks ${dimension}`
      );
      validateNoSelfNaming(
        truth.claim,
        concept,
        `${concept.id} ${dimension}.claim`
      );
      ensure(
        DIMENSION_WINNERS.has(truth.winner),
        `${concept.id} ${dimension}.winner is invalid: ${truth.winner}`
      );
      ensure(
        Array.isArray(truth.evidence),
        `${concept.id} ${dimension}.evidence must be an array`
      );
      if (truth.evidence.length > 0) {
        validateCitationList(
          truth.evidence,
          context,
          `${concept.id} ${dimension}.evidence`
        );
      }
      const effective = !['insufficient evidence', 'not-applicable'].includes(
        truth.winner
      );
      ensure(
        EVIDENCE_SELECTIONS.has(truth.evidenceSelection),
        `${concept.id} ${dimension}.evidenceSelection is invalid`
      );
      ensure(
        truth.evidenceSelection === 'explicit',
        `${concept.id} ${dimension} does not explicitly select evidence`
      );
      ensure(
        EVIDENCE_STATUSES.has(truth.evidenceStatus),
        `${concept.id} ${dimension}.evidenceStatus is invalid`
      );
      if (effective) {
        ensure(
          truth.evidenceStatus === 'direct',
          `${concept.id} ${dimension} has a coverage-only effective winner`
        );
      }
      const evidenceKeys = truth.evidenceKeys;
      ensure(
        Array.isArray(evidenceKeys),
        `${concept.id} ${dimension}.evidenceKeys must be an intentional array`
      );
      if (effective) {
        ensure(
          evidenceKeys.length > 0,
          `${concept.id} ${dimension} effective winner lacks evidenceKeys`
        );
      }
      const directSides = new Set();
      ensure(
        new Set(evidenceKeys).size === evidenceKeys.length,
        `${concept.id} ${dimension}.evidenceKeys repeats a key`
      );
      const expectedEvidence = [];
      const seenEvidence = new Set();
      let selectedFacetsAreDirect = evidenceKeys.length > 0;
      for (const key of evidenceKeys) {
        ensure(
          typeof key === 'string' &&
            key.split('.').length === 2 &&
            key.split('.').every(Boolean),
          `${concept.id} ${dimension} has malformed evidence key ${key}`
        );
        const [side, facet] = key.split('.');
        ensure(
          SIDES.includes(side),
          `${concept.id} ${dimension} has unknown evidence side ${side}`
        );
        const contract = concept.contracts?.[side];
        ensure(
          contract && MAPPING_STATUSES.has(contract.status),
          `${concept.id} ${dimension} keys a missing ${side} contract`
        );
        ensure(
          contractCitationFields(contract).includes(facet),
          `${concept.id} ${dimension} keys unavailable ${side}.${facet}`
        );
        const provenance = contract.evidenceProvenance?.[facet];
        ensure(
          EVIDENCE_PROVENANCE.has(provenance),
          `${concept.id} ${dimension} keys unclassified ${side}.${facet}`
        );
        if (provenance === 'direct') {
          directSides.add(side);
        } else {
          selectedFacetsAreDirect = false;
        }
        if (effective) {
          ensure(
            provenance === 'direct',
            `${concept.id} ${dimension} promotes coverage-only ${side}.${facet}`
          );
        }
        for (const citation of contract[facet]) {
          if (seenEvidence.has(citation)) continue;
          seenEvidence.add(citation);
          expectedEvidence.push(citation);
        }
      }
      ensure(
        JSON.stringify(truth.evidence) === JSON.stringify(expectedEvidence),
        `${concept.id} ${dimension}.evidence does not match evidenceKeys`
      );
      const expectedEvidenceStatus = selectedFacetsAreDirect
        ? 'direct'
        : 'coverage-only';
      ensure(
        truth.evidenceStatus === expectedEvidenceStatus,
        `${concept.id} ${dimension}.evidenceStatus contradicts selected facets`
      );
      const requiredSides = DIMENSION_WINNER_SIDES[truth.winner] ?? [];
      for (const side of requiredSides) {
        const contract = concept.contracts?.[side];
        ensure(
          contract && ['exact', 'partial'].includes(contract.status),
          `${concept.id} ${dimension} prefers ${side} without a positive mapping`
        );
        ensure(
          directSides.has(side),
          `${concept.id} ${dimension} cites no direct ${side} winning-side evidence`
        );
      }
      if (['equivalent', 'different tradeoff'].includes(truth.winner)) {
        ensure(
          directSides.size >= 2,
          `${concept.id} ${dimension} tradeoff/equivalence has fewer than two direct sides`
        );
      }
      if (
        dimension === 'runtime' &&
        effective &&
        !['equivalent', 'different tradeoff'].includes(truth.winner)
      ) {
        ensure(
          [...directSides].some((side) => !requiredSides.includes(side)),
          `${concept.id} runtime winner lacks direct comparable-side proof`
        );
      }
      if (effective) effectiveWinners.push(truth.winner);
      normalizedClaims.push(
        `${truth.winner.toLowerCase()}:${normalizeQualitativeClaim(truth.claim, concept)}`
      );
    }
    const effective = deriveEffectiveComparison(effectiveWinners);
    if (concept.classification !== undefined) {
      ensure(
        concept.classification === effective.classification,
        `${concept.id} classification is unsupported by direct dimensions`
      );
    }
    if (concept.preferred !== undefined) {
      ensure(
        concept.preferred === effective.preferred,
        `${concept.id} preferred base is unsupported by direct dimensions`
      );
    }
    if (concept.decision?.classification !== undefined) {
      ensure(
        concept.decision.classification === effective.classification,
        `${concept.id} decision.classification is unsupported by direct dimensions`
      );
    }
    if (concept.decision?.preferredBase !== undefined) {
      ensure(
        concept.decision.preferredBase === effective.preferred,
        `${concept.id} decision.preferredBase is unsupported by direct dimensions`
      );
    }
    const profile = normalizedClaims.join('||');
    const profileIds = profiles.get(profile) ?? [];
    profileIds.push(concept.id);
    profiles.set(profile, profileIds);
  }
  for (const ids of profiles.values()) {
    ensure(
      ids.length === 1,
      `templated qualitative profile: ${ids.join(', ')}`
    );
  }
};

const groupIds = (values, valueFor, { sortIds = true } = {}) => {
  const groups = {};
  for (const value of values) {
    const key = valueFor(value);
    const ids = groups[key] ?? [];
    ids.push(value.id);
    groups[key] = ids;
  }
  return Object.fromEntries(
    Object.entries(groups)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, ids]) => [key, sortIds ? [...ids].sort() : ids])
  );
};
const machineGroup = (groups) =>
  Object.fromEntries(
    Object.entries(groups).map(([key, ids]) => [
      key,
      { count: ids.length, ids },
    ])
  );

const deriveSummaryGroups = (manifest) => {
  const concepts = manifest.concepts;
  const candidates = manifest.priorCandidates;
  const index = new Map(concepts.map(({ id }, position) => [id, position]));
  const priorityOrder = new Map([
    ['P0', 0],
    ['P1', 1],
    ['P2', 2],
    ['P3', 3],
  ]);
  const materialIds = concepts
    .filter(({ decision }) => MATERIAL_VERDICTS.has(decision.verdict))
    .sort(
      (left, right) =>
        priorityOrder.get(left.decision.priority) -
          priorityOrder.get(right.decision.priority) ||
        index.get(left.id) - index.get(right.id)
    )
    .map(({ id }) => id);
  const deferredIds = concepts
    .filter(({ decision }) => ['defer', 'research'].includes(decision.verdict))
    .map(({ id }) => id);
  return {
    classification: groupIds(
      concepts,
      ({ decision }) => decision.classification
    ),
    deferredIds,
    localDebt: groupIds(concepts, ({ decision }) => decision.localDebt),
    materialIds,
    origin: groupIds(concepts, ({ origin }) => origin),
    preferred: groupIds(concepts, ({ decision }) => decision.preferredBase),
    priorDisposition: groupIds(candidates, ({ disposition }) => disposition),
    priority: groupIds(concepts, ({ decision }) => decision.priority),
    proofAdaptation: groupIds(
      concepts,
      ({ decision }) => decision.proofAdaptation
    ),
    referenceAdaptation: groupIds(
      concepts,
      ({ decision }) => decision.referenceAdaptation
    ),
    verdict: groupIds(concepts, ({ decision }) => decision.verdict),
  };
};

const machineSummary = (groups) => ({
  classifications: machineGroup(groups.classification),
  deferred: { count: groups.deferredIds.length, ids: groups.deferredIds },
  localDebt: machineGroup(groups.localDebt),
  material: { count: groups.materialIds.length, ids: groups.materialIds },
  origins: machineGroup(groups.origin),
  preferredBases: machineGroup(groups.preferred),
  priorCandidateDispositions: machineGroup(groups.priorDisposition),
  priorities: machineGroup(groups.priority),
  proofAdaptations: machineGroup(groups.proofAdaptation),
  referenceAdaptations: machineGroup(groups.referenceAdaptation),
  verdicts: machineGroup(groups.verdict),
});

const validateDecisions = (manifest) => {
  const conceptIds = new Set(manifest.concepts.map(({ id }) => id));
  ensure(
    conceptIds.size === manifest.concepts.length,
    'manifest repeats concept IDs'
  );
  for (const concept of manifest.concepts) {
    const decision = concept.decision;
    ensure(
      decision && typeof decision === 'object',
      `${concept.id} lacks decision truth`
    );
    for (const field of Object.keys(DECISION_COLUMNS)) {
      ensure(
        typeof decision[field] === 'string' && decision[field],
        `${concept.id} decision.${field} is empty`
      );
    }
    const materialSignal =
      decision.referenceAdaptation === 'adapt' ||
      decision.localDebt === 'material' ||
      decision.proofAdaptation === 'adapt';
    const material = MATERIAL_VERDICTS.has(decision.verdict);
    ensure(
      materialSignal === material,
      `${concept.id} adaptation/debt signal and verdict disagree`
    );
    ensure(
      material === PRIORITY_PATTERN.test(decision.priority),
      `${concept.id} material debt and priority disagree`
    );
  }
};

export const validatePriorCandidates = ({ candidates, concepts, root }) => {
  const conceptIds = new Set(concepts.map(({ id }) => id));
  const seen = new Set();
  for (const candidate of candidates) {
    ensure(
      candidate && typeof candidate.id === 'string',
      'prior candidate lacks ID'
    );
    ensure(
      !seen.has(candidate.id),
      `duplicate prior candidate ${candidate.id}`
    );
    seen.add(candidate.id);
    ensure(
      PRIOR_DISPOSITIONS.has(candidate.disposition),
      `${candidate.id} has invalid disposition ${candidate.disposition}`
    );
    ensure(
      Array.isArray(candidate.conceptIds) && candidate.conceptIds.length > 0,
      `${candidate.id} has no concept IDs`
    );
    for (const conceptId of candidate.conceptIds) {
      ensure(
        conceptIds.has(conceptId),
        `${candidate.id} maps unknown ${conceptId}`
      );
    }
    if (candidate.reconciliationConceptId) {
      ensure(
        candidate.conceptIds.includes(candidate.reconciliationConceptId),
        `${candidate.id} reconciles outside its conceptIds`
      );
    }
    const provenance = asArray(candidate.provenance ?? []);
    ensure(provenance.length > 0, `${candidate.id} has no provenance`);
    if (candidate.sources) {
      sameValue(
        candidate.sources,
        provenance,
        `${candidate.id} sources/provenance`
      );
    }
    for (const [index, source] of provenance.entries()) {
      const label = `${candidate.id} provenance ${index}`;
      ensure(source && typeof source.path === 'string', `${label} lacks path`);
      const { absolutePath, path } = resolvePriorSourcePath({
        label,
        path: source.path,
        root,
      });
      ensure(
        !PRIOR_CIRCULAR_PATHS.has(path) &&
          !PRIOR_CIRCULAR_PREFIXES.some((prefix) => path.startsWith(prefix)),
        `${label} is circular current-audit evidence: ${path}`
      );
      ensure(
        Number.isInteger(source.lineStart) &&
          Number.isInteger(source.lineEnd) &&
          source.lineStart > 0 &&
          source.lineEnd >= source.lineStart,
        `${label} has invalid line bounds`
      );
      ensure(SHA256_PATTERN.test(source.sha256), `${label} lacks sha256`);
      ensure(existsSync(absolutePath), `${label} path does not exist: ${path}`);
      const text = readFileSync(absolutePath, 'utf8');
      const lines = text.split(LINE_SPLIT_PATTERN);
      ensure(source.lineEnd <= lines.length, `${label} exceeds ${path}`);
      ensure(
        lineSliceDigest(text, source.lineStart, source.lineEnd) ===
          source.sha256,
        `${label} digest drift: ${path}`
      );
    }
  }
  for (const concept of concepts) {
    const expected = candidates
      .filter(
        (candidate) =>
          (candidate.reconciliationConceptId ?? candidate.conceptIds[0]) ===
          concept.id
      )
      .map(({ id }) => id);
    sameSet(
      concept.priorCandidateIds ?? [],
      expected,
      `${concept.id} priorCandidateIds`
    );
  }
};

export const validateReportSummary = ({ dossiers, manifest, report }) => {
  const groups = deriveSummaryGroups(manifest);
  sameValue(manifest.summaryGroups, groups, 'manifest summaryGroups');
  const match = report.match(REPORT_SUMMARY_PATTERN);
  ensure(match, 'audit report lacks machine summary block');
  let parsed;
  try {
    parsed = JSON.parse(match[1]);
  } catch (error) {
    fail(`audit report machine summary is invalid JSON: ${error.message}`);
  }
  sameValue(
    parsed,
    machineSummary(groups),
    'audit report exact disposition summary'
  );

  const dossierIds = [];
  for (const line of dossiers.split(LINE_SPLIT_PATTERN)) {
    if (!line.startsWith('## ')) continue;
    const ids = [...line.matchAll(DOSSIER_ID_PATTERN)].map(([, id]) => id);
    ensure(ids.length === 1, `dossier H2 must name one concept ID: ${line}`);
    dossierIds.push(ids[0]);
  }
  const materialDossierIds = dossierIds.slice(0, groups.materialIds.length);
  sameSet(materialDossierIds, groups.materialIds, 'material dossiers');
  const deferredDossierIds = dossierIds.slice(groups.materialIds.length);
  ensure(
    new Set(deferredDossierIds).size === deferredDossierIds.length &&
      deferredDossierIds.every((id) => groups.deferredIds.includes(id)),
    `deferred dossiers must be unique deferred rows: ${deferredDossierIds.join(',')}`
  );
  return groups;
};

const matrixGroupSets = (matrixResult) => ({
  classification: matrixResult.classifications,
  localDebt: matrixResult.localDebt,
  origin: matrixResult.origins,
  preferred: matrixResult.preferredBases,
  priorDisposition: matrixResult.priorCandidates,
  priority: matrixResult.priorities,
  proofAdaptation: matrixResult.proofAdaptations,
  referenceAdaptation: matrixResult.referenceAdaptations,
  verdict: matrixResult.verdicts,
});
const compareGroupSets = (actual, expected, label) => {
  const nonEmptyActual = Object.fromEntries(
    Object.entries(actual).filter(([, value]) => {
      const ids = value?.ids ?? value;
      return ids.length > 0;
    })
  );
  sameSet(Object.keys(nonEmptyActual), Object.keys(expected), `${label} keys`);
  for (const [key, ids] of Object.entries(expected)) {
    const actualIds = nonEmptyActual[key]?.ids ?? nonEmptyActual[key];
    sameSet(actualIds, ids, `${label}.${key}`);
  }
};

const validateRenderedMatrix = ({ manifest, matrix }) => {
  const rows = parseMatrixRows(matrix);
  ensure(
    rows.size === manifest.concepts.length,
    `strict matrix row parity failed: ${rows.size}/${manifest.concepts.length}`
  );
  for (const concept of manifest.concepts) {
    const row = rows.get(concept.id);
    ensure(row, `matrix omits ${concept.id}`);
    ensure(row.Concept === concept.title, `${concept.id} matrix title drift`);
    ensure(row.Origin === concept.origin, `${concept.id} matrix origin drift`);
    for (const side of SIDES) {
      const cell = row[CONTRACT_COLUMNS[side]];
      ensure(
        leadingValue(cell) === concept.contracts[side].status,
        `${concept.id} ${side} rendered status drift`
      );
      for (const field of contractCitationFields(concept.contracts[side])) {
        for (const citation of concept.contracts[side][field]) {
          ensure(
            cell.includes(`\`${citation}\``),
            `${concept.id} ${side} omits ${citation}`
          );
        }
      }
    }
    for (const dimension of DIMENSIONS) {
      const cell = row[DIMENSION_COLUMNS[dimension]];
      const truth = concept.dimensions[dimension];
      ensure(
        leadingValue(cell) === truth.winner,
        `${concept.id} ${dimension} winner drift`
      );
      ensure(
        cell.includes(truth.claim),
        `${concept.id} ${dimension} claim drift`
      );
      for (const citation of truth.evidence) {
        ensure(
          cell.includes(`\`${citation}\``),
          `${concept.id} ${dimension} omits ${citation}`
        );
      }
    }
    for (const [field, column] of Object.entries(DECISION_COLUMNS)) {
      const rendered =
        field === 'priority' ? row[column] : leadingValue(row[column]);
      ensure(
        rendered === concept.decision[field],
        `${concept.id} matrix ${field} drift: ${rendered}`
      );
    }
    for (const candidateId of concept.priorCandidateIds ?? []) {
      ensure(
        row['Prior candidates'].includes(`\`${candidateId}\``),
        `${concept.id} matrix omits prior candidate ${candidateId}`
      );
    }
  }
  const matrixResult = {
    classifications: manifest.summaryGroups.classification,
    concepts: manifest.concepts.length,
    integrity: { duplicateIds: 0, extraIds: 0, missingIds: 0 },
    localDebt: manifest.summaryGroups.localDebt,
    origins: manifest.summaryGroups.origin,
    preferredBases: manifest.summaryGroups.preferred,
    priorCandidates: manifest.summaryGroups.priorDisposition,
    priorities: manifest.summaryGroups.priority,
    proofAdaptations: manifest.summaryGroups.proofAdaptation,
    referenceAdaptations: manifest.summaryGroups.referenceAdaptation,
    rows: rows.size,
    verdicts: manifest.summaryGroups.verdict,
  };
  const expectedGroups = manifest.summaryGroups;
  const actualGroups = matrixGroupSets(matrixResult);
  for (const key of Object.keys(actualGroups)) {
    compareGroupSets(
      actualGroups[key],
      expectedGroups[key],
      `matrix groups ${key}`
    );
  }
  return matrixResult;
};

const headingAnchors = (text) => {
  const anchors = new Set(
    [...text.matchAll(HTML_ANCHOR_PATTERN)].map(([, id]) => id)
  );
  const counts = new Map();
  for (const line of text.split(LINE_SPLIT_PATTERN)) {
    const match = line.match(MARKDOWN_HEADING_PATTERN);
    if (!match) continue;
    const base = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }
  return anchors;
};

export const validateArtifactGraph = ({ markdownArtifacts, root }) => {
  const context = {
    allowedRoots: [
      root,
      resolve(root, '../wordgard'),
      resolve(root, '../wordgard-website'),
    ],
    lineCounts: new Map(),
    root,
  };
  for (const artifact of markdownArtifacts) {
    const sourcePath = resolve(root, artifact.path);
    const sourceDir = dirname(sourcePath);
    const links = artifact.text.matchAll(MARKDOWN_LINK_PATTERN);
    for (const [, rawTarget] of links) {
      const target = rawTarget
        .trim()
        .replace(/^<|>$/g, '')
        .split(LINK_TITLE_PATTERN)[0];
      if (REMOTE_LINK_PATTERN.test(target)) continue;
      const [pathPart, fragment] = target.split('#');
      ensure(
        !pathPart?.startsWith('/'),
        `${artifact.path} has non-portable absolute link ${target}`
      );
      const targetPath = pathPart ? resolve(sourceDir, pathPart) : sourcePath;
      ensure(
        context.allowedRoots.some((allowedRoot) => {
          const child = relative(allowedRoot, targetPath);
          return (
            child !== '..' &&
            !child.startsWith('../') &&
            !child.startsWith('..\\')
          );
        }),
        `${artifact.path} link escapes audited repositories: ${target}`
      );
      ensure(
        existsSync(targetPath),
        `${artifact.path} has broken link ${target}`
      );
      if (fragment) {
        const anchors = headingAnchors(readFileSync(targetPath, 'utf8'));
        ensure(
          anchors.has(decodeURIComponent(fragment)),
          `${artifact.path} has broken anchor ${target}`
        );
      }
    }
    for (const match of artifact.text.matchAll(CODE_CITATION_PATTERN)) {
      if (
        !match[1].includes('/') ||
        match[1].includes(' ') ||
        REMOTE_LINK_PATTERN.test(match[1])
      ) {
        continue;
      }
      resolveCitation(match[1], context, `${artifact.path} citation`);
    }
  }
};

export const validateRegistryFreshness = ({ manifest, registry }) => {
  const audit = registry.audits?.find(({ id }) => id === AUDIT_ID);
  ensure(audit, `registry lacks ${AUDIT_ID}`);
  ensure(
    audit.artifactVersion >= manifest.schemaVersion,
    'registry artifactVersion predates manifest schema'
  );
  ensure(
    audit.artifact === CURRENT_PLAN,
    'registry audit points at wrong plan'
  );
  ensure(
    audit.validationReceipt === RECEIPT_PATH,
    'registry lacks validation receipt path'
  );
  const generatedAt = Date.parse(manifest.generatedAt);
  ensure(Number.isFinite(generatedAt), 'manifest generatedAt is invalid');
  const source = audit.references?.find(
    ({ auditedCommit }) => auditedCommit === manifest.authority.wordgardHead
  );
  const site = audit.references?.find(
    ({ auditedCommit }) => auditedCommit === manifest.authority.wordgardSiteHead
  );
  ensure(source, 'registry lacks frozen Wordgard source reference');
  ensure(site, 'registry lacks frozen official-site reference');
  ensure(
    source.conceptManifest === `${CURRENT_ARTIFACT}/concept-manifest.json` &&
      source.conceptMatrix === `${CURRENT_ARTIFACT}/concept-matrix.md`,
    'registry source reference has stale artifact paths'
  );
  for (const [label, reference] of [
    ['source', source],
    ['site', site],
  ]) {
    ensure(
      Date.parse(reference.auditedAt) >= generatedAt,
      `registry ${label} auditedAt predates manifest`
    );
  }
  ensure(
    Date.parse(source.conceptMatrixValidatedAt) >= generatedAt,
    'registry validation timestamp predates manifest'
  );
};

const validateGeneratedArtifacts = ({ manifest, root }) => {
  ensure(
    Array.isArray(manifest.generatedArtifacts),
    'manifest generatedArtifacts must be an array'
  );
  const paths = manifest.generatedArtifacts.map(({ path }) => path);
  ensure(
    new Set(paths).size === paths.length,
    'generatedArtifacts repeats paths'
  );
  for (const required of REQUIRED_GENERATED_PATHS) {
    ensure(paths.includes(required), `generatedArtifacts omits ${required}`);
  }
  for (const artifact of manifest.generatedArtifacts) {
    ensure(
      artifact && typeof artifact.role === 'string' && artifact.role.trim(),
      `generated artifact ${artifact.path} lacks role`
    );
    ensure(
      SHA256_PATTERN.test(artifact.sha256),
      `${artifact.path} lacks sha256`
    );
    const absolutePath = resolve(root, artifact.path);
    ensure(
      existsSync(absolutePath),
      `generated artifact missing: ${artifact.path}`
    );
    ensure(
      hashFile(absolutePath) === artifact.sha256,
      `generated artifact drift: ${artifact.path}`
    );
  }
};

const validateInventoryClosure = ({
  manifest,
  plate,
  plite,
  wordgard,
  wordgardRaw,
  wordgardSite,
}) => {
  ensure(
    manifest.authority.wordgardHead === wordgard.authority.head &&
      manifest.authority.wordgardHead === wordgardRaw.authority.commit &&
      manifest.authority.wordgardClean === wordgard.authority.clean,
    'Wordgard authority/inventory drift'
  );
  ensure(
    manifest.authority.wordgardSiteHead === wordgardSite.authority.head &&
      manifest.authority.wordgardSiteClean === wordgardSite.authority.clean,
    'Wordgard site authority/inventory drift'
  );
  ensure(
    manifest.authority.pliteHead === plite.provenance.head &&
      manifest.authority.plateHead === plate.repositoryHead,
    'Plate/Plite authority/inventory drift'
  );
  ensure(
    Object.values(wordgard.validation ?? {}).every((count) => count === 0) &&
      wordgard.summary.unexplainedDeclarations === 0 &&
      wordgard.summary.unexplainedFiles === 0 &&
      wordgard.summary.parseDiagnostics === 0,
    'Wordgard source inventory is not closed'
  );
  ensure(
    Object.values(wordgardSite.validation ?? {}).every(
      (count) => count === 0
    ) &&
      wordgardSite.summary.unexplainedDeclarations === 0 &&
      wordgardSite.summary.unexplainedFiles === 0 &&
      wordgardSite.summary.parseDiagnostics === 0 &&
      wordgardSite.summary.unusedConcepts === 0,
    'Wordgard official-site inventory is not closed'
  );
  ensure(
    plite.coverage.unmappedDeclarations.length === 0 &&
      plite.coverage.unmappedFiles.length === 0,
    'Plite source inventory is not closed'
  );
  ensure(
    plate.summary.includedFiles ===
      plate.files.filter(({ exclusion }) => !exclusion).length,
    'Plate included-file summary drift'
  );
  const rawByPath = new Map(wordgardRaw.files.map((file) => [file.path, file]));
  sameSet(
    wordgard.files.map(({ path }) => path),
    wordgardRaw.files.map(({ path }) => path),
    'Wordgard coverage/raw file inventory'
  );
  for (const file of wordgard.files) {
    ensure(
      rawByPath.get(file.path)?.sha256 === file.sha256,
      `Wordgard coverage/raw hash mismatch: ${file.path}`
    );
  }
};

const validationHasNoFailures = (validation) =>
  Object.values(validation ?? {}).every((value) => {
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'boolean') return value;
    return value === null || value === 0;
  });

const ensureUniqueValues = (values, label) => {
  ensure(
    Array.isArray(values) && new Set(values).size === values.length,
    `${label} contains duplicates`
  );
};

const validateClosedValidation = (validation, requiredKeys, label) => {
  ensure(
    validation && typeof validation === 'object' && !Array.isArray(validation),
    `${label} validation is missing`
  );
  for (const key of requiredKeys) {
    ensure(Object.hasOwn(validation, key), `${label} validation lacks ${key}`);
  }
  ensure(validationHasNoFailures(validation), `${label} is not closed`);
};

const validateProbeEnvelope = ({
  expectedHead,
  headField,
  label,
  probe,
  schemaVersion,
}) => {
  ensure(
    probe && typeof probe === 'object' && !Array.isArray(probe),
    `${label} is missing`
  );
  ensure(
    probe.schemaVersion === schemaVersion,
    `${label} schema version drift`
  );
  ensure(
    typeof probe.generatedAt === 'string' &&
      Number.isFinite(Date.parse(probe.generatedAt)),
    `${label} generation time is invalid`
  );
  if (headField) {
    ensure(
      SHA1_PATTERN.test(expectedHead) &&
        SHA1_PATTERN.test(probe[headField]) &&
        probe[headField] === expectedHead,
      `${label} authority head drift`
    );
  }
};

const validateSuccessfulProcess = (process, label) => {
  ensure(
    process?.status === 0 && process.error === null && process.signal === null,
    `${label} process failed`
  );
};

const isCanonicalSha512Integrity = (value) => {
  const match = SHA512_INTEGRITY_PATTERN.exec(value);
  if (!match) return false;
  const digest = Buffer.from(match[1], 'base64');
  return digest.byteLength === 64 && digest.toString('base64') === match[1];
};

export const validateRuntimeApiBundleProbe = ({
  expectedPlateHead,
  probe,
  root,
}) => {
  validateProbeEnvelope({
    expectedHead: expectedPlateHead,
    headField: 'plateHead',
    label: 'Runtime API bundle probe',
    probe,
    schemaVersion: 1,
  });
  ensure(
    typeof probe.method === 'string' &&
      probe.method.length > 0 &&
      ROLLDOWN_VERSION_PATTERN.test(probe.rolldown),
    'Runtime API bundle probe method is incomplete'
  );
  const results = probe.results ?? [];
  const ids = results.map(({ id }) => id);
  ensureUniqueValues(ids, 'Runtime API bundle targets');
  sameSet(
    ids,
    Object.keys(RUNTIME_API_BUNDLE_TARGETS),
    'Runtime API bundle targets'
  );
  for (const result of results) {
    ensure(
      result.source === RUNTIME_API_BUNDLE_TARGETS[result.id] &&
        Number.isInteger(result.bytes) &&
        result.bytes > 0 &&
        Number.isInteger(result.sourceBytes) &&
        result.sourceBytes > 0,
      `Runtime API bundle result is invalid: ${result.id}`
    );
    if (root) {
      ensure(
        readFileSync(resolve(root, result.source)).byteLength ===
          result.sourceBytes,
        `Runtime API bundle source-size drift: ${result.id}`
      );
    }
  }
  const nodeResults = results.filter(({ id }) => id.startsWith('NodeApi.'));
  const nonNodeBundleBytes = results
    .filter(({ id }) => !id.startsWith('NodeApi.'))
    .map(({ bytes }) => bytes);
  ensure(
    nodeResults.length === 2 &&
      nodeResults[0].bytes === nodeResults[1].bytes &&
      nodeResults[0].sourceBytes === nodeResults[1].sourceBytes &&
      nodeResults[0].bytes > Math.max(...nonNodeBundleBytes),
    'Runtime API bundle probe lost the grouped NodeApi retention observation'
  );
};

export const validateNamespaceBundleProbe = ({
  expectedWordgardHead,
  probe,
  wordgardRoot,
}) => {
  validateProbeEnvelope({
    expectedHead: expectedWordgardHead,
    headField: 'wordgardHead',
    label: 'Wordgard namespace bundle probe',
    probe,
    schemaVersion: 1,
  });
  ensure(
    ROLLDOWN_VERSION_PATTERN.test(probe.rolldown) &&
      SEMVER_PATTERN.test(probe.esbuild) &&
      typeof probe.method === 'string' &&
      probe.method.length > 0,
    'Wordgard namespace bundle probe method is incomplete'
  );
  const results = probe.results ?? [];
  const ids = results.map(({ id }) => id);
  ensureUniqueValues(ids, 'Wordgard namespace bundle targets');
  sameSet(
    ids,
    Object.keys(WORDGARD_NAMESPACE_TARGETS),
    'Wordgard namespace bundle targets'
  );
  for (const result of results) {
    ensure(
      result.module === WORDGARD_NAMESPACE_TARGETS[result.id] &&
        Number.isInteger(result.sourceBytes) &&
        result.sourceBytes > 0,
      `Wordgard namespace source is invalid: ${result.id}`
    );
    if (wordgardRoot) {
      ensure(
        readFileSync(resolve(wordgardRoot, result.module)).byteLength ===
          result.sourceBytes,
        `Wordgard namespace source-size drift: ${result.id}`
      );
    }
    for (const tool of ['esbuild', 'rolldown']) {
      const bundle = result[tool];
      ensure(
        Number.isInteger(bundle?.bytes) &&
          Number.isInteger(bundle?.gzipBytes) &&
          bundle.bytes > 0 &&
          bundle.gzipBytes > 0 &&
          bundle.gzipBytes <= bundle.bytes &&
          bundle.siblingSentinels &&
          Object.keys(bundle.siblingSentinels).length > 0 &&
          Object.values(bundle.siblingSentinels).every(
            (value) => typeof value === 'boolean'
          ),
        `Wordgard namespace ${tool} result is invalid: ${result.id}`
      );
      sameSet(
        Object.keys(bundle.siblingSentinels),
        WORDGARD_NAMESPACE_SENTINELS[result.id],
        `Wordgard namespace ${tool} sentinel keys: ${result.id}`
      );
      sameValue(
        bundle.siblingSentinels,
        WORDGARD_NAMESPACE_SENTINEL_VALUES[result.id][tool],
        `Wordgard namespace ${tool} sentinel values: ${result.id}`
      );
    }
  }
  const byId = new Map(results.map((result) => [result.id, result]));
  ensure(
    ['heading.keyBindings', 'heading.createOnHash'].every((id) =>
      ['esbuild', 'rolldown'].every((tool) =>
        Object.values(byId.get(id)[tool].siblingSentinels).every(Boolean)
      )
    ) &&
      ['esbuild', 'rolldown'].every((tool) =>
        Object.values(byId.get('Command.bind')[tool].siblingSentinels).every(
          (value) => !value
        )
      ) &&
      Object.values(
        byId.get('imageResizing.keyBindings').rolldown.siblingSentinels
      ).some(Boolean) &&
      Object.values(
        byId.get('imageResizing.keyBindings').esbuild.siblingSentinels
      ).every((value) => !value),
    'Wordgard namespace sibling-retention observation drift'
  );
};

export const validateStatePurityProbe = ({ expectedWordgardHead, probe }) => {
  validateProbeEnvelope({
    expectedHead: expectedWordgardHead,
    headField: 'wordgardHead',
    label: 'Wordgard state-purity probe',
    probe,
    schemaVersion: 1,
  });
  ensure(
    typeof probe.collab?.derivedBeforeReservation === 'string' &&
      probe.collab.derivedBeforeReservation.length > 0 &&
      typeof probe.collab.reservation === 'string' &&
      probe.collab.reservation.length > 0 &&
      typeof probe.collab.derivedAfterReservation === 'string' &&
      probe.collab.derivedAfterReservation.length > 0 &&
      probe.collab.derivedBeforeReservation !==
        probe.collab.derivedAfterReservation &&
      probe.collab.derivedAfterReservation === probe.collab.reservation &&
      probe.collab.observationallyPure === false,
    'Wordgard collab purity observation drift'
  );
  ensure(
    probe.history?.branchIdentityPreserved === false &&
      probe.history.fieldIdentityPreserved === true,
    'Wordgard history identity observation drift'
  );
};

export const validateValuePurityProbe = ({ expectedWordgardHead, probe }) => {
  validateProbeEnvelope({
    expectedHead: expectedWordgardHead,
    headField: 'wordgardHead',
    label: 'Wordgard value-purity probe',
    probe,
    schemaVersion: 1,
  });
  for (const [label, observation] of [
    ['plot input', probe.plotInputAliasing],
    ['slice input', probe.sliceInputAliasing],
  ]) {
    ensure(
      typeof observation?.before?.text === 'string' &&
        typeof observation.after?.text === 'string' &&
        observation.before.text !== observation.after?.text &&
        observation.before.length === observation.after.length &&
        JSON.stringify(canonicalize(observation.before.json)) !==
          JSON.stringify(canonicalize(observation.after.json)) &&
        observation.cachedLengthMatchesContent === false,
      `Wordgard ${label} aliasing observation drift`
    );
  }
  const plot = probe.plotInputAliasing;
  ensure(
    plot.before.contentLength === plot.before.json.content?.length &&
      plot.before.contentLength === plot.after.contentLength &&
      plot.before.length === plot.after.length &&
      plot.after.contentLength !== plot.after.json.content?.length,
    'Wordgard plot cached-length observation drift'
  );
  const slice = probe.sliceInputAliasing;
  ensure(
    slice.before.length === slice.before.json?.length &&
      slice.before.length === slice.after.length &&
      slice.after.length !== slice.after.json?.length,
    'Wordgard slice cached-length observation drift'
  );
  const beforeMarkNode = probe.markSetInputAliasing?.before?.json;
  const afterMarkNode = probe.markSetInputAliasing?.after?.json;
  const beforeMarkKeys = Object.keys(beforeMarkNode?.marks ?? {});
  const afterMarkKeys = Object.keys(afterMarkNode?.marks ?? {});
  ensure(
    typeof probe.markSetInputAliasing?.before?.text === 'string' &&
      typeof probe.markSetInputAliasing?.after?.text === 'string' &&
      probe.markSetInputAliasing.before.text !==
        probe.markSetInputAliasing?.after?.text &&
      typeof beforeMarkNode?.type === 'string' &&
      typeof beforeMarkNode.param === 'string' &&
      beforeMarkNode?.type === afterMarkNode?.type &&
      beforeMarkNode?.param === afterMarkNode?.param &&
      beforeMarkKeys.length > 0 &&
      beforeMarkKeys.length < afterMarkKeys.length &&
      beforeMarkKeys.every((key) => afterMarkKeys.includes(key)) &&
      probe.markSetInputAliasing?.valuePreserved === false,
    'Wordgard mark-set aliasing observation drift'
  );
  const transaction = probe.writableTransactionNewDoc;
  ensure(
    transaction?.before?.appliedChangeText === transaction.before.newDocText &&
      transaction.before.appliedChangeText !==
        transaction.before.startDocText &&
      transaction.after?.appliedChangeText ===
        transaction.before.appliedChangeText &&
      transaction.after.newDocText === transaction.after.publishedStateText &&
      transaction.after.appliedChangeText !== transaction.after.newDocText &&
      transaction.publishedStateMatchesChanges === false,
    'Wordgard writable-transaction observation drift'
  );
  const failed = probe.failedTransactionStateResolution;
  ensure(
    typeof failed?.firstStateError === 'string' &&
      failed.firstStateError.length > 0 &&
      failed.cachedPartialState === true &&
      typeof failed.secondStateDocText === 'string' &&
      failed.secondStateDocText.length > 0 &&
      typeof failed.secondStateFieldError === 'string' &&
      failed.secondStateFieldError.length > 0 &&
      failed.failureRemainedAtomic === false,
    'Wordgard failed-transaction state observation drift'
  );
};

const validateForumSemanticIntegrity = ({ coverage, inventory }) => {
  ensure(
    coverage.schemaVersion === 1 &&
      coverage.kind === 'wordgard-public-forum-claim-coverage' &&
      inventory.schemaVersion === 1 &&
      inventory.kind === 'wordgard-public-forum-inventory' &&
      typeof inventory.retrievedAt === 'string' &&
      Number.isFinite(Date.parse(inventory.retrievedAt)) &&
      coverage.retrievedAt === inventory.retrievedAt,
    'Wordgard forum artifact identity drift'
  );
  validateClosedValidation(
    coverage.validation,
    FORUM_VALIDATION_KEYS,
    'Wordgard forum coverage'
  );
  validateClosedValidation(
    inventory.validation,
    FORUM_VALIDATION_KEYS,
    'Wordgard forum inventory'
  );
  ensure(
    coverage.corpus?.inventory === 'wordgard-forum-inventory.json' &&
      coverage.evidenceLaw?.forumClaimsAreImplementationProof === false &&
      typeof coverage.evidenceLaw.maintainerPosts === 'string' &&
      typeof coverage.evidenceLaw.communityPosts === 'string',
    'Wordgard forum evidence boundary drift'
  );
  ensure(
    inventory.authority?.forum === 'https://discuss.wordgard.net' &&
      inventory.authority.maintainer?.id === 1 &&
      inventory.authority.maintainer.username === 'marijn' &&
      inventory.authority.maintainer.title === 'Maintainer',
    'Wordgard forum authority drift'
  );

  const topics = inventory.topics ?? [];
  const topicIds = topics.map(({ id }) => id);
  ensureUniqueValues(topicIds, 'Wordgard forum topic IDs');
  ensure(
    topics.length > 0 &&
      topics.every(
        ({ id, posts, slug, title }) =>
          Number.isInteger(id) &&
          id > 0 &&
          Array.isArray(posts) &&
          posts.length > 0 &&
          typeof slug === 'string' &&
          slug.length > 0 &&
          typeof title === 'string' &&
          title.length > 0
      ),
    'Wordgard forum topic inventory is invalid'
  );
  const posts = topics.flatMap((topic) =>
    topic.posts.map((post) => ({ ...post, topic }))
  );
  const postIds = posts.map(({ id }) => id);
  ensureUniqueValues(postIds, 'Wordgard forum post IDs');
  for (const topic of topics) {
    const postNumbers = topic.posts.map(({ postNumber }) => postNumber);
    ensureUniqueValues(
      postNumbers,
      `Wordgard forum topic ${topic.id} post numbers`
    );
    const missingPostNumbers = Array.from(
      { length: topic.highestPostNumber },
      (_, index) => index + 1
    ).filter((number) => !postNumbers.includes(number));
    ensure(
      topic.postsCount === topic.posts.length &&
        Number.isInteger(topic.highestPostNumber) &&
        topic.highestPostNumber >= Math.max(...postNumbers) &&
        topic.url ===
          `${inventory.authority.forum}/t/${topic.slug}/${topic.id}`,
      `Wordgard forum topic ${topic.id} count or locator drift`
    );
    sameValue(
      topic.missingPublicPostNumbers,
      missingPostNumbers,
      `Wordgard forum topic ${topic.id} visible post gaps`
    );
    for (const post of topic.posts) {
      ensure(
        Number.isInteger(post.id) &&
          post.id > 0 &&
          Number.isInteger(post.postNumber) &&
          post.postNumber > 0 &&
          SHA256_PATTERN.test(post.cookedHtmlSha256) &&
          SHA256_PATTERN.test(post.plainTextSha256) &&
          Number.isInteger(post.plainTextCharacters) &&
          post.plainTextCharacters >= 0 &&
          Number.isInteger(post.plainTextWords) &&
          post.plainTextWords >= 0 &&
          post.url === `${topic.url}/${post.postNumber}` &&
          post.authorAuthority ===
            (post.author === inventory.authority.maintainer.username
              ? 'maintainer'
              : post.author === 'system'
                ? 'system'
                : 'community'),
        `Wordgard forum post ${post.id} inventory is invalid`
      );
      ensureUniqueValues(
        post.claimIds,
        `Wordgard forum post ${post.id} claims`
      );
    }
  }
  const derivedCorpusHash = sha256(
    posts
      .map(({ cookedHtmlSha256, id }) => `${id}:${cookedHtmlSha256}`)
      .sort()
      .join('\n')
  );
  ensure(
    SHA256_PATTERN.test(inventory.authority?.publicCorpusHash) &&
      inventory.authority.publicCorpusHash === derivedCorpusHash &&
      coverage.corpus.publicCorpusHash === derivedCorpusHash,
    'Wordgard forum public-corpus hash is not derived from visible posts'
  );

  const completeness = inventory.completeness;
  ensure(
    completeness.publicTopicCount === topics.length &&
      completeness.visiblePostCount === posts.length &&
      completeness.indexedPublicPostCount === posts.length &&
      completeness.visiblePostNumberGaps ===
        topics.reduce(
          (sum, topic) => sum + topic.missingPublicPostNumbers.length,
          0
        ),
    'Wordgard forum visible-corpus counts drift'
  );
  sameValue(
    completeness.instanceRecordsNotAnonymousRetrievable,
    completeness.anonymousInaccessibleGap,
    'Wordgard forum inaccessible-record boundary'
  );
  const descriptionTopicIds = completeness.categoryDescriptionTopicIds;
  ensureUniqueValues(
    descriptionTopicIds,
    'Wordgard forum category-description topics'
  );
  ensure(
    descriptionTopicIds.every((id) => topicIds.includes(id)),
    'Wordgard forum category-description topic is missing'
  );
  const regularTopics = topics.filter(
    ({ id }) => !descriptionTopicIds.includes(id)
  );
  ensure(
    completeness.categoryRegularTopicCount === regularTopics.length &&
      completeness.categoryRegularPostCount ===
        regularTopics.reduce((sum, { posts }) => sum + posts.length, 0),
    'Wordgard forum regular-category counts drift'
  );
  const categories = inventory.categories ?? [];
  const categoryIndexes = inventory.categoryIndexes ?? [];
  ensureUniqueValues(
    categories.map(({ id }) => id),
    'Wordgard forum category IDs'
  );
  ensureUniqueValues(
    categoryIndexes.map(({ categoryId }) => categoryId),
    'Wordgard forum category-index IDs'
  );
  sameSet(
    categoryIndexes.map(({ categoryId }) => categoryId),
    categories.map(({ id }) => id),
    'Wordgard forum category indexes'
  );
  sameSet(
    categoryIndexes.flatMap(({ topicIds: ids }) => ids),
    topicIds,
    'Wordgard forum category topic coverage'
  );
  ensureUniqueValues(
    categoryIndexes.flatMap(({ topicIds: ids }) => ids),
    'Wordgard forum category topic indexes'
  );
  ensure(
    categories.reduce((sum, { topicCount }) => sum + topicCount, 0) ===
      completeness.categoryRegularTopicCount &&
      categories.reduce((sum, { postCount }) => sum + postCount, 0) ===
        completeness.categoryRegularPostCount &&
      categoryIndexes.every(
        ({ pages, topicIds: ids }) =>
          Number.isInteger(pages) && pages > 0 && Array.isArray(ids)
      ),
    'Wordgard forum category totals drift'
  );

  const claims = coverage.claims ?? [];
  const claimIds = claims.map(({ id }) => id);
  ensureUniqueValues(claimIds, 'Wordgard forum claim IDs');
  ensure(
    claims.length > 0 &&
      claims.every(
        ({ id, kind, statement }) =>
          WGF_CLAIM_ID_PATTERN.test(id) &&
          typeof kind === 'string' &&
          kind.length > 0 &&
          typeof statement === 'string' &&
          statement.length > 0
      ),
    'Wordgard forum claim inventory is invalid'
  );
  const postById = new Map(posts.map((post) => [post.id, post]));
  for (const claim of claims) {
    const post = postById.get(claim.postId);
    ensure(
      post &&
        claim.author === post.author &&
        claim.authorAuthority === post.authorAuthority &&
        claim.postNumber === post.postNumber &&
        claim.topicId === post.topic.id &&
        claim.topicTitle === post.topic.title &&
        claim.url === post.url,
      `Wordgard forum claim/post drift: ${claim.id}`
    );
    ensureUniqueValues(
      claim.existingRowIds,
      `Wordgard forum claim ${claim.id} existing rows`
    );
    ensureUniqueValues(
      claim.proposedRowIds,
      `Wordgard forum claim ${claim.id} proposed rows`
    );
    ensure(
      claim.existingRowIds.length + claim.proposedRowIds.length > 0,
      `Wordgard forum claim is unmapped: ${claim.id}`
    );
  }
  const excludedPosts = coverage.excludedPosts ?? [];
  ensureUniqueValues(
    excludedPosts.map(({ postId }) => postId),
    'Wordgard forum excluded post IDs'
  );
  const excludedById = new Map(
    excludedPosts.map((exclusion) => [exclusion.postId, exclusion])
  );
  for (const post of posts) {
    const expectedClaimIds = claims
      .filter(({ postId }) => postId === post.id)
      .map(({ id }) => id);
    sameSet(
      post.claimIds,
      expectedClaimIds,
      `Wordgard forum post ${post.id} claim coverage`
    );
    const exclusion = excludedById.get(post.id);
    if (expectedClaimIds.length > 0) {
      ensure(
        post.review?.disposition === 'material' &&
          post.review.reason === null &&
          !exclusion,
        `Wordgard forum material post ${post.id} review drift`
      );
    } else {
      ensure(
        post.review?.disposition === 'excluded' &&
          exclusion?.reason === post.review.reason &&
          exclusion?.scope === post.review.scope,
        `Wordgard forum excluded post ${post.id} review drift`
      );
    }
  }
  const existingRows = coverage.mappings.existingMatrixRows;
  const proposedRows = coverage.mappings.proposedMatrixRows;
  ensureUniqueValues(
    existingRows.map(({ rowId }) => rowId),
    'Wordgard forum existing-row mappings'
  );
  ensureUniqueValues(
    proposedRows.map(({ id }) => id),
    'Wordgard forum proposed-row mappings'
  );
  for (const row of [...existingRows, ...proposedRows]) {
    ensureUniqueValues(
      row.claimIds,
      `Wordgard forum row ${row.rowId ?? row.id} claims`
    );
    ensure(
      row.claimIds.length > 0,
      `Wordgard forum row mapping is empty: ${row.rowId ?? row.id}`
    );
  }
  sameValue(
    coverage.summary,
    {
      claims: claims.length,
      communityClaims: claims.filter(
        ({ authorAuthority }) => authorAuthority === 'community'
      ).length,
      communityPosts: posts.filter(
        ({ authorAuthority }) => authorAuthority === 'community'
      ).length,
      excludedPosts: excludedPosts.length,
      existingMatrixRowsReferenced: existingRows.length,
      maintainerClaims: claims.filter(
        ({ authorAuthority }) => authorAuthority === 'maintainer'
      ).length,
      maintainerPosts: posts.filter(
        ({ authorAuthority }) => authorAuthority === 'maintainer'
      ).length,
      materialPosts: posts.filter(({ claimIds: ids }) => ids.length > 0).length,
      proposedMatrixRows: proposedRows.length,
      publicTopics: topics.length,
      systemPosts: posts.filter(
        ({ authorAuthority }) => authorAuthority === 'system'
      ).length,
      unexplainedVisiblePosts: 0,
      unexplainedVisibleTopics: 0,
      visiblePosts: posts.length,
    },
    'Wordgard forum summary'
  );
};

export const validateForumClosure = ({ coverage, inventory, manifest }) => {
  ensure(
    validationHasNoFailures(inventory.validation) &&
      validationHasNoFailures(coverage.validation),
    'Wordgard forum inventory is not closed'
  );
  ensure(
    coverage.corpus?.publicCorpusHash === inventory.authority?.publicCorpusHash,
    'Wordgard forum public-corpus hash drift'
  );
  sameValue(
    coverage.completeness,
    inventory.completeness,
    'Wordgard forum completeness boundary'
  );
  const completeness = inventory.completeness;
  const gap = completeness.anonymousInaccessibleGap;
  ensure(
    gap?.topics ===
      completeness.instanceTopicCount - completeness.publicTopicCount &&
      gap?.posts ===
        completeness.instancePostCount - completeness.visiblePostCount &&
      gap.topics > 0 &&
      gap.posts > 0,
    'Wordgard forum anonymous-inaccessible gap is missing or inconsistent'
  );
  ensure(
    completeness.unexplainedVisibleCorpus?.topics === 0 &&
      completeness.unexplainedVisibleCorpus?.posts === 0,
    'Wordgard forum has unexplained visible records'
  );

  const visiblePostIds = inventory.topics.flatMap(({ posts }) =>
    posts.map(({ id }) => id)
  );
  const claimedPostIds = coverage.claims.map(({ postId }) => postId);
  const excludedPostIds = coverage.excludedPosts.map(({ postId }) => postId);
  ensure(
    claimedPostIds.every((id) => !excludedPostIds.includes(id)),
    'Wordgard forum post is both claimed and excluded'
  );
  sameSet(
    [...claimedPostIds, ...excludedPostIds],
    visiblePostIds,
    'Wordgard forum explained visible posts'
  );
  ensure(
    coverage.claims.every(({ implementationProof }) => !implementationProof),
    'Wordgard forum intent was promoted to implementation proof'
  );

  const liveIds = new Set(manifest.concepts.map(({ id }) => id));
  const claimIds = new Set(coverage.claims.map(({ id }) => id));
  const existingRows = coverage.mappings.existingMatrixRows;
  const proposedRows = coverage.mappings.proposedMatrixRows;
  for (const claim of coverage.claims) {
    for (const rowId of [
      ...(claim.existingRowIds ?? []),
      ...(claim.proposedRowIds ?? []),
    ]) {
      ensure(liveIds.has(rowId), `Wordgard forum cites unknown row ${rowId}`);
    }
  }
  for (const row of [...existingRows, ...proposedRows]) {
    ensure(liveIds.has(row.rowId ?? row.id), 'Wordgard forum mapping is stale');
    ensure(
      row.claimIds.every((id) => claimIds.has(id)),
      'Wordgard forum mapping cites unknown claim'
    );
  }
  const inverseExisting = coverage.claims.flatMap((claim) =>
    (claim.existingRowIds ?? []).map((rowId) => `${rowId}\0${claim.id}`)
  );
  const mappedExisting = existingRows.flatMap((row) =>
    row.claimIds.map((claimId) => `${row.rowId}\0${claimId}`)
  );
  const inverseProposed = coverage.claims.flatMap((claim) =>
    (claim.proposedRowIds ?? []).map((rowId) => `${rowId}\0${claim.id}`)
  );
  const mappedProposed = proposedRows.flatMap((row) =>
    row.claimIds.map((claimId) => `${row.id}\0${claimId}`)
  );
  sameSet(
    mappedExisting,
    inverseExisting,
    'Wordgard forum existing-row inverse mapping'
  );
  sameSet(
    mappedProposed,
    inverseProposed,
    'Wordgard forum proposed-row inverse mapping'
  );
  validateForumSemanticIntegrity({ coverage, inventory });
};

export const validatePublicContractProbe = ({
  expectedWordgardHead,
  namespaceProbe,
  probe,
}) => {
  validateProbeEnvelope({
    expectedHead: expectedWordgardHead,
    headField: 'wordgardHead',
    label: 'Wordgard public-contract probe',
    probe,
    schemaVersion: 2,
  });
  ensure(
    typeof probe.method === 'string' && probe.method.length > 0,
    'Wordgard public-contract method is missing'
  );
  const packageContract = probe.package;
  ensure(
    packageContract?.name === 'wordgard' &&
      SEMVER_PATTERN.test(packageContract.version) &&
      packageContract.type === 'module' &&
      packageContract.main === 'dist/index.js' &&
      packageContract.exports?.['.'] === `./${packageContract.main}`,
    'Wordgard public package identity drift'
  );
  sameValue(packageContract.files, ['/dist'], 'Wordgard package file boundary');
  sameSet(
    Object.keys(packageContract.exports ?? {}),
    WORDGARD_EXPORT_SUBPATHS,
    'Wordgard public export subpaths'
  );
  ensureUniqueValues(
    Object.values(packageContract.exports),
    'Wordgard public export targets'
  );
  const exportTargets = packageContract.exportTargets ?? [];
  ensureUniqueValues(
    exportTargets.map(({ subpath }) => subpath),
    'Wordgard public export targets'
  );
  sameSet(
    exportTargets.map(({ subpath }) => subpath),
    WORDGARD_EXPORT_SUBPATHS,
    'Wordgard public export targets'
  );
  for (const target of exportTargets) {
    const runtimeTarget = packageContract.exports[target.subpath];
    ensure(
      target.runtimeTarget === runtimeTarget &&
        target.declarationTarget ===
          runtimeTarget.replace(JS_EXTENSION_PATTERN, '.d.ts') &&
        target.runtimeTargetExists === true &&
        target.declarationTargetExists === true,
      `Wordgard public export target drift: ${target.subpath}`
    );
  }
  ensure(
    packageContract.metadata?.browser === null &&
      packageContract.metadata.module === null &&
      packageContract.metadata.sideEffects === null &&
      packageContract.metadata.types === null &&
      packageContract.metadata.typesVersions === null &&
      packageContract.metadata.conditionalExports === false,
    'Wordgard package metadata observation drift'
  );

  const provenance = probe.distProvenance;
  validateSuccessfulProcess(
    provenance?.snapshotBuild,
    'Wordgard dist snapshot build'
  );
  ensure(
    provenance.ignored === true &&
      provenance.trackedFiles?.length === 0 &&
      SHA1_PATTERN.test(provenance.snapshotRef) &&
      provenance.snapshotRef !== expectedWordgardHead &&
      provenance.snapshotBuild.diagnostics?.length === 0 &&
      provenance.fileParity?.allEqual === true &&
      provenance.fileParity.fileCount === exportTargets.length * 2 &&
      provenance.fileParity.mismatches?.length === 0 &&
      SHA256_PATTERN.test(provenance.fileParity.digest) &&
      provenance.changedCommitsAfterSnapshot?.length === 7 &&
      provenance.changedSourceFilesAfterSnapshot?.length > 0 &&
      provenance.changedCommitsAfterSnapshot.at(-1)?.commit ===
        expectedWordgardHead,
    'Wordgard stale-dist provenance observation drift'
  );
  ensureUniqueValues(
    provenance.changedCommitsAfterSnapshot.map(({ commit }) => commit),
    'Wordgard post-snapshot commits'
  );
  ensure(
    provenance.changedCommitsAfterSnapshot.every(({ commit }) =>
      SHA1_PATTERN.test(commit)
    ),
    'Wordgard post-snapshot commit is invalid'
  );
  ensureUniqueValues(
    provenance.changedSourceFilesAfterSnapshot,
    'Wordgard post-snapshot source files'
  );

  const buildAndPack = probe.currentBuildAndPack;
  validateSuccessfulProcess(
    buildAndPack?.currentBuild,
    'Wordgard current-head build'
  );
  validateSuccessfulProcess(
    buildAndPack?.cleanPack?.process,
    'Wordgard clean pack'
  );
  validateSuccessfulProcess(
    buildAndPack?.ambientDistPack?.process,
    'Wordgard ambient-dist pack'
  );
  ensure(
    buildAndPack.currentBuild.diagnostics?.length > 0 &&
      buildAndPack.cleanPack.process.diagnostics?.length > 0,
    'Wordgard zero-exit TypeScript diagnostics observation drift'
  );
  sameValue(
    buildAndPack.cleanPack.process.diagnostics,
    buildAndPack.currentBuild.diagnostics,
    'Wordgard current-build/clean-pack diagnostics'
  );
  const targetFiles = exportTargets.flatMap(
    ({ declarationTarget, runtimeTarget }) => [
      declarationTarget.slice(2),
      runtimeTarget.slice(2),
    ]
  );
  const expectedMissing = exportTargets.flatMap(
    ({ declarationTarget, runtimeTarget, subpath }) => [
      `declaration\0${subpath}\0${declarationTarget.slice(2)}`,
      `runtime\0${subpath}\0${runtimeTarget.slice(2)}`,
    ]
  );
  sameSet(
    buildAndPack.cleanPack.exportTargetsMissingFromPack.map(
      ({ kind, subpath, target }) => `${kind}\0${subpath}\0${target}`
    ),
    expectedMissing,
    'Wordgard clean-pack missing export targets'
  );
  sameSet(
    buildAndPack.ambientDistPack.files,
    [...buildAndPack.cleanPack.files, ...targetFiles],
    'Wordgard ambient-dist pack contents'
  );
  ensureUniqueValues(buildAndPack.cleanPack.files, 'Wordgard clean-pack files');
  ensureUniqueValues(
    buildAndPack.ambientDistPack.files,
    'Wordgard ambient-dist pack files'
  );
  ensureUniqueValues(
    buildAndPack.cleanPack.exportTargetsMissingFromPack.map(
      ({ kind, subpath, target }) => `${kind}\0${subpath}\0${target}`
    ),
    'Wordgard clean-pack missing export targets'
  );
  ensure(
    buildAndPack.cleanPack.files.every((path) => !targetFiles.includes(path)) &&
      buildAndPack.ambientDistPack.exportTargetsMissingFromPack.length === 0 &&
      buildAndPack.releaseScriptRunsBuildOrTests === false &&
      buildAndPack.releaseCommands?.length > 0 &&
      buildAndPack.releaseCommands.every(
        ({ argumentsSource, command }) =>
          typeof command === 'string' &&
          typeof argumentsSource === 'string' &&
          !RELEASE_VERIFICATION_COMMAND_PATTERN.test(
            `${command} ${argumentsSource}`
          )
      ),
    'Wordgard release/pack observation drift'
  );

  const entryParity = probe.entryParity;
  validateSuccessfulProcess(
    entryParity?.node?.process,
    'Wordgard Node entrypoint'
  );
  validateSuccessfulProcess(
    entryParity?.typescript,
    'Wordgard TypeScript entrypoint'
  );
  validateSuccessfulProcess(
    entryParity?.browserBundle?.process,
    'Wordgard browser bundle'
  );
  ensure(
    Number.isInteger(entryParity.browserBundle.bytes) &&
      entryParity.browserBundle.bytes > 0 &&
      SHA256_PATTERN.test(entryParity.browserBundle.sha256) &&
      entryParity.browserTestResolution?.status === 200 &&
      entryParity.browserTestResolution.resolvesWordgardToDist === true &&
      entryParity.browserTestResolution.wordgardImports?.length > 0 &&
      entryParity.browserTestResolution.wordgardImports.every(
        (path) =>
          path.startsWith('/_m/__/dist/') &&
          entryParity.browserTestResolution.moduleImports.includes(path)
      ) &&
      entryParity.sameUnconditionalTargetsForNodeAndBrowser === true,
    'Wordgard browser entrypoint parity observation drift'
  );
  const imports = entryParity.node.imports;
  const expectedSpecifiers = WORDGARD_EXPORT_SUBPATHS.map((subpath) =>
    subpath === '.' ? 'wordgard' : `wordgard/${subpath.slice(2)}`
  );
  sameSet(
    Object.keys(imports ?? {}),
    expectedSpecifiers,
    'Wordgard Node import entrypoints'
  );
  for (const target of exportTargets) {
    const specifier =
      target.subpath === '.'
        ? 'wordgard'
        : `wordgard/${target.subpath.slice(2)}`;
    const imported = imports[specifier];
    ensure(
      imported?.resolved.endsWith(target.runtimeTarget.slice(1)) &&
        imported.exports?.length > 0,
      `Wordgard Node import proof is incomplete: ${specifier}`
    );
    ensureUniqueValues(imported.exports, `Wordgard ${specifier} exports`);
  }

  const publicSurface = probe.publicSurface;
  for (const [label, surface] of [
    ['current', publicSurface?.currentSource],
    ['dist snapshot', publicSurface?.distSnapshotSource],
  ]) {
    ensure(
      Number.isInteger(surface?.recordCount) &&
        surface.recordCount > 0 &&
        Number.isInteger(surface.valueRecords) &&
        surface.valueRecords > 0 &&
        Number.isInteger(surface.typeRecords) &&
        surface.typeRecords > 0 &&
        SHA256_PATTERN.test(surface.digest),
      `Wordgard ${label} public surface is invalid`
    );
  }
  ensure(
    publicSurface.currentSource.recordCount ===
      publicSurface.distSnapshotSource.recordCount &&
      publicSurface.currentSource.digest !==
        publicSurface.distSnapshotSource.digest &&
      publicSurface.delta?.added?.length === 0 &&
      publicSurface.delta.removed?.length === 0 &&
      publicSurface.delta.changed?.length > 0 &&
      Array.isArray(publicSurface.unresolvedCurrentIndexExports),
    'Wordgard source/dist public-surface divergence observation drift'
  );
  ensureUniqueValues(
    publicSurface.delta.changed.map(({ path }) => path),
    'Wordgard changed public records'
  );
  ensure(
    publicSurface.delta.changed.every(
      ({ after, before }) =>
        JSON.stringify(canonicalize(before)) !==
        JSON.stringify(canonicalize(after))
    ),
    'Wordgard changed public record lacks a semantic delta'
  );
  ensureUniqueValues(
    publicSurface.unresolvedCurrentIndexExports,
    'Wordgard unresolved current exports'
  );
  sameSet(
    publicSurface.unresolvedCurrentIndexExports,
    ['schema.codeBlockLanguage'],
    'Wordgard unresolved current exports'
  );
  const declarationRuntime = publicSurface.emittedDeclarationRuntime;
  const moduleResults = declarationRuntime?.moduleResults ?? [];
  const moduleNames = WORDGARD_EXPORT_SUBPATHS.slice(1).map((subpath) =>
    subpath.slice(2)
  );
  sameSet(
    moduleResults.map(({ module }) => module),
    moduleNames,
    'Wordgard declaration/runtime modules'
  );
  ensureUniqueValues(
    moduleResults.map(({ module }) => module),
    'Wordgard declaration/runtime modules'
  );
  for (const result of moduleResults) {
    sameSet(
      result.declaredTopLevel,
      result.runtimeTopLevel,
      `Wordgard ${result.module} declaration/runtime exports`
    );
    ensure(
      result.topLevelEqual === true && result.runtimeTopLevel.length > 0,
      `Wordgard ${result.module} declaration/runtime parity drift`
    );
    sameSet(
      imports[`wordgard/${result.module}`].exports,
      result.runtimeTopLevel,
      `Wordgard ${result.module} import/runtime exports`
    );
  }
  ensure(
    Number.isInteger(declarationRuntime.declaredValueChecks) &&
      declarationRuntime.declaredValueChecks > 0 &&
      Number.isInteger(declarationRuntime.prototypeMemberChecks) &&
      declarationRuntime.prototypeMemberChecks > 0 &&
      declarationRuntime.missingPrototypeMembers?.length === 0,
    'Wordgard declaration/runtime member observation drift'
  );
  ensureUniqueValues(
    declarationRuntime.missingValues,
    'Wordgard missing runtime values'
  );
  sameSet(
    declarationRuntime.missingValues,
    ['state.Transaction.foo'],
    'Wordgard missing runtime values'
  );
  const rootParity = publicSurface.rootNamespaceParity;
  sameSet(
    rootParity.rootKeys,
    rootParity.expectedRootKeys,
    'Wordgard root namespace keys'
  );
  sameSet(rootParity.rootKeys, moduleNames, 'Wordgard root namespace modules');
  sameSet(
    imports.wordgard.exports,
    rootParity.rootKeys,
    'Wordgard root import namespace'
  );
  sameSet(
    rootParity.modules.map(({ module }) => module),
    moduleNames,
    'Wordgard root namespace module parity'
  );
  ensure(
    rootParity.modules.every(
      ({ exportCount, identityParity, keyParity, module }) =>
        keyParity === true &&
        identityParity === true &&
        Number.isInteger(exportCount) &&
        exportCount ===
          moduleResults.find((result) => result.module === module)
            ?.runtimeTopLevel.length
    ),
    'Wordgard root namespace parity observation drift'
  );

  const treeShaking = probe.sourceMapsAndTreeShaking;
  const browserImportsResolveToDist =
    entryParity.browserTestResolution.wordgardImports?.length > 0 &&
    entryParity.browserTestResolution.wordgardImports.every((path) =>
      path.startsWith('/_m/__/dist/')
    );
  ensure(
    treeShaking?.sourceMapFiles?.length === treeShaking.sourceMappingUrlCount &&
      treeShaking.sourceMapFiles.length === 0 &&
      treeShaking.sourceFilesPacked?.length === 0 &&
      treeShaking.sideEffectsField === packageContract.metadata.sideEffects &&
      Number.isInteger(treeShaking.pureAnnotationCount) &&
      treeShaking.pureAnnotationCount > 0 &&
      treeShaking.namespaceProbe?.artifact ===
        `${CURRENT_ARTIFACT}/wordgard-namespace-bundle-probe.json` &&
      treeShaking.namespaceProbe.resultCount ===
        namespaceProbe.results.length &&
      treeShaking.namespaceProbe.sha256 ===
        sha256(`${JSON.stringify(namespaceProbe, null, 2)}\n`) &&
      entryParity.browserTestResolution.resolvesWordgardToDist ===
        browserImportsResolveToDist,
    'Wordgard source-map/tree-shaking observation drift'
  );
  sameValue(
    treeShaking.namespaceProbe.siblingRetention,
    namespaceProbe.results.map(({ esbuild, id, rolldown }) => ({
      esbuild: esbuild.siblingSentinels,
      id,
      rolldown: rolldown.siblingSentinels,
    })),
    'Wordgard namespace probe summary'
  );

  const findings = probe.findings ?? [];
  ensureUniqueValues(
    findings.map(({ id }) => id),
    'Wordgard public-contract findings'
  );
  sameSet(
    findings.map(({ id }) => id),
    Object.keys(WORDGARD_PUBLIC_FINDING_CONTRACTS),
    'Wordgard public-contract findings'
  );
  ensure(
    findings.every(
      ({ id, impacts, kind, severity, title }) =>
        severity === WORDGARD_PUBLIC_FINDING_CONTRACTS[id].severity &&
        kind === WORDGARD_PUBLIC_FINDING_CONTRACTS[id].kind &&
        typeof title === 'string' &&
        title.length > 0 &&
        Array.isArray(impacts) &&
        impacts.length > 0 &&
        new Set(impacts).size === impacts.length &&
        JSON.stringify([...impacts].sort()) ===
          JSON.stringify(
            [...WORDGARD_PUBLIC_FINDING_CONTRACTS[id].impacts].sort()
          )
    ) &&
      probe.interpretation?.proofDefectsOnly === true &&
      probe.interpretation.semanticArchitectureRowsAdded?.length === 0,
    'Wordgard public-contract finding semantics drift'
  );
};

export const validatePublishedPackageProbe = (probe, currentContract) => {
  ensure(
    probe && typeof probe === 'object' && !Array.isArray(probe),
    'Wordgard published-package probe is missing'
  );
  ensure(
    validationHasNoFailures(probe.validation),
    'Wordgard published-package probe failed'
  );
  ensure(
    probe.package?.integrity === probe.package?.npmIntegrity,
    'Wordgard published-package integrity drift'
  );
  ensure(
    probe.package?.spec === `wordgard@${probe.package?.version}`,
    'Wordgard published-package identity drift'
  );
  ensure(
    probe.entries?.length > 0 &&
      probe.entries.every(
        ({ declarationExists, importError, runtimeExists }) =>
          declarationExists && runtimeExists && !importError
      ),
    'Wordgard published-package entrypoint proof is incomplete'
  );
  ensure(
    probe.pack?.entryCount === probe.pack?.fileCount &&
      probe.pack.fileCount === probe.pack.files?.length,
    'Wordgard published-package file-count drift'
  );
  validateProbeEnvelope({
    label: 'Wordgard published-package probe',
    probe,
    schemaVersion: 1,
  });
  ensure(
    probe.kind === 'wordgard-published-package-contract',
    'Wordgard published-package kind drift'
  );
  validateClosedValidation(
    probe.validation,
    PUBLISHED_PACKAGE_VALIDATION_KEYS,
    'Wordgard published-package probe'
  );
  ensure(
    isCanonicalSha512Integrity(probe.package.integrity) &&
      SEMVER_PATTERN.test(probe.package.version) &&
      SHA1_PATTERN.test(probe.package.npmShasum) &&
      SHA256_PATTERN.test(probe.package.tarballSha256) &&
      probe.package.npmTarball ===
        `https://registry.npmjs.org/wordgard/-/wordgard-${probe.package.version}.tgz` &&
      Number.isFinite(Date.parse(probe.package.publishedAt)) &&
      Number.isInteger(probe.package.unpackedSize) &&
      probe.package.unpackedSize > 0,
    'Wordgard published-package provenance is invalid'
  );
  const entries = probe.entries;
  ensureUniqueValues(
    entries.map(({ subpath }) => subpath),
    'Wordgard published-package entrypoints'
  );
  sameSet(
    entries.map(({ subpath }) => subpath),
    WORDGARD_EXPORT_SUBPATHS,
    'Wordgard published-package entrypoints'
  );
  for (const entry of entries) {
    const stem = entry.subpath === '.' ? 'index' : entry.subpath.slice(2);
    ensure(
      entry.runtimeExists === true &&
        entry.declarationExists === true &&
        entry.importError === null &&
        entry.runtimePath === `dist/${stem}.js` &&
        entry.declarationPath === `dist/${stem}.d.ts` &&
        entry.runtimeExports?.length > 0,
      `Wordgard published-package entrypoint is invalid: ${entry.subpath}`
    );
    ensureUniqueValues(
      entry.runtimeExports,
      `Wordgard published-package ${entry.subpath} exports`
    );
  }
  const files = probe.pack.files;
  ensureUniqueValues(
    files.map(({ path }) => path),
    'Wordgard published-package files'
  );
  ensure(
    files.length > 0 &&
      files.every(
        ({ path, size }) =>
          typeof path === 'string' &&
          path.length > 0 &&
          Number.isInteger(size) &&
          size > 0
      ) &&
      files.reduce((sum, { size }) => sum + size, 0) ===
        probe.package.unpackedSize &&
      files.some(({ path }) => path === 'package.json'),
    'Wordgard published-package file inventory is invalid'
  );
  const packedPaths = new Set(files.map(({ path }) => path));
  ensure(
    entries.every(
      ({ declarationPath, runtimePath }) =>
        packedPaths.has(declarationPath) && packedPaths.has(runtimePath)
    ),
    'Wordgard published-package export target is absent from tarball'
  );
  if (currentContract) {
    ensure(
      currentContract.package?.name === 'wordgard' &&
        currentContract.package.version === probe.package.version,
      'Wordgard published/current package identity drift'
    );
    sameSet(
      entries.map(({ subpath }) => subpath),
      Object.keys(currentContract.package.exports ?? {}),
      'Wordgard published/current export subpaths'
    );
    for (const entry of entries) {
      const specifier =
        entry.subpath === '.'
          ? 'wordgard'
          : `wordgard/${entry.subpath.slice(2)}`;
      sameSet(
        entry.runtimeExports,
        currentContract.entryParity.node.imports[specifier].exports,
        `Wordgard published/current exports: ${entry.subpath}`
      );
    }
  }
  sameSet(
    entries.find(({ subpath }) => subpath === '.')?.runtimeExports ?? [],
    entries
      .filter(({ subpath }) => subpath !== '.')
      .map(({ subpath }) => subpath.slice(2)),
    'Wordgard published root namespace exports'
  );
};

export const validateProbeSet = ({
  authority,
  root,
  runtimeApiBundle,
  wordgardNamespaceBundle,
  wordgardPublishedPackage,
  wordgardPublicContract,
  wordgardRoot,
  wordgardStatePurity,
  wordgardValuePurity,
}) => {
  validateRuntimeApiBundleProbe({
    expectedPlateHead: authority?.plateHead,
    probe: runtimeApiBundle,
    root,
  });
  validateNamespaceBundleProbe({
    expectedWordgardHead: authority?.wordgardHead,
    probe: wordgardNamespaceBundle,
    wordgardRoot,
  });
  validateStatePurityProbe({
    expectedWordgardHead: authority?.wordgardHead,
    probe: wordgardStatePurity,
  });
  validateValuePurityProbe({
    expectedWordgardHead: authority?.wordgardHead,
    probe: wordgardValuePurity,
  });
  validatePublicContractProbe({
    expectedWordgardHead: authority?.wordgardHead,
    namespaceProbe: wordgardNamespaceBundle,
    probe: wordgardPublicContract,
  });
  validatePublishedPackageProbe(
    wordgardPublishedPackage,
    wordgardPublicContract
  );
};

const validateFileHashes = (files, baseRoot, pathField = 'path') => {
  for (const file of files) {
    ensure(
      SHA256_PATTERN.test(file.sha256),
      `${file[pathField]} lacks inventory hash`
    );
    const absolutePath = resolve(baseRoot, file[pathField]);
    ensure(
      existsSync(absolutePath),
      `inventory file disappeared: ${absolutePath}`
    );
    ensure(
      hashFile(absolutePath) === file.sha256,
      `inventory file drift: ${absolutePath}`
    );
  }
};

const validateLiveFreshness = ({
  manifest,
  plate,
  plite,
  root,
  siteRoot,
  wordgardRaw,
  wordgardRoot,
  wordgardSite,
}) => {
  const head = (cwd) =>
    execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd,
      encoding: 'utf8',
    }).trim();
  const clean = (cwd) =>
    execFileSync('git', ['status', '--porcelain'], {
      cwd,
      encoding: 'utf8',
    }).trim() === '';
  ensure(head(root) === manifest.authority.plateHead, 'Plate head drift');
  ensure(head(root) === manifest.authority.pliteHead, 'Plite head drift');
  ensure(
    head(wordgardRoot) === manifest.authority.wordgardHead,
    'Wordgard head drift'
  );
  ensure(
    clean(wordgardRoot) && manifest.authority.wordgardClean,
    'Wordgard is dirty'
  );
  ensure(
    head(siteRoot) === manifest.authority.wordgardSiteHead,
    'Wordgard site head drift'
  );
  ensure(
    clean(siteRoot) && manifest.authority.wordgardSiteClean,
    'Wordgard site is dirty'
  );
  validateFileHashes(plate.files, root);
  validateFileHashes(plite.entries, root);
  validateFileHashes(wordgardRaw.files, wordgardRoot);
  validateFileHashes(wordgardSite.files, siteRoot);
  const pliteDigest = sha256(
    plite.entries.map((entry) => `${entry.path}\0${entry.sha256}\0`).join('')
  );
  ensure(
    pliteDigest === plite.provenance.sourceDigest,
    'Plite sourceDigest drift'
  );
};

const validateNonIgnored = ({ paths, root }) => {
  for (const path of paths) {
    let ignored = false;
    try {
      execFileSync('git', ['check-ignore', '-q', '--', path], { cwd: root });
      ignored = true;
    } catch (error) {
      ensure(error.status === 1, `git check-ignore failed for ${path}`);
    }
    ensure(!ignored, `audit artifact is ignored: ${path}`);
  }
};

const createReceipt = ({ groups, manifest, matrixResult, root }) => {
  const paths = sortedUnique([
    `${CURRENT_ARTIFACT}/concept-manifest.json`,
    `${CURRENT_ARTIFACT}/validate-audit.mjs`,
    `${CURRENT_ARTIFACT}/validate-audit.test.mjs`,
    `${CURRENT_ARTIFACT}/validate-test-harvest.mjs`,
    ...manifest.generatedArtifacts.map(({ path }) => path),
    CURRENT_PLAN,
    REGISTRY_PATH,
  ]);
  const artifacts = Object.fromEntries(
    paths.map((path) => [path, sha256(readFileSync(resolve(root, path)))])
  );
  return {
    schemaVersion: 1,
    artifacts,
    authority: canonicalize(manifest.authority),
    counts: {
      concepts: manifest.concepts.length,
      deferred: groups.deferredIds.length,
      material: groups.materialIds.length,
      priorCandidates: manifest.priorCandidates.length,
      strictMatrixRows: matrixResult.rows,
    },
  };
};

export const validateAuditArtifacts = ({
  checkLive = false,
  dossiers,
  forumCoverage,
  forumInventory,
  manifest,
  markdownArtifacts = [],
  matrix,
  matrixTruthSource,
  plate,
  plite,
  registry,
  report,
  root,
  runtimeApiBundle,
  siteRoot,
  wordgard,
  wordgardNamespaceBundle,
  wordgardPublishedPackage,
  wordgardPublicContract,
  wordgardRaw,
  wordgardRoot,
  wordgardSite,
  wordgardStatePurity,
  wordgardValuePurity,
}) => {
  ensure(
    manifest.schemaVersion >= 4,
    'manifest schema is not the strict atomic schema'
  );
  validateInventoryClosure({
    manifest,
    plate,
    plite,
    wordgard,
    wordgardRaw,
    wordgardSite,
  });
  validateForumClosure({
    coverage: forumCoverage,
    inventory: forumInventory,
    manifest,
  });
  validateProbeSet({
    authority: manifest.authority,
    root,
    runtimeApiBundle,
    wordgardNamespaceBundle,
    wordgardPublishedPackage,
    wordgardPublicContract,
    wordgardRoot,
    wordgardStatePurity,
    wordgardValuePurity,
  });
  validateProfileAssignments(matrixTruthSource);
  validateDecisions(manifest);
  validatePriorCandidates({
    candidates: manifest.priorCandidates,
    concepts: manifest.concepts,
    root,
  });
  const inventory = buildInventoryIndex({
    plate,
    plite,
    root,
    siteRoot,
    wordgard,
    wordgardRaw,
    wordgardRoot,
    wordgardSite,
  });
  const context = {
    allowedRoots: [root, wordgardRoot, siteRoot],
    lineCounts: new Map(),
    root,
  };
  validateMappingGraph({
    concepts: manifest.concepts,
    context,
    forumCoverage,
    inventory,
    sourceMappings: manifest.sourceMappings,
  });
  validateDimensionTruth({ concepts: manifest.concepts, context });
  const groups = validateReportSummary({ dossiers, manifest, report });
  const matrixResult = validateRenderedMatrix({ manifest, matrix });
  validateArtifactGraph({ markdownArtifacts, root });
  validateGeneratedArtifacts({ manifest, root });
  validateRegistryFreshness({ manifest, registry });
  if (checkLive) {
    validateLiveFreshness({
      manifest,
      plate,
      plite,
      root,
      siteRoot,
      wordgardRaw,
      wordgardRoot,
      wordgardSite,
    });
  }
  return {
    groups,
    matrixResult,
    receipt: createReceipt({ groups, manifest, matrixResult, root }),
  };
};

const loadCurrentAudit = () => {
  const artifactRoot = dirname(fileURLToPath(import.meta.url));
  const root = resolve(artifactRoot, '../../../..');
  const wordgardRoot = resolve(root, '../wordgard');
  const siteRoot = resolve(root, '../wordgard-website');
  const readArtifact = (name) =>
    readFileSync(resolve(artifactRoot, name), 'utf8');
  const manifest = JSON.parse(readArtifact('concept-manifest.json'));
  const markdownPaths = [
    `${CURRENT_ARTIFACT}/concept-matrix.md`,
    `${CURRENT_ARTIFACT}/audit-report.md`,
    `${CURRENT_ARTIFACT}/material-dossiers.md`,
    CURRENT_PLAN,
    'docs/editor-test-harvester/wordgard/report.md',
    'docs/editor-test-harvester/wordgard/inventory.md',
    'docs/editor-test-harvester/wordgard/test-index.md',
    'docs/editor-issue-harvester/wordgard/full/issue-closure-ledger.md',
  ];
  return {
    dossiers: readArtifact('material-dossiers.md'),
    forumCoverage: JSON.parse(readArtifact('wordgard-forum-coverage.json')),
    forumInventory: JSON.parse(readArtifact('wordgard-forum-inventory.json')),
    manifest,
    markdownArtifacts: markdownPaths.map((path) => ({
      path,
      text: readFileSync(resolve(root, path), 'utf8'),
    })),
    matrix: readArtifact('concept-matrix.md'),
    matrixTruthSource: readArtifact('matrix-truth.mjs'),
    plate: JSON.parse(readArtifact('plate-source-coverage.json')),
    plite: JSON.parse(readArtifact('plite-source-coverage.json')),
    registry: readJson(resolve(root, REGISTRY_PATH)),
    report: readArtifact('audit-report.md'),
    root,
    runtimeApiBundle: JSON.parse(readArtifact('runtime-api-bundle-probe.json')),
    siteRoot,
    wordgard: JSON.parse(readArtifact('wordgard-source-coverage.json')),
    wordgardNamespaceBundle: JSON.parse(
      readArtifact('wordgard-namespace-bundle-probe.json')
    ),
    wordgardPublishedPackage: JSON.parse(
      readArtifact('wordgard-published-package-probe.json')
    ),
    wordgardPublicContract: JSON.parse(
      readArtifact('wordgard-public-contract-probe.json')
    ),
    wordgardRaw: JSON.parse(readArtifact('wordgard-raw-source-inventory.json')),
    wordgardRoot,
    wordgardSite: JSON.parse(readArtifact('wordgard-site-coverage.json')),
    wordgardStatePurity: JSON.parse(
      readArtifact('wordgard-state-purity-probe.json')
    ),
    wordgardValuePurity: JSON.parse(
      readArtifact('wordgard-value-purity-probe.json')
    ),
  };
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const inputs = loadCurrentAudit();
    const result = validateAuditArtifacts({ ...inputs, checkLive: true });
    const receiptText = `${JSON.stringify(result.receipt, null, 2)}\n`;
    writeFileSync(resolve(inputs.root, RECEIPT_PATH), receiptText);
    validateNonIgnored({
      paths: [...Object.keys(result.receipt.artifacts), RECEIPT_PATH],
      root: inputs.root,
    });
    process.stdout.write(
      `${JSON.stringify({
        concepts: result.matrixResult.rows,
        material: result.groups.materialIds,
        priorCandidates: inputs.manifest.priorCandidates.length,
        receipt: RECEIPT_PATH,
        receiptSha256: sha256(receiptText),
      })}\n`
    );
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

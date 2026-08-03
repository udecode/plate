import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { comparisonRows as previousRows } from '../wordgard-full-strict-editor-audit/comparison-data.mjs';
import {
  contractEvidence as docSchemaContractEvidence,
  dimensionEvidenceKeys as docSchemaDimensionEvidenceKeys,
} from './matrix-evidence-doc-schema.mjs';
import {
  contractEvidence as forumContractEvidence,
  dimensionEvidenceKeys as forumDimensionEvidenceKeys,
} from './matrix-evidence-forum.mjs';
import {
  contractEvidence as integrationLocalContractEvidence,
  dimensionEvidenceKeys as integrationLocalDimensionEvidenceKeys,
} from './matrix-evidence-integration-local.mjs';
import {
  contractEvidence as metaCommandProofContractEvidence,
  dimensionEvidenceKeys as metaCommandProofDimensionEvidenceKeys,
} from './matrix-evidence-meta-command-proof.mjs';
import {
  contractEvidence as productContractEvidence,
  dimensionEvidenceKeys as productDimensionEvidenceKeys,
} from './matrix-evidence-product.mjs';
import {
  contractEvidence as stateTableContractEvidence,
  dimensionEvidenceKeys as stateTableDimensionEvidenceKeys,
} from './matrix-evidence-state-table.mjs';
import {
  contractEvidence as viewContractEvidence,
  dimensionEvidenceKeys as viewDimensionEvidenceKeys,
} from './matrix-evidence-view.mjs';

const artifactRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(artifactRoot, '../../../..');
const readJson = (name) =>
  JSON.parse(readFileSync(resolve(artifactRoot, name), 'utf8'));

const inventories = {
  plate: readJson('plate-source-coverage.json'),
  plite: readJson('plite-source-coverage.json'),
  wordgard: readJson('wordgard-source-coverage.json'),
  wordgardSite: readJson('wordgard-site-coverage.json'),
};

const previousById = new Map(previousRows.map((value) => [value.id, value]));
const statusNames = {
  A: 'absent',
  E: 'exact',
  N: 'not-applicable',
  P: 'partial',
};
const dimensions = [
  'correctness',
  'api',
  'data',
  'ownership',
  'runtime',
  'proof',
];
const LINE_SPLIT_PATTERN = /\r?\n/;

const statusTuple = (value) => {
  const parts = value.split('/').map((part) => statusNames[part]);
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new Error(`Invalid status tuple: ${value}`);
  }
  return { plate: parts[2], plite: parts[1], wordgard: parts[0] };
};

const lineCount = (path) => {
  const absolute = path.startsWith('../wordgard-website/')
    ? resolve(repositoryRoot, path)
    : path.startsWith('../wordgard/')
      ? resolve(repositoryRoot, path)
      : resolve(repositoryRoot, path);
  return readFileSync(absolute, 'utf8').split(LINE_SPLIT_PATTERN).length;
};
const cite = (prefix, entry) => {
  const path = `${prefix}${entry.path}`;
  const declaration = entry.declarations?.find(
    (value) => value.exported && Number.isInteger(value.line)
  );
  const section = entry.sections?.find((value) => Number.isInteger(value.line));
  const start = declaration?.line ?? section?.line ?? 1;
  const knownLines = entry.lines ?? lineCount(path);
  const end = Math.min(knownLines, Math.max(start, start + 24));
  return `${path}:${start}-${end}`;
};

const inventoryEntries = (side, sourceConceptIds) => {
  if (side === 'plite') {
    return inventories.plite.entries
      .filter((entry) =>
        entry.conceptIds.some((id) => sourceConceptIds.includes(id))
      )
      .map((entry) => ({
        citation: cite('', entry),
        consumer:
          entry.role === 'documentation' ||
          entry.role === 'test' ||
          entry.role === 'benchmark' ||
          entry.role === 'proof-tooling',
        owner: entry.role === 'source',
        proof: entry.role === 'test' || entry.role === 'proof-tooling',
        public:
          entry.role === 'package-metadata' ||
          entry.declarations?.some((value) => value.exported),
      }));
  }
  if (side === 'plate') {
    return inventories.plate.files
      .filter(
        (entry) =>
          !entry.exclusion &&
          entry.concepts.some((id) => sourceConceptIds.includes(id))
      )
      .map((entry) => ({
        citation: cite('', entry),
        consumer:
          entry.kind === 'documentation' ||
          entry.kind === 'product' ||
          entry.kind === 'proof',
        owner: entry.kind === 'source',
        proof: entry.kind === 'proof',
        public: entry.declarations?.some((value) => value.exported),
      }));
  }

  const sourceIds = sourceConceptIds.filter((id) => id.startsWith('WG-'));
  const siteIds = sourceConceptIds.filter((id) => id.startsWith('WGS-'));
  const sourceEntries = inventories.wordgard.files
    .filter(
      (entry) =>
        entry.status === 'mapped' &&
        entry.conceptIds.some((id) => sourceIds.includes(id))
    )
    .map((entry) => ({
      citation: cite('../wordgard/', entry),
      consumer:
        entry.category === 'test' ||
        entry.category === 'product-shell' ||
        entry.category === 'metadata',
      owner: entry.category === 'source',
      proof: entry.category === 'test',
      public: entry.declarations?.some((value) => value.exported),
    }));
  const siteEntries = inventories.wordgardSite.files
    .filter(
      (entry) =>
        entry.status === 'mapped' &&
        entry.conceptIds.some((id) => siteIds.includes(id))
    )
    .map((entry) => ({
      citation: cite('../wordgard-website/', entry),
      consumer: true,
      owner: entry.path.startsWith('src/'),
      proof: entry.path.includes('/examples/') || entry.path === 'package.json',
      public: entry.path.startsWith('site/docs/') || entry.path === 'README.md',
    }));
  return [...sourceEntries, ...siteEntries];
};

const unique = (values) => [...new Set(values.filter(Boolean))];
const pick = (entries, predicate, excluded = []) =>
  entries.find(
    (entry) => predicate(entry) && !excluded.includes(entry.citation)
  )?.citation;

const inventoryEvidence = {
  plate:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24',
  plite:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24',
  wordgard:
    'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24',
};

const contract = ({
  anchors = [],
  evidenceOverride = {},
  mechanism,
  side,
  sourceConceptIds,
  status,
}) => {
  if (status === 'absent' || status === 'not-applicable') {
    return {
      evidence: [inventoryEvidence[side]],
      evidenceProvenance: { evidence: 'coverage-only' },
      reason:
        status === 'absent'
          ? `${mechanism} has no assigned ${side} source concept in the frozen inventory.`
          : `${mechanism} belongs outside the documented ${side} layer boundary.`,
      sourceConceptIds: [],
      status,
    };
  }
  if (!sourceConceptIds?.length) {
    throw new Error(
      `${mechanism}: ${side} ${status} mapping is missing source concept IDs`
    );
  }
  const entries = inventoryEntries(side, sourceConceptIds);
  if (entries.length === 0) {
    throw new Error(`${side} inventory has no entries for ${sourceConceptIds}`);
  }
  const all = unique(entries.map((entry) => entry.citation));
  const proof = pick(entries, (entry) => entry.proof) ?? all.at(-1);
  if (status === 'partial') {
    const explicitCovers = Boolean(
      evidenceOverride.covers?.length || anchors[0]
    );
    const explicitMissingEvidence = Boolean(
      evidenceOverride.missingEvidence?.length
    );
    const explicitProof = Boolean(evidenceOverride.proof?.length);
    const covers =
      evidenceOverride.covers?.[0] ??
      anchors[0] ??
      pick(entries, (entry) => entry.owner || entry.public, [proof]) ??
      all[0];
    return {
      covers: evidenceOverride.covers ?? [covers],
      evidenceProvenance: {
        covers: explicitCovers ? 'direct' : 'coverage-only',
        missingEvidence: explicitMissingEvidence ? 'direct' : 'coverage-only',
        proof: explicitProof ? 'direct' : 'coverage-only',
      },
      missing: `${side} covers only part of ${mechanism}; the unmatched ownership or host facets remain outside this mapping.`,
      missingEvidence: evidenceOverride.missingEvidence ?? [
        inventoryEvidence[side],
      ],
      proof: evidenceOverride.proof ?? [proof],
      sourceConceptIds,
      status,
    };
  }

  const publicEvidence =
    evidenceOverride.public?.[0] ??
    pick(entries, (entry) => entry.public) ??
    all[0];
  const owner =
    evidenceOverride.owner?.[0] ??
    anchors[0] ??
    pick(entries, (entry) => entry.owner, [publicEvidence]) ??
    all[1] ??
    all[0];
  const consumers =
    evidenceOverride.consumers?.[0] ??
    pick(entries, (entry) => entry.consumer, [publicEvidence, owner]) ??
    all[2] ??
    all[0];
  const lifecycle =
    evidenceOverride.lifecycle?.[0] ??
    anchors[1] ??
    all.find(
      (value) => ![publicEvidence, owner, consumers, proof].includes(value)
    ) ??
    owner;
  const result = {
    consumers: [consumers],
    lifecycle: [lifecycle],
    owner: [owner],
    proof: evidenceOverride.proof ?? [proof],
    public: [publicEvidence],
    sourceConceptIds,
    status,
  };
  result.evidenceProvenance = {
    consumers: evidenceOverride.consumers?.length ? 'direct' : 'coverage-only',
    lifecycle:
      evidenceOverride.lifecycle?.length || anchors[1]
        ? 'direct'
        : 'coverage-only',
    owner:
      evidenceOverride.owner?.length || anchors[0] ? 'direct' : 'coverage-only',
    proof: evidenceOverride.proof?.length ? 'direct' : 'coverage-only',
    public: evidenceOverride.public?.length ? 'direct' : 'coverage-only',
  };
  const reused = Object.entries(result)
    .filter(([facet]) =>
      ['public', 'owner', 'consumers', 'lifecycle', 'proof'].includes(facet)
    )
    .flatMap(([facet, values]) => values.map((value) => [facet, value]));
  const repeatedGroups = unique(reused.map(([, value]) => value))
    .map((value) => reused.filter(([, current]) => current === value))
    .filter((group) => group.length > 1);
  if (repeatedGroups.length > 0) {
    result.facetReuseJustification = repeatedGroups.map((group) => ({
      facets: group.map(([facet]) => facet),
      reason: `${group.map(([facet]) => facet).join(' and ')} are declared together at ${group[0][1]}; the frozen inventory contains no separate declaration for this exact source-owned facet pair.`,
    }));
  }
  return result;
};

const contractEvidenceAtKey = (contracts, key) => {
  const [side, facet] = key.split('.');
  return contracts[side]?.[facet] ?? [];
};

const dimensionSet = ({
  contracts,
  evidenceIsExplicit,
  evidenceKeys,
  semantic,
  winners,
}) => {
  if (
    semantic.length !== dimensions.length ||
    evidenceKeys.length !== dimensions.length ||
    winners.length !== dimensions.length
  ) {
    throw new Error('Each row needs six explicit dimension decisions');
  }
  return Object.fromEntries(
    dimensions.map((name, index) => {
      const keys = evidenceKeys[index];
      const directSides = unique(
        keys
          .filter((key) => {
            const [side, facet] = key.split('.');
            return contracts[side]?.evidenceProvenance?.[facet] === 'direct';
          })
          .map((key) => key.split('.')[0])
      );
      const requestedWinner = winners[index];
      const requiredSides = {
        'Plate stronger': ['plate'],
        'Plite stronger': ['plite'],
        'Plite/Plate stack stronger': ['plite', 'plate'],
        'reference stronger': ['wordgard'],
      }[requestedWinner];
      const hasDirectSupport =
        evidenceIsExplicit &&
        (requestedWinner === 'equivalent' ||
        requestedWinner === 'different tradeoff'
          ? directSides.length >= 2
          : requiredSides
            ? requiredSides.every((side) => directSides.includes(side))
            : directSides.length > 0);
      const hasRuntimeComparison =
        name !== 'runtime' ||
        !requiredSides ||
        directSides.some((side) => !requiredSides.includes(side));
      const winnerIsSupported =
        requestedWinner === 'not-applicable' ||
        requestedWinner === 'insufficient evidence' ||
        (hasDirectSupport && hasRuntimeComparison);
      return [
        name,
        {
          claim: semantic[index],
          evidence: unique(
            keys.flatMap((key) => contractEvidenceAtKey(contracts, key))
          ),
          evidenceKeys: keys,
          evidenceSelection: evidenceIsExplicit ? 'explicit' : 'automatic',
          evidenceStatus: hasDirectSupport ? 'direct' : 'coverage-only',
          requestedWinner,
          winner: winnerIsSupported ? requestedWinner : 'insufficient evidence',
        },
      ];
    })
  );
};

const effectiveOverall = (dimensionRows) => {
  const supported = new Set(
    Object.values(dimensionRows)
      .map(({ winner }) => winner)
      .filter(
        (winner) =>
          winner !== 'insufficient evidence' && winner !== 'not-applicable'
      )
  );
  const hasLocal = [
    'Plate stronger',
    'Plite stronger',
    'Plite/Plate stack stronger',
  ].some((winner) => supported.has(winner));
  const hasReference = supported.has('reference stronger');
  const classification =
    supported.size === 0
      ? 'insufficient evidence'
      : supported.has('different tradeoff') || (hasReference && hasLocal)
        ? 'different tradeoff'
        : hasReference
          ? 'reference stronger'
          : supported.has('Plite/Plate stack stronger') ||
              (supported.has('Plate stronger') &&
                supported.has('Plite stronger'))
            ? 'Plite/Plate stack stronger'
            : supported.has('Plate stronger')
              ? 'Plate stronger'
              : supported.has('Plite stronger')
                ? 'Plite stronger'
                : 'equivalent';

  return {
    classification,
    preferred: {
      'Plate stronger': 'Plate',
      'Plite stronger': 'Plite',
      'Plite/Plate stack stronger': 'Plite/Plate stack',
      'different tradeoff': 'different tradeoff',
      equivalent: 'tie',
      'insufficient evidence': 'insufficient evidence',
      'reference stronger': 'reference',
    }[classification],
  };
};

const availableContractKeys = (side, value) => {
  if (value.status === 'exact') {
    return ['public', 'owner', 'consumers', 'lifecycle', 'proof'].map(
      (facet) => `${side}.${facet}`
    );
  }
  if (value.status === 'partial') {
    return ['covers', 'missingEvidence', 'proof'].map(
      (facet) => `${side}.${facet}`
    );
  }
  return [`${side}.evidence`];
};

const directContractKeys = (side, value) =>
  availableContractKeys(side, value).filter((key) => {
    const facet = key.split('.')[1];
    return value.evidenceProvenance?.[facet] === 'direct';
  });

const dimensionEvidenceKeys = (contracts, winners) => {
  const keysBySide = Object.fromEntries(
    Object.entries(contracts).map(([side, value]) => [
      side,
      directContractKeys(side, value).length > 0
        ? directContractKeys(side, value)
        : availableContractKeys(side, value),
    ])
  );
  const preferredFacet = [
    ['proof', 'covers', 'lifecycle', 'evidence'],
    ['public', 'covers', 'evidence'],
    ['public', 'owner', 'covers', 'evidence'],
    ['owner', 'covers', 'evidence'],
    ['proof', 'lifecycle', 'covers', 'evidence'],
    ['proof', 'evidence'],
  ];
  const mappedSides = ['wordgard', 'plite', 'plate'].filter((side) =>
    ['exact', 'partial'].includes(contracts[side].status)
  );
  const requiredSides = (winner, index) => {
    if (winner === 'reference stronger') return ['wordgard'];
    if (winner === 'Plite stronger') return ['plite'];
    if (winner === 'Plate stronger') return ['plate'];
    if (winner === 'Plite/Plate stack stronger') return ['plite', 'plate'];
    if (winner === 'equivalent' || winner === 'different tradeoff') {
      return mappedSides.slice(index % Math.max(1, mappedSides.length), 2)
        .length === 2
        ? mappedSides.slice(index % mappedSides.length, 2)
        : mappedSides.slice(0, 2);
    }
    return mappedSides.length > 0
      ? [mappedSides[index % mappedSides.length]]
      : [['wordgard', 'plite', 'plate'][index % 3]];
  };
  return winners.map((winner, index) => {
    const sides = requiredSides(winner, index);
    return sides.map((side) => {
      const sideKeys = keysBySide[side];
      return (
        preferredFacet[index]
          .map((facet) => `${side}.${facet}`)
          .find((key) => sideKeys.includes(key)) ?? sideKeys[0]
      );
    });
  });
};

const row = (spec) => {
  const statuses = statusTuple(spec.status);
  const contracts = {
    wordgard: contract({
      anchors: spec.wordgardAnchors,
      evidenceOverride: spec.contractEvidence?.wordgard,
      mechanism: spec.mechanism,
      side: 'wordgard',
      sourceConceptIds: spec.sources.wordgard,
      status: statuses.wordgard,
    }),
    plite: contract({
      evidenceOverride: spec.contractEvidence?.plite,
      mechanism: spec.mechanism,
      side: 'plite',
      sourceConceptIds: spec.sources.plite,
      status: statuses.plite,
    }),
    plate: contract({
      evidenceOverride: spec.contractEvidence?.plate,
      mechanism: spec.mechanism,
      side: 'plate',
      sourceConceptIds: spec.sources.plate,
      status: statuses.plate,
    }),
  };
  const evidenceKeys =
    spec.dimensionEvidenceKeys ??
    dimensionEvidenceKeys(contracts, spec.dimensionWinners);
  const dimensionRows = dimensionSet({
    contracts,
    evidenceIsExplicit: Boolean(spec.dimensionEvidenceKeys),
    evidenceKeys,
    semantic: spec.semantic,
    winners: spec.dimensionWinners,
  });
  const effectiveComparison = effectiveOverall(dimensionRows);
  return Object.freeze({
    classification: effectiveComparison.classification,
    contracts,
    dimensions: dimensionRows,
    dossier: spec.dossier,
    id: spec.id,
    lane: spec.lane,
    localDebt: spec.localDebt,
    origin: spec.origin,
    ...(spec.parent ? { parent: spec.parent } : {}),
    preferred: effectiveComparison.preferred,
    priority: spec.priority,
    proofAdaptation: spec.proofAdaptation,
    referenceAdaptation: spec.referenceAdaptation,
    title: spec.title,
    verdict: spec.verdict,
  });
};

const defaultDisposition = Object.freeze({
  localDebt: 'none',
  priority: '—',
  proofAdaptation: 'keep-local',
  referenceAdaptation: 'keep-local',
});

const intactStatus = Object.freeze({
  'WG-META-001': 'E/E/E',
  'WG-META-002': 'E/E/E',
  'WG-META-003': 'E/E/E',
  'WG-COLLAB-001': 'E/E/N',
  'WG-DOC-004': 'E/E/P',
  'WG-DOC-006': 'E/P/N',
  'WG-DOC-007': 'E/P/N',
  'WG-DOC-008': 'P/E/P',
  'WG-DOC-009': 'E/E/N',
  'WG-DOC-010': 'E/E/N',
  'WG-DOC-011': 'E/E/N',
  'WG-DOC-012': 'E/E/P',
  'WG-DOC-013': 'E/E/P',
  'WG-DOC-016': 'E/E/E',
  'WG-DOC-018': 'E/E/N',
  'WG-HIST-002': 'E/E/P',
  'WG-HIST-003': 'E/E/P',
  'WG-PRODUCT-001B': 'E/N/E',
  'WG-PRODUCT-001C': 'E/N/E',
  'WG-PRODUCT-001D': 'E/N/E',
  'WG-PRODUCT-002': 'P/P/E',
  'WG-PRODUCT-003C': 'E/N/E',
  'WG-PRODUCT-003E': 'E/N/E',
  'WG-PRODUCT-004B': 'P/N/E',
  'WG-PRODUCT-004C': 'E/N/E',
  'WG-PROOF-003': 'P/P/E',
  'WG-STATE-008': 'E/E/P',
  'WG-STATE-012': 'E/N/P',
  'WG-STATE-013': 'E/P/N',
  'WG-TABLE-001': 'E/P/E',
  'WG-TABLE-002': 'E/A/E',
  'WG-TABLE-003': 'E/P/E',
  'WG-TABLE-005': 'E/P/E',
  'WG-TABLE-006': 'E/E/E',
  'WG-VIEW-002': 'E/E/N',
  'WG-VIEW-006A': 'E/E/P',
  'WG-VIEW-006B': 'E/E/P',
  'WG-VIEW-008A': 'E/E/P',
  'WG-VIEW-010A': 'E/E/P',
  'WG-VIEW-012B': 'P/N/E',
  'WG-VIEW-014B': 'P/N/E',
});

const splitDefinitions = Object.freeze([
  [
    'WG-META-004A',
    'Basic editor demo and teaching surface',
    'WG-META-004',
    'E/E/E',
  ],
  [
    'WG-META-004B',
    'Literate executable examples with snippet injection and import maps',
    'WG-META-004',
    'E/P/P',
  ],
  [
    'WG-META-004C',
    'Sandboxed shareable code playground and console transport',
    'WG-META-004',
    'E/N/N',
  ],
  [
    'WG-META-004D',
    'Public architecture positioning and ProseMirror migration map',
    'WG-META-004',
    'E/N/P',
  ],
  ['WG-META-005A', 'Dead-code and tree-shaking probe', 'WG-META-005', 'P/E/E'],
  ['WG-META-005B', 'Mass-change maintenance script', 'WG-META-005', 'E/N/N'],
  [
    'WG-CMD-001A',
    'Function and callable command identity',
    'WG-CMD-001',
    'E/P/P',
  ],
  [
    'WG-CMD-001B',
    'Ordered command-handler interception',
    'WG-CMD-001',
    'E/E/P',
  ],
  [
    'WG-CMD-004A1',
    'Key-binding declaration and platform normalization',
    'WG-CMD-004',
    'E/P/E',
  ],
  [
    'WG-CMD-004A2',
    'Declarative menu tree, predicates, and resolved command presentation',
    'WG-CMD-004',
    'E/N/P',
  ],
  [
    'WG-CMD-004B',
    'Resolved active-shortcut metadata and accessible command discovery',
    'WG-CMD-004',
    'P/P/P',
  ],
  [
    'WG-CMD-002A',
    'Pure transaction command specifications',
    'WG-CMD-002',
    'E/E/P',
  ],
  ['WG-CMD-002B', 'DOM-dependent imperative commands', 'WG-CMD-002', 'E/P/E'],
  ['WG-CMD-003A1', 'Text insertion commands', 'WG-CMD-003A', 'E/E/P'],
  ['WG-CMD-003A2', 'Text and range deletion commands', 'WG-CMD-003A', 'E/E/P'],
  ['WG-CMD-003A3', 'Block split and join commands', 'WG-CMD-003A', 'E/E/P'],
  ['WG-CMD-003B1A', 'Block type mutation', 'WG-CMD-003B', 'E/E/E'],
  ['WG-CMD-003B1B', 'Block wrapping', 'WG-CMD-003B', 'E/E/E'],
  ['WG-CMD-003B1C', 'Block unwrapping', 'WG-CMD-003B', 'E/E/E'],
  ['WG-CMD-003C1', 'Explicit list toggle behavior', 'WG-CMD-003C', 'E/N/E'],
  [
    'WG-CMD-003C2',
    'Delete and break list-join behavior',
    'WG-CMD-003C',
    'E/P/E',
  ],
  ['WG-CMD-003B2A', 'Text-alignment mutation', 'WG-CMD-003B', 'E/N/E'],
  ['WG-CMD-003B2B', 'Text-direction mutation', 'WG-CMD-003B', 'E/N/A'],
  ['WG-CMD-003D1', 'Mark toggle mutations', 'WG-CMD-003D', 'E/P/E'],
  [
    'WG-CMD-003D2',
    'Dedicated mark-range eligibility query',
    'WG-CMD-003D',
    'E/P/P',
  ],
  ['WG-CMD-003E1', 'Selection mutation commands', 'WG-CMD-003E', 'E/E/P'],
  [
    'WG-CMD-003E2',
    'Logical cursor-movement command surface',
    'WG-CMD-003E',
    'E/E/P',
  ],
  [
    'WG-COLLAB-002A',
    'Pairwise change transformation',
    'WG-COLLAB-002',
    'E/E/N',
  ],
  [
    'WG-COLLAB-002B',
    'Shared effects and collaborative corrections',
    'WG-COLLAB-002',
    'E/E/N',
  ],
  [
    'WG-COLLAB-002C',
    'Central-authority server transformation helper',
    'WG-COLLAB-002',
    'E/P/N',
  ],
  [
    'WG-DOC-001B',
    'Persistent document construction snapshot and collection ownership',
    'WG-DOC-001',
    'P/E/P',
  ],
  ['WG-DOC-001A', 'Nominal Leaf and Plot node model', 'WG-DOC-001', 'E/P/P'],
  [
    'WG-DOC-001C',
    'Privileged schema-bound primary document root',
    'WG-DOC-001',
    'E/E/P',
  ],
  ['WG-DOC-002A', 'Node flags and type classification', 'WG-DOC-002', 'E/P/P'],
  [
    'WG-DOC-002B',
    'Hierarchical grammar groups and queries',
    'WG-DOC-002',
    'E/E/P',
  ],
  ['WG-DOC-002C', 'Semantic node roles', 'WG-DOC-002', 'E/P/E'],
  ['WG-DOC-002D', 'Runtime-configured atom semantics', 'WG-DOC-002', 'E/E/P'],
  [
    'WG-DOC-003A',
    'Ranked mark representation and precedence',
    'WG-DOC-003',
    'P/P/E',
  ],
  ['WG-DOC-003B', 'Immutable mark-set algebra', 'WG-DOC-003', 'P/E/N'],
  [
    'WG-DOC-005A',
    'Recursive schema-owned document construction and fill',
    'WG-DOC-005',
    'E/E/P',
  ],
  ['WG-DOC-005B', 'Node equality', 'WG-DOC-005', 'E/E/N'],
  ['WG-DOC-005C', 'Adjacent-text canonicalization', 'WG-DOC-005', 'P/E/N'],
  ['WG-DOC-017A', 'Deep-equality helper', 'WG-DOC-017', 'E/E/N'],
  ['WG-DOC-017B', 'Validation errors and diagnostics', 'WG-DOC-017', 'E/E/N'],
  [
    'WG-DOC-014A',
    'Immutable DOM element, fragment, and attribute host representation',
    'WG-DOC-014',
    'P/P/P',
  ],
  [
    'WG-DOC-014B',
    'Schema-owned render and parse shape contract',
    'WG-DOC-014',
    'E/P/P',
  ],
  [
    'WG-DOC-015A',
    'Schema-derived ranked parse-rule set',
    'WG-DOC-015',
    'E/E/E',
  ],
  ['WG-DOC-015B', 'Full-document DOM parsing', 'WG-DOC-015', 'E/E/E'],
  [
    'WG-DOC-015C',
    'Contextual open-slice parsing, parent guessing, and fitting',
    'WG-DOC-015',
    'E/E/P',
  ],
  [
    'WG-HIST-001A',
    'Undo branches, selection restoration, and effect inversion',
    'WG-HIST-001',
    'E/E/P',
  ],
  [
    'WG-STATE-009A',
    'Custom selection-kind registration and runtime dispatch',
    'WG-STATE-009',
    'P/E/P',
  ],
  [
    'WG-STATE-009B',
    'Persisted selection codec and version envelope',
    'WG-STATE-009',
    'P/E/P',
  ],
  [
    'WG-STATE-014A',
    'Vertical line motion and retained goal column',
    'WG-STATE-014',
    'E/E/N',
  ],
  ['WG-STATE-014B', 'Page-motion authoring policy', 'WG-STATE-014', 'P/A/N'],
  [
    'WG-VIEW-003A',
    'Pending-versus-flushed transaction state and mapped scroll target',
    'WG-VIEW-003',
    'P/E/P',
  ],
  [
    'WG-VIEW-003B',
    'Measured editor and content geometry snapshot',
    'WG-VIEW-003',
    'P/P/P',
  ],
  [
    'WG-VIEW-005B1',
    'Mapped positional anchor primitive',
    'WG-VIEW-005B',
    'P/E/P',
  ],
  [
    'WG-VIEW-005B2',
    'Packed bulk point and range storage and mapping',
    'WG-VIEW-005B',
    'P/P/A',
  ],
  ['WG-PRODUCT-001A2A', 'Paragraph node identity', 'WG-PRODUCT-001A', 'E/N/E'],
  [
    'WG-PRODUCT-003A2A',
    'Paragraph type-switch behavior',
    'WG-PRODUCT-003A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-001A2B',
    'Code-block node identity and language property',
    'WG-PRODUCT-001A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003A2B',
    'Code-block editing, conversion, and fenced-input behavior',
    'WG-PRODUCT-003A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-001A2C',
    'Text-alignment property identity',
    'WG-PRODUCT-001A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003A2C',
    'Text-alignment commands, values, and codecs',
    'WG-PRODUCT-003A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-001A2D',
    'Persisted block-direction property identity',
    'WG-PRODUCT-001A',
    'E/N/A',
  ],
  [
    'WG-PRODUCT-003A2D',
    'Block-direction commands and visual projection',
    'WG-PRODUCT-003A',
    'P/N/A',
  ],
  ['WG-PRODUCT-001A2E', 'Blockquote node identity', 'WG-PRODUCT-001A', 'E/N/E'],
  [
    'WG-PRODUCT-003A2E',
    'Blockquote wrapping, lift, and input-rule behavior',
    'WG-PRODUCT-003A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-001A2F',
    'Horizontal-rule node identity',
    'WG-PRODUCT-001A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003A2F',
    'Horizontal-rule insertion and input-rule behavior',
    'WG-PRODUCT-003A',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-001A2G',
    'Hard line-break representation',
    'WG-PRODUCT-001A',
    'E/E/E',
  ],
  [
    'WG-PRODUCT-003A2G',
    'Hard line-break insertion behavior',
    'WG-PRODUCT-003A',
    'E/E/E',
  ],
  ['WG-PRODUCT-003B1', 'Semantic mark behavior', 'WG-PRODUCT-003B', 'E/N/E'],
  [
    'WG-PRODUCT-003B2',
    'Text and background color behavior',
    'WG-PRODUCT-003B',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003D1A',
    'Link add, remove, and key-binding behavior',
    'WG-PRODUCT-003D',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003D1B',
    'Link editing dialog and menu presentation',
    'WG-PRODUCT-003D',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003D2',
    'Cursor link-target tooltip behavior',
    'WG-PRODUCT-003D',
    'E/N/E',
  ],
  [
    'WG-PRODUCT-003D3',
    'Paste URL over selection behavior',
    'WG-PRODUCT-003D',
    'E/N/E',
  ],
  ['WG-PRODUCT-004A1', 'Image-upload host policy', 'WG-PRODUCT-004A', 'E/N/E'],
  [
    'WG-PRODUCT-004A2',
    'Image-insertion dialog policy',
    'WG-PRODUCT-004A',
    'E/N/E',
  ],
  ['WG-PROOF-001A', 'Document structure proof', 'WG-PROOF-001', 'P/E/P'],
  ['WG-PROOF-001B', 'Document change algebra proof', 'WG-PROOF-001', 'P/E/P'],
  [
    'WG-PROOF-001C',
    'Schema grammar and validation proof',
    'WG-PROOF-001',
    'P/E/P',
  ],
  [
    'WG-PROOF-001D',
    'Property-based document law proof',
    'WG-PROOF-001',
    'P/E/P',
  ],
  ['WG-PROOF-002A1', 'State transition proof', 'WG-PROOF-002', 'P/E/P'],
  ['WG-PROOF-002A2', 'Selection behavior proof', 'WG-PROOF-002', 'P/E/P'],
  [
    'WG-PROOF-002A3',
    'Command dispatch and transaction proof',
    'WG-PROOF-002',
    'P/E/P',
  ],
  [
    'WG-PROOF-002A4',
    'Correction and normalization proof',
    'WG-PROOF-002',
    'P/E/P',
  ],
  ['WG-PROOF-002B', 'History proof', 'WG-PROOF-002', 'P/E/P'],
  ['WG-PROOF-002C', 'Collaboration proof', 'WG-PROOF-002', 'P/E/P'],
  [
    'WG-PROOF-004A',
    'Desktop editor and DOM browser proof',
    'WG-PROOF-004',
    'P/E/E',
  ],
  [
    'WG-PROOF-004B',
    'Selection, input, and composition browser proof',
    'WG-PROOF-004',
    'P/E/E',
  ],
  ['WG-PROOF-004C', 'Raw iOS and Android input proof', 'WG-PROOF-004', 'A/P/P'],
  ['WG-STATE-001A', 'Immutable editor state', 'WG-STATE-001', 'P/E/P'],
  [
    'WG-STATE-001B',
    'Observational purity of state snapshots across transport and persistence reads',
    'WG-STATE-001',
    'P/E/P',
  ],
  [
    'WG-STATE-002A',
    'Typed state-field declaration and update',
    'WG-STATE-002',
    'E/E/P',
  ],
  [
    'WG-STATE-002B',
    'State-field JSON persistence and version boundary',
    'WG-STATE-002',
    'P/E/P',
  ],
  [
    'WG-STATE-006A',
    'Transaction specifications and sequential merge',
    'WG-STATE-006',
    'E/E/P',
  ],
  [
    'WG-STATE-006B',
    'Failure-atomic transaction state resolution and publication',
    'WG-STATE-006',
    'P/E/P',
  ],
  [
    'WG-STATE-010A',
    'Selection ranges, mapping, and affinity',
    'WG-STATE-010',
    'E/E/P',
  ],
  [
    'WG-STATE-010B',
    'Active marks and selection replacement',
    'WG-STATE-010',
    'E/E/P',
  ],
  ['WG-STATE-011A', 'Textblock projection', 'WG-STATE-011', 'E/E/N'],
  [
    'WG-STATE-011B',
    'Grapheme, word, and logical movement',
    'WG-STATE-011',
    'E/E/N',
  ],
  [
    'WG-STATE-015A',
    'Transaction annotations and combination',
    'WG-STATE-015',
    'E/E/P',
  ],
  [
    'WG-STATE-015B',
    'Mapped effects, inversion, history, and collaboration policy',
    'WG-STATE-015',
    'E/E/P',
  ],
  [
    'WG-TABLE-004A',
    'Cell-selection kind, mapping, and normalization',
    'WG-TABLE-004',
    'E/P/E',
  ],
  ['WG-TABLE-004B', 'Cell-selection DOM projection', 'WG-TABLE-004', 'E/N/E'],
  [
    'WG-TABLE-007A',
    'Accessible table dimension picker and insertion',
    'WG-TABLE-007',
    'E/N/E',
  ],
  [
    'WG-TABLE-007B',
    'Table manipulation menu projection',
    'WG-TABLE-007',
    'E/N/E',
  ],
  [
    'WG-VIEW-001A',
    'Imperative editor and view lifecycle',
    'WG-VIEW-001',
    'E/E/E',
  ],
  [
    'WG-VIEW-004A1',
    'Incremental DOM projection and subtree identity reuse',
    'WG-VIEW-004',
    'E/E/P',
  ],
  [
    'WG-VIEW-004A2',
    'Private nominal imperative Tile machinery',
    'WG-VIEW-004',
    'E/A/A',
  ],
  ['WG-VIEW-004A3', 'Large-document bounded mounting', 'WG-VIEW-004', 'A/E/P'],
  [
    'WG-VIEW-004B',
    'Composition and mounted-DOM identity preservation',
    'WG-VIEW-004',
    'E/E/E',
  ],
  ['WG-VIEW-005A1', 'Decoration public model', 'WG-VIEW-005A', 'E/E/P'],
  [
    'WG-VIEW-005A2',
    'Widget public model and lifecycle',
    'WG-VIEW-005A',
    'E/E/P',
  ],
  ['WG-VIEW-005C1', 'Decoration invalidation', 'WG-VIEW-005C', 'E/E/P'],
  [
    'WG-VIEW-005C2',
    'Heap-merged decoration iteration',
    'WG-VIEW-005C',
    'E/P/P',
  ],
  ['WG-VIEW-007A', 'DOM selection import and export', 'WG-VIEW-007', 'E/E/P'],
  [
    'WG-VIEW-007B1',
    'Focus acquisition and replay lifecycle',
    'WG-VIEW-007',
    'P/E/P',
  ],
  ['WG-VIEW-007B2', 'Model-to-DOM selection replay', 'WG-VIEW-007', 'E/E/P'],
  ['WG-VIEW-008B1', 'Resize observation', 'WG-VIEW-008B', 'P/E/P'],
  ['WG-VIEW-008B2', 'Scroll observation', 'WG-VIEW-008B', 'P/E/P'],
  [
    'WG-VIEW-008B3',
    'Tooltip host visibility observation',
    'WG-VIEW-008B',
    'P/N/P',
  ],
  ['WG-VIEW-009A', 'Beforeinput command routing', 'WG-VIEW-009', 'E/E/E'],
  [
    'WG-VIEW-010B1',
    'Keyboard routing and virtual-key arbitration',
    'WG-VIEW-010B',
    'P/E/E',
  ],
  ['WG-VIEW-010B2', 'Pointer selection routing', 'WG-VIEW-010B', 'P/E/E'],
  [
    'WG-VIEW-010C1A',
    'Generic browser drag-and-drop routing',
    'WG-VIEW-010C',
    'P/E/P',
  ],
  [
    'WG-VIEW-010C1B',
    'Plate block and product drag-and-drop policy',
    'WG-VIEW-010C',
    'N/P/E',
  ],
  ['WG-VIEW-010C2', 'Copy, cut, and paste routing', 'WG-VIEW-010C', 'E/E/E'],
  [
    'WG-VIEW-011A',
    'Contextual clipboard fragment and slice',
    'WG-VIEW-011',
    'E/E/E',
  ],
  [
    'WG-VIEW-011B',
    'Browser HTML clipboard wire encoding and decoding',
    'WG-VIEW-011',
    'P/E/E',
  ],
  [
    'WG-VIEW-012C1A',
    'Host component DOM callback surface',
    'WG-VIEW-012C',
    'P/E/P',
  ],
  [
    'WG-VIEW-012C1B',
    'Extension-contributed ordered and preventable DOM handlers',
    'WG-VIEW-012C',
    'P/P/E',
  ],
  [
    'WG-VIEW-012C2',
    'Passive observers before handlers and listener lifecycle',
    'WG-VIEW-012C',
    'P/P/P',
  ],
  ['WG-VIEW-012A1A', 'Platform hotkey normalization', 'WG-VIEW-012A', 'P/E/P'],
  [
    'WG-VIEW-012A1B',
    'Key-binding precedence compilation',
    'WG-VIEW-012A',
    'P/P/E',
  ],
  ['WG-VIEW-012A1C', 'Runtime key-binding dispatch', 'WG-VIEW-012A', 'P/P/E'],
  ['WG-VIEW-012A2', 'Built-in editing keymap policy', 'WG-VIEW-012A', 'P/N/E'],
  ['WG-VIEW-014A1', 'Panels', 'WG-VIEW-014A', 'P/N/E'],
  ['WG-VIEW-014A2', 'Dialogs', 'WG-VIEW-014A', 'P/N/P'],
  [
    'WG-VIEW-014C1',
    'Tooltip model, positioning, and view lifecycle',
    'WG-VIEW-014C',
    'P/N/P',
  ],
  [
    'WG-VIEW-014C2',
    'Asynchronous hover-source, state, and pointer lifecycle',
    'WG-VIEW-014C',
    'P/N/P',
  ],
  ['WG-VIEW-015A', 'Placeholder projection', 'WG-VIEW-015', 'P/E/E'],
  ['WG-VIEW-015B1', 'Local caret projection', 'WG-VIEW-015', 'P/E/P'],
  ['WG-VIEW-015B2', 'Remote cursor overlay', 'WG-VIEW-015', 'A/P/E'],
  ['WG-VIEW-015C', 'Drop cursor projection', 'WG-VIEW-015', 'P/P/E'],
  [
    'WG-VIEW-016A',
    'Whole-plugin lifecycle deactivation after failure',
    'WG-VIEW-016',
    'P/A/P',
  ],
  [
    'WG-VIEW-016B',
    'Per-view-source fault boundary and error sink',
    'WG-VIEW-016',
    'A/E/P',
  ],
]);

const siteDefinitions = Object.freeze([
  [
    'WG-WEB-001',
    'Source-derived public API reference generation',
    'documentation',
    'WGS-META-001',
    'P/N/N',
  ],
  [
    'WG-WEB-002',
    'Staged static-site publication and rollback',
    'documentation',
    'WGS-META-008',
    'P/N/N',
  ],
  [
    'WG-WEB-003',
    'Reference search, ranking, and trail navigation',
    'documentation',
    'WGS-META-003',
    'P/N/E',
  ],
  [
    'WG-META-002B',
    'Namespace-output rewrite and cross-bundler dead-code elimination',
    'meta',
    'WGS-META-007',
    'P/P/P',
  ],
  [
    'WG-DOC-004B1',
    'Schema relationship overrides',
    'schema',
    'WGS-SCHEMA-003',
    'E/P/P',
  ],
  [
    'WG-DOC-004B2',
    'Schema-specific command adaptation',
    'schema',
    'WGS-SCHEMA-003',
    'E/P/P',
  ],
  [
    'WG-STATE-003A',
    'Typed facet declaration, combination, and precedence',
    'state',
    'WGS-CONFIG-001',
    'E/E/N',
  ],
  [
    'WG-STATE-003B',
    'Dependency-tracked computed facet providers',
    'state',
    'WGS-CONFIG-002',
    'E/E/N',
  ],
  [
    'WG-STATE-004A',
    'Recursive extension trees and feature-local bundles',
    'state',
    'WGS-CONFIG-003',
    'E/E/E',
  ],
  [
    'WG-STATE-004B',
    'Extension identity deduplication and precedence bands',
    'state',
    'WGS-CONFIG-004',
    'E/E/E',
  ],
  [
    'WG-STATE-005A',
    'Whole-root transactional reconfiguration',
    'state',
    'WGS-CONFIG-005',
    'E/P/P',
  ],
  [
    'WG-STATE-005B',
    'Append-only transactional configuration injection',
    'state',
    'WGS-CONFIG-006',
    'E/P/P',
  ],
  [
    'WG-STATE-005C',
    'Named-slot transactional reconfiguration',
    'state',
    'WGS-CONFIG-007',
    'E/E/P',
  ],
  [
    'WG-STATE-007A',
    'Universal same-transaction extenders',
    'state',
    'WGS-TX-002',
    'E/P/P',
  ],
  [
    'WG-STATE-007B',
    'Follow-up transaction appenders',
    'state',
    'WGS-TX-003',
    'E/P/P',
  ],
  [
    'WG-VIEW-013A',
    'Always-active extension-local style modules',
    'view',
    'WGS-STYLE-001',
    'P/N/P',
  ],
  [
    'WG-VIEW-013B',
    'Editor-scoped opt-in themes',
    'view',
    'WGS-STYLE-002',
    'P/P/P',
  ],
  [
    'WG-VIEW-013C',
    'Color-scheme and root stylesheet publication',
    'view',
    'WGS-STYLE-003',
    'P/P/P',
  ],
  [
    'WG-VIEW-013D',
    'Editor DOM attributes and layout contracts',
    'view',
    'WGS-STYLE-004',
    'E/P/E',
  ],
  [
    'WG-INTEGRATION-NESTED-001',
    'Editable nested content ownership and selection integration',
    'integration',
    'WGS-NESTED-001',
    'E/E/P',
  ],
  [
    'WG-INTEGRATION-NESTED-002A',
    'Parent-owned content-root history and focus navigation',
    'integration',
    'WGS-NESTED-002',
    'E/E/A',
  ],
  [
    'WG-INTEGRATION-NESTED-002B',
    'Nested-editor tooltip reuse and synchronous flush',
    'integration',
    'WGS-NESTED-002',
    'E/N/N',
  ],
  [
    'WG-APPLICATION-BLAME-001',
    'Persistent origin attribution through document gaps',
    'application-state',
    'WGS-BLAME-001',
    'E/P/P',
  ],
  [
    'WG-APPLICATION-BLAME-002',
    'Cached decoration projection of attribution state',
    'application-state',
    'WGS-BLAME-002',
    'E/P/A',
  ],
  [
    'WG-PROOF-005A1A',
    'Registry example source compilation',
    'proof',
    'WGS-PROOF-001',
    'P/P/E',
  ],
  [
    'WG-PROOF-005A1B',
    'Copied registry source installability',
    'proof',
    'WGS-PROOF-001',
    'P/P/E',
  ],
  [
    'WG-PROOF-005A2',
    'Executable-example behavior integrity',
    'proof',
    'WGS-PROOF-001',
    'P/P/P',
  ],
  [
    'WG-PROOF-005B1',
    'Source-derived public symbol and reference completeness',
    'proof',
    'WGS-PROOF-002',
    'P/P/P',
  ],
  [
    'WG-PROOF-005B2',
    'Internal docs route and navigation integrity',
    'proof',
    'WGS-PROOF-002',
    'P/N/E',
  ],
  [
    'WG-PROOF-005B3A',
    'Source-backed sample extraction and injection',
    'proof',
    'WGS-PROOF-002',
    'E/N/P',
  ],
  [
    'WG-PROOF-005B3B',
    'Injected sample compilation',
    'proof',
    'WGS-PROOF-002',
    'P/N/P',
  ],
]);

const localDefinitions = Object.freeze([
  {
    id: 'LOCAL-COMPLETION-LIFECYCLE',
    title:
      'Feature-owned completion query, suggestion, accept, and cancel lifecycle',
    lane: 'integration',
    origin: 'shared',
    status: 'A/N/P',
    sources: {
      wordgard: [],
      plite: [],
      plate: ['PL-AI-01', 'PL-COMBO-01', 'PL-PRODUCT-02'],
    },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-VERTICAL-WRITING-LAYOUT',
    title:
      'CSS vertical-rl/lr layout, ruby, mixed orientation, geometry, and navigation',
    lane: 'view',
    origin: 'reference',
    status: 'A/A/A',
    sources: { wordgard: [], plite: [], plate: [] },
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    proofAdaptation: 'defer',
    referenceAdaptation: 'defer',
    verdict: 'defer',
  },
  {
    id: 'LOCAL-VERTICAL-WRITING-INPUT',
    title:
      'Vertical-mode caret, selection, key routing, composition, and IME reconciliation',
    lane: 'input',
    origin: 'reference',
    status: 'A/A/A',
    sources: { wordgard: [], plite: [], plate: [] },
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    proofAdaptation: 'defer',
    referenceAdaptation: 'defer',
    verdict: 'defer',
  },
  {
    id: 'LOCAL-OFFLINE-MERGE-REVIEW',
    title:
      'User-visible offline change attribution, review, and adjustment atop convergence',
    lane: 'collaboration',
    origin: 'reference',
    status: 'A/P/P',
    sources: {
      wordgard: [],
      plite: ['PL-26'],
      plate: ['PL-COLLAB-01', 'PL-CMD-02'],
    },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'defer',
  },
  {
    id: 'LOCAL-HOST-EDITOR-CAPABILITY',
    title:
      'Typed headless editor capability across DOM, React, virtualized, native, and canvas hosts',
    lane: 'integration',
    origin: 'reference',
    status: 'P/P/P',
    sources: {
      wordgard: ['WG-VIEW-001', 'WG-CMD-002', 'WG-STATE-001'],
      plite: ['PL-14', 'PL-16', 'PL-21', 'PL-23', 'PL-27'],
      plate: ['PL-CAP-01', 'PL-REACT-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY',
    title:
      'Separately owned Markdown parse/serialize module integrated through host codecs',
    lane: 'serialization',
    origin: 'reference',
    status: 'A/P/E',
    sources: { wordgard: [], plite: ['PL-20'], plate: ['PL-CODEC-04'] },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-EXTERNAL-MODEL-SYNC',
    title:
      'Bidirectional external-model synchronization over committed editor transactions',
    lane: 'integration',
    origin: 'reference',
    status: 'P/P/P',
    sources: {
      wordgard: ['WG-VIEW-001', 'WG-STATE-006'],
      plite: ['PL-19', 'PL-05'],
      plate: ['PL-REACT-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-DOC-ROOTS',
    title: 'Named and element-owned document roots',
    lane: 'document',
    origin: 'Plite',
    status: 'A/E/P',
    sources: { wordgard: [], plite: ['PL-01'], plate: ['PL-SCHEMA-01'] },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-ANCHORS',
    title:
      'Runtime identities, anchors, and transaction-scoped draft references',
    lane: 'document',
    origin: 'Plite',
    status: 'P/E/P',
    sources: {
      wordgard: ['WG-DOC-006'],
      plite: ['PL-03', 'PL-08'],
      plate: ['PL-DOM-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-SCHEMA-IDENTITY',
    title: 'Canonical schema fingerprints and named persistence identity',
    lane: 'schema',
    origin: 'Plite/Plate',
    status: 'P/E/E',
    sources: {
      wordgard: ['WG-DOC-004'],
      plite: ['PL-09'],
      plate: ['PL-SCHEMA-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-EXTENSION-CAPABILITIES',
    title: 'Typed extension and plugin capability groups',
    lane: 'state',
    origin: 'Plite/Plate',
    status: 'P/E/E',
    sources: {
      wordgard: ['WG-STATE-004'],
      plite: ['PL-14', 'PL-16'],
      plate: ['PL-DESC-04', 'PL-CAP-01', 'PL-CTX-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-COMMIT-IMPACT-METADATA',
    title: 'Lazy commit impact metadata and queries',
    lane: 'state',
    origin: 'Plite',
    status: 'P/E/P',
    sources: {
      wordgard: ['WG-STATE-006'],
      plite: ['PL-19'],
      plate: ['PL-REACT-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS',
    title: 'Commit-scoped React subscription invalidation',
    lane: 'view',
    origin: 'Plite',
    status: 'A/E/P',
    sources: {
      wordgard: [],
      plite: ['PL-19', 'PL-23'],
      plate: ['PL-REACT-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-REACT-HOST',
    title: 'React renderer and provider host',
    lane: 'view',
    origin: 'Plite',
    status: 'A/E/E',
    sources: {
      wordgard: [],
      plite: ['PL-23'],
      plate: ['PL-RENDER-01', 'PL-REACT-01', 'PL-OPT-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-YJS',
    title: 'Yjs bridge, awareness, relative selections, and schema envelope',
    lane: 'collaboration',
    origin: 'Plite',
    status: 'A/E/P',
    sources: { wordgard: [], plite: ['PL-26'], plate: ['PL-COLLAB-01'] },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-LAYOUT-PLAN',
    title: 'Headless page and layout plan',
    lane: 'view',
    origin: 'Plite',
    status: 'P/E/A',
    sources: {
      wordgard: ['WG-VIEW-004'],
      plite: ['PL-27'],
      plate: ['PL-RENDER-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-LAYOUT-GEOMETRY',
    title: 'Projected page geometry',
    lane: 'view',
    origin: 'Plite',
    status: 'P/E/A',
    sources: {
      wordgard: ['WG-VIEW-004'],
      plite: ['PL-27'],
      plate: ['PL-RENDER-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-A11Y-ANNOUNCEMENTS',
    title: 'Assistive announcement channel and live region',
    lane: 'view',
    origin: 'Plite/Plate',
    status: 'A/E/A',
    sources: {
      wordgard: ['WG-VIEW-001'],
      plite: ['PL-32'],
      plate: ['PL-REACT-02'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-A11Y-DOM-COVERAGE',
    title: 'Partial-DOM accessibility coverage boundaries',
    lane: 'view',
    origin: 'Plite',
    status: 'A/E/P',
    sources: { wordgard: [], plite: ['PL-32'], plate: ['PL-REACT-02'] },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-HYPERSCRIPT',
    title: 'Typed hyperscript and fixture authoring',
    lane: 'proof',
    origin: 'Plite',
    status: 'P/E/P',
    sources: {
      wordgard: ['WG-PROOF-001'],
      plite: ['PL-28'],
      plate: ['PL-PROOF-01'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-PROOF-AFFECTED-CHECKS',
    title: 'Affected development checks and strict handoff checks',
    lane: 'proof',
    origin: 'Plite/Plate',
    status: 'P/E/E',
    sources: {
      wordgard: ['WG-META-003'],
      plite: ['PL-29'],
      plate: ['PL-PROOF-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-PROOF-BROWSER-COVERAGE',
    title: 'Browser fingerprints and exact behavior coverage',
    lane: 'proof',
    origin: 'Plite/Plate',
    status: 'P/E/E',
    sources: {
      wordgard: ['WG-META-003'],
      plite: ['PL-29', 'PL-30'],
      plate: ['PL-PROOF-01'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-PROOF-CI-MATRIX',
    title: 'CI engine matrix and retained proof artifacts',
    lane: 'proof',
    origin: 'Plite/Plate',
    status: 'A/E/E',
    sources: {
      wordgard: [],
      plite: ['PL-29', 'PL-30'],
      plate: ['PL-PROOF-01', 'PL-PROOF-02'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-PROOF-TRACE-REDUCTION',
    title: 'Trace-reduction candidate generation',
    lane: 'proof',
    origin: 'Plite',
    status: 'A/E/P',
    sources: { wordgard: [], plite: ['PL-30'], plate: ['PL-PROOF-01'] },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-PROOF-RELEASE-GATES',
    title: 'Benchmark and release artifact gates',
    lane: 'proof',
    origin: 'Plite/Plate',
    status: 'P/E/E',
    sources: {
      wordgard: ['WG-META-003'],
      plite: ['PL-29', 'PL-30'],
      plate: ['PL-PROOF-01', 'PL-PROOF-02'],
    },
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  {
    id: 'PLATE-PLUGIN-IDENTITY',
    title: 'Plugin name versus persisted AST identity',
    lane: 'plugin',
    origin: 'Plate',
    status: 'P/E/P',
    sources: {
      wordgard: ['WG-DOC-001'],
      plite: ['PL-13', 'PL-14'],
      plate: ['PL-DESC-01', 'PL-DESC-02', 'PL-DESC-03'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'rearchitect',
    priority: 'P0',
    dossier: 'honest-plugin-and-persisted-identity',
  },
  {
    id: 'PLATE-HEADING-ONTOLOGY',
    title: 'Semantic heading identity and level variants',
    lane: 'schema',
    origin: 'shared',
    status: 'E/N/E',
    sources: {
      wordgard: ['WG-PRODUCT-001A', 'WG-PRODUCT-003A'],
      plite: ['PL-11'],
      plate: ['PL-SCHEMA-02', 'PL-FEATURE-01'],
    },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL',
    title: 'Grammar-owned defaults versus global defaultBlockType',
    lane: 'schema',
    origin: 'Plite/Plate',
    status: 'E/E/P',
    sources: {
      wordgard: ['WG-DOC-005'],
      plite: ['PL-10', 'PL-11'],
      plate: ['PL-SCHEMA-03'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'hard-cut',
    priority: 'P1',
    dossier: 'grammar-owned-defaults',
  },
  {
    id: 'LOCAL-LIFECYCLE-PHASE',
    title: 'Rollbackable publication versus isolated post-commit observers',
    lane: 'state',
    origin: 'shared',
    status: 'P/P/P',
    sources: {
      wordgard: ['WG-STATE-001', 'WG-STATE-006', 'WG-VIEW-001'],
      plite: ['PL-13'],
      plate: ['PL-DESC-05'],
    },
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'rearchitect',
    priority: 'P0',
    dossier: 'honest-lifecycle-phases',
  },
  {
    id: 'LOCAL-HISTORY-IDLE-GROUP',
    title: 'Idle-time boundary for automatic history grouping',
    lane: 'history',
    origin: 'reference',
    status: 'E/A/N',
    sources: { wordgard: ['WG-HIST-001'], plite: ['PL-25'], plate: [] },
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'steal',
    priority: 'P1',
    dossier: 'history-idle-boundary',
  },
  {
    id: 'LOCAL-MAX-LENGTH-POLICY',
    title: 'Max-length authoring policy ownership',
    lane: 'input',
    origin: 'Plite',
    status: 'A/P/P',
    sources: {
      wordgard: [],
      plite: ['PL-05', 'PL-06'],
      plate: ['PL-SCHEMA-03'],
    },
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'move',
    priority: 'P1',
    dossier: 'max-length-is-authoring-policy',
  },
  {
    id: 'PLATE-COPIED-KITS',
    title: 'Copied registry kits, demos, and descriptor dependencies',
    lane: 'product',
    origin: 'Plate',
    status: 'A/N/E',
    sources: {
      wordgard: [],
      plite: [],
      plate: ['PL-BND-02', 'PL-PRODUCT-01', 'PL-DOCS-01'],
    },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  {
    id: 'PLATE-STATIC-RENDERING',
    title: 'Server-safe static React and HTML rendering',
    lane: 'product',
    origin: 'Plate',
    status: 'A/N/E',
    sources: {
      wordgard: [],
      plite: [],
      plate: ['PL-RENDER-02', 'PL-RENDER-03', 'PL-PRODUCT-02'],
    },
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-RUNTIME-API-TREESHAKING',
    title: 'Namespace-like API discoverability with real ESM tree-shaking',
    lane: 'meta',
    origin: 'shared',
    status: 'P/P/P',
    sources: {
      wordgard: ['WG-META-002', 'WGS-META-007'],
      plite: ['PL-31'],
      plate: ['PL-BND-01'],
    },
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'hard-cut',
    priority: 'P1',
    dossier: 'esm-namespace-ergonomics',
  },
  {
    id: 'LOCAL-NATIVE-INPUT-RECONCILIATION',
    title: 'Canonical native DOM change reconciliation',
    lane: 'input',
    origin: 'shared',
    status: 'E/E/P',
    sources: {
      wordgard: ['WG-VIEW-009'],
      plite: ['PL-22'],
      plate: ['PL-INPUT-03'],
    },
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  {
    id: 'LOCAL-MATH-CSS-BOUNDARY',
    title: 'Explicit math CSS package boundary',
    lane: 'product',
    origin: 'Plate',
    status: 'A/N/P',
    sources: { wordgard: [], plite: [], plate: ['PL-FEATURE-02'] },
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'move',
    priority: 'P1',
    dossier: 'explicit-math-css',
  },
  {
    id: 'LOCAL-MEDIA-KEYBOARD-RESIZE',
    title: 'Keyboard-operable media resizing',
    lane: 'product',
    origin: 'Plate',
    status: 'E/N/P',
    sources: {
      wordgard: ['WG-PRODUCT-004B'],
      plite: [],
      plate: ['PL-MEDIA-01'],
    },
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'rearchitect',
    priority: 'P2',
    dossier: 'keyboard-media-resize',
  },
]);

const sourceGroups = Object.freeze([
  {
    ids: [
      'WG-META-001',
      'WG-META-002',
      'WG-META-002B',
      'WG-META-005A',
      'WG-META-005B',
    ],
    plite: ['PL-31'],
    plate: ['PL-BND-01'],
  },
  {
    ids: ['WG-META-003', 'WG-PROOF-004A', 'WG-PROOF-004B', 'WG-PROOF-004C'],
    plite: ['PL-29', 'PL-30'],
    plate: ['PL-PROOF-01', 'PL-PROOF-02'],
  },
  {
    ids: ['WG-META-004A', 'WG-META-004B', 'WG-WEB-001', 'WG-WEB-003'],
    plite: ['PL-31'],
    plate: ['PL-DOCS-01', 'PL-PRODUCT-02'],
  },
  {
    ids: ['WG-META-004D'],
    plite: [],
    plate: ['PL-DOCS-01'],
  },
  { ids: ['WG-WEB-002'], plite: ['PL-30'], plate: ['PL-PROOF-01'] },
  {
    ids: [
      'WG-PROOF-005A1A',
      'WG-PROOF-005A1B',
      'WG-PROOF-005A2',
      'WG-PROOF-005B1',
      'WG-PROOF-005B2',
      'WG-PROOF-005B3A',
      'WG-PROOF-005B3B',
    ],
    plite: ['PL-29', 'PL-30'],
    plate: ['PL-PROOF-01', 'PL-DOCS-01'],
  },
  {
    ids: ['WG-CMD-001A', 'WG-CMD-001B', 'WG-CMD-002A'],
    plite: ['PL-15'],
    plate: ['PL-CMD-01'],
  },
  {
    ids: ['WG-CMD-004A1'],
    plite: ['PL-15'],
    plate: ['PL-INPUT-01'],
  },
  {
    ids: ['WG-CMD-004A2'],
    plite: [],
    plate: ['PL-PRODUCT-01'],
  },
  {
    ids: ['WG-CMD-004B'],
    plite: ['PL-15'],
    plate: ['PL-INPUT-01'],
  },
  {
    ids: ['WG-CMD-002B'],
    plite: ['PL-15'],
    plate: ['PL-CMD-01', 'PL-INPUT-01'],
  },
  {
    ids: [
      'WG-CMD-003A1',
      'WG-CMD-003A2',
      'WG-CMD-003A3',
      'WG-CMD-003B1A',
      'WG-CMD-003B1B',
      'WG-CMD-003B1C',
    ],
    plite: ['PL-05', 'PL-06'],
    plate: ['PL-CMD-01', 'PL-FEATURE-01'],
  },
  {
    ids: ['WG-CMD-003B2A'],
    plite: [],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-CMD-003B2B'],
    plite: [],
    plate: [],
  },
  {
    ids: ['WG-CMD-003C1', 'WG-CMD-003C2'],
    plite: ['PL-05'],
    plate: ['PL-LIST-01'],
  },
  {
    ids: ['WG-CMD-003D1'],
    plite: ['PL-11'],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-CMD-003D2'],
    plite: ['PL-02', 'PL-11'],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-CMD-003E1'],
    plite: ['PL-05', 'PL-07'],
    plate: ['PL-SEL-01'],
  },
  {
    ids: ['WG-CMD-003E2'],
    plite: ['PL-07', 'PL-22'],
    plate: ['PL-SEL-01'],
  },
  {
    ids: ['WG-COLLAB-001'],
    plite: ['PL-26'],
    plate: [],
  },
  {
    ids: ['WG-COLLAB-002A'],
    plite: ['PL-04'],
    plate: [],
  },
  {
    ids: ['WG-COLLAB-002B'],
    plite: ['PL-12', 'PL-18'],
    plate: [],
  },
  {
    ids: ['WG-COLLAB-002C'],
    plite: ['PL-26'],
    plate: [],
  },
  {
    ids: ['WG-DOC-001A', 'WG-DOC-001C'],
    plite: ['PL-01'],
    plate: ['PL-SCHEMA-01'],
  },
  {
    ids: ['WG-DOC-001B'],
    plite: ['PL-01', 'PL-12'],
    plate: ['PL-SCHEMA-01'],
  },
  {
    ids: ['WG-DOC-002A', 'WG-DOC-002B', 'WG-DOC-002C', 'WG-DOC-002D'],
    plite: ['PL-09'],
    plate: ['PL-SCHEMA-01'],
  },
  {
    ids: ['WG-DOC-003A', 'WG-DOC-003B'],
    plite: ['PL-11'],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-DOC-004'],
    plite: ['PL-09', 'PL-10'],
    plate: ['PL-SCHEMA-01', 'PL-SCHEMA-03', 'PL-DESC-06'],
  },
  {
    ids: ['WG-DOC-005A'],
    plite: ['PL-09', 'PL-10'],
    plate: ['PL-SCHEMA-01', 'PL-SCHEMA-03'],
  },
  {
    ids: ['WG-DOC-004B1', 'WG-DOC-004B2'],
    plite: ['PL-09', 'PL-10'],
    plate: ['PL-DESC-01', 'PL-DESC-05'],
  },
  {
    ids: ['WG-DOC-005B', 'WG-DOC-005C', 'WG-DOC-017A', 'WG-DOC-017B'],
    plite: ['PL-01', 'PL-12'],
    plate: [],
  },
  { ids: ['WG-DOC-006', 'WG-DOC-018'], plite: ['PL-02'], plate: [] },
  { ids: ['WG-DOC-007'], plite: ['PL-03'], plate: [] },
  {
    ids: ['WG-DOC-008', 'WG-DOC-012'],
    plite: ['PL-10'],
    plate: ['PL-SCHEMA-01'],
  },
  {
    ids: ['WG-DOC-009', 'WG-DOC-010', 'WG-DOC-011'],
    plite: ['PL-04'],
    plate: [],
  },
  {
    ids: ['WG-DOC-013'],
    plite: ['PL-09', 'PL-18'],
    plate: ['PL-SCHEMA-01'],
  },
  {
    ids: [
      'WG-DOC-014A',
      'WG-DOC-014B',
      'WG-DOC-015A',
      'WG-DOC-015B',
      'WG-DOC-015C',
    ],
    plite: ['PL-20'],
    plate: ['PL-CODEC-01', 'PL-CODEC-02', 'PL-RENDER-03'],
  },
  {
    ids: ['WG-DOC-016'],
    plite: ['PL-20'],
    plate: ['PL-CODEC-01', 'PL-CODEC-02', 'PL-CODEC-03', 'PL-RENDER-03'],
  },
  {
    ids: ['WG-HIST-001A', 'WG-HIST-002', 'WG-HIST-003'],
    plite: ['PL-25'],
    plate: ['PL-DESC-04'],
  },
  {
    ids: [
      'WG-PRODUCT-001A2A',
      'WG-PRODUCT-001A2B',
      'WG-PRODUCT-001A2C',
      'WG-PRODUCT-001A2E',
      'WG-PRODUCT-001A2F',
      'WG-PRODUCT-001B',
    ],
    plite: [],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-PRODUCT-001A2D', 'WG-PRODUCT-003A2D'],
    plite: [],
    plate: [],
  },
  {
    ids: ['WG-PRODUCT-001A2G', 'WG-PRODUCT-003A2G'],
    plite: ['PL-02'],
    plate: ['PL-BND-01'],
  },
  {
    ids: [
      'WG-PRODUCT-001C',
      'WG-PRODUCT-003E',
      'WG-PRODUCT-004A1',
      'WG-PRODUCT-004A2',
      'WG-PRODUCT-004B',
    ],
    plite: [],
    plate: ['PL-MEDIA-01'],
  },
  {
    ids: [
      'WG-PRODUCT-001D',
      'WG-TABLE-001',
      'WG-TABLE-002',
      'WG-TABLE-003',
      'WG-TABLE-004A',
      'WG-TABLE-004B',
      'WG-TABLE-005',
      'WG-TABLE-006',
    ],
    plite: ['PL-09', 'PL-07', 'PL-10'],
    plate: ['PL-TABLE-01'],
  },
  {
    ids: ['WG-PRODUCT-002'],
    plite: ['PL-09', 'PL-13'],
    plate: ['PL-PRODUCT-01', 'PL-FEATURE-01'],
  },
  {
    ids: [
      'WG-PRODUCT-003A2A',
      'WG-PRODUCT-003A2B',
      'WG-PRODUCT-003A2C',
      'WG-PRODUCT-003A2E',
      'WG-PRODUCT-003A2F',
      'WG-PRODUCT-003B1',
      'WG-PRODUCT-003B2',
    ],
    plite: [],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-PRODUCT-003C'],
    plite: [],
    plate: ['PL-LIST-01'],
  },
  {
    ids: [
      'WG-PRODUCT-003D1A',
      'WG-PRODUCT-003D1B',
      'WG-PRODUCT-003D2',
      'WG-PRODUCT-003D3',
    ],
    plite: [],
    plate: ['PL-FEATURE-01'],
  },
  {
    ids: ['WG-PRODUCT-004C'],
    plite: [],
    plate: ['PL-FEATURE-01', 'PL-PRODUCT-02'],
  },
  {
    ids: ['WG-TABLE-007A', 'WG-TABLE-007B'],
    plite: [],
    plate: ['PL-TABLE-01', 'PL-PRODUCT-01'],
  },
  {
    ids: ['WG-PROOF-001A', 'WG-PROOF-001B', 'WG-PROOF-001C', 'WG-PROOF-001D'],
    plite: ['PL-04', 'PL-09', 'PL-11'],
    plate: ['PL-PROOF-01'],
  },
  {
    ids: [
      'WG-PROOF-002A1',
      'WG-PROOF-002A2',
      'WG-PROOF-002A3',
      'WG-PROOF-002A4',
    ],
    plite: ['PL-05', 'PL-06', 'PL-07', 'PL-12', 'PL-15'],
    plate: ['PL-PROOF-01'],
  },
  {
    ids: ['WG-PROOF-002B'],
    plite: ['PL-25'],
    plate: ['PL-PROOF-01'],
  },
  {
    ids: ['WG-PROOF-002C'],
    plite: ['PL-26'],
    plate: ['PL-PROOF-01'],
  },
  {
    ids: ['WG-PROOF-003'],
    plite: ['PL-09', 'PL-10'],
    plate: ['PL-TABLE-01', 'PL-PROOF-01'],
  },
  {
    ids: ['WG-STATE-001A', 'WG-STATE-001B', 'WG-STATE-006A', 'WG-STATE-006B'],
    plite: ['PL-05', 'PL-06'],
    plate: ['PL-DESC-05'],
  },
  {
    ids: ['WG-STATE-002A', 'WG-STATE-002B', 'WG-STATE-015A', 'WG-STATE-015B'],
    plite: ['PL-18'],
    plate: ['PL-DESC-04'],
  },
  {
    ids: ['WG-STATE-003A', 'WG-STATE-003B'],
    plite: ['PL-17'],
    plate: [],
  },
  {
    ids: ['WG-STATE-004A', 'WG-STATE-004B'],
    plite: ['PL-13', 'PL-14'],
    plate: ['PL-DESC-01', 'PL-DESC-04'],
  },
  {
    ids: ['WG-STATE-005A', 'WG-STATE-005B', 'WG-STATE-005C'],
    plite: ['PL-13'],
    plate: ['PL-DESC-05'],
  },
  {
    ids: ['WG-STATE-007A', 'WG-STATE-007B'],
    plite: ['PL-05', 'PL-14'],
    plate: ['PL-DESC-04'],
  },
  {
    ids: ['WG-STATE-008'],
    plite: ['PL-12'],
    plate: ['PL-DESC-04'],
  },
  {
    ids: ['WG-STATE-009A', 'WG-STATE-009B', 'WG-STATE-010A', 'WG-STATE-010B'],
    plite: ['PL-07'],
    plate: ['PL-SEL-01'],
  },
  {
    ids: ['WG-STATE-011A', 'WG-STATE-013', 'WG-STATE-014A', 'WG-STATE-014B'],
    plite: ['PL-07', 'PL-22'],
    plate: [],
  },
  {
    ids: ['WG-STATE-011B'],
    plite: ['PL-02', 'PL-07'],
    plate: [],
  },
  { ids: ['WG-STATE-012'], plite: [], plate: ['PL-PRODUCT-01'] },
  {
    ids: ['WG-VIEW-001A'],
    plite: ['PL-13', 'PL-23'],
    plate: ['PL-RENDER-01'],
  },
  { ids: ['WG-VIEW-002'], plite: ['PL-21'], plate: [] },
  {
    ids: ['WG-VIEW-003A', 'WG-VIEW-003B'],
    plite: ['PL-19', 'PL-24'],
    plate: ['PL-RENDER-01'],
  },
  {
    ids: ['WG-VIEW-004A1', 'WG-VIEW-004A2', 'WG-VIEW-004A3', 'WG-VIEW-004B'],
    plite: ['PL-23', 'PL-27'],
    plate: ['PL-RENDER-01'],
  },
  {
    ids: [
      'WG-VIEW-005A1',
      'WG-VIEW-005A2',
      'WG-VIEW-005B1',
      'WG-VIEW-005B2',
      'WG-VIEW-005C1',
      'WG-VIEW-005C2',
    ],
    plite: ['PL-24'],
    plate: ['PL-RENDER-01'],
  },
  {
    ids: [
      'WG-VIEW-006A',
      'WG-VIEW-006B',
      'WG-VIEW-007A',
      'WG-VIEW-007B1',
      'WG-VIEW-007B2',
      'WG-VIEW-008A',
      'WG-VIEW-008B1',
      'WG-VIEW-008B2',
      'WG-VIEW-008B3',
    ],
    plite: ['PL-21'],
    plate: ['PL-DOM-01'],
  },
  {
    ids: [
      'WG-VIEW-009A',
      'WG-VIEW-010A',
      'WG-VIEW-010B1',
      'WG-VIEW-010B2',
      'WG-VIEW-010C2',
      'WG-VIEW-012A1A',
      'WG-VIEW-012C1A',
      'WG-VIEW-012C2',
    ],
    plite: ['PL-22'],
    plate: ['PL-INPUT-01', 'PL-INPUT-03'],
  },
  {
    ids: ['WG-VIEW-010C1A', 'WG-VIEW-010C1B'],
    plite: ['PL-22'],
    plate: ['PL-INPUT-03', 'PL-PRODUCT-01'],
  },
  {
    ids: ['WG-VIEW-011A', 'WG-VIEW-011B'],
    plite: ['PL-20'],
    plate: ['PL-CODEC-05'],
  },
  {
    ids: ['WG-VIEW-012B'],
    plite: ['PL-15'],
    plate: ['PL-INPUT-02'],
  },
  {
    ids: ['WG-VIEW-012A1B', 'WG-VIEW-012A1C'],
    plite: ['PL-22'],
    plate: ['PL-INPUT-01', 'PL-FEATURE-01'],
  },
  {
    ids: ['WG-VIEW-012A2'],
    plite: [],
    plate: ['PL-INPUT-01', 'PL-FEATURE-01'],
  },
  {
    ids: ['WG-VIEW-012C1B'],
    plite: ['PL-22'],
    plate: ['PL-INPUT-03'],
  },
  {
    ids: ['WG-VIEW-013A', 'WG-VIEW-013B', 'WG-VIEW-013C', 'WG-VIEW-013D'],
    plite: ['PL-23'],
    plate: ['PL-RENDER-01', 'PL-REACT-01'],
  },
  {
    ids: [
      'WG-VIEW-014A1',
      'WG-VIEW-014A2',
      'WG-VIEW-014B',
      'WG-VIEW-014C1',
      'WG-VIEW-014C2',
      'WG-VIEW-015A',
      'WG-VIEW-015B1',
      'WG-VIEW-015B2',
      'WG-VIEW-015C',
    ],
    plite: ['PL-23', 'PL-24'],
    plate: ['PL-PRODUCT-01', 'PL-REACT-02'],
  },
  {
    ids: ['WG-VIEW-016A', 'WG-VIEW-016B'],
    plite: ['PL-13', 'PL-24'],
    plate: ['PL-DESC-05'],
  },
  {
    ids: ['WG-INTEGRATION-NESTED-001'],
    plite: ['PL-04', 'PL-07'],
    plate: ['PL-REACT-01'],
  },
  {
    ids: ['WG-INTEGRATION-NESTED-002A'],
    plite: ['PL-04', 'PL-25'],
    plate: ['PL-REACT-01'],
  },
  {
    ids: ['WG-INTEGRATION-NESTED-002B'],
    plite: [],
    plate: [],
  },
  {
    ids: ['WG-APPLICATION-BLAME-001'],
    plite: ['PL-04', 'PL-18'],
    plate: ['PL-COLLAB-02'],
  },
  {
    ids: ['WG-APPLICATION-BLAME-002'],
    plite: ['PL-18', 'PL-24'],
    plate: ['PL-RENDER-01'],
  },
]);

const sourceGroupById = new Map();
for (const group of sourceGroups) {
  for (const id of group.ids) {
    if (sourceGroupById.has(id)) {
      throw new Error(`Duplicate local source group for ${id}`);
    }
    sourceGroupById.set(id, { plate: group.plate, plite: group.plite });
  }
}

const semantic = (value) => {
  const parts = value.split('|').map((part) => part.trim());
  if (parts.length !== 6 || parts.some((part) => part.length < 12)) {
    throw new Error(
      `Semantic profile must contain six substantive claims: ${value}`
    );
  }
  return parts;
};

const semanticProfiles = new Map(
  Object.entries({
    'WG-META-001': semantic(
      'host-specific entrypoint layouts are sound | coherent subpaths expose host boundaries without namespace coupling | split packages preserve structural editor types | package owners isolate substrate DOM React and product code | no common import-cost benchmark exists | local package and browser integration is broader'
    ),
    'WG-META-002': semantic(
      'both pipelines emit runnable JavaScript and declarations | ordinary ESM avoids namespace-output surgery | compilation leaves AST data unchanged | shared workspace tooling beats a bespoke library compiler | Rollup-only rewriting has uncertain cross-bundler elimination | donor dead-code checks are sharp while local release gates are broader'
    ),
    'WG-CMD-002A': semantic(
      'sequential specifications preserve one atomic transaction | typed command groups infer payload and result | specifications carry intent rather than AST state | the substrate registry owns pure execution | one compiled dispatch path handles the sequence | local nested and rollback command proof is broader'
    ),
    'WG-CMD-002B': semantic(
      'both implementations gate host actions correctly | Plate commands expose focus scroll and UI actions without polluting core | imperative effects are not persisted | DOM and product hosts honestly own these actions | host action cost is equivalent | local browser proof spans React and product consumers'
    ),
    'WG-CMD-003A1': semantic(
      'Wordgard and Plite preserve text insertion through different transaction models | Plite direct verbs expose root-aware inferred inputs | inserted text remains structural document data | Plite owns edit algebra while Plate may intercept product policy | changed paths constrain normalization and runtime parity is unmeasured | local transaction and browser insertion proof is broader'
    ),
    'WG-CMD-003A2': semantic(
      'Wordgard and Plite preserve text and range deletion through different cursor laws | Plite direct verbs expose root-aware deletion units | deletion produces ordinary structural changes | Plite owns edit algebra while Plate owns feature interception | changed paths constrain correction and runtime parity is unmeasured | local backward forward and range deletion proof is broader'
    ),
    'WG-CMD-003A3': semantic(
      'Wordgard and Plite split and join blocks with different schema abstractions | Plite transaction verbs infer root-aware block targets | resulting blocks remain structural document data | Plite mechanics and Plate product policy split ownership | ancestor work remains path-scoped and comparative cost is unmeasured | local split join and list integration proof is broader'
    ),
    'WG-CMD-003B1A': semantic(
      'schema-aware changes to block tags are preserved across the Plite mechanics and Plate policy layers | scoped commands infer configured block identities | changed blocks remain structural JSON | Plite owns mechanics and Plate owns semantic policy | only selected blocks update and runtime parity is unmeasured | local transform and feature tests provide direct proof'
    ),
    'WG-CMD-003B1B': semantic(
      'schema-aware wrapper insertion is preserved across the Plite mechanics and Plate policy layers | scoped commands infer wrapper identities and valid targets | wrappers remain structural JSON | Plite owns wrapping mechanics and Plate owns product policy | ancestor traversal remains path-scoped | local transform list and block proof is broader'
    ),
    'WG-CMD-003B1C': semantic(
      'schema-aware wrapper removal is preserved across the Plite mechanics and Plate policy layers | scoped commands expose valid wrapper removal | unwrapped content remains structural JSON | Plite owns mechanics and Plate owns semantic policy | ancestor traversal remains path-scoped | local transform list and block proof is broader'
    ),
    'WG-CMD-003B2A': semantic(
      'both stacks mutate text alignment correctly | Plate exposes typed configured alignment values | alignment persistence makes different tradeoffs | the local style package owns mutation | runtime cost is unmeasured | focused local alignment proof is broader'
    ),
    'WG-CMD-003B2B': semantic(
      'Wordgard is the only current stack with a first-party textDirection mutation | its command demonstrates the missing capability | textDirection should persist as the canonical property while HTML alone maps dir | the future Plate feature owner is defined by the product direction dossier | runtime cost is unmeasured | donor source proves mutation but complete projection proof belongs to the behavior row'
    ),
    'WG-CMD-003C1': semantic(
      'Wordgard and Plate expose explicit list toggling with different data models | Plate scoped commands infer configured list types | list persistence makes different structural tradeoffs | the list package owns semantic policy | scoped traversal avoids a global command owner | focused list toggle tests and browser demos are broader'
    ),
    'WG-CMD-003C2': semantic(
      'Plate more completely handles delete and break list-join policy | scoped list commands compose over lower-level Plite edits | list joins remain ordinary structural changes | the list package owns semantic boundary behavior | scoped traversal limits affected siblings and runtime parity is unmeasured | focused join split and deletion proof is broader'
    ),
    'WG-CMD-003D1': semantic(
      'feature plugins enforce applicable mark eligibility | scoped toggles infer the configured mark key | mark values remain structural text properties | mark packages own product policy over core transactions | only changed text ranges update | package and toolbar browser proof is broader'
    ),
    'WG-CMD-003D2': semantic(
      'Wordgard alone exposes a dedicated canAddMarkInRange eligibility query | local stacks expose lower-level schema predicates and current-mark reads rather than the same public capability | eligibility inspection does not mutate document data | a future feature query owner could wrap the substrate predicate without UI coupling | traversal remains read-only and range-scoped but comparative cost is unmeasured | donor source and consumers prove usage while direct behavior tests remain absent'
    ),
    'WG-CMD-003E1': semantic(
      'root-aware selection updates reject cross-root invalidity | explicit transaction selection verbs expose mutation intent | selection stays ephemeral and root-keyed | the transaction owns mapping and publication | selection publishes exactly once | history and browser selection proof is broader'
    ),
    'WG-CMD-003E2': semantic(
      'logical and visual motion use the appropriate text and geometry laws | APIs separate host-neutral from DOM-dependent movement | cursor motion does not encode AST state | core owns logical motion while DOM owns geometry | browser geometry avoids retained global token tables | local browser engines are broader despite raw-device gaps'
    ),
    'WG-CMD-004A1': semantic(
      'both stacks normalize platform key bindings while Plate resolves descriptor shortcuts centrally | declaration APIs make different composition tradeoffs | binding metadata remains transient | feature descriptors and the shortcut compiler split ownership locally | comparative dispatch cost is unmeasured | local shortcut resolution tests are broader'
    ),
    'WG-CMD-004A2': semantic(
      'Wordgard exposes a declarative menu tree with predicates and command resolution absent as one local contract | its menu definitions are directly inspectable | menu state remains transient | the menu registry owns hierarchy and enablement | runtime resolution cost is unmeasured | donor source and menu tests provide the only coherent behavior oracle'
    ),
    'WG-CMD-004B': semantic(
      'no implementation proves complete active-shortcut discovery | a future help surface needs resolved metadata rather than declarations alone | command help is transient presentation state | the compiled command registry should expose resolution to a product consumer | resolution cost and cache invalidation remain unmeasured | issue demand lacks an implemented cross-editor oracle'
    ),
    'WG-COLLAB-001': semantic(
      'Yjs integration preserves local schema and multiroot constraints | provider APIs fit structural editor types | relative positions and schema envelopes survive persistence | adapters own awareness transport and reconnect while core owns changes | CRDT transport avoids a client OT rebase queue | local package and browser contracts are broader'
    ),
    'WG-COLLAB-002A': semantic(
      'root-aware change composition covers local edit algebra | structural APIs avoid nominal change-class coupling | root-keyed changes fit persistence and collaboration | pairwise algebra remains substrate-owned | changed-scope mapping avoids flattening the document | local property and algebra tests are broader'
    ),
    'WG-COLLAB-002B': semantic(
      'mapped effects and corrections integrate with transactions | typed descriptors infer effect payloads | effects remain separate from AST while mapping through changes | state and change owners isolate correction from transport | event-scoped correction avoids global sweeps | local effect and correction tests are broader'
    ),
    'WG-COLLAB-002C': semantic(
      'the donor exposes the only complete central-authority transform loop | its helper directly consumes versions and queued updates | its wire model is coherent but single-root | the collaboration module owns server transformation end to end | pairwise transforms are explicitly bounded | no equivalent local central-server integration proof exists'
    ),
    'WG-DOC-004': semantic(
      'the local compiler resolves grammar properties and dependencies atomically | declarative contributions infer from descriptors | fingerprints bind compiled vocabulary to persistence | the compiler owns lookup and wrapping caches | indexes compile once per revision | schema conflict and reconfiguration proof is broader'
    ),
    'WG-DOC-004B1': semantic(
      'donor relationship overrides express targeted schema relationships that local replacement rules reject | an explicit relationship API can remain schema-owned | overrides stay outside persisted nodes | the schema compiler should validate and publish relationships | configuration-time compilation keeps runtime lookup bounded | donor outliner cases provide the only direct behavior oracle'
    ),
    'WG-DOC-004B2': semantic(
      'only the donor outliner demonstrates commands rebound to a changed schema | no stable public command contract has been isolated | command adaptation remains runtime policy | ownership between schema and feature command is unresolved | runtime cost is unmeasured | neither side has focused proof beyond the example'
    ),
    'WG-DOC-005A': semantic(
      'both sides recursively construct schema-valid content while Plite rejects invalid fill more explicitly | typed local builders infer the configured value | construction emits plain structural JSON | the grammar compiler owns recursive fill | defaults apply only at construction boundaries | local schema construction contracts are broader'
    ),
    'WG-DOC-005B': semantic(
      'structural equality fits immutable JSON snapshots | small predicates avoid nominal instance methods | equality ignores runtime identities appropriately | a private substrate utility is the honest owner | deep-comparison cost is comparable | focused equality properties cover the invariant'
    ),
    'WG-DOC-005C': semantic(
      'normalization joins adjacent compatible text under schema law | canonicalization remains internal rather than a node method | JSON leaf runs stay canonical | the change builder and normalizer own merging | dirty-scope merging avoids whole-document passes | text normalization tests are broader'
    ),
    'WG-DOC-006': semantic(
      'root-aware paths avoid global token arithmetic | structural location types preserve root inference | root identity remains explicit in every target | location resolution belongs in the substrate | indexed paths avoid repeated whole-document offset resolution | multiroot location contracts are broader'
    ),
    'WG-DOC-007': semantic(
      'snapshot indexes avoid strong document-to-position-array retention | no public cache API is required | caches remain revision-scoped and non-persisted | snapshot state owns invalidation | retention is likely lower though no common benchmark exists | local invalidation tests are broader'
    ),
    'WG-DOC-008': semantic(
      'structural fragments preserve insertion context without open-token coupling | typed slice APIs accept configured descendants | fragment context fits JSON clipboard and collaboration | schema and codecs fit content at the host boundary | fitting happens only on insertion | clipboard and schema browser proof is broader'
    ),
    'WG-DOC-009': semantic(
      'root-keyed immutable changes preserve canonical operation order | structural APIs avoid packed token encoding | serializable root changes integrate history and Yjs | the change module owns the algebra | lazy impact avoids decoding a token stream | transaction properties are broader'
    ),
    'WG-DOC-010': semantic(
      'composition transform and inversion cover roots and operation families | typed algebra works over structural operations | multiroot changes fit history and collaboration | the substrate change module owns algebra | changed scopes remain incremental | history and collaboration proofs are broader'
    ),
    'WG-DOC-011': semantic(
      'path and anchor mapping answer affected-scope queries correctly | root-aware targets avoid raw token padding | mapped anchors preserve root and runtime identity | commits and indexes centralize impact | lazy impact avoids eager range materialization | mapping and subscription contracts are broader'
    ),
    'WG-DOC-012': semantic(
      'candidate fitting and validation reject invalid replacements atomically | transaction replacement verbs avoid a public replace-error class | root-aware changes preserve structural JSON | schema and transaction owners fit or abort | validation occurs before publication | rollback and invalid-replacement proof is broader'
    ),
    'WG-DOC-013': semantic(
      'runtime codecs validate nodes fragments and changes | descriptor-inferred schemas avoid nominal JSON decoders | versioned JSON and fingerprints govern persistence | schema codec and change owners split validation | compiled validators are reused | package property and persistence proof is broader'
    ),
    'WG-DOC-016': semantic(
      'static RSC and browser serializers preserve configured components | editor serialization and static components expose direct APIs | serialization never mutates AST data | Plate and the DOM host split static and browser ownership | direct projection avoids namespace machinery | static and browser roundtrip proof is broader'
    ),
    'WG-DOC-017A': semantic(
      'both recursive comparators preserve the same value law | both remain private and minimal | neither alters persisted data | package-local ownership is honest | cost is negligible on intended inputs | ordinary focused units are sufficient'
    ),
    'WG-DOC-017B': semantic(
      'both systems distinguish schema and programmer failures | local error codes are as usable as tiny donor classes | diagnostics are never persisted | failing package owners create their errors | this is a cold path | focused failure tests are sufficient'
    ),
    'WG-DOC-018': semantic(
      'root-aware iterators handle paths text and voids | query APIs infer configured descendants | traversal leaves structural JSON untouched | substrate reads own iteration | indexes avoid materialized nominal walks | query and transform proof is broader'
    ),
  })
);

const setSemanticProfile = (id, value) => {
  if (semanticProfiles.has(id)) {
    throw new Error(`Duplicate semantic profile for ${id}`);
  }
  semanticProfiles.set(id, value);
};

for (const [id, value] of Object.entries({
  'WG-PROOF-001A': semantic(
    'Plite directly proves document structure roots paths and traversal laws | tests exercise public structural APIs | fixtures preserve structural JSON | document owners keep focused proof | bounded fixtures keep iteration fast | local source-first contracts are broader than donor package resolution proof'
  ),
  'WG-PROOF-001B': semantic(
    'Plite directly proves change application inversion and mapping laws | tests exercise public change APIs | fixtures encode versioned structural changes | the change owner keeps algebra proof | generated cases explore composition without browser overhead | local source-first property contracts are broader'
  ),
  'WG-PROOF-001C': semantic(
    'Plite directly proves schema grammar validation defaults and reconfiguration laws | tests exercise compiled schema APIs | fixtures bind expected structural JSON to schema identity | the schema owner keeps validation proof | focused programs avoid full editor startup | local negative nested and reconfiguration cases are broader'
  ),
  'WG-PROOF-001D': semantic(
    'Plite directly proves document laws through generated and translated property cases | public APIs remain the test boundary | generated fixtures stay structural JSON | each algebra owner keeps its generators | bounded seeds make failures reproducible | local current-source property proof is broader than donor ambient builds'
  ),
  'WG-PROOF-002A1': semantic(
    'Plite directly proves state transition commit rollback and snapshot laws | tests exercise public state APIs | fixtures use the live local state model | state owners keep focused proof | source-first suites remain bounded | donor green output does not close the frozen source head'
  ),
  'WG-PROOF-002A2': semantic(
    'Plite directly proves selection mapping validation and persistence laws | tests exercise public selection protocols | fixtures encode root-aware structural selections | selection owners keep focused proof | generated mappings remain bounded | local malformed roundtrip and browser cases are broader'
  ),
  'WG-PROOF-002A3': semantic(
    'Plite directly proves command dispatch transactions interception and rollback | tests exercise public command descriptors and update APIs | command fixtures carry intent rather than editor data | command and transaction owners keep proof | focused nested cases avoid browser startup | local source-first command contracts are broader'
  ),
  'WG-PROOF-002A4': semantic(
    'Plite directly proves changed-region correction normalization and cycle laws | tests exercise public correction registration and commits | correction fixtures remain structural changes | invariant owners keep their focused proof | worklist cases bound repeated repair | local idempotence scope and failure contracts are broader'
  ),
  'WG-PROOF-005A1A': semantic(
    'Plate compiles registry examples against their current source imports | current public package APIs are exercised by copied source | compilation metadata is not editor data | the registry owner maintains source validity | check cost is unmeasured | current-source type and path gates are broader than donor clean-pack output'
  ),
  'WG-PROOF-005A1B': semantic(
    'Plate verifies that copied registry sources resolve and install their declared dependencies | package and registry imports form the public boundary | install fixtures are repository proof data | registry and package owners share installation truth | packed install cost is closure-only | current installability contracts are broader than donor ambient dist examples'
  ),
  'WG-PROOF-005B3A': semantic(
    'Wordgard directly implements marker-based source sample extraction and injection | Plate MDX and registry samples provide only a partial alternative | extracted snippets are documentation data | the source marker and docs build own injection | extraction cost is unmeasured | donor source proves the mechanism without a shared sample corpus'
  ),
  'WG-PROOF-005B3B': semantic(
    'neither side checks one shared injected-sample corpus end to end | local docs compilation covers only its own representation | sample outputs are documentation proof data | docs tooling owns compilation | compilation cost is unmeasured | incompatible sample pipelines leave the comparative result insufficient'
  ),
  'WG-VIEW-003A': semantic(
    'Plite publishes pending and flushed state with mapped scroll targets | typed view-state reads separate commit and projection timing | scroll intent remains transient | commit impact and the view host split ownership | only affected projections flush but comparative cost is unmeasured | local view-state and scroll contracts are direct while donor source lacks focused proof'
  ),
  'WG-VIEW-003B': semantic(
    'no side directly proves one coherent snapshot spanning editor bounds and content geometry | current APIs expose lower-level measurements rather than this exact contract | geometry remains transient host state | a DOM view owner would own measurement publication | measurement frequency and cache invalidation are unbenchmarked | implementation source alone cannot decide the comparison'
  ),
  'WG-VIEW-005B1': semantic(
    'Plite anchors map positions and ranges through changes with explicit affinity | the structural anchor protocol avoids donor packed-store coupling | runtime identities do not enter persisted document data | public state owns anchor mapping | only affected anchors remap and comparative cost is unmeasured | local anchor range and mapping contracts are broader'
  ),
  'WG-VIEW-005B2': semantic(
    'Wordgard uniquely implements packed bulk point and range storage | its nominal bulk store is not justified as a public local API | packed positions remain transient indexes | the donor view model owns storage and mapping together | no benchmark proves packed stores beat individual anchors | source demonstrates the mechanism but direct performance and behavior proof are incomplete'
  ),
  'WG-VIEW-007B1': semantic(
    'Plite directly proves focus acquisition and replay across host updates | typed focus helpers expose the host boundary | focus replay remains transient | React and DOM lifecycle owners coordinate focus | replay runs only after relevant commits and comparative cost is unmeasured | focused local contracts are broader while donor focus proof is partial'
  ),
  'WG-VIEW-007B2': semantic(
    'both Wordgard and Plite replay model selections into mounted DOM state | host APIs expose selection conversion without persisting DOM objects | replay state remains transient | the DOM selection owner publishes after model commits | mapped replay is scoped to changed selection and runtime is unbenchmarked | donor composition cases and local reconciler contracts prove behavior'
  ),
  'WG-VIEW-008B1': semantic(
    'Plite directly proves element-size change delivery while Wordgard only exposes implementation source | host-only observation avoids editor-core coupling | measured sizes remain transient | DOM and layout owners consume resize events | browser batching limits callbacks but comparative runtime is unmeasured | local resize and layout contracts are direct'
  ),
  'WG-VIEW-008B2': semantic(
    'Plite directly proves viewport movement delivery while Wordgard has no focused listener test | host APIs isolate browser scroll state | viewport state remains transient | DOM and layout own listeners | passive scheduling is useful but comparative cost is unmeasured | local viewport proof is broader than donor source-only evidence'
  ),
  'WG-VIEW-008B3': semantic(
    'Wordgard exposes tooltip-specific visibility observation rather than large-document mounting | the source API is tied to tooltip hosts | visibility state remains transient | tooltip presentation owns observation | IntersectionObserver cost is browser-managed and unbenchmarked | neither side has direct equivalent behavior proof'
  ),
  'WG-VIEW-010B1': semantic(
    'Plite and Plate directly prove ordered dispatch of physical and synthetic key events | typed event contexts separate host dispatch from feature policy | keyboard state remains transient | DOM core and feature handlers split ownership | selective routing avoids duplicate work but runtime parity is unmeasured | local package and browser key contracts are broader'
  ),
  'WG-VIEW-010B2': semantic(
    'Plite and Plate directly prove pointer-to-selection routing | typed host APIs expose valid points and feature policy | pointer state remains transient | the DOM host owns geometry while features own gestures | direct coordinates avoid retained intermediate models | local pointer and selection contracts are broader'
  ),
  'WG-VIEW-010C1A': semantic(
    'Plite directly proves generic browser drag and drop routing | host event APIs expose transfer and drop intent | only contextual fragments cross the transfer boundary | the DOM input host owns generic routing | one targeted transaction handles each accepted drop | local browser image mention and input-router proof is broader'
  ),
  'WG-VIEW-010C1B': semantic(
    'Plate owns block and product-specific drag and drop policy | scoped DnD stores hooks and commands expose feature intent | product fragments remain structural data | the DnD package owns policy above generic routing | targeted drops update only affected blocks | focused DnD package and registry tests prove the local feature layer'
  ),
  'WG-VIEW-012C1A': semantic(
    'Plite exposes direct DOM event callbacks on the rendered host | typed callback props keep application handlers outside core | events remain transient | the rendered host owns component callbacks | direct dispatch avoids extension lookup | local input-router and host contracts provide focused proof'
  ),
  'WG-VIEW-012C1B': semantic(
    'Plate compiles feature-declared DOM event chains with ordering and prevention | inferred event contexts keep feature handlers colocated | events remain transient | features declare handlers and the DOM host dispatches them | compiled chains limit lookup while comparative cost is unmeasured | local handler ordering and prevention tests are direct'
  ),
  'WG-VIEW-012C2': semantic(
    'no side directly proves the full passive-observers-before-handlers lifecycle | Wordgard source combines observer registration passivity and ordering without tests | observer state remains transient | a DOM lifecycle owner should register and clean listeners | listener fanout and cleanup cost are unmeasured | source coverage is insufficient for a winner'
  ),
  'WG-VIEW-012A1A': semantic(
    'Plite directly proves cross-platform shortcut syntax normalization | normalized binding declarations isolate platform syntax | binding metadata remains transient | the DOM input host owns normalization | normalization compiles once but comparative cost is unmeasured | focused hotkey tests are broader than donor source-only evidence'
  ),
  'WG-VIEW-012A1B': semantic(
    'Plate directly proves deterministic ordering of compiled shortcuts | descriptor shortcuts expose typed feature declarations | binding metadata remains transient | the shortcut compiler owns deterministic precedence | tables compile once per plugin revision | local conflict and precedence tests are direct'
  ),
  'WG-VIEW-012A1C': semantic(
    'Plate directly proves execution-time dispatch through compiled shortcut tables | the dispatcher exposes typed descriptor event contexts | dispatch state remains transient | the editor shortcut host owns runtime arbitration | compiled lookup avoids repeated discovery | focused dispatcher and browser key tests are direct'
  ),
  'WG-VIEW-012A2': semantic(
    'Plate feature packages own the default editing shortcuts | inline shortcut declarations colocate policy with commands | shortcuts never enter persisted data | each feature owns its editing policy | direct dispatch avoids a central default-keymap object | package and browser key tests are broader'
  ),
  'WG-VIEW-013A': semantic(
    'Wordgard exposes per-extension styles that stay active for the editor lifetime without focused lifecycle proof | local class and stylesheet ownership is only a partial alternative | styles remain outside AST data | feature packages should own CSS rather than editor core | native cascade handles composition but injection cost is unmeasured | source does not justify adopting the donor style-object system'
  ),
  'WG-VIEW-013B': semantic(
    'donor editor-scoped themes and local app token themes make different partial tradeoffs | neither side proves one superior public theme API | theme state remains outside AST data | app and registry ownership differs from editor-scoped publication | CSS variables and classes use native composition | direct lifecycle proof is incomplete on both sides'
  ),
  'WG-VIEW-013C': semantic(
    'donor color-scheme publication and local host theme policy make different partial tradeoffs | host class and stylesheet APIs remain implementation-specific | color scheme never enters AST data | document and shadow-root owners must clean publication | stylesheet dedupe matters but is unbenchmarked | direct publication and cleanup proof is incomplete'
  ),
  'WG-VIEW-014A2': semantic(
    'neither stack directly proves a complete editor dialog focus and dismissal lifecycle | registry components expose only partial composition evidence | dialog drafts remain transient | copied UI should own dialog behavior | local component state limits rendering | mocked or native prompts do not establish generic dialog proof'
  ),
  'WG-VIEW-014C1': semantic(
    'neither stack directly proves generic tooltip positioning visibility and teardown | donor and Plate expose partial presentation implementations | tooltip state remains transient | copied UI should own tooltip behavior | floating geometry remains scoped to active tooltips | current tests mock tooltips or prove adjacent floating surfaces only'
  ),
  'WG-VIEW-014C2': semantic(
    'Wordgard demonstrates asynchronous hover-source and pointer coordination absent as one local contract | the donor lifecycle is a behavior oracle rather than a wholesale API target | hover state remains transient | the component family should own delayed source and pointer work | delayed work must cancel on teardown and runtime is unmeasured | donor source plus local footnote behavior motivate a focused adoption dossier'
  ),
  'WG-VIEW-015A': semantic(
    'Plite and Plate jointly prove empty-editor hints from host projection through product rendering | host and component APIs expose empty-state presentation | placeholder text remains transient | Plite owns projection and Plate owns product rendering | selectors limit updates while comparative cost is unmeasured | local placeholder package and browser tests are direct'
  ),
  'WG-VIEW-015B1': semantic(
    'Plite directly proves drawing the active selection endpoint through its host engine | typed geometry stays below product cursor components | caret visuals remain transient | the DOM caret engine owns local projection | updates follow mapped selection and layout | local browser caret contracts are broader than donor source-only evidence'
  ),
  'WG-VIEW-015B2': semantic(
    'Plate directly owns collaborator-caret presentation above presence data | scoped collaboration and cursor components expose typed decoration data | remote cursor state remains transient | collaboration provides presence while React owns overlay geometry | only active presence updates render | focused cursor overlay tests prove the product layer'
  ),
  'WG-VIEW-015C': semantic(
    'Plate directly owns drop-cursor projection over product drag geometry | DnD components bind typed target state | drop targets remain transient | DnD and registry own projection | only active drags render | focused DnD package and browser proof support the local capability'
  ),
  'WG-VIEW-016A': semantic(
    'Wordgard alone exposes whole-plugin lifecycle deactivation after a failure but lacks focused proof | the mechanism is coupled to nominal plugin instances | failure state remains runtime-only | the plugin lifecycle owner disables the failed feature | failure paths are cold and recovery cost is unmeasured | source is a reference but does not justify copying global deactivation'
  ),
  'WG-VIEW-016B': semantic(
    'Plite isolates each view source behind a direct fault boundary and error sink | typed view sources report failures without disabling unrelated features | errors never enter persisted data | each projection owner handles its own failure | cold failure paths do not burden normal updates | focused source and mapped-store failure contracts are direct'
  ),
  'WG-META-003': semantic(
    'local runners execute current sources while donor Node and browser commands resolve stale ignored dist output | local commands separate development and browser closure | proof runners do not own persisted data | local orchestration tracks the live workspace graph | runner cost has no comparable benchmark | donor green counts cannot prove the frozen source head'
  ),
  'WG-CMD-001A': semantic(
    'callable identity permits direct bypass of registry law | named descriptors give stable typed lookup | command identity remains runtime-only | one registry should own dispatch | descriptor lookup avoids function scans | local descriptor contracts are broader'
  ),
  'WG-CMD-001B': semantic(
    'ordered interception preserves deterministic handler priority | named handlers remain directly discoverable | interception never changes persistence shape | the registry owns chain ordering | compiled chains avoid repeated discovery | local nested and failure tests are broader'
  ),
  'WG-DOC-003A': semantic(
    'deterministic mark precedence prevents ambiguous rendering | structural property declarations avoid nominal mark classes | marks remain ordinary JSON text properties | schema and feature packages own ordering policy | compiled precedence avoids set sorting per read | local mark and browser tests are broader'
  ),
  'WG-DOC-001B': semantic(
    'persistent constructors must snapshot caller-owned node and mark collections | structural builders cannot retain mutable input arrays | cached lengths and JSON must remain stable after construction | constructors own defensive collection boundaries | one shallow snapshot prevents cache corruption | regressions mutate source arrays after plot leaf tag and slice creation'
  ),
  'WG-DOC-003B': semantic(
    'structural text properties replace immutable nominal mark sets | small property utilities give simpler types | plain JSON collaborates without conversion | the substrate owns structural updates | no MarkSet allocation is retained | property algebra tests cover equivalence'
  ),
  'WG-HIST-001A': semantic(
    'multiroot commits restore documents selections and effects | typed undo and redo remain host-neutral | versioned history follows local schema identity | the history extension owns branches | grouped commits avoid token-position maps | local history and integration proof is broader'
  ),
  'WG-HIST-002': semantic(
    'mapped anchors rebase skipped commits under root identity | no public lazy-map class is required | history entries stay schema-aware JSON | the history adapter owns rebase | lazy impact bounds mapping work | local history and collaboration proof is broader'
  ),
  'WG-HIST-003': semantic(
    'history codecs reject or reset incompatible schema revisions rather than migrate history payloads | typed codecs expose explicit decode and compatibility boundaries | multiroot JSON persistence is first-class | the history package owns compatibility rejection while schema migration stays outside history | decode occurs once per restore | roundtrip and schema-mismatch rejection proof is broader'
  ),
  'WG-PRODUCT-001B': semantic(
    'Plate descriptors cover applicable semantic marks | literal mark types infer plugin APIs | marks persist as structural properties | mark packages own declaration and behavior | compiler indexes mark policy | package toolbar and codec proof is broader'
  ),
  'WG-PRODUCT-001C': semantic(
    'Plate media schemas cover image and figure invariants | media descriptors infer configured identities | image metadata persists as JSON | media packages own declarations | compiled codecs avoid generic element branching | media demos and browser proof are broader'
  ),
  'WG-PRODUCT-001D': semantic(
    'Plate table descriptors cover row cell and table identity | literal table types infer commands | grid nodes persist as structural JSON | the table package owns declarations | compiled schema validates grid families | table package and browser proof are broader'
  ),
  'WG-PRODUCT-002': semantic(
    'descriptor kits compose dependencies and schema contributions | plugin arrays infer the extension tree | kit composition is never serialized | copied registry owns app composition | compilation deduplicates once per editor | editor-kit and demo proof is broader'
  ),
  'WG-PRODUCT-003B1': semantic(
    'Plate mark plugins enforce semantic toggle policy | scoped portals infer the mark key | marks remain plain JSON | each mark package owns behavior | changed text ranges only update | package and toolbar proof is broader'
  ),
  'WG-PRODUCT-003B2': semantic(
    'Plate color features validate text and background values | typed color commands expose allowed data | colors persist as explicit properties | color packages own policy | selected leaves update only | color picker and browser proof is broader'
  ),
  'WG-PRODUCT-003C': semantic(
    'Plate lists preserve nesting and sibling invariants | list portals infer configured item types | list state remains structural JSON | the list package owns behavior | scoped traversal reuses indexes | focused list proof is broader'
  ),
  'WG-PRODUCT-003E': semantic(
    'Plate media editing preserves caption and figure policy | media portals expose direct mutations | image state persists as JSON | media packages own behavior | React selectors scope updates | media browser demos are broader'
  ),
  'WG-PRODUCT-004A1': semantic(
    'Plate exposes app-owned upload callbacks and states | typed upload options fit host policy | transient files become image JSON only on success | media and app integration own upload | async work stays outside transactions | upload UI proof is broader'
  ),
  'WG-PRODUCT-004A2': semantic(
    'Plate covers dialog insertion workflow | component and hook families compose with media portals | draft URLs remain transient until insert | registry UI owns the dialog | local component state avoids editor pollution | demo and browser proof is broader'
  ),
  'WG-PRODUCT-004B': semantic(
    'Plate persists resize state with configured media policy | plugin APIs expose width changes | width remains a JSON property | resizable and media packages split ownership | pointer deltas update one element | product resize tests are broader'
  ),
  'WG-PRODUCT-004C': semantic(
    'Plate color controls preserve applicable value constraints | copied components bind typed feature portals | picker state stays transient | registry UI owns the control | local state limits rerenders | standalone demos cover interaction'
  ),
  'WG-PROOF-004C': semantic(
    'no side proves raw mobile editing correctness | no raw-device API evidence exists | viewport emulation is not device state | no verified device owner exists | device latency is unmeasured | iOS and Android traces are absent'
  ),
  'WG-STATE-001A': semantic(
    'immutable multiroot snapshots publish atomically | update callbacks infer transaction access | snapshots remain JSON plus runtime indexes | public state owns commit and rollback | structural sharing bounds changed work | atomic and rollback contracts are broader'
  ),
  'WG-STATE-001B': semantic(
    'repeated reads of one snapshot must remain observationally pure | serialization and transport queries cannot reserve mutable work | branch arrays and send queues stay outside immutable state | adapters and codecs own mutable cursors separately | pure reads preserve memoization and replay | regression cases cover collaboration sends and history JSON'
  ),
  'WG-STATE-002A': semantic(
    'typed fields update deterministically with editor commits | field descriptors infer values | field state stays separate from AST | the declaring extension owns the field | indexed lookup avoids scans | field transition tests are broader'
  ),
  'WG-STATE-003A': semantic(
    'named facets combine declared inputs deterministically | explicit dependency types are agent-readable | derived state never enters AST | the compiler owns the dependency graph | revision caches avoid redundant recompute | local facet tests cover cycles and precedence'
  ),
  'WG-STATE-003B': semantic(
    'explicit dependencies avoid hidden runtime read acquisition | declared graphs are more inspectable than auto-tracking | computed state remains transient | the compiler owns invalidation | tracking may skip reads but adds hidden overhead | local declared-dependency proof is stronger'
  ),
  'WG-STATE-004A': semantic(
    'recursive descriptor trees flatten without losing dependency order | define and extend APIs infer feature bundles | configuration stays outside AST | feature owners export bundles and compiler flattens | trees compile once | dependency and browser proof is broader'
  ),
  'WG-STATE-004B': semantic(
    'named identity and latest-wins precedence resolve conflicts | configure and extend are clearer than precedence wrappers | dedupe state is transient | the compiler owns deterministic conflict resolution | indexed dedupe runs once | conflict and duplicate tests are broader'
  ),
  'WG-STATE-005A': semantic(
    'Wordgard proves whole-root transactional replacement while Plite exposes only partial whole-editor reconfiguration | Plite keeps the public structural API simpler but lacks the donor full-root replacement contract | schema identity binds candidate revisions to persistence on both sides | each compiler owns candidate publication | one compiled revision swaps, but comparative cost is unmeasured | donor source proves atomic replacement while local rollback proof covers a narrower path'
  ),
  'WG-STATE-005B': semantic(
    'append-only injection risks unbounded retained configuration | named slots are clearer than irreversible append | appended config is runtime-only | the compiler should own bounded changes | avoiding accumulation is the safer runtime | donor example is a warning rather than target proof'
  ),
  'WG-STATE-005C': semantic(
    'Wordgard compartments and Plite named slots both isolate transactional reconfiguration | Plite named slots avoid nominal compartment objects and preserve descriptor inference | configuration stays outside AST | the slot owner and compiler publish one candidate revision | activation rollback remains separately unresolved and comparative cost is unmeasured | local commit and abort proof is stronger than donor isolation examples'
  ),
  'WG-STATE-006A': semantic(
    'Wordgard and Plite both merge document selection and effects sequentially | Plite transaction callbacks avoid parameter plumbing while donor builders expose explicit composition | one root-keyed commit payload is produced | core owns draft and merge | only one publication occurs but comparative cost is unmeasured | nested update and rollback proof is broader locally'
  ),
  'WG-STATE-007A': semantic(
    'Wordgard universal extenders and Plite corrections make different tradeoffs inside one commit | named invariant corrections are more discoverable than a universal extender but do not replace every donor use | hidden additions must not alter persistence unexpectedly | invariant owners declare corrections while donor state owns extenders | no bounded scheduling claim is established for the donor mechanism | local correction tests are stronger but do not prove feature equivalence'
  ),
  'WG-STATE-007B': semantic(
    'Wordgard directly proves an extension hook that schedules another transaction after commit | Plite feature commands can request separate commits but lack the same generic appender contract | follow-ups affect history boundaries and require explicit policy | feature owners should request follow-ups while core owns commit publication | the donor mechanism does not establish a bounded queue guarantee | donor undoability cases are useful reference proof without justifying an unbounded universal hook'
  ),
  'WG-STATE-008': semantic(
    'changed-region correction limits invariant repair | typed impact reaches the correction owner | corrections join the same atomic commit | schema and extension owners declare repair | only dirty entities are revisited | idempotence and scope proof is broader'
  ),
  'WG-STATE-009A': semantic(
    'Plite registers custom selection kinds through a typed extension protocol while Wordgard dispatches raw tags without focused proof | extension-owned codecs infer each selection payload | custom selections remain tagged structural state | the extension registry owns kind dispatch | tag lookup is direct but comparative runtime cost is unmeasured | local registration malformed-input and dispatch contracts are broader'
  ),
  'WG-STATE-009B': semantic(
    'Plite binds persisted selection codecs to an explicit version envelope | typed codec declarations make compatibility failure visible | serialized selections retain structural JSON with version identity | the selection protocol owner validates decode boundaries | decode cost is boundary-only and unbenchmarked | local roundtrip version and rejection contracts are direct while donor raw tags lack an envelope'
  ),
  'WG-STATE-010A': semantic(
    'root-aware ranges preserve affinity through changes | point and range APIs reject cross-root ambiguity | selections remain serializable | the selection module owns mapping | only changed paths remap | property history and browser proof is broader'
  ),
  'WG-STATE-010B': semantic(
    'active marks and replacement remain transaction selection state | transaction verbs infer text properties | pending marks enter AST only during insertion | transactions own pending state | replacement touches one range | typing and replacement tests are broader'
  ),
  'WG-STATE-011A': semantic(
    'local position segments already project root-aware text blocks | private iterators avoid another public nominal model | projection remains transient | the substrate positions module owns mapping | donor WeakMap caching may be faster but is unbenchmarked | local text-unit contracts are broader'
  ),
  'WG-STATE-011B': semantic(
    'local deterministic Unicode grapheme and word traversal is more complete | tx selection movement exposes concise logical units | movement remains transient on both sides | Plite positions and selection transforms own the behavior directly | no comparable segmentation benchmark exists | local pinned donor translated and generated boundary cases are broader'
  ),
  'WG-STATE-012': semantic(
    'Wordgard PhraseSet proves real typed localization demand while Plate owns only product-local phrase fragments | donor typed keys and placeholders improve authoring but do not belong in Plite core | phrases stay outside AST | product localization is the honest ownership boundary | comparative lookup and bundle cost are unmeasured | donor source and local product usage lack a shared override contract'
  ),
  'WG-STATE-013': semantic(
    'Wordgard currently proves deterministic visual bidi order beyond local legal-offset navigation | retain the local movement API and host ownership rather than copy donor classes | bidi spans remain transient | adapt donor semantics onto the Plite React caret engine | donor isolate omissions and truncated bracket classes block wholesale adoption | port exact visual-order oracles because current local browser proof checks only progress and legal offsets'
  ),
  'WG-STATE-014A': semantic(
    'both Wordgard and Plite preserve vertical line motion through measured host geometry and a retained goal column | their coordinate and DOM command APIs make different host tradeoffs | desired horizontal position remains transient selection state | the DOM host owns line geometry and motion | layout is queried only while moving and comparative cost is unmeasured | direct donor coordinate cases and local caret contracts prove the behavior'
  ),
  'WG-STATE-014B': semantic(
    'Wordgard alone exposes an explicit page-motion policy but lacks a focused proof contract | the policy is tied to its viewport command surface | page movement remains transient selection state | page authoring policy belongs to the DOM host rather than editor core | browser-native page behavior and retained geometry are unbenchmarked | source demonstrates the partial capability while local support and parity remain absent'
  ),
  'WG-STATE-015A': semantic(
    'Plite annotations cover typed transaction metadata while Wordgard directly proves annotation combination | descriptors infer local payloads but do not expose every donor combination law | annotations stay outside AST | each transaction module owns combination | only present annotations are processed and comparative cost is unmeasured | focused local tests are broader for covered metadata while donor source remains necessary for its combination semantics'
  ),
  'WG-STATE-015B': semantic(
    'mapped effects integrate inversion history and collaboration | effect descriptors infer payloads and codecs | serializable effects remain explicit | transaction and change owners map and invert | only present effects are mapped | effect history and collaboration proof is broader'
  ),
}))
  setSemanticProfile(id, value);

const winnerNames = {
  a: 'Plate stronger',
  e: 'equivalent',
  i: 'insufficient evidence',
  n: 'not-applicable',
  p: 'Plite stronger',
  r: 'reference stronger',
  s: 'Plite/Plate stack stronger',
  t: 'different tradeoff',
};
const winnerProfiles = new Map();
const setWinnerProfile = (id, winners) => {
  if (winnerProfiles.has(id)) {
    throw new Error(`Duplicate winner profile for ${id}`);
  }
  if (winners.length !== dimensions.length || winners.some((value) => !value)) {
    throw new Error(`Invalid winner profile for ${id}`);
  }
  winnerProfiles.set(id, winners);
};
const assignWinners = (code, ids) => {
  const winners = [...code].map((value) => winnerNames[value]);
  if (winners.length !== 6 || winners.some((value) => !value)) {
    throw new Error(`Invalid winner code ${code}`);
  }
  for (const id of ids) {
    setWinnerProfile(id, winners);
  }
};

assignWinners('etntis', ['WG-META-001']);
assignWinners('esnsis', ['WG-META-002']);
assignWinners('ssnsis', ['WG-META-003']);
assignWinners('etntia', ['WG-META-004A']);
assignWinners('rrnrii', ['WG-META-004B', 'WG-META-004C', 'WG-META-004D']);
assignWinners('ppnpip', ['WG-CMD-001A', 'WG-CMD-001B', 'WG-CMD-003E1']);
assignWinners('tpesip', ['WG-CMD-003A1', 'WG-CMD-003A2', 'WG-CMD-003A3']);
assignWinners('ptptip', ['WG-COLLAB-002A']);
assignWinners('ptntip', ['WG-COLLAB-002B']);
assignWinners('rrnrii', ['WG-CMD-003D2']);
assignWinners('ppnpip', ['WG-CMD-002A']);
assignWinners('ssesis', ['WG-CMD-003B1A', 'WG-CMD-003B1B', 'WG-CMD-003B1C']);
assignWinners('eansis', ['WG-CMD-002B']);
assignWinners('aaeaia', ['WG-CMD-003D1']);
assignWinners('eataia', ['WG-CMD-003C1']);
assignWinners('aataia', ['WG-CMD-003C2']);
assignWinners('ttntia', ['WG-CMD-004A1']);
assignWinners('tantii', ['WG-CMD-004A2']);
assignWinners('ppnpip', ['WG-CMD-003E2']);
assignWinners('iiniii', ['WG-CMD-004B']);
assignWinners('rrtrir', ['WG-COLLAB-002C']);
assignWinners('ppppip', [
  'WG-DOC-003B',
  'WG-DOC-005B',
  'WG-DOC-005C',
  'WG-DOC-006',
  'WG-DOC-009',
  'WG-DOC-010',
  'WG-DOC-011',
  'WG-DOC-018',
]);
assignWinners('eeeeie', ['WG-DOC-017A', 'WG-DOC-017B']);
assignWinners('ssssis', [
  'WG-DOC-003A',
  'WG-DOC-004',
  'WG-DOC-008',
  'WG-DOC-012',
  'WG-DOC-013',
  'WG-DOC-016',
]);
assignWinners('rrrrii', ['WG-DOC-004B1']);
assignWinners('iiiiii', ['WG-DOC-004B2']);
assignWinners('ppppip', ['WG-DOC-001B']);
assignWinners('ppppip', ['WG-DOC-007']);
assignWinners('ppppip', ['WG-HIST-001A']);
assignWinners('epeeip', ['WG-HIST-002']);
assignWinners('ppppip', ['WG-HIST-003']);
assignWinners('aaaaia', [
  'WG-PRODUCT-001B',
  'WG-PRODUCT-001C',
  'WG-PRODUCT-001D',
  'WG-PRODUCT-002',
  'WG-PRODUCT-003B1',
  'WG-PRODUCT-003B2',
  'WG-PRODUCT-003C',
  'WG-PRODUCT-003E',
]);
assignWinners('ppppip', [
  'WG-PROOF-001A',
  'WG-PROOF-001B',
  'WG-PROOF-001C',
  'WG-PROOF-001D',
  'WG-PROOF-002A1',
  'WG-PROOF-002A2',
  'WG-PROOF-002A3',
  'WG-PROOF-002A4',
  'WG-PROOF-002B',
]);
assignWinners('ttttii', ['WG-PROOF-002C']);
assignWinners('aaaaia', ['WG-PROOF-003']);
assignWinners('ssssis', ['WG-PROOF-004A', 'WG-PROOF-004B']);
assignWinners('iiiiii', ['WG-PROOF-004C']);
assignWinners('ppppip', [
  'WG-STATE-001A',
  'WG-STATE-002A',
  'WG-STATE-002B',
  'WG-STATE-008',
  'WG-STATE-010A',
  'WG-STATE-010B',
  'WG-STATE-015B',
]);
assignWinners('epeeip', ['WG-STATE-003A']);
assignWinners('ppppip', ['WG-STATE-009A', 'WG-STATE-009B']);
assignWinners('pppeip', ['WG-STATE-003B']);
assignWinners('eseeis', ['WG-STATE-004A']);
assignWinners('sseeis', ['WG-STATE-004B']);
assignWinners('ppppip', ['WG-STATE-005B']);
assignWinners('rpptip', ['WG-STATE-005A']);
assignWinners('ppppip', ['WG-STATE-005C']);
assignWinners('pppeip', ['WG-STATE-006A']);
assignWinners('tpptip', ['WG-STATE-007A']);
assignWinners('rrttir', ['WG-STATE-007B']);
assignWinners('ppppip', ['WG-STATE-011A']);
assignWinners('rrntii', ['WG-STATE-012']);
assignWinners('ppeeip', ['WG-STATE-015A']);
assignWinners('etntip', ['WG-STATE-014A']);
assignWinners('rrnrii', ['WG-STATE-014B']);
assignWinners('aaaaia', [
  'WG-TABLE-001',
  'WG-TABLE-002',
  'WG-TABLE-003',
  'WG-TABLE-004A',
  'WG-TABLE-004B',
  'WG-TABLE-005',
]);
assignWinners('ssssia', ['WG-TABLE-006']);
assignWinners('ssssis', ['WG-VIEW-001A']);
assignWinners('ppppip', [
  'WG-VIEW-002',
  'WG-VIEW-005A1',
  'WG-VIEW-005A2',
  'WG-VIEW-005C1',
  'WG-VIEW-006A',
  'WG-VIEW-006B',
  'WG-VIEW-007A',
  'WG-VIEW-008A',
  'WG-VIEW-010A',
]);
assignWinners('ppppip', [
  'WG-VIEW-003A',
  'WG-VIEW-005B1',
  'WG-VIEW-007B1',
  'WG-VIEW-007B2',
  'WG-VIEW-008B1',
  'WG-VIEW-008B2',
  'WG-VIEW-010C1A',
  'WG-VIEW-016B',
]);
assignWinners('iiiiii', [
  'WG-VIEW-003B',
  'WG-VIEW-012C2',
  'WG-VIEW-014A2',
  'WG-VIEW-014C1',
]);
assignWinners('rrnrii', [
  'WG-VIEW-005B2',
  'WG-VIEW-008B3',
  'WG-VIEW-013A',
  'WG-VIEW-014C2',
  'WG-VIEW-016A',
]);
assignWinners('ttpsis', ['WG-VIEW-004B']);
assignWinners('ssssis', ['WG-VIEW-004A1']);
assignWinners('nnnnnn', ['WG-VIEW-004A2']);
assignWinners('ppppip', ['WG-VIEW-004A3']);
assignWinners('ppppii', ['WG-VIEW-009A']);
assignWinners('ssssii', ['WG-VIEW-010B1', 'WG-VIEW-010B2']);
assignWinners('aanaia', [
  'WG-VIEW-010C1B',
  'WG-VIEW-012A1B',
  'WG-VIEW-012A1C',
  'WG-VIEW-012A2',
  'WG-VIEW-012B',
  'WG-VIEW-012C1B',
  'WG-VIEW-013D',
  'WG-VIEW-014A1',
  'WG-VIEW-014B',
  'WG-VIEW-015B2',
  'WG-VIEW-015C',
]);
assignWinners('ppnpip', ['WG-VIEW-012A1A', 'WG-VIEW-012C1A', 'WG-VIEW-015B1']);
assignWinners('ssnsis', ['WG-VIEW-015A']);
assignWinners('ssssis', ['WG-VIEW-010C2', 'WG-VIEW-011A']);
assignWinners('ssssii', ['WG-VIEW-011B']);
assignWinners('ttntii', ['WG-VIEW-013B', 'WG-VIEW-013C']);
assignWinners('irnrii', ['WG-WEB-001']);
assignWinners('aanaia', ['WG-WEB-003']);
assignWinners('iiiiii', ['WG-WEB-002']);
assignWinners('ppnpip', ['WG-META-002B']);
assignWinners('ppppip', ['WG-INTEGRATION-NESTED-002A']);
assignWinners('rrnrii', ['WG-INTEGRATION-NESTED-002B']);
assignWinners('rrrrii', ['WG-APPLICATION-BLAME-001']);
assignWinners('rrnrii', ['WG-APPLICATION-BLAME-002']);
assignWinners('ppppip', [
  'LOCAL-DOC-ROOTS',
  'LOCAL-ANCHORS',
  'LOCAL-COMMIT-IMPACT-METADATA',
  'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS',
]);
assignWinners('ppppip', ['LOCAL-YJS']);
assignWinners('ppppip', [
  'LOCAL-LAYOUT-PLAN',
  'LOCAL-LAYOUT-GEOMETRY',
  'LOCAL-A11Y-ANNOUNCEMENTS',
  'LOCAL-A11Y-DOM-COVERAGE',
  'LOCAL-HYPERSCRIPT',
]);
assignWinners('ssnsis', ['LOCAL-EXTENSION-CAPABILITIES', 'LOCAL-REACT-HOST']);
assignWinners('ssnsis', [
  'LOCAL-PROOF-AFFECTED-CHECKS',
  'LOCAL-PROOF-BROWSER-COVERAGE',
  'LOCAL-PROOF-CI-MATRIX',
  'LOCAL-PROOF-RELEASE-GATES',
]);
assignWinners('ppnpip', ['LOCAL-PROOF-TRACE-REDUCTION']);
assignWinners('aaaaia', ['PLATE-COPIED-KITS']);
assignWinners('rrrrir', ['LOCAL-HISTORY-IDLE-GROUP']);

assignWinners('ssnsis', ['WG-META-005A']);
assignWinners('rrnrii', ['WG-META-005B']);
assignWinners('ppppip', ['WG-DOC-001A', 'WG-DOC-001C', 'WG-DOC-002A']);
assignWinners('ssssis', [
  'WG-DOC-002B',
  'WG-DOC-014A',
  'WG-DOC-014B',
  'WG-DOC-015A',
  'WG-DOC-015B',
  'WG-DOC-015C',
]);
assignWinners('aaaaia', ['WG-DOC-002C']);
assignWinners('ttetii', ['WG-TABLE-007A']);
assignWinners('etetii', ['WG-TABLE-007B']);
assignWinners('ppppip', ['WG-STATE-006B']);

setWinnerProfile(
  'LOCAL-LIFECYCLE-PHASE',
  [...'ttntii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-RUNTIME-API-TREESHAKING',
  [...'etntii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-DOC-002D',
  [...'ppetip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'PLATE-PLUGIN-IDENTITY',
  [...'itttii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-MAX-LENGTH-POLICY',
  [...'iiniis'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-NATIVE-INPUT-RECONCILIATION',
  [...'ppppip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-MATH-CSS-BOUNDARY',
  [...'iiniii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-MEDIA-KEYBOARD-RESIZE',
  [...'rrarii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-INTEGRATION-NESTED-001',
  [...'ppppip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-STATE-011B',
  [...'ppetip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-STATE-013',
  [...'rpppir'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-STATE-001B',
  [...'ppppii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-VIEW-005C2',
  [...'enetip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-COLLAB-001',
  [...'tpttip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2A',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-CMD-003B2A',
  [...'eataia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-CMD-003B2B',
  [...'rrrrii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2A',
  [...'eaetia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2B',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2B',
  [...'aattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2C',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2C',
  [...'aattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2D',
  [...'rrrrir'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2D',
  [...'rrrrii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2E',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2E',
  [...'aattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2F',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2F',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-001A2G',
  [...'epppip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003A2G',
  [...'ppppip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003D1A',
  [...'aattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003D1B',
  [...'etntia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003D2',
  [...'etntia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-003D3',
  [...'eattia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-004A1',
  [...'etntia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-004A2',
  [...'etntia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-004B',
  [...'etetia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PRODUCT-004C',
  [...'etetia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'PLATE-STATIC-RENDERING',
  [...'aanaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005A1A',
  [...'aanaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005A1B',
  [...'aanaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005A2',
  [...'iiniii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005B1',
  [...'irnrii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005B2',
  [...'aanaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005B3A',
  [...'rrnrii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-PROOF-005B3B',
  [...'iiiiii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-SCHEMA-IDENTITY',
  [...'ppppis'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'PLATE-HEADING-ONTOLOGY',
  [...'aaeaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL',
  [...'ppprip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'WG-DOC-005A',
  [...'ppppip'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-COMPLETION-LIFECYCLE',
  [...'aanaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-VERTICAL-WRITING-LAYOUT',
  [...'iiiiii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-VERTICAL-WRITING-INPUT',
  [...'iiiiii'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-OFFLINE-MERGE-REVIEW',
  [...'aaaaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-HOST-EDITOR-CAPABILITY',
  [...'isssis'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY',
  [...'aaaaia'].map((value) => winnerNames[value])
);
setWinnerProfile(
  'LOCAL-EXTERNAL-MODEL-SYNC',
  [...'isssis'].map((value) => winnerNames[value])
);

const siteRedirects = Object.freeze({
  'WG-DOC-004A': ['WG-DOC-004'],
  'WG-PRODUCT-001A': ['WG-PRODUCT-001A2'],
  'WG-VIEW-001': ['WG-VIEW-001A'],
  'WG-VIEW-001B': ['LOCAL-LIFECYCLE-PHASE'],
  'WG-VIEW-009B': ['LOCAL-NATIVE-INPUT-RECONCILIATION'],
});
const siteSourcesByRow = new Map();
for (const concept of inventories.wordgardSite.concepts) {
  const rowIds = concept.representation.auditConceptIds ?? [];
  for (const rawId of rowIds) {
    const targets = siteRedirects[rawId] ?? [rawId];
    for (const target of targets) {
      const values = siteSourcesByRow.get(target) ?? [];
      values.push(concept.id);
      siteSourcesByRow.set(target, unique(values));
    }
  }
}

const comparisonOverrides = Object.freeze({
  'WG-PROOF-001A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-001B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-001C': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-001D': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-002A1': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-002A2': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-002A3': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PROOF-002A4': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-CMD-003A1': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-CMD-003A2': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-CMD-003A3': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-CMD-003B1A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-CMD-003B1B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-CMD-003B1C': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-CMD-003C1': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-CMD-003C2': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-003A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-003B': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-VIEW-005B1': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-005B2': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-VIEW-007B1': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-007B2': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-008B1': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-008B2': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-008B3': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-VIEW-010B1': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-VIEW-010B2': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-VIEW-010C1A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-010C1B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012A1A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-012A1B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012A1C': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012A2': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012C1A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-012C1B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-012C2': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-VIEW-013A': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'reject',
  },
  'WG-VIEW-013B': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'defer',
  },
  'WG-VIEW-013C': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'defer',
  },
  'WG-VIEW-013D': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-014A1': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-014A2': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-VIEW-014B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-014C1': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-VIEW-014C2': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'rearchitect',
  },
  'WG-VIEW-015A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-VIEW-015B1': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-015B2': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-015C': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-VIEW-016A': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'reject',
  },
  'WG-VIEW-016B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-STATE-009A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-009B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-014A': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-STATE-014B': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-META-004A': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-META-004B': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-META-004C': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-META-004D': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-META-005A': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'keep',
  },
  'WG-META-005B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-CMD-001A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-CMD-001B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-CMD-004A1': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-CMD-004A2': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'reject',
  },
  'WG-CMD-004B': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-CMD-003D2': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-COLLAB-001': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-CMD-003B2A': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-CMD-003B2B': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'reject',
  },
  'WG-COLLAB-002C': {
    classification: 'reference stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-PRODUCT-001A2A': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2A': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-001A2B': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-001A2C': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2C': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-001A2D': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'reject',
  },
  'WG-PRODUCT-003A2D': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'rearchitect',
  },
  'WG-PRODUCT-001A2E': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2E': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-001A2F': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2F': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-001A2G': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PRODUCT-003A2G': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-PRODUCT-003D1A': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003D1B': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003D2': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-003D3': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-004A1': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-004A2': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-004B': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PRODUCT-004C': {
    classification: 'different tradeoff',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PROOF-005A1A': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PROOF-005A1B': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PROOF-005A2': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-PROOF-005B1': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-PROOF-005B2': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PROOF-005B3A': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-PROOF-005B3B': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-DOC-003A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-DOC-001B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-001A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-001C': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-002A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-002B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-002C': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'reject',
  },
  'WG-DOC-002D': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-014A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-014B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-015A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-015B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-015C': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'reject',
  },
  'WG-DOC-003B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-DOC-004B1': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-DOC-004B2': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-DOC-017A': {
    classification: 'equivalent',
    preferred: 'tie',
    verdict: 'keep',
  },
  'WG-DOC-017B': {
    classification: 'equivalent',
    preferred: 'tie',
    verdict: 'keep',
  },
  'WG-PROOF-002C': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'keep',
  },
  'WG-PROOF-004C': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'rearchitect',
  },
  'WG-STATE-001B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-006B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-003A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-STATE-003B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-004A': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-STATE-004B': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-STATE-005A': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-005B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-005C': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-007A': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-007B': {
    classification: 'different tradeoff',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-STATE-011A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-STATE-011B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-STATE-012': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'reject',
  },
  'WG-STATE-013': {
    classification: 'reference stronger',
    preferred: 'Plite',
    verdict: 'rearchitect',
  },
  'WG-VIEW-004A1': {
    classification: 'Plite/Plate stack stronger',
    preferred: 'Plite/Plate stack',
    verdict: 'keep',
  },
  'WG-VIEW-004A2': {
    classification: 'not-applicable',
    preferred: 'not-applicable',
    verdict: 'reject',
  },
  'WG-VIEW-004A3': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'keep',
  },
  'WG-VIEW-004B': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'keep',
  },
  'WG-VIEW-005C2': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'defer',
  },
  'WG-WEB-001': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'rearchitect',
  },
  'WG-WEB-002': {
    classification: 'insufficient evidence',
    preferred: 'insufficient evidence',
    verdict: 'reject',
  },
  'WG-WEB-003': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-META-002B': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-INTEGRATION-NESTED-001': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-INTEGRATION-NESTED-002A': {
    classification: 'Plite stronger',
    preferred: 'Plite',
    verdict: 'reject',
  },
  'WG-INTEGRATION-NESTED-002B': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'reject',
  },
  'WG-APPLICATION-BLAME-001': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-APPLICATION-BLAME-002': {
    classification: 'reference stronger',
    preferred: 'reference',
    verdict: 'defer',
  },
  'WG-PROOF-005A': {
    classification: 'Plate stronger',
    preferred: 'Plate',
    verdict: 'keep',
  },
  'WG-PROOF-005B': {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
    verdict: 'keep',
  },
});

const materialDispositions = Object.freeze({
  'PLATE-PLUGIN-IDENTITY': {
    referenceAdaptation: 'reject',
    localDebt: 'material',
    proofAdaptation: 'keep-local',
  },
  'LOCAL-LIFECYCLE-PHASE': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'keep-local',
  },
  'LOCAL-HISTORY-IDLE-GROUP': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'LOCAL-MAX-LENGTH-POLICY': {
    referenceAdaptation: 'not-applicable',
    localDebt: 'material',
    proofAdaptation: 'not-applicable',
  },
  'LOCAL-RUNTIME-API-TREESHAKING': {
    referenceAdaptation: 'reject',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'LOCAL-MATH-CSS-BOUNDARY': {
    referenceAdaptation: 'not-applicable',
    localDebt: 'material',
    proofAdaptation: 'not-applicable',
  },
  'LOCAL-MEDIA-KEYBOARD-RESIZE': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'WG-PROOF-004C': {
    referenceAdaptation: 'not-applicable',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'WG-STATE-013': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'WG-PRODUCT-003A2D': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'WG-WEB-001': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
  'WG-VIEW-014C2': {
    referenceAdaptation: 'adapt',
    localDebt: 'material',
    proofAdaptation: 'adapt',
  },
});

const defaultDecision = ({ status, verdict }) => ({
  localDebt: verdict === 'defer' ? 'insufficient evidence' : 'none',
  priority: '—',
  proofAdaptation:
    verdict === 'defer'
      ? 'defer'
      : verdict === 'reject'
        ? 'reject'
        : 'keep-local',
  referenceAdaptation:
    status.startsWith('A/') || status.startsWith('N/')
      ? 'not-applicable'
      : verdict === 'defer'
        ? 'defer'
        : verdict === 'reject'
          ? 'reject'
          : 'keep-local',
});

const siteParentSources = Object.freeze({
  'WG-META-002B': ['WG-META-002'],
  'WG-DOC-004B1': ['WG-DOC-004'],
  'WG-DOC-004B2': ['WG-DOC-004'],
  'WG-STATE-003A': ['WG-STATE-003'],
  'WG-STATE-003B': ['WG-STATE-003'],
  'WG-STATE-004A': ['WG-STATE-004'],
  'WG-STATE-004B': ['WG-STATE-004'],
  'WG-STATE-005A': ['WG-STATE-005'],
  'WG-STATE-005B': ['WG-STATE-005'],
  'WG-STATE-005C': ['WG-STATE-005'],
  'WG-STATE-007A': ['WG-STATE-007'],
  'WG-STATE-007B': ['WG-STATE-007'],
  'WG-VIEW-013A': ['WG-VIEW-013'],
  'WG-VIEW-013B': ['WG-VIEW-013'],
  'WG-VIEW-013C': ['WG-VIEW-013'],
  'WG-VIEW-013D': ['WG-VIEW-013'],
});

const splitSiteParents = Object.freeze({
  'WG-INTEGRATION-NESTED-002A': 'WG-INTEGRATION-NESTED-002',
  'WG-INTEGRATION-NESTED-002B': 'WG-INTEGRATION-NESTED-002',
  'WG-PROOF-005A1A': 'WG-PROOF-005A',
  'WG-PROOF-005A1B': 'WG-PROOF-005A',
  'WG-PROOF-005A2': 'WG-PROOF-005A',
  'WG-PROOF-005B1': 'WG-PROOF-005B',
  'WG-PROOF-005B2': 'WG-PROOF-005B',
  'WG-PROOF-005B3A': 'WG-PROOF-005B',
  'WG-PROOF-005B3B': 'WG-PROOF-005B',
});

const wordgardAnchors = Object.freeze({
  'WG-META-005A': ['../wordgard/bin/test-dead-code.ts:1-47'],
  'WG-META-005B': ['../wordgard/bin/mass-change.ts:1-23'],
  'WG-CMD-001A': ['../wordgard/src/command/command.ts:19-55'],
  'WG-CMD-001B': [
    '../wordgard/src/command/command.ts:4-17',
    '../wordgard/src/command/command.ts:57-96',
  ],
  'WG-CMD-002A': [
    '../wordgard/src/command/command.ts:55-57',
    '../wordgard/src/command/commands.ts:20-487',
  ],
  'WG-CMD-002B': [
    '../wordgard/src/command/command.ts:43-96',
    '../wordgard/src/command/commands.ts:494-559',
  ],
  'WG-CMD-003B1': [
    '../wordgard/src/command/commands.ts:162-222',
    '../wordgard/src/command/helper.ts:353-595',
  ],
  'WG-CMD-003B2': ['../wordgard/src/command/commands.ts:263-302'],
  'WG-CMD-003D1': ['../wordgard/src/command/commands.ts:223-260'],
  'WG-CMD-003D2': ['../wordgard/src/command/helper.ts:596-609'],
  'WG-CMD-003E1': [
    '../wordgard/src/command/commands.ts:432-487',
    '../wordgard/src/command/commands.ts:560-576',
  ],
  'WG-CMD-003E2': ['../wordgard/src/command/commands.ts:487-559'],
  'WG-COLLAB-002A': ['../wordgard/src/collab/collab.ts:245-274'],
  'WG-COLLAB-002B': [
    '../wordgard/src/collab/collab.ts:55-80',
    '../wordgard/src/collab/collab.ts:127-208',
  ],
  'WG-COLLAB-002C': ['../wordgard/src/collab/collab.ts:245-274'],
  'WG-DOC-001B': [
    '../wordgard/src/doc/node.ts:63-69',
    '../wordgard/src/doc/node.ts:483-509',
    '../wordgard/src/doc/node.ts:665-688',
    '../wordgard/src/doc/node.ts:973-992',
    '../wordgard/src/doc/slice.ts:26-35',
  ],
  'WG-DOC-001A': [
    '../wordgard/src/doc/node.ts:25-98',
    '../wordgard/src/doc/node.ts:325-781',
  ],
  'WG-DOC-001C': [
    '../wordgard/src/doc/node.ts:647-653',
    '../wordgard/src/doc/node.ts:862-930',
    '../wordgard/src/doc/schema.ts:7-39',
  ],
  'WG-DOC-002A': ['../wordgard/src/doc/node.ts:12-61'],
  'WG-DOC-002B': ['../wordgard/src/doc/node.ts:217-267'],
  'WG-DOC-002C': ['../wordgard/src/doc/node.ts:268-323'],
  'WG-DOC-002D': [
    '../wordgard/src/state/state.ts:273-275',
    '../wordgard/src/state/state.ts:872-880',
    '../wordgard/src/editor/decoration.ts:117-177',
    '../wordgard/test/webtest-content.ts:439-560',
  ],
  'WG-DOC-003A': [
    '../wordgard/src/doc/mark.ts:43-80',
    '../wordgard/src/doc/mark.ts:139-279',
  ],
  'WG-DOC-003B': [
    '../wordgard/src/doc/mark.ts:7-41',
    '../wordgard/src/doc/mark.ts:82-136',
  ],
  'WG-DOC-005A': ['../wordgard/src/doc/schema.ts:39-182'],
  'WG-DOC-005B': [
    '../wordgard/src/doc/node.ts:63-98',
    '../wordgard/src/doc/node.ts:325-505',
  ],
  'WG-DOC-005C': ['../wordgard/src/doc/node.ts:938-992'],
  'WG-DOC-017A': ['../wordgard/src/doc/helper.ts:1-26'],
  'WG-DOC-017B': [
    '../wordgard/src/doc/helper.ts:27-36',
    '../wordgard/src/doc/error.ts:1-7',
  ],
  'WG-DOC-014A': ['../wordgard/src/doc/shape.ts:6-360'],
  'WG-DOC-014B': ['../wordgard/src/doc/shape.ts:362-468'],
  'WG-DOC-015A': ['../wordgard/src/doc/parse.ts:66-245'],
  'WG-DOC-015B': [
    '../wordgard/src/doc/parse.ts:10-19',
    '../wordgard/src/doc/parse.ts:247-499',
  ],
  'WG-DOC-015C': [
    '../wordgard/src/doc/parse.ts:21-64',
    '../wordgard/src/doc/parse.ts:501-557',
  ],
  'WG-HIST-001A': [
    '../wordgard/src/history/history.ts:6-170',
    '../wordgard/src/history/history.ts:261-314',
  ],
  'WG-PRODUCT-001A2': [
    '../wordgard/src/types/schema.ts:7-16',
    '../wordgard/src/types/schema.ts:40-191',
  ],
  'WG-PRODUCT-003A2': [
    '../wordgard/src/schema/block.ts:12-60',
    '../wordgard/src/schema/block.ts:120-332',
  ],
  'WG-PRODUCT-003B1': ['../wordgard/src/schema/mark.ts:10-188'],
  'WG-PRODUCT-003B2': ['../wordgard/src/schema/color.ts:276-327'],
  'WG-PRODUCT-003D1': [
    '../wordgard/src/schema/link.ts:8-43',
    '../wordgard/src/schema/link.ts:100-137',
  ],
  'WG-PRODUCT-003D2': [
    '../wordgard/src/schema/link.ts:45-98',
    '../wordgard/src/schema/link.ts:139-152',
  ],
  'WG-PRODUCT-003D3': ['../wordgard/src/schema/link.ts:154-171'],
  'WG-PRODUCT-004A1': [
    '../wordgard/src/schema/imagedialog.ts:9-12',
    '../wordgard/src/schema/imagedialog.ts:95-115',
  ],
  'WG-PRODUCT-004A2': [
    '../wordgard/src/schema/imagedialog.ts:13-94',
    '../wordgard/src/schema/imagedialog.ts:116-281',
  ],
  'WG-STATE-001A': [
    '../wordgard/src/state/state.ts:49-157',
    '../wordgard/src/state/state.ts:198-293',
  ],
  'WG-STATE-001B': [
    '../wordgard/src/collab/collab.ts:23-37',
    '../wordgard/src/collab/collab.ts:211-225',
    '../wordgard/src/history/history.ts:381-418',
  ],
  'WG-STATE-002A': ['../wordgard/src/state/state.ts:320-416'],
  'WG-STATE-002B': [
    '../wordgard/src/state/state.ts:219-250',
    '../wordgard/src/state/state.ts:417-422',
  ],
  'WG-STATE-006A': [
    '../wordgard/src/state/transaction.ts:12-195',
    '../wordgard/src/state/transaction.ts:359-406',
  ],
  'WG-STATE-006B': [
    '../wordgard/src/state/state.ts:89-99',
    '../wordgard/src/state/state.ts:1060-1069',
  ],
  'WG-STATE-010A': [
    '../wordgard/src/state/selection.ts:20-218',
    '../wordgard/src/state/selection.ts:375-432',
  ],
  'WG-STATE-010B': ['../wordgard/src/state/selection.ts:219-374'],
  'WG-STATE-011A': ['../wordgard/src/state/textblock.ts:23-141'],
  'WG-STATE-011B': [
    '../wordgard/src/state/textblock.ts:142-229',
    '../wordgard/src/state/selection.ts:435-576',
  ],
  'WG-STATE-015A': ['../wordgard/src/state/transaction.ts:197-282'],
  'WG-STATE-015B': [
    '../wordgard/src/state/transaction.ts:283-356',
    '../wordgard/src/state/transaction.ts:372-379',
  ],
  'WG-TABLE-004A': ['../wordgard/src/table/cellselection.ts:31-243'],
  'WG-TABLE-004B': ['../wordgard/src/table/cellselection.ts:9-30'],
  'WG-TABLE-007A': ['../wordgard/src/table/menu.ts:13-137'],
  'WG-TABLE-007B': ['../wordgard/src/table/menu.ts:139-265'],
  'WG-VIEW-001A': [
    '../wordgard/src/editor/editor.ts:28-190',
    '../wordgard/src/editor/editor.ts:840-1073',
  ],
  'WG-VIEW-004A1': [
    '../wordgard/src/editor/tile.ts:55-193',
    '../wordgard/src/editor/tile.ts:299-367',
    '../wordgard/src/editor/tile.ts:786-854',
  ],
  'WG-VIEW-004A2': [
    '../wordgard/src/editor/tile.ts:13-54',
    '../wordgard/src/editor/tile.ts:915-1050',
  ],
  'WG-VIEW-004A3': ['../wordgard/src/editor/tile.ts:786-854'],
  'WG-VIEW-004B': [
    '../wordgard/src/editor/tile.ts:875-914',
    '../wordgard/src/editor/tile.ts:1219-1225',
  ],
  'WG-VIEW-005A1': ['../wordgard/src/editor/decoration.ts:112-579'],
  'WG-VIEW-005A2': [
    '../wordgard/src/editor/decoration.ts:10-109',
    '../wordgard/src/editor/decoration.ts:511-533',
  ],
  'WG-VIEW-005C1': ['../wordgard/src/editor/decoration.ts:973-1112'],
  'WG-VIEW-005C2': ['../wordgard/src/editor/decoration.ts:1113-1222'],
  'WG-VIEW-007A': ['../wordgard/src/editor/selection.ts:1-36'],
  'WG-VIEW-007B': [
    '../wordgard/src/editor/selection.ts:37-149',
    '../wordgard/src/editor/editor.ts:490-508',
  ],
  'WG-VIEW-008B1': [
    '../wordgard/src/editor/domobserver.ts:35-61',
    '../wordgard/src/editor/domobserver.ts:71-104',
  ],
  'WG-VIEW-008B2': [
    '../wordgard/src/editor/domobserver.ts:39-40',
    '../wordgard/src/editor/domobserver.ts:78-90',
  ],
  'WG-VIEW-008B3': [
    '../wordgard/src/editor/dom.ts:90-210',
    '../wordgard/src/editor/domobserver.ts:91-104',
  ],
  'WG-VIEW-009A': [
    '../wordgard/src/editor/input.ts:142-218',
    '../wordgard/src/editor/input.ts:680-900',
  ],
  'WG-VIEW-010B1': [
    '../wordgard/src/editor/input.ts:142-166',
    '../wordgard/src/editor/input.ts:680-900',
  ],
  'WG-VIEW-010B2': [
    '../wordgard/src/editor/input.ts:167-185',
    '../wordgard/src/editor/input.ts:369-567',
  ],
  'WG-VIEW-010C1': ['../wordgard/src/editor/input.ts:487-576'],
  'WG-VIEW-010C2': ['../wordgard/src/editor/input.ts:577-618'],
  'WG-VIEW-011A': [
    '../wordgard/src/editor/clipboard.ts:17-31',
    '../wordgard/src/editor/clipboard.ts:66-112',
  ],
  'WG-VIEW-011B': [
    '../wordgard/src/editor/clipboard.ts:32-60',
    '../wordgard/src/editor/clipboard.ts:114-166',
  ],
  'WG-VIEW-012B': [
    '../wordgard/src/editor/inputrule.ts:11-160',
    '../wordgard/src/editor/inputrule.ts:173-214',
  ],
  'WG-VIEW-012C1': [
    '../wordgard/src/editor/input.ts:18-29',
    '../wordgard/src/editor/input.ts:108-166',
  ],
  'WG-VIEW-012C2': [
    '../wordgard/src/editor/input.ts:30-40',
    '../wordgard/src/editor/input.ts:317-325',
  ],
  'WG-VIEW-012A1': [
    '../wordgard/src/editor/keymap.ts:5-107',
    '../wordgard/src/editor/keymap.ts:240-379',
  ],
  'WG-VIEW-012A2': ['../wordgard/src/editor/keymap.ts:108-238'],
  'WG-VIEW-013A': ['../wordgard/src/editor/theme.ts:1-196'],
  'WG-VIEW-013B': [
    '../wordgard/src/editor/editor.ts:317-336',
    '../wordgard/src/editor/editor.ts:715-759',
  ],
  'WG-VIEW-014A1': ['../wordgard/src/editor/panel.ts:14-206'],
  'WG-VIEW-014A2': ['../wordgard/src/editor/dialog.ts:8-186'],
  'WG-VIEW-014C1': ['../wordgard/src/editor/tooltip.ts:7-616'],
  'WG-VIEW-014C2': ['../wordgard/src/editor/tooltip.ts:618-838'],
});

const contractEvidenceSeed = Object.freeze({
  'WG-META-004A': {
    wordgard: {
      public: ['../wordgard/README.md:1-24'],
      owner: ['../wordgard/demo/demo.ts:1-15'],
      consumers: ['../wordgard/README.md:1-24'],
      lifecycle: ['../wordgard/demo/demo.ts:1-15'],
      proof: ['../wordgard/demo/demo.ts:1-15'],
    },
    plite: {
      public: ['apps/plite/src/app/page.tsx:1-20'],
      owner: ['apps/plite/src/app/page.tsx:1-20'],
      consumers: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:1-63',
      ],
      lifecycle: ['apps/plite/src/app/page.tsx:1-20'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:1-63',
      ],
    },
    plate: {
      public: ['apps/www/src/registry/registry-examples.ts:1-160'],
      owner: ['apps/www/src/registry/registry-examples.ts:1-160'],
      consumers: ['content/docs/(guides)/feature-kits.mdx:1-137'],
      lifecycle: ['apps/www/src/registry/registry-examples.ts:160-360'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1-220',
      ],
    },
  },
  'WG-META-004B': {
    wordgard: {
      public: ['../wordgard-website/site/examples/index.html:1-84'],
      owner: ['../wordgard-website/src/build.ts:64-110'],
      consumers: ['../wordgard-website/site/examples/index.html:1-84'],
      lifecycle: ['../wordgard-website/src/build.ts:194-210'],
      proof: ['../wordgard-website/site/examples/index.html:1-84'],
    },
    plite: {
      covers: ['apps/plite/src/app/page.tsx:1-20'],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/example-navigation.test.ts:1-63',
      ],
    },
    plate: {
      covers: [
        'apps/www/src/registry/registry-examples.ts:1-160',
        'content/docs/(guides)/feature-kits.mdx:1-137',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:1-220',
      ],
    },
  },
  'WG-META-004C': {
    wordgard: {
      public: ['../wordgard-website/site/try/index.html:1-154'],
      owner: ['../wordgard-website/site/try/try.ts:143-250'],
      consumers: ['../wordgard-website/site/try/index.html:120-150'],
      lifecycle: ['../wordgard-website/site/try/sandbox.js:1-51'],
    },
  },
  'WG-META-004D': {
    wordgard: {
      public: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
      owner: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
      consumers: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
      lifecycle: ['../wordgard-website/site/docs/prosemirror/index.md:1-349'],
    },
    plate: {
      covers: ['content/docs/plite/migration.mdx:1-220'],
      proof: ['content/docs/plite/migration.mdx:1-220'],
    },
  },
  'LOCAL-DOC-ROOTS': {
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:140-165'],
      owner: ['packages/plite/src/interfaces/schema.ts:220-246'],
      consumers: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:75-167',
      ],
      lifecycle: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:197-228',
      ],
      proof: ['packages/plite/test/schema-contract.ts:362-496'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:316-359',
      ],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:84-103',
      ],
    },
  },
  'LOCAL-SCHEMA-IDENTITY': {
    wordgard: {
      covers: ['../wordgard/src/doc/schema.ts:192-274'],
      proof: ['../wordgard/test/test-schema.ts:23-58'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:361-380'],
      owner: ['packages/plite/src/core/schema-compiler.ts:3689-3737'],
      consumers: ['packages/plite/test/schema-contract.ts:1059-1105'],
      lifecycle: ['packages/plite-history/src/history-codec.ts:26-92'],
      proof: ['packages/plite/test/schema-contract.ts:1059-1105'],
    },
    plate: {
      public: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      owner: ['packages/core/src/internal/plugin/compilePlateModel.ts:316-359'],
      consumers: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:84-103',
      ],
      lifecycle: ['packages/core/src/lib/editor/withPlite.ts:194-253'],
      proof: [
        'packages/core/src/internal/plugin/compilePlateModel.spec.ts:711-721',
        'packages/core/src/lib/editor/withPlite.slow.ts:382-405',
        'packages/core/src/lib/editor/withPlite.slow.ts:582-606',
      ],
    },
  },
  'PLATE-HEADING-ONTOLOGY': {
    wordgard: {
      public: ['../wordgard/src/types/schema.ts:14-35'],
      owner: ['../wordgard/src/schema/block.ts:57-114'],
      consumers: ['../wordgard/test/test-commands.ts:513-555'],
      lifecycle: ['../wordgard/src/schema/block.ts:57-114'],
      proof: ['../wordgard/test/test-commands.ts:513-555'],
    },
    plate: {
      public: ['packages/basic-nodes/src/lib/BaseHeadingPlugins.ts:9-68'],
      owner: ['packages/basic-nodes/src/lib/BaseHeadingPlugins.ts:70-243'],
      consumers: [
        'packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx:38-176',
      ],
      lifecycle: ['packages/basic-nodes/src/lib/BaseHeadingPlugins.ts:70-243'],
      proof: [
        'packages/basic-nodes/src/lib/BaseHeadingPlugins.spec.tsx:179-255',
      ],
    },
  },
  'WG-DOC-004B1': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:344-390'],
      owner: ['../wordgard/src/doc/schema.ts:344-390'],
      consumers: ['../wordgard-website/site/examples/schema/index.md:139-172'],
      lifecycle: ['../wordgard-website/site/examples/schema/outliner.ts:1-38'],
      proof: ['../wordgard/test/test-schema.ts:38-58'],
    },
    plite: {
      covers: ['packages/plite/src/core/schema-compiler.ts:2760-2780'],
      proof: ['packages/plite/test/schema-contract.ts:1603-1621'],
    },
    plate: {
      covers: [
        'packages/core/src/lib/plugin/defineBasePlugin.ts:228-280',
        'packages/core/src/internal/plugin/resolvePlugins.ts:1513-1536',
      ],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-DOC-004B2': {
    wordgard: {
      public: ['../wordgard-website/site/examples/schema/index.md:139-172'],
      owner: ['../wordgard-website/site/examples/schema/outliner.ts:1-38'],
      consumers: ['../wordgard-website/site/examples/schema/index.md:139-172'],
      lifecycle: ['../wordgard-website/site/examples/schema/outliner.ts:1-38'],
      proof: ['../wordgard-website/site/examples/schema/index.md:139-172'],
    },
    plite: {
      covers: ['packages/plite/src/core/schema-compiler.ts:2760-2780'],
      proof: ['packages/plite/test/schema-contract.ts:1603-1621'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1513-1536'],
      proof: ['packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-80'],
    },
  },
  'WG-DOC-005A': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:131-156'],
      owner: ['../wordgard/src/doc/change.ts:1057-1125'],
      consumers: ['../wordgard/test/test-schema.ts:23-26'],
      lifecycle: ['../wordgard/src/doc/change.ts:1237-1239'],
      proof: ['../wordgard/test/test-schema.ts:23-26'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:195-218'],
      owner: ['packages/plite/src/core/editor-schema.ts:1304-1383'],
      consumers: ['packages/plite/test/schema-contract.ts:566-613'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:1304-1383'],
      proof: ['packages/plite/test/schema-contract.ts:1059-1105'],
    },
    plate: {
      covers: ['packages/core/src/lib/editor/withPlite.ts:194-213'],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'WG-COLLAB-001': {
    wordgard: {
      public: ['../wordgard/src/collab/collab.ts:7-80'],
      owner: ['../wordgard/src/collab/collab.ts:81-160'],
      consumers: ['../wordgard/test/test-collab.ts:1-120'],
      lifecycle: ['../wordgard/src/collab/collab.ts:161-243'],
      proof: ['../wordgard/test/test-collab.ts:1-120'],
    },
    plite: {
      public: ['packages/yjs/src/core/extension.ts:17-80'],
      owner: ['packages/yjs/src/core/extension.ts:81-160'],
      consumers: ['packages/yjs/test/schema-identity-contract.spec.ts:1-120'],
      lifecycle: ['packages/yjs/src/core/extension.ts:81-160'],
      proof: [
        'packages/yjs/test/schema-identity-contract.spec.ts:1-120',
        'packages/plite/test/collab-document-state-contract.ts:76-140',
      ],
    },
  },
  'WG-COLLAB-002A': {
    wordgard: {
      public: ['../wordgard/src/doc/change.ts:261-263'],
      owner: ['../wordgard/src/doc/change.ts:541-545'],
      consumers: ['../wordgard/test/test-change.ts:366-451'],
      lifecycle: ['../wordgard/src/doc/change.ts:727-790'],
      proof: ['../wordgard/test/test-change.ts:366-451'],
    },
    plite: {
      public: ['packages/plite/src/core/change/document-change.ts:901-978'],
      owner: ['packages/plite/src/core/change/root-change.ts:1649-1656'],
      consumers: ['packages/plite/test/document-change-laws.test.ts:655-770'],
      lifecycle: ['packages/plite/src/core/change/root-change.ts:1835-1922'],
      proof: [
        'packages/plite/test/document-change-laws.test.ts:431-435',
        'packages/plite/test/document-change-laws.test.ts:655-770',
      ],
    },
  },
  'WG-COLLAB-002B': {
    wordgard: {
      public: ['../wordgard/src/collab/collab.ts:55-80'],
      owner: ['../wordgard/src/collab/collab.ts:127-208'],
      consumers: ['../wordgard/test/test-collab.ts:1-120'],
      lifecycle: ['../wordgard/src/collab/collab.ts:127-208'],
      proof: ['../wordgard/test/test-collab.ts:1-120'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/editor.ts:186-333'],
      owner: ['packages/plite/src/editor/correct-document.ts:166-207'],
      consumers: [
        'packages/plite/test/document-state-effect-contract.ts:30-243',
      ],
      lifecycle: ['packages/plite/src/editor/correct-document.ts:343-429'],
      proof: [
        'packages/plite/test/collab-document-state-contract.ts:76-140',
        'packages/plite/test/normalization-contract.ts:141-278',
        'packages/plite/test/normalization-contract.ts:447-785',
      ],
    },
  },
  'WG-COLLAB-002C': {
    wordgard: {
      public: ['../wordgard/src/collab/collab.ts:245-274'],
      owner: ['../wordgard/src/collab/collab.ts:245-274'],
      consumers: ['../wordgard/test/test-collab.ts:120-220'],
      lifecycle: ['../wordgard/src/collab/collab.ts:245-274'],
      proof: ['../wordgard/test/test-collab.ts:120-220'],
    },
    plite: {
      covers: [
        'packages/yjs/src/core/extension.ts:17-160',
        'packages/plite/src/core/change/transform.ts:1-160',
      ],
      proof: ['packages/plite/test/collab-document-state-contract.ts:76-140'],
    },
  },
  'WG-CMD-004B': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/keymap.ts:99-118',
        '../wordgard/src/editor/keymap.ts:289-330',
      ],
      proof: ['../wordgard/test/test-commands.ts:1-80'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/command-definition.ts:73-110',
        'packages/plite/src/core/command-registry.ts:39-56',
      ],
      proof: ['packages/core/src/react/utils/shortcuts.spec.tsx:58-95'],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248'],
      proof: [
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:109-176',
        'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:249-286',
      ],
    },
  },
  'WG-CMD-003D2': {
    wordgard: {
      public: ['../wordgard/src/command/index.ts:88-112'],
      owner: ['../wordgard/src/command/helper.ts:593-605'],
      consumers: [
        '../wordgard/src/command/commands.ts:223-242',
        '../wordgard/src/command/menu.ts:125-149',
      ],
      lifecycle: ['../wordgard/src/command/helper.ts:593-605'],
    },
    plite: {
      covers: [
        'packages/plite/src/editor/add-mark.ts:24-38',
        'packages/plite/src/editor/add-mark.ts:64-83',
      ],
      proof: ['packages/plite/test/transaction-contract.ts:695-780'],
    },
    plate: {
      covers: ['packages/basic-nodes/src/lib/BaseMarkPlugins.ts:109-250'],
      proof: ['packages/basic-nodes/src/lib/BaseMarkPlugins.spec.tsx:65-270'],
    },
  },
  'WG-CMD-004A1': {
    wordgard: {
      public: ['../wordgard/src/editor/keymap.ts:44-118'],
      owner: ['../wordgard/src/editor/keymap.ts:168-223'],
      consumers: ['../wordgard/test/test-commands.ts:1-80'],
      lifecycle: ['../wordgard/src/editor/keymap.ts:289-330'],
      proof: ['../wordgard/test/test-commands.ts:1-80'],
    },
    plite: {
      covers: ['packages/plite/src/core/command-definition.ts:73-110'],
      proof: ['packages/plite-dom/test/hotkeys.ts:1-412'],
    },
    plate: {
      public: ['packages/core/src/lib/plugin/BasePlugin.ts:1697-1732'],
      owner: [
        'packages/core/src/internal/plugin/compilePlateShortcuts.ts:136-171',
      ],
      consumers: ['packages/core/src/react/utils/shortcuts.spec.tsx:58-95'],
      lifecycle: [
        'packages/core/src/internal/plugin/resolvePlugins.ts:1109-1248',
      ],
      proof: ['packages/core/src/react/utils/shortcuts.spec.tsx:58-95'],
    },
  },
  'WG-CMD-004A2': {
    wordgard: {
      public: ['../wordgard/src/command/menu.ts:10-153'],
      owner: ['../wordgard/src/command/menu.ts:235-278'],
      consumers: ['../wordgard/test/test-commands.ts:1-80'],
      lifecycle: ['../wordgard/src/command/menu.ts:311-470'],
      proof: ['../wordgard/test/test-commands.ts:1-80'],
    },
    plate: {
      covers: [
        'apps/www/src/registry/components/editor/plugins/fixed-toolbar-kit.tsx:1-20',
      ],
      proof: ['apps/www/src/registry/ui/mark-toolbar-button.spec.tsx:1-120'],
    },
  },
  'WG-STATE-005C': {
    wordgard: {
      public: ['../wordgard/src/state/state.ts:781-809'],
      owner: ['../wordgard/src/state/state.ts:626-673'],
      consumers: ['../wordgard-website/site/examples/config/index.md:1-120'],
      lifecycle: ['../wordgard/src/state/state.ts:163-194'],
      proof: ['../wordgard-website/site/examples/config/index.md:1-120'],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:379-399',
        'packages/plite/src/core/public-state.ts:3537-3548',
      ],
      proof: [
        'packages/plite/test/extension-configuration.test.ts:1280-1344',
        'packages/plite/test/transaction-extension-contract.ts:266-312',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:384-420',
      ],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-514',
      ],
    },
  },
  'WG-WEB-001': {
    wordgard: {
      covers: [
        '../wordgard-website/src/build.ts:145-171',
        '../wordgard-website/src/build.ts:222-237',
        '../wordgard-website/template/ref.html:1-28',
        '../wordgard-website/site/docs/ref/index.md:1-32',
        '../wordgard/package.json:6-18',
        '../wordgard/bin/build.ts:277-279',
      ],
    },
  },
  'WG-WEB-002': {
    wordgard: {
      covers: ['../wordgard-website/src/mapdir.ts:39-78'],
      proof: ['../wordgard-website/src/mapdir.ts:65-76'],
    },
  },
  'WG-INTEGRATION-NESTED-001': {
    wordgard: {
      public: ['../wordgard-website/site/examples/footnote/index.md:51-91'],
      owner: ['../wordgard-website/site/examples/footnote/footnote.ts:69-92'],
      consumers: ['../wordgard-website/site/examples/footnote/index.md:51-91'],
      lifecycle: [
        '../wordgard-website/site/examples/footnote/footnote.ts:101-160',
      ],
      proof: ['../wordgard-website/site/examples/footnote/index.md:51-91'],
    },
    plite: {
      public: [
        'packages/plite-react/src/hooks/use-plite-content-root.ts:13-54',
      ],
      owner: [
        'packages/plite/test/content-root-lifecycle-contract.test.ts:27-228',
      ],
      consumers: [
        'packages/plite-react/test/content-root-navigation-contract.test.ts:127-320',
      ],
      lifecycle: [
        'packages/plite-react/test/content-root-navigation-contract.test.ts:321-640',
      ],
      proof: [
        'packages/plite-react/test/content-root-navigation-contract.test.ts:641-886',
        'packages/plite-react/test/projected-clipboard-contract.test.ts:453-531',
      ],
    },
    plate: {
      covers: ['packages/core/src/react/stores/plate/useEditorPlugin.ts:20-56'],
      proof: [
        'packages/core/src/react/stores/plate/useEditorPlugin.spec.tsx:1-94',
      ],
    },
  },
  'WG-INTEGRATION-NESTED-002A': {
    wordgard: {
      public: ['../wordgard-website/site/examples/footnote/index.md:78-107'],
      owner: ['../wordgard-website/site/examples/footnote/footnote.ts:101-135'],
      consumers: [
        '../wordgard-website/site/examples/footnote/footnote.ts:163-182',
      ],
      lifecycle: [
        '../wordgard-website/site/examples/footnote/footnote.ts:189-207',
      ],
      proof: ['../wordgard-website/site/examples/footnote/index.md:78-107'],
    },
    plite: {
      public: ['packages/plite-react/src/hooks/use-plite-history.ts:173-296'],
      owner: ['packages/plite-react/src/editable/history-focus.ts:6-60'],
      consumers: [
        'packages/plite-react/test/content-root-navigation-contract.test.ts:127-420',
      ],
      lifecycle: ['packages/plite-react/test/use-plite-history.test.tsx:1-220'],
      proof: [
        'packages/plite-react/test/content-root-navigation-contract.test.ts:421-886',
        'packages/plite-react/test/use-plite-history.test.tsx:221-300',
      ],
    },
    plate: {
      covers: ['packages/core/src/react/stores/plate/useEditorPlugin.ts:20-56'],
      proof: [
        'packages/core/src/react/stores/plate/useEditorPlugin.spec.tsx:1-94',
      ],
    },
  },
  'WG-INTEGRATION-NESTED-002B': {
    wordgard: {
      public: ['../wordgard-website/site/examples/footnote/index.md:78-107'],
      owner: ['../wordgard-website/site/examples/footnote/footnote.ts:138-160'],
      consumers: [
        '../wordgard-website/site/examples/footnote/footnote.ts:189-207',
      ],
      lifecycle: [
        '../wordgard-website/site/examples/footnote/footnote.ts:138-160',
      ],
      proof: ['../wordgard-website/site/examples/footnote/index.md:78-107'],
    },
  },
  'WG-APPLICATION-BLAME-001': {
    wordgard: {
      public: ['../wordgard-website/site/examples/blame/index.md:12-54'],
      owner: ['../wordgard-website/site/examples/blame/blame.ts:5-43'],
      consumers: ['../wordgard-website/site/examples/blame/index.md:12-54'],
      lifecycle: ['../wordgard-website/site/examples/blame/blame.ts:73-127'],
      proof: ['../wordgard-website/site/examples/blame/index.md:12-54'],
    },
    plite: {
      covers: ['packages/plite/src/core/state-field.ts:20-145'],
      proof: ['packages/plite/test/field-facet-contract.test.ts:20-310'],
    },
    plate: {
      covers: [
        'apps/www/src/registry/components/editor/plugins/suggestion-base-kit.tsx:1-55',
      ],
      proof: [
        'apps/www/src/registry/components/editor/plugins/suggestion-base-kit.spec.ts:1-51',
      ],
    },
  },
  'WG-APPLICATION-BLAME-002': {
    wordgard: {
      public: ['../wordgard-website/site/examples/blame/index.md:12-54'],
      owner: ['../wordgard-website/site/examples/blame/blame.ts:45-69'],
      consumers: ['../wordgard-website/site/examples/blame/index.md:12-54'],
      lifecycle: ['../wordgard-website/site/examples/blame/blame.ts:77-117'],
      proof: ['../wordgard-website/site/examples/blame/index.md:12-54'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/state-field.ts:20-145',
        'packages/plite-react/src/decoration-source.ts:22-64',
        'packages/plite-react/src/decoration-source.ts:162-243',
      ],
      proof: [
        'packages/plite-react/test/projections-and-selection-contract.tsx:562-596',
      ],
    },
    plate: {
      covers: [
        'apps/www/src/registry/components/editor/plugins/suggestion-base-kit.tsx:1-55',
      ],
      proof: [
        'apps/www/src/registry/components/editor/plugins/suggestion-base-kit.spec.ts:1-51',
      ],
    },
  },
  'WG-VIEW-005C2': {
    wordgard: {
      public: ['../wordgard/src/editor/decoration.ts:1113-1220'],
      owner: ['../wordgard/src/editor/decoration.ts:1269-1397'],
      consumers: ['../wordgard/src/editor/tile.ts:326-365'],
      lifecycle: ['../wordgard/src/editor/decoration.ts:1269-1397'],
      proof: ['../wordgard/test/webtest-content.ts:149-215'],
    },
    plite: {
      covers: [
        'packages/plite-react/src/decoration-source.ts:119-147',
        'packages/plite-react/src/decoration-source.ts:243-320',
      ],
      proof: [
        'packages/plite-react/test/projections-and-selection-contract.tsx:562-596',
      ],
    },
    plate: {
      covers: ['packages/core/src/react/components/plate-nodes.tsx:1-120'],
      proof: ['packages/core/src/react/components/plate-nodes.spec.tsx:1-120'],
    },
  },
  'PLATE-PLUGIN-IDENTITY': {
    wordgard: {
      covers: [
        '../wordgard/src/doc/node.ts:25-61',
        '../wordgard/src/doc/schema.ts:207-239',
      ],
      proof: ['../wordgard/src/doc/schema.ts:307-323'],
    },
    plite: {
      public: ['packages/plite/src/core/editor-extension.ts:662-687'],
      owner: ['packages/plite/src/core/editor-extension.ts:662-687'],
      consumers: ['packages/plite/src/interfaces/editor.ts:2363-2402'],
      lifecycle: ['packages/plite/src/core/editor-extension.ts:2099-2159'],
      proof: ['packages/plite/test/extension-namespace-contract.ts:1-80'],
    },
    plate: {
      covers: [
        'packages/core/src/lib/plugin/defineBasePlugin.ts:479-514',
        'packages/core/src/lib/plugin/BasePlugin.ts:168-210',
      ],
      proof: ['packages/core/src/lib/plugin/defineBasePlugin.spec.ts:20-40'],
    },
  },
  'LOCAL-LIFECYCLE-PHASE': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:1078-1158',
        '../wordgard/src/state/state.ts:89-99',
        '../wordgard/src/state/state.ts:1060-1069',
      ],
      proof: ['../wordgard/src/editor/editor.ts:1095-1155'],
    },
    plite: {
      covers: [
        'packages/plite/src/core/editor-extension.ts:1150-1219',
        'packages/plite/src/core/editor-extension.ts:2099-2159',
      ],
      proof: [
        'packages/plite/test/extension-configuration.test.ts:1346-1448',
        'packages/plite/test/extension-configuration.test.ts:1511-1573',
      ],
    },
    plate: {
      covers: ['packages/core/src/internal/plugin/resolvePlugins.ts:1023-1046'],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-514',
      ],
    },
  },
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': {
    wordgard: {
      public: ['../wordgard/src/doc/schema.ts:131-156'],
      owner: ['../wordgard/src/doc/schema.ts:192-274'],
      consumers: ['../wordgard/test/test-schema.ts:23-26'],
      lifecycle: ['../wordgard/src/state/state.ts:26-36'],
      proof: ['../wordgard/test/test-schema.ts:23-26'],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/schema.ts:195-218',
        'packages/plite/src/core/editor-schema.ts:85-101',
        'packages/plite/src/core/editor-schema.ts:1304-1383',
        'packages/plite/src/interfaces/editor.ts:1349-1362',
        'packages/plite/src/core/public-state.ts:3146-3157',
      ],
      proof: [
        'packages/plite/test/schema-contract.ts:566-613',
        'packages/plite/test/schema-contract.ts:1059-1105',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/lib/editor/withPlite.ts:194-213',
        'packages/core/src/lib/editor/withPlite.ts:670-675',
        'packages/core/src/lib/plugins/override/OverridePlugin.ts:39-75',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:382-405'],
    },
  },
  'LOCAL-HISTORY-IDLE-GROUP': {
    wordgard: {
      public: ['../wordgard/src/history/history.ts:102-126'],
      owner: ['../wordgard/src/history/history.ts:10-35'],
      consumers: ['../wordgard/test/test-history.ts:93-103'],
      lifecycle: ['../wordgard/src/history/history.ts:295-334'],
      proof: ['../wordgard/test/test-history.ts:93-103'],
    },
  },
  'LOCAL-MAX-LENGTH-POLICY': {
    plite: {
      covers: [
        'packages/plite/src/core/insert-limit.ts:23-154',
        'packages/plite/src/core/public-state.ts:5020-5041',
        'packages/plite-react/src/components/editable-text-blocks.tsx:1127-1138',
      ],
      proof: ['packages/plite/test/max-length-contract.test.ts:22-102'],
    },
    plate: {
      covers: [
        'packages/core/src/react/editor/withPlate.ts:218-225',
        'packages/core/src/lib/editor/withPlite.ts:597-616',
      ],
      proof: ['packages/core/src/lib/editor/withPlite.slow.ts:898-915'],
    },
  },
  'LOCAL-RUNTIME-API-TREESHAKING': {
    wordgard: {
      covers: [
        '../wordgard/bin/build.ts:317-348',
        '../wordgard-website/site/docs/faq/index.md:51-65',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-namespace-bundle-probe.json:1-93',
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-public-contract-probe.json:106-180',
      ],
    },
    plite: {
      covers: [
        'packages/plite/package.json:30-39',
        'packages/plite/src/core/public-state.ts:2350-2438',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/runtime-api-bundle-probe.json:1-38',
      ],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/defineBasePlugin.ts:479-524'],
      proof: ['packages/core/src/lib/plugin/defineBasePlugin.spec.ts:1-40'],
    },
  },
  'LOCAL-MATH-CSS-BOUNDARY': {
    plate: {
      covers: [
        'packages/math/src/lib/BaseEquationPlugin.ts:1-12',
        'packages/math/package.json:20-29',
        'apps/www/src/registry/blocks/plate-to-html/page.tsx:69-84',
        'apps/www/src/registry/ui/export-toolbar-button.tsx:119-134',
      ],
      proof: ['packages/math/src/lib/BaseEquationPlugin.spec.tsx:160-172'],
    },
  },
  'LOCAL-MEDIA-KEYBOARD-RESIZE': {
    wordgard: {
      public: ['../wordgard/src/schema/image.ts:28-36'],
      owner: ['../wordgard/src/schema/image.ts:141-172'],
      consumers: ['../wordgard/test/test-commands.ts:400-480'],
      lifecycle: ['../wordgard/src/schema/image.ts:55-140'],
      proof: ['../wordgard/test/test-commands.ts:400-480'],
    },
    plate: {
      covers: [
        'packages/media/src/lib/BaseMediaPlugin.ts:26-37',
        'packages/media/src/lib/BaseMediaPlugin.ts:101-205',
        'packages/resizable/src/useResizable.ts:56-147',
      ],
      proof: [
        'packages/media/src/lib/BaseMediaPluginContracts.spec.ts:181-242',
        'packages/resizable/src/resizeLength.spec.ts:8-59',
      ],
    },
  },
  'WG-STATE-011B': {
    wordgard: {
      public: ['../wordgard/src/state/textblock.ts:142-229'],
      owner: ['../wordgard/src/state/selection.ts:435-576'],
      consumers: ['../wordgard/test/test-selection.ts:85-219'],
      lifecycle: ['../wordgard/src/state/textblock.ts:179-227'],
      proof: ['../wordgard/test/test-selection.ts:85-219'],
    },
    plite: {
      public: ['packages/plite/src/transforms-selection/move.ts:13-58'],
      owner: ['packages/plite/src/utils/string.ts:15-75'],
      consumers: ['packages/plite/test/text-units-contract.ts:279-548'],
      lifecycle: ['packages/plite/src/editor/positions.ts:400-607'],
      proof: [
        'packages/plite/test/text-units-contract.ts:279-548',
        'packages/plite/test/word-boundary-proof.test.ts:29-93',
        'packages/plite/test/word-boundary-proof.test.ts:187-357',
      ],
    },
  },
  'WG-STATE-013': {
    wordgard: {
      public: ['../wordgard/src/state/bidi.ts:51-115'],
      owner: ['../wordgard/src/state/bidi.ts:136-405'],
      consumers: ['../wordgard/test/test-selection.ts:102-158'],
      lifecycle: ['../wordgard/src/state/textblock.ts:142-175'],
      proof: ['../wordgard/test/test-selection.ts:102-158'],
    },
    plite: {
      covers: [
        'packages/plite/src/transforms-selection/move.ts:13-58',
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:147-159',
        'packages/plite-react/src/editable/caret-engine.ts:677-843',
      ],
      proof: [
        'apps/plite/tests/plite-browser/donor/examples/navigation-bidi.test.ts:93-197',
      ],
    },
  },
  'WG-PROOF-004C': {
    plite: {
      covers: ['apps/plite/tests/plite-browser/mobile-lab.test.ts:4-45'],
      proof: [
        'packages/browser/test/core/mobile-device-proof-command.test.ts:15-40',
      ],
    },
    plate: {
      covers: ['packages/browser/src/core/mobile-transport-proof.ts:3-99'],
      proof: [
        'packages/browser/test/core/mobile-device-proof-command.test.ts:15-40',
      ],
    },
  },
  'LOCAL-NATIVE-INPUT-RECONCILIATION': {
    wordgard: {
      public: ['../wordgard/src/editor/input.ts:18-40'],
      owner: ['../wordgard/src/editor/input.ts:173-301'],
      consumers: ['../wordgard/test/webtest-dom-changes.ts:10-126'],
      lifecycle: ['../wordgard/src/editor/input.ts:710-857'],
      proof: [
        '../wordgard/test/webtest-dom-changes.ts:10-126',
        '../wordgard/test/webtest-composition.ts:9-177',
      ],
    },
    plite: {
      public: [
        'packages/plite-react/src/editable/native-input-strategy.ts:12-165',
      ],
      owner: [
        'packages/plite-react/src/editable/dom-repair-text.ts:1-89',
        'packages/plite-react/src/editable/dom-repair-queue.ts:54-398',
      ],
      consumers: [
        'packages/plite-react/src/editable/runtime-before-input-events.ts:1-180',
      ],
      lifecycle: [
        'packages/plite-react/src/editable/native-text-input-delta.ts:1-107',
      ],
      proof: [
        'packages/plite-react/test/runtime-before-input-events-contract.test.ts:47-126',
        'packages/plite-react/test/native-text-input-delta-contract.test.ts:1-20',
        'packages/plite-react/test/dom-repair-policy-contract.test.ts:161-381',
      ],
    },
    plate: {
      covers: [
        'packages/browser/test/core/playwright-native-event-trace.test.ts:47-219',
      ],
      proof: [
        'packages/browser/test/core/playwright-native-event-trace.test.ts:47-219',
      ],
    },
  },
  'WG-DOC-001B': {
    wordgard: {
      covers: [
        '../wordgard/src/doc/node.ts:63-69',
        '../wordgard/src/doc/node.ts:483-509',
        '../wordgard/src/doc/node.ts:665-688',
        '../wordgard/src/doc/node.ts:973-992',
        '../wordgard/src/doc/slice.ts:26-35',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-value-purity-probe.json:5-89',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/clone.ts:1-17'],
      owner: ['packages/plite/src/core/clone.ts:1-17'],
      consumers: ['packages/plite/test/accessor-transaction.test.ts:241-261'],
      lifecycle: ['packages/plite/src/core/public-state.ts:7161-7194'],
      proof: [
        'packages/plite/test/accessor-transaction.test.ts:241-261',
        'packages/plite/test/snapshot-contract.ts:6865-6898',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:384-420',
      ],
      proof: ['packages/core/type-tests/plugin-schema-contracts.ts:110-160'],
    },
  },
  'WG-STATE-001B': {
    wordgard: {
      covers: [
        '../wordgard/src/collab/collab.ts:23-37',
        '../wordgard/src/collab/collab.ts:211-225',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-state-purity-probe.json:5-14',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/public-state.ts:2963-3005'],
      owner: ['packages/plite/src/core/public-state.ts:740-790'],
      consumers: ['packages/plite/test/snapshot-contract.ts:6865-6898'],
      lifecycle: ['packages/plite/src/core/public-state.ts:5290-5385'],
      proof: ['packages/plite/test/snapshot-contract.ts:6865-6898'],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-514',
      ],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:488-514',
      ],
    },
  },
  'WG-STATE-002B': {
    wordgard: {
      covers: [
        '../wordgard/src/state/state.ts:219-250',
        '../wordgard/src/state/state.ts:417-422',
      ],
      proof: ['../wordgard/test/test-history.ts:552-575'],
    },
    plite: {
      public: ['packages/plite/src/core/state-field.ts:20-45'],
      owner: ['packages/plite/src/core/value-codec.ts:283-375'],
      consumers: ['packages/plite/test/value-codec.test.ts:56-125'],
      lifecycle: ['packages/plite/src/core/state-field.ts:107-145'],
      proof: ['packages/plite/test/value-codec.test.ts:56-125'],
    },
    plate: {
      covers: ['packages/core/src/lib/plugin/BasePlugin.ts:168-210'],
      proof: [
        'packages/core/src/lib/plugin/createPluginContext.internal.spec.ts:1-80',
      ],
    },
  },
  'WG-STATE-006B': {
    wordgard: {
      covers: [
        '../wordgard/src/state/state.ts:89-99',
        '../wordgard/src/state/state.ts:1060-1069',
      ],
      proof: [
        'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-value-purity-probe.json:91-110',
      ],
    },
    plite: {
      public: ['packages/plite/src/core/public-state.ts:6502-6681'],
      owner: ['packages/plite/src/core/public-state.ts:6502-6681'],
      consumers: ['packages/plite/test/transaction-contract.ts:669-693'],
      lifecycle: ['packages/plite/src/core/public-state.ts:1186-1233'],
      proof: [
        'packages/plite/test/transaction-contract.ts:669-693',
        'packages/plite/test/facet-draft-contract.test.ts:142-184',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:61-76',
      ],
      proof: [
        'packages/core/src/internal/plugin/plateModelPublication.spec.ts:61-76',
      ],
    },
  },
  'WG-DOC-002D': {
    wordgard: {
      public: ['../wordgard/src/editor/decoration.ts:117-177'],
      owner: ['../wordgard/src/state/state.ts:872-880'],
      consumers: ['../wordgard/test/webtest-content.ts:500-560'],
      lifecycle: ['../wordgard/src/state/state.ts:872-880'],
      proof: ['../wordgard/test/webtest-content.ts:500-560'],
    },
    plite: {
      public: ['packages/plite/src/interfaces/schema.ts:265-280'],
      owner: ['packages/plite/src/core/editor-schema.ts:597-630'],
      consumers: ['packages/plite/test/schema-contract.ts:1509-1550'],
      lifecycle: ['packages/plite/src/core/editor-schema.ts:597-630'],
      proof: [
        'packages/plite/test/schema-contract.ts:1509-1550',
        'packages/plite/test/schema-contract.ts:1664-1700',
      ],
    },
    plate: {
      covers: [
        'packages/core/src/internal/plugin/compilePlateModel.ts:384-420',
      ],
      proof: ['packages/core/type-tests/plugin-schema-contracts.ts:110-160'],
    },
  },
  'LOCAL-OFFLINE-MERGE-REVIEW': {
    plite: {
      covers: ['packages/yjs/test/canonical-change-contract.spec.ts:97-290'],
      proof: ['packages/yjs/test/canonical-change-contract.spec.ts:97-290'],
    },
    plate: {
      covers: [
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1204-1303',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.ts:1392-1425',
      ],
      proof: [
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:1882-1915',
        'packages/suggestion/src/lib/BaseSuggestionPlugin.spec.tsx:2572-2617',
      ],
    },
  },
  'LOCAL-HOST-EDITOR-CAPABILITY': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:26-79',
        '../wordgard/src/command/command.ts:19-55',
        '../wordgard/src/state/state.ts:41-79',
      ],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:120-180',
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite-dom/src/index.ts:23-55',
        'packages/plite-react/src/index.ts:35-85',
      ],
    },
    plate: {
      covers: ['packages/core/src/react/editor/PlateEditor.ts:24-70'],
      proof: ['packages/core/src/react/editor/TPlateEditorCore.spec.ts:55-90'],
    },
  },
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': {
    plite: {
      covers: [
        'packages/plite-dom/test/host-codec.test.ts:163-239',
        'packages/plite-dom/test/host-codec.test.ts:356-411',
      ],
      proof: ['packages/plite-dom/test/host-codec.test.ts:163-239'],
    },
    plate: {
      public: ['packages/markdown/src/lib/MarkdownPlugin.ts:47-122'],
      owner: ['packages/markdown/src/lib/MarkdownPlugin.ts:47-122'],
      consumers: ['packages/markdown/src/lib/MarkdownPlugin.spec.ts:152-185'],
      lifecycle: ['packages/markdown/src/lib/MarkdownPlugin.ts:47-122'],
      proof: [
        'packages/markdown/src/lib/MarkdownPlugin.spec.ts:152-185',
        'packages/markdown/src/lib/MarkdownPlugin.spec.ts:304-434',
      ],
    },
  },
  'LOCAL-EXTERNAL-MODEL-SYNC': {
    wordgard: {
      covers: [
        '../wordgard/src/editor/editor.ts:170-190',
        '../wordgard/src/editor/editor.ts:240-243',
        '../wordgard/src/editor/editor.ts:635-658',
        '../wordgard/src/editor/editor.ts:1015-1039',
      ],
    },
    plite: {
      covers: [
        'packages/plite/src/interfaces/editor.ts:1285-1311',
        'packages/plite/src/interfaces/editor.ts:3491-3508',
        'packages/plite/src/core/listener-state.ts:105-118',
      ],
      proof: ['packages/plite/test/transaction-extension-contract.ts:19-79'],
    },
    plate: {
      covers: ['packages/plite-react/src/components/plite.tsx:127-150'],
      proof: [
        'packages/plite-react/test/plite-runtime-provider-contract.test.tsx:435-535',
      ],
    },
  },
});

const dimensionEvidenceKeySeed = Object.freeze({
  'WG-META-004A': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    [],
    ['wordgard.owner', 'plite.owner', 'plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-META-004B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-004C': [
    ['wordgard.owner'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-META-004D': [
    ['wordgard.owner'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'LOCAL-DOC-ROOTS': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    ['plite.proof'],
  ],
  'LOCAL-SCHEMA-IDENTITY': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'PLATE-HEADING-ONTOLOGY': [
    ['plate.proof'],
    ['plate.public'],
    ['wordgard.public', 'plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-DOC-004B1': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public'],
    ['wordgard.owner'],
    ['wordgard.lifecycle'],
    [],
  ],
  'WG-DOC-004B2': [[], [], [], [], [], []],
  'WG-DOC-005A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-001': [
    ['wordgard.proof', 'plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002A': [
    ['plite.proof'],
    ['wordgard.public', 'plite.public'],
    ['plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002B': [
    ['plite.proof'],
    ['wordgard.public', 'plite.public'],
    [],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-COLLAB-002C': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public', 'plite.covers'],
    ['wordgard.owner'],
    [],
    ['wordgard.proof'],
  ],
  'WG-CMD-004B': [[], [], [], [], [], []],
  'WG-CMD-003D2': [
    ['wordgard.owner'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-CMD-004A1': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.public', 'plite.covers', 'plate.public'],
    [],
    ['wordgard.owner', 'plite.covers', 'plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-CMD-004A2': [
    ['wordgard.proof', 'plate.proof'],
    ['plate.covers'],
    [],
    ['wordgard.owner', 'plate.covers'],
    [],
    [],
  ],
  'WG-STATE-005C': [
    ['plite.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-WEB-001': [[], ['wordgard.covers'], [], ['wordgard.covers'], [], []],
  'WG-WEB-002': [[], [], [], [], [], []],
  'WG-INTEGRATION-NESTED-001': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    ['plite.proof'],
  ],
  'WG-INTEGRATION-NESTED-002A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-INTEGRATION-NESTED-002B': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-APPLICATION-BLAME-001': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public'],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-APPLICATION-BLAME-002': [
    ['wordgard.proof'],
    ['wordgard.public'],
    [],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-VIEW-005C2': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    [],
    ['wordgard.public', 'plite.covers', 'plate.covers'],
    ['wordgard.owner', 'plite.covers', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'PLATE-PLUGIN-IDENTITY': [
    [],
    ['wordgard.covers', 'plite.public', 'plate.covers'],
    ['wordgard.covers', 'plite.public', 'plate.covers'],
    ['wordgard.covers', 'plite.owner', 'plate.covers'],
    [],
    [],
  ],
  'LOCAL-LIFECYCLE-PHASE': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    [],
  ],
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': [
    ['plite.proof'],
    ['plite.proof'],
    ['plite.proof'],
    ['wordgard.owner'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-HISTORY-IDLE-GROUP': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['wordgard.public'],
    ['wordgard.owner'],
    ['wordgard.lifecycle'],
    ['wordgard.proof'],
  ],
  'LOCAL-MAX-LENGTH-POLICY': [
    [],
    [],
    [],
    [],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'LOCAL-RUNTIME-API-TREESHAKING': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    [],
  ],
  'LOCAL-MATH-CSS-BOUNDARY': [[], [], [], [], [], []],
  'LOCAL-MEDIA-KEYBOARD-RESIZE': [
    ['wordgard.proof'],
    ['wordgard.public'],
    ['plate.covers'],
    ['wordgard.owner'],
    [],
    [],
  ],
  'WG-STATE-011B': [
    ['plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public'],
    ['wordgard.owner', 'plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-STATE-013': [
    ['wordgard.proof'],
    ['plite.covers'],
    ['plite.covers'],
    ['plite.covers'],
    [],
    ['wordgard.proof'],
  ],
  'WG-PROOF-004C': [[], [], [], [], [], []],
  'LOCAL-NATIVE-INPUT-RECONCILIATION': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-DOC-001B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    ['plite.proof'],
  ],
  'WG-STATE-001B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    [],
  ],
  'WG-STATE-002B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    ['plite.proof'],
  ],
  'WG-STATE-006B': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.public'],
    ['plite.owner'],
    ['plite.lifecycle'],
    ['plite.proof'],
  ],
  'WG-DOC-002D': [
    ['plite.proof'],
    ['plite.public'],
    ['wordgard.public', 'plite.public', 'plate.covers'],
    ['wordgard.owner', 'plite.owner', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'LOCAL-VERTICAL-WRITING-LAYOUT': [[], [], [], [], [], []],
  'LOCAL-VERTICAL-WRITING-INPUT': [[], [], [], [], [], []],
  'LOCAL-OFFLINE-MERGE-REVIEW': [
    ['plate.proof'],
    ['plate.covers'],
    ['plate.covers'],
    ['plate.covers'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-HOST-EDITOR-CAPABILITY': [
    [],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.covers', 'plate.proof'],
  ],
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': [
    ['plate.proof'],
    ['plate.public'],
    ['plate.public'],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'LOCAL-EXTERNAL-MODEL-SYNC': [
    [],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    ['plite.covers', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
});

const expectedEvidenceIds = new Set([
  ...Object.keys(intactStatus),
  ...splitDefinitions.map(([id]) => id),
  ...siteDefinitions.map(([id]) => id),
  ...localDefinitions.map(({ id }) => id),
]);
const evidenceModules = Object.freeze([
  {
    contractEvidence: docSchemaContractEvidence,
    dimensionEvidenceKeys: docSchemaDimensionEvidenceKeys,
    name: 'doc-schema',
  },
  {
    contractEvidence: forumContractEvidence,
    dimensionEvidenceKeys: forumDimensionEvidenceKeys,
    name: 'forum',
  },
  {
    contractEvidence: integrationLocalContractEvidence,
    dimensionEvidenceKeys: integrationLocalDimensionEvidenceKeys,
    name: 'integration-local',
  },
  {
    contractEvidence: metaCommandProofContractEvidence,
    dimensionEvidenceKeys: metaCommandProofDimensionEvidenceKeys,
    name: 'meta-command-proof',
  },
  {
    contractEvidence: productContractEvidence,
    dimensionEvidenceKeys: productDimensionEvidenceKeys,
    name: 'product',
  },
  {
    contractEvidence: stateTableContractEvidence,
    dimensionEvidenceKeys: stateTableDimensionEvidenceKeys,
    name: 'state-table',
  },
  {
    contractEvidence: viewContractEvidence,
    dimensionEvidenceKeys: viewDimensionEvidenceKeys,
    name: 'view',
  },
]);

const mergeEvidenceModules = () => {
  const contractEvidence = {};
  const contractFacetOwners = new Map();
  const contractRowOwners = new Map();
  const dimensionEvidenceKeys = {};
  const dimensionRowOwners = new Map();
  const contractSides = new Set(['plate', 'plite', 'wordgard']);
  const contractFacets = new Set([
    'consumers',
    'coverage',
    'covers',
    'lifecycle',
    'missingEvidence',
    'owner',
    'proof',
    'public',
  ]);

  for (const evidenceModule of evidenceModules) {
    const contractIds = Object.keys(evidenceModule.contractEvidence).sort();
    const dimensionIds = Object.keys(
      evidenceModule.dimensionEvidenceKeys
    ).sort();
    if (JSON.stringify(contractIds) !== JSON.stringify(dimensionIds)) {
      throw new Error(
        `${evidenceModule.name} contract and dimension row partitions differ`
      );
    }

    for (const id of contractIds) {
      if (!expectedEvidenceIds.has(id)) {
        throw new Error(
          `${evidenceModule.name} owns unknown evidence row ${id}`
        );
      }
      const priorContractOwner = contractRowOwners.get(id);
      if (priorContractOwner) {
        throw new Error(
          `${id} contract evidence is owned by both ${priorContractOwner} and ${evidenceModule.name}`
        );
      }
      contractRowOwners.set(id, evidenceModule.name);
      contractEvidence[id] = {};

      for (const [side, facets] of Object.entries(
        evidenceModule.contractEvidence[id]
      )) {
        if (side === 'forum') {
          if (facets.implementationProof !== false) {
            throw new Error(
              `${id} forum evidence cannot be implementation proof`
            );
          }
          contractEvidence[id].forum = facets;
          continue;
        }
        if (!contractSides.has(side)) {
          throw new Error(`${id} has unknown evidence side ${side}`);
        }
        contractEvidence[id][side] = {};
        for (const [facet, citations] of Object.entries(facets)) {
          if (!contractFacets.has(facet)) {
            throw new Error(
              `${id} has unknown ${side}.${facet} evidence facet`
            );
          }
          if (!Array.isArray(citations) || citations.length === 0) {
            throw new Error(
              `${id} ${side}.${facet} evidence must be non-empty`
            );
          }
          const ownerKey = `${id}.${side}.${facet}`;
          const priorFacetOwner = contractFacetOwners.get(ownerKey);
          if (priorFacetOwner) {
            throw new Error(
              `${ownerKey} is owned by both ${priorFacetOwner} and ${evidenceModule.name}`
            );
          }
          contractFacetOwners.set(ownerKey, evidenceModule.name);
          contractEvidence[id][side][facet] = Object.freeze([...citations]);
        }
        Object.freeze(contractEvidence[id][side]);
      }
      Object.freeze(contractEvidence[id]);

      const priorDimensionOwner = dimensionRowOwners.get(id);
      if (priorDimensionOwner) {
        throw new Error(
          `${id} dimension evidence is owned by both ${priorDimensionOwner} and ${evidenceModule.name}`
        );
      }
      const keys = evidenceModule.dimensionEvidenceKeys[id];
      if (
        !Array.isArray(keys) ||
        keys.length !== dimensions.length ||
        keys.some(
          (dimensionKeys) =>
            !Array.isArray(dimensionKeys) ||
            new Set(dimensionKeys).size !== dimensionKeys.length
        )
      ) {
        throw new Error(`${id} must declare six unique evidence-key arrays`);
      }
      dimensionRowOwners.set(id, evidenceModule.name);
      dimensionEvidenceKeys[id] = Object.freeze(
        keys.map((dimensionKeys) => Object.freeze([...dimensionKeys]))
      );
    }
  }

  const missingContractRows = [...expectedEvidenceIds].filter(
    (id) => !contractRowOwners.has(id)
  );
  const missingDimensionRows = [...expectedEvidenceIds].filter(
    (id) => !dimensionRowOwners.has(id)
  );
  if (missingContractRows.length > 0 || missingDimensionRows.length > 0) {
    throw new Error(
      `Evidence partition is incomplete: contract=${missingContractRows.join(',')}; dimensions=${missingDimensionRows.join(',')}`
    );
  }

  for (const id of Object.keys(contractEvidenceSeed)) {
    if (!Object.hasOwn(contractEvidence, id)) {
      throw new Error(`Partition lost seeded contract evidence for ${id}`);
    }
  }
  for (const id of Object.keys(dimensionEvidenceKeySeed)) {
    if (!Object.hasOwn(dimensionEvidenceKeys, id)) {
      throw new Error(`Partition lost seeded dimension evidence for ${id}`);
    }
  }

  return {
    contractEvidenceOverrides: Object.freeze(contractEvidence),
    dimensionEvidenceKeyOverrides: Object.freeze(dimensionEvidenceKeys),
  };
};

const { contractEvidenceOverrides, dimensionEvidenceKeyOverrides } =
  mergeEvidenceModules();

const priorityAndDossier = Object.freeze({
  'WG-DOC-004B1': {
    dossier: 'complete-schema-relationship-rebinding',
  },
  'WG-CMD-003B2B': { dossier: 'first-party-block-direction' },
  'WG-PRODUCT-001A2D': { dossier: 'first-party-block-direction' },
  'WG-PRODUCT-003A2D': {
    dossier: 'first-party-block-direction',
    priority: 'P1',
  },
  'WG-PROOF-004C': { dossier: 'raw-mobile-input-proof', priority: 'P2' },
  'WG-STATE-013': { dossier: 'visual-bidi-order', priority: 'P1' },
  'WG-WEB-001': { dossier: 'source-backed-api-reference', priority: 'P2' },
  'WG-VIEW-014C2': { dossier: 'async-hover-source-lifecycle', priority: 'P2' },
});

const inferOverall = (winners) => {
  const uniqueWinners = unique(winners);
  if (uniqueWinners.length === 1) {
    const classification = uniqueWinners[0];
    const preferred = {
      'Plate stronger': 'Plate',
      'Plite stronger': 'Plite',
      'Plite/Plate stack stronger': 'Plite/Plate stack',
      'reference stronger': 'reference',
      equivalent: 'tie',
      'different tradeoff': 'different tradeoff',
      'insufficient evidence': 'insufficient evidence',
      'not-applicable': 'not-applicable',
    }[classification];
    return { classification, preferred };
  }
  return {
    classification: 'different tradeoff',
    preferred: 'different tradeoff',
  };
};

const makeSpec = ({
  id,
  lane,
  origin = 'reference',
  parent,
  sources: explicitSources,
  status,
  title,
  ...explicitDecision
}) => {
  const localSources = sourceGroupById.get(id) ?? { plate: [], plite: [] };
  const profile = semanticProfiles.get(id);
  const dimensionWinners = winnerProfiles.get(id);
  if (!profile) throw new Error(`Missing explicit semantic profile for ${id}`);
  if (!dimensionWinners)
    throw new Error(`Missing explicit winner profile for ${id}`);
  const inherited = parent ? previousById.get(parent) : previousById.get(id);
  const inferred = inferOverall(dimensionWinners);
  const comparison = {
    classification:
      explicitDecision.classification ??
      comparisonOverrides[id]?.classification ??
      inherited?.classification ??
      inferred.classification,
    preferred:
      explicitDecision.preferred ??
      comparisonOverrides[id]?.preferred ??
      inherited?.preferred ??
      inferred.preferred,
    verdict:
      explicitDecision.verdict ??
      comparisonOverrides[id]?.verdict ??
      inherited?.verdict ??
      'keep',
  };
  const baseDecision = defaultDecision({ status, verdict: comparison.verdict });
  const material = materialDispositions[id] ?? {};
  const namedDossier = priorityAndDossier[id] ?? {};
  const sources = explicitSources ?? {
    plate: localSources.plate,
    plite: localSources.plite,
    wordgard: unique([
      ...(parent ? [parent] : [id]),
      ...(siteSourcesByRow.get(id) ?? []),
    ]),
  };
  return {
    ...defaultDisposition,
    ...baseDecision,
    ...explicitDecision,
    ...comparison,
    ...material,
    ...namedDossier,
    contractEvidence: contractEvidenceOverrides[id],
    dimensionEvidenceKeys: dimensionEvidenceKeyOverrides[id],
    dimensionWinners,
    id,
    lane: lane ?? inherited?.lane,
    mechanism: profile[0],
    origin: origin ?? inherited?.origin ?? 'reference',
    parent,
    semantic: profile,
    sources,
    status,
    title,
    wordgardAnchors: wordgardAnchors[id],
  };
};

for (const [id, value] of Object.entries({
  'WG-META-004A': semantic(
    'all three stacks expose a runnable basic editor teaching surface | Plate registry examples compose feature kits directly while donor and Plite demos emphasize their substrate | demo values use each stack own structural model | product examples and substrate demos make different ownership tradeoffs | comparative demo startup cost is unmeasured | local standalone routes and browser checks provide the broadest direct proof'
  ),
  'WG-META-004B': semantic(
    'Wordgard uniquely turns prose and source fragments into runnable browser lessons | the donor build surface is a coherent implementation rather than the only viable docs API | example source and injected snippets remain documentation data | the website build owns extraction and sandbox assembly | build overhead and long-term maintenance cost are unmeasured | donor source is direct while local MDX and registry examples prove only a partial alternative'
  ),
  'WG-META-004C': semantic(
    'Wordgard alone exposes a sandboxed shareable code playground with console transport | its try-page protocol is implementation-specific but reusable as a product reference | playground source and console messages remain application data | the website owns sandbox isolation sharing and transport | runtime isolation and abuse resistance need dedicated proof | source documents the mechanism without a local equivalent or complete security test'
  ),
  'WG-META-004D': semantic(
    'Wordgard publishes a detailed architecture positioning and ProseMirror migration map | the reference is useful research rather than a runtime API target | migration prose is documentation data | curated docs owners should adapt only still-correct conceptual guidance | maintenance cost and staleness are unmeasured | local migration docs partially cover adoption but not the same architecture comparison'
  ),
  'WG-WEB-001': semantic(
    'the donor source-comment generator is useful but omits the root aggregate and publishes stale module names | source-backed symbol and type facts are worth adapting under curated local documentation | reference metadata is not editor data | generation should own factual symbol extraction while docs authors own narrative and hierarchy | generation cost and maintenance savings are unmeasured | current donor completeness claims lack a direct frozen-head gate'
  ),
  'WG-WEB-002': semantic(
    'the donor publisher deletes the previous output before the final rename can fail | its private helper is not an API target | publication does not affect editor data | the website build script owns the unsafe sequence | rename cost is trivial but failure recovery is incomplete | source inspection disproves rollback safety and no failure test repairs that contract'
  ),
  'WG-WEB-003': semantic(
    'Plate docs search is correct where donor punctuation queries crash | local user-facing navigation is broader | search indexes do not affect AST data | the docs application owns navigation | relevance and ranking lack a shared benchmark | local route and browser proof is broader'
  ),
  'WG-META-002B': semantic(
    'ordinary ESM eliminates properties across bundlers more honestly | namespaces require output rewrite and declaration merging | module shape does not affect AST data | source API viability should not depend on build surgery | probes show used namespace properties retain siblings | donor dead-code methodology should be retained for ESM'
  ),
  'LOCAL-COMPLETION-LIFECYCLE': semantic(
    'Plate feature owners cover product-specific completion behavior without a fabricated donor counterpart | Copilot and combobox expose query suggestion accept and cancellation capabilities rather than one false universal provider | completion and selection state remain transient | feature packages own behavior while copied UI owns presentation | product-scoped state avoids a new core subsystem | focused Copilot and combobox tests prove their separate lifecycle laws'
  ),
  'LOCAL-VERTICAL-WRITING-LAYOUT': semantic(
    'the retrieved forum corpus establishes demand for vertical writing layout without implementation proof | no current public API demonstrates the complete behavior | writing-mode geometry would remain host state | the DOM layout and caret host must own the feature | layout and bidi cost are unmeasured | inaccessible forum posts and absent browser traces keep the decision insufficient'
  ),
  'LOCAL-VERTICAL-WRITING-INPUT': semantic(
    'the retrieved forum corpus establishes demand for vertical writing input without implementation proof | no current public API demonstrates composition and selection parity | composition state would remain transient | the DOM input host must own reconciliation | native mobile and IME behavior are unmeasured | inaccessible posts and absent cross-engine traces keep the decision insufficient'
  ),
  'LOCAL-OFFLINE-MERGE-REVIEW': semantic(
    'Plate suggestion attribution and Yjs convergence partially cover the requested offline review workflow | scoped collaboration and suggestion APIs expose the strongest current product pieces | conflict review state is product data outside the document core | a collaboration product owner must coordinate transport attribution and review UI | offline reconciliation cost and scale are unmeasured | focused convergence and suggestion tests prove the covered pieces but not an end-to-end offline workflow'
  ),
  'LOCAL-HOST-EDITOR-CAPABILITY': semantic(
    'no stack proves the complete DOM React virtualized native and canvas host set | the Plite and Plate stack exposes the strongest typed headless capability boundary | capability metadata stays outside persisted document data | Plite owns host-neutral mechanics while Plate owns React product capabilities | comparative host runtime cost is unmeasured | local type and host contracts prove the covered stack but native and canvas implementations remain absent'
  ),
  'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': semantic(
    'Plate owns the complete Markdown parse and serialize boundary while Plite exposes only a generic host codec boundary | one feature-scoped Markdown API keeps ownership explicit | Markdown text is boundary output rather than internal state | the Markdown package owns codecs and Plate integration | serialization cost lacks a comparative benchmark | focused roundtrip and host-codec tests prove the local boundary'
  ),
  'LOCAL-EXTERNAL-MODEL-SYNC': semantic(
    'no stack proves a complete bidirectional external-model adapter | the Plite and Plate stack exposes the strongest committed snapshot listener and provider primitives | synchronized external state remains adapter data with explicit inbound transactions | a product adapter owns conflict and lifecycle policy above Plite and Plate | update fanout and consistency cost are unmeasured | local transaction-listener and provider contracts prove the covered stack but not one end-to-end external model'
  ),
  'WG-INTEGRATION-NESTED-001': semantic(
    'Plite content roots preserve nested editable ownership and selection laws without dual-editor synchronization | one root API avoids donor padding clipping and loop annotations | nested content remains one schema-owned document graph | the root lifecycle owner replaces a bridge between independent editors | shared runtime publication avoids recreate-on-divergence | root lifecycle navigation and clipboard contracts are broader than the donor example'
  ),
  'WG-INTEGRATION-NESTED-002A': semantic(
    'Plite parent-owned roots keep nested history and focus navigation inside one timeline | content-root and history hooks replace manual second-editor wiring | nested content remains in the parent document graph | the parent root and history owners control focus and undo | one branch avoids duplicate history bookkeeping | focused history and content-root navigation contracts are broader'
  ),
  'WG-INTEGRATION-NESTED-002B': semantic(
    'Wordgard alone demonstrates nested-editor tooltip reuse and synchronous child flushing | the behavior is coupled to its example editor and view API | tooltip state is transient and does not affect persisted content | the nested example owns the glue rather than a reusable substrate primitive | synchronous flushing is implementation-specific and unbenchmarked | source and teaching example document behavior without a direct local counterpart'
  ),
  'WG-APPLICATION-BLAME-001': semantic(
    'donor origin spans plausibly map through document gaps but current proof is only an example | its domain API is compact | provenance remains separate from AST | a feature field would own mapping | adjacent-run merging is unbenchmarked | the example has no test and its serialization path is unused so adoption waits for product demand'
  ),
  'WG-APPLICATION-BLAME-002': semantic(
    'Wordgard alone implements cached attribution decoration projection | local state fields and generic decoration sources are lower-level primitives rather than this feature | attribution presentation is transient over separate blame state | the feature model and projection owner stays application-scoped | changed-state and color caching are portable but unbenchmarked | the donor source is a useful oracle without local product demand or equivalent proof'
  ),
  'WG-PRODUCT-001A2A': semantic(
    'both stacks preserve paragraph identity | Plate exposes a literal paragraph descriptor | persisted paragraph vocabularies make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | local paragraph contracts are broader'
  ),
  'WG-PRODUCT-003A2A': semantic(
    'both stacks switch blocks to paragraphs correctly | Plate exposes the configured paragraph owner directly | both emit equivalent paragraph data | feature command and donor schema ownership differ | runtime cost is unmeasured | local block-toggle proof is broader'
  ),
  'WG-PRODUCT-001A2B': semantic(
    'both stacks preserve code-block identity and language | Plate exposes typed code-block configuration | persisted language models make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | local code-block contracts are broader'
  ),
  'WG-PRODUCT-003A2B': semantic(
    'Plate covers code editing conversion and fenced input more completely | scoped code-block APIs are direct | code data models make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | focused local command and input-rule proof is broader'
  ),
  'WG-PRODUCT-001A2C': semantic(
    'both stacks preserve text-alignment identity | Plate exposes typed configured values | persisted alignment representations make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | local style contracts are broader'
  ),
  'WG-PRODUCT-003A2C': semantic(
    'Plate covers alignment commands values and codecs more completely | scoped style APIs expose allowed values | output representations make different tradeoffs | the style package owns the complete local behavior | runtime cost is unmeasured | focused local command and codec proof is broader'
  ),
  'WG-PRODUCT-001A2D': semantic(
    'Wordgard is the only current stack with a first-party persisted textDirection property | its explicit property is the only demonstrated API | textDirection is canonical persisted JSON while dir remains an HTML codec detail | the future Plate feature package should own the property | runtime cost is unmeasured | donor source proves the capability but adoption is decided in the behavior row'
  ),
  'WG-PRODUCT-003A2D': semantic(
    'Wordgard proves first-party textDirection commands and visual projection absent locally | a Plate textDirection plugin should expose one scoped set command | textDirection persists independently from the HTML dir attribute | the feature package must own blocks lists and codecs together | runtime cost is unmeasured | donor source plus issue evidence defines the missing projection cases'
  ),
  'WG-PRODUCT-001A2E': semantic(
    'both stacks preserve blockquote identity | Plate exposes a literal blockquote descriptor | persisted blockquote vocabularies make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | local block contracts are broader'
  ),
  'WG-PRODUCT-003A2E': semantic(
    'Plate covers wrapping lift and input rules more completely | scoped blockquote APIs are direct | both preserve equivalent structural quotes | the block package owns the complete local behavior | runtime cost is unmeasured | focused local blockquote proof is broader'
  ),
  'WG-PRODUCT-001A2F': semantic(
    'both stacks preserve horizontal-rule identity | Plate exposes a literal rule descriptor | persisted rule vocabularies make different tradeoffs | feature-local and donor schema ownership differ | runtime cost is unmeasured | local block contracts are broader'
  ),
  'WG-PRODUCT-003A2F': semantic(
    'both stacks insert horizontal rules correctly | Plate exposes direct insertion and input-rule composition | resulting structural rules are equivalent | feature-local and donor schema ownership differ | runtime cost is unmeasured | focused local insertion proof is broader'
  ),
  'WG-PRODUCT-001A2G': semantic(
    'both stacks represent hard line breaks correctly | Plite needs no nominal break node API | Plite newline data is simpler than an explicit leaf node | the text model owns line breaks centrally | runtime cost is unmeasured | local command-spec proof is broader'
  ),
  'WG-PRODUCT-003A2G': semantic(
    'Plite inserts hard line breaks through one canonical command | the transaction API is direct and host-neutral | newline data stays inside the text model | Plite owns insertion while Plate adds rule integration | runtime cost is unmeasured | local command-spec proof is broader'
  ),
  'WG-PRODUCT-003D1A': semantic(
    'Plate link add remove and key-binding behavior is more complete | scoped link commands expose the configured owner | link persistence makes different tradeoffs | donor bundle and local feature ownership differ | runtime cost is unmeasured | focused local command and input-rule proof is broader'
  ),
  'WG-PRODUCT-003D1B': semantic(
    'both stacks provide link editing presentation | dialog and menu APIs make different composition tradeoffs | drafts stay outside persisted data | donor schema UI and copied Plate components own presentation differently | runtime cost is unmeasured | focused local floating-link proof is broader'
  ),
  'PLATE-STATIC-RENDERING': semantic(
    'Plate alone renders configured documents to React elements and HTML without a browser | static render APIs accept configured Plate descriptors | no donor or Plite data model is introduced | the Plate static package owns server rendering | comparative runtime cost is unmeasured | static component and HTML tests plus registry adoption are direct'
  ),
  'WG-PROOF-005A2': semantic(
    'no gate executes every example behavior | example APIs differ by product scope | fixtures contain realistic but non-equivalent data | runtime-example ownership is selective on both sides | whole-corpus runtime cost is unmeasured | selective Browser routes cannot prove universal behavior integrity'
  ),
  'WG-PROOF-005B1': semantic(
    'source-derived reference generation is the stronger idea but the donor output trails its source head | donor symbol extraction is a focused API mechanism | reference metadata is outside editor data | source generation owns symbol completeness | runtime cost is unmeasured | broken current references prevent an exact proof winner'
  ),
  'WG-PROOF-005B2': semantic(
    'Plate fails closed on internal docs routes and navigation | route checks expose direct diagnostics | route metadata is outside editor data | the docs application owns navigation integrity | check cost is unmeasured | direct parity and route tests are broader than donor warnings'
  ),
  'LOCAL-DOC-ROOTS': semantic(
    'named and element-owned roots preserve independent document domains | root-aware APIs infer location ownership | every root remains structural JSON | core owns roots while extensions declare them | indexes stay root-scoped | multiroot contracts are first-class'
  ),
  'LOCAL-ANCHORS': semantic(
    'runtime anchors survive structural edits without persisted IDs | typed references expose affinity | anchors remain revision-bound runtime state | public state owns mapping | only impacted anchors remap | transaction and browser proof is broad'
  ),
  'LOCAL-SCHEMA-IDENTITY': semantic(
    'Plite fingerprints prevent incompatible persisted schemas from mixing | explicit schema identity is inspectable without Plate plugin coupling | identity guards document history and collaboration payloads | the Plite compiler owns canonical publication | hash computation occurs once per revision | Plite plus Plate integration tests cover compile persistence and reconfiguration'
  ),
  'LOCAL-EXTENSION-CAPABILITIES': semantic(
    'typed capability groups expose only installed behavior | descriptor portals infer dependencies | capability state stays outside AST | each extension owns its API and core compiles it | direct registry lookup is bounded | compile-only and runtime proof is broad'
  ),
  'LOCAL-COMMIT-IMPACT-METADATA': semantic(
    'lazy impact queries identify exact changed scopes | typed queries avoid materialized range lists | impact remains commit metadata | public state owns computation | queries compute only when consumed | commit metadata and snapshot contracts are direct'
  ),
  'LOCAL-COMMIT-IMPACT-SUBSCRIPTIONS': semantic(
    'commit impact invalidates only subscribed React projections | selectors infer their configured output values | render state remains derived | projection stores own subscription invalidation | scoped sources constrain rerenders | focused render-count and invalidation contracts are direct'
  ),
  'LOCAL-REACT-HOST': semantic(
    'the Plite and Plate stack renders through React and publishes editor context to descendants | hooks infer the configured editor without owning unrelated selector law | render state remains derived | the React host owns projection and provider context | host publication is scoped to mounted editors | component lifecycle and browser proof is broad'
  ),
  'LOCAL-YJS': semantic(
    'Yjs integration preserves awareness relative selection and schema identity | provider APIs infer structural editors | schema envelopes guard collaborative JSON | the Yjs package owns transport and awareness | CRDT updates avoid local OT machinery | convergence and browser proof is broad'
  ),
  'LOCAL-LAYOUT-PLAN': semantic(
    'Plite computes page placement independently from React mounting | typed plan APIs expose page structure | layout state remains derived | the layout package owns pagination policy | plan computation can run without DOM mounting | layout owner tests prove pagination and break decisions'
  ),
  'LOCAL-LAYOUT-GEOMETRY': semantic(
    'Plite projects page geometry from the headless layout plan | typed geometry APIs expose projected page regions | geometry remains derived host state | layout and DOM hosts split measurement ownership | projection touches only visible page regions | focused layout browser and geometry contracts are direct'
  ),
  'LOCAL-A11Y-ANNOUNCEMENTS': semantic(
    'the Plite and Plate stack publishes assistive editor announcements through a live region | typed host hooks expose semantic messages | accessibility messages remain transient | core creates announcements and React owns presentation | only meaningful changes announce | focused history and live-region tests prove the channel'
  ),
  'LOCAL-A11Y-DOM-COVERAGE': semantic(
    'Plite explicitly reports which document regions have mounted DOM for assistive access | typed coverage APIs distinguish mounted and projected content | coverage state remains derived | DOM coverage and React boundary owners split mechanics and presentation | only unavailable regions need alternate semantics | browser coverage contracts prove hidden and virtualized boundaries'
  ),
  'LOCAL-HYPERSCRIPT': semantic(
    'typed fixtures construct valid structural trees | builder syntax infers configured nodes | fixtures serialize as editor JSON | proof utilities own construction | direct builders avoid parser overhead | package tests reuse one fixture law'
  ),
  'LOCAL-PROOF-AFFECTED-CHECKS': semantic(
    'affected development checks preserve fast source-first feedback while strict checks close the full package family | explicit commands distinguish iteration from handoff | check selection is tooling metadata | repository tooling owns dependency mapping and gate composition | affected checks reduce routine work while strict checks remain bounded | command contracts and CI invocation prove both modes'
  ),
  'LOCAL-PROOF-BROWSER-COVERAGE': semantic(
    'browser fingerprints bind scenarios to exact behavior coverage | route and scenario identifiers make proof gaps inspectable | fingerprints are proof metadata rather than editor data | browser harness owners publish coverage truth | focused reruns avoid unrelated browser work | exact scenario and engine artifacts close browser claims'
  ),
  'LOCAL-PROOF-CI-MATRIX': semantic(
    'the local CI matrix spans package adopters browser engines and retained artifacts | explicit lanes make release expectations discoverable | artifacts record frozen source truth | workflow owners separate package and host proof | parallel engines bound closure time | retained reports make failures and omissions auditable'
  ),
  'LOCAL-PROOF-TRACE-REDUCTION': semantic(
    'Plite tooling generates reduced trace candidates without claiming automatic minimization | candidate files expose replayable public inputs | traces remain proof fixtures | the browser proof owner curates generated candidates | candidate generation reduces debugging work but needs human validation | replay contracts distinguish generated leads from accepted regressions'
  ),
  'LOCAL-PROOF-RELEASE-GATES': semantic(
    'benchmark and release gates validate performance budgets and packed artifacts separately | explicit commands expose artifact-facing boundaries | measurements and package outputs are proof data | benchmark and release tooling retain separate ownership | budget checks catch regressions without running on every edit | packed import and benchmark artifacts close release claims'
  ),
  'PLATE-HEADING-ONTOLOGY': semantic(
    'both sides preserve semantic heading levels while Plate exposes separate configurable descriptors | h1 through h6 remain literal portal types | donor level data and local per-level identities make equivalent persistence tradeoffs | each Plate level remains registry-addressable | no comparable runtime benchmark exists | direct heading configuration rendering serialization and injection proof is broader locally'
  ),
  'PLATE-COPIED-KITS': semantic(
    'copied kits preserve transparent application composition | descriptor dependencies remain directly editable | kit arrays are never persisted | registry owns copies and packages own behavior | compilation deduplicates once | standalone demos prove copied output'
  ),
  'LOCAL-NATIVE-INPUT-RECONCILIATION': semantic(
    'Plite already reconciles verified native text deltas without a shadow document | the native input strategy exposes a narrower host contract than the donor ChangeSet machinery | imported text becomes ordinary named-root transactions | the Plite React input host owns validation dedupe repair and caret reconciliation | model-owned deletes breaks and clipboard avoid retained transform machinery | direct burst virtualization composition and repair contracts are broader than the donor tests'
  ),
}))
  setSemanticProfile(id, value);

for (const [id, value] of Object.entries({
  'WG-TABLE-001': semantic(
    'configured table grammar preserves row and cell invariants | scoped descriptors infer table identities | tables remain structural JSON | the table package owns policy | schema rules compile once | package and browser proof is broader'
  ),
  'WG-TABLE-002': semantic(
    'grid maps diagnose rowspan colspan and malformed geometry | read APIs avoid a nominal public TableMap | caches key to immutable revisions | the table package owns invalidation | unchanged tables avoid rescans | grid and merge tests are broader'
  ),
  'WG-TABLE-003': semantic(
    'correction restores rectangular and span invariants | plugin correction contexts infer table types | repair joins the same JSON commit | table schema owns normalization | only dirty tables are repaired | malformed-grid proof is broader'
  ),
  'WG-TABLE-004A': semantic(
    'cell selections map and normalize through structural changes | selection APIs infer configured cell types | selected cells remain ephemeral | table code owns selection kind and mapping | traversal stays within selected grids | history and browser proof is broader'
  ),
  'WG-TABLE-004B': semantic(
    'React projection renders selected-cell state correctly | table hooks infer the plugin portal | DOM selection state is not persisted | the table component owns projection | subscribed selection changes rerender only cells | browser visuals are broader'
  ),
  'WG-TABLE-005': semantic(
    'row column header merge and split preserve spans | flat plugin verbs expose direct actions | operations remain root-aware JSON changes | the table plugin owns commands | grid caches are reused | focused demos and tests are broader'
  ),
  'WG-TABLE-006': semantic(
    'fragment fitting and table policy preserve rectangular paste | scoped codecs infer table content | clipboard HTML and JSON preserve spans | DOM codec and table owners split work | one transaction grows and inserts | clipboard browser proof is broader'
  ),
  'WG-VIEW-001A': semantic(
    'local editor and React lifecycles cover create update and destroy | host-neutral editor APIs compose with React hooks | AST remains structural and root-aware | Plite host and Plate rendering split ownership | scoped subscriptions limit work | package and browser lifecycle proof is broader'
  ),
  'WG-VIEW-002': semantic(
    'bounded phases order DOM reads writes and repairs | internal scheduler APIs expose diagnostics | scheduling never changes AST | the DOM host owns the queue | bounded flushes prevent recursive layout thrash | scheduler browser tests are broader'
  ),
  'WG-VIEW-004A1': semantic(
    'both stacks preserve unchanged subtree identity but local projection binds structural nodes without nominal tiles | local binding and equality APIs are less coupled to one renderer | projection state remains transient | Plite React owns equality binding and publication | changed descendants avoid whole-root remounts | local projection and selection contracts are broader'
  ),
  'WG-VIEW-004A2': semantic(
    'nominal imperative Tile classes are an implementation choice rather than an editor capability | no public local API should copy the private hierarchy | tile instances remain transient | the donor renderer owns this machinery internally | importing the class graph would add retained machinery without a measured win | donor functional tests do not justify adopting its private model'
  ),
  'WG-VIEW-004A3': semantic(
    'local virtualization bounds mounted work while the donor has no separate large-document mounting contract | the plan stays private behind the editable host | segment plans remain transient | Plite React owns bounded mounting | windowed segments cap DOM work for large roots | local virtualization contracts and browser proof are broader'
  ),
  'WG-VIEW-004B': semantic(
    'both hosts preserve mounted identity during composition | runtime IDs and React keys fit local host types | structural roots remain a local advantage | React ownership avoids a custom renderer owning model state | no common identity benchmark exists | local composition matrices are broader'
  ),
  'WG-VIEW-005A1': semantic(
    'mapped decorations preserve anchor and range validity | typed sources infer payloads | decoration state stays transient | core maps and React renders | changed-range invalidation bounds work | anchor and browser proof is broader'
  ),
  'WG-VIEW-005A2': semantic(
    'React components preserve widget mount and teardown | component APIs fit the product ecosystem | widget data remains transient | React owns lifecycle while core owns anchors | reconciliation limits DOM churn | component browser proof is broader'
  ),
  'WG-VIEW-005C1': semantic(
    'commit impact invalidates decorations by changed region | no public cache knobs are exposed | caches remain transient | projection owners subscribe to impact | scoped recomputation limits work | invalidation and render tests are broader'
  ),
  'WG-VIEW-005C2': semantic(
    'donor heap merging and local decoration projection are functionally equivalent on shown cases | the donor HeapIterator is private machinery rather than a public API target | iteration leaves persisted data unchanged | donor iterator and local projection-store ownership make different tradeoffs | no property or performance benchmark proves an asymptotic winner | local projection contracts are broader but neither side proves the heap claim'
  ),
  'WG-VIEW-006A': semantic(
    'DOM positions map to root-aware structural points | typed host APIs avoid token offsets | DOM identity is never persisted | the DOM host owns conversion | indexes avoid global scans | cross-engine mapping proof is broader'
  ),
  'WG-VIEW-006B': semantic(
    'geometry mapping handles scrolling voids and portals | host coordinate APIs expose structural locations | geometry remains transient | only the DOM host owns layout | layout queries run on demand | cross-engine coordinate tests are broader'
  ),
  'WG-VIEW-007A': semantic(
    'DOM selection imports and exports root-aware ranges | typed host APIs preserve direction | selection remains transient | the DOM host owns conversion | lookup stays within mounted roots | browser selection proof is broader'
  ),
  'WG-VIEW-008A': semantic(
    'mutation observation reconciles native DOM into canonical changes | observer APIs remain internal | transient mutations become structural transactions | the DOM host owns reconciliation | batched records limit work | native-input browser proof is broader'
  ),
  'WG-VIEW-009A': semantic(
    'beforeinput routes editing through canonical commands | typed handler contexts expose host intent | events become structural changes | the DOM input owner arbitrates routes | duplicate keydown edits are avoided | desktop proof is broader while raw devices remain absent'
  ),
  'WG-VIEW-010A': semantic(
    'composition preserves native DOM identity until completion | lifecycle stays internal to the host | composition state remains transient | the DOM host owns composition | composing subtrees avoid rerender | cross-engine composition proof is broader'
  ),
  'WG-VIEW-010C2': semantic(
    'clipboard routes preserve contextual fragments | scoped codecs and plugin APIs infer content | JSON and HTML context survive transfer | DOM mechanics and feature deserializers split ownership | one decode and fitted insert occurs | clipboard browser proof is broader'
  ),
  'WG-VIEW-011A': semantic(
    'contextual fragments preserve open structural insertion state | typed slice APIs accept configured descendants | fragment data stays structural JSON | schema and clipboard owners fit content | insertion fits once | fragment and clipboard proof is broad'
  ),
  'WG-VIEW-011B': semantic(
    'browser wire codecs preserve HTML and text interoperability | scoped serialize and deserialize APIs infer editor types | wire data remains outside AST until decode | DOM host and feature codecs split ownership | direct encoding avoids extra models | strict benchmark proof remains incomplete despite broad tests'
  ),
  'WG-VIEW-012B': semantic(
    'feature-owned input rules preserve matching policy | inline rule declarations infer plugin context | rules are not persisted | each feature owns matching while core dispatches | bounded matching creates one transaction | package and browser proof is broader'
  ),
  'WG-VIEW-013D': semantic(
    'typed render contracts preserve editor and content attributes | React props and plugin injection infer values | attributes remain transient | the React DOM host owns projection | scoped subscriptions limit updates | accessibility browser proof is broader'
  ),
  'WG-VIEW-014A1': semantic(
    'Plate panel positioning covers product layout | component families expose typed props | panel state remains transient | copied registry owns these surfaces | floating geometry is subscribed | standalone demos prove behavior'
  ),
  'WG-VIEW-014B': semantic(
    'Plate menus cover custom product controls | shadcn components bind plugin portals | menu state remains transient | copied registry owns menus | subscribed controls limit updates | registry demos provide proof'
  ),
}))
  setSemanticProfile(id, value);

for (const [id, value] of Object.entries({
  'WG-META-005A': semantic(
    'the donor probe directly catches namespace sibling retention | a focused sentinel fixture makes tree-shaking failures readable | probe fixtures do not touch editor data | build tooling owns the bundled assertion | the probe measures emitted dead code instead of assuming elimination | local release gates are broader but lack this exact sentinel'
  ),
  'WG-META-005B': semantic(
    'both repositories automate broad mechanical maintenance | local scripts cover workspace-specific barrels and registries | mass edits do not alter runtime data law | repository tooling honestly owns mechanical rewrites | no comparable maintenance benchmark exists | ordinary diff and package gates prove the resulting edit'
  ),
  'WG-DOC-001A': semantic(
    'structural JSON nodes avoid nominal Leaf and Plot instance invariants | discriminated unions infer configured descendants more directly | plain objects serialize without class reconstruction | the substrate schema owns node shape | immutable snapshots avoid retained method machinery | local schema and codec tests cover more node families'
  ),
  'WG-DOC-001C': semantic(
    'named and element-owned roots avoid one privileged document root | root-aware locations expose ownership in their types | every root persists as structural JSON | the substrate owns roots while extensions declare them | root-scoped indexes avoid primary-root branching | local multiroot history and collaboration proof is broader'
  ),
  'WG-DOC-002A': semantic(
    'compiled schema classification covers text element inline and void policy | descriptor declarations infer configured node families | classification remains compiled runtime metadata | the schema compiler owns flags | indexed lookup avoids nominal type methods | local conflict and reconfiguration proof is broader'
  ),
  'WG-DOC-002B': semantic(
    'compiled grammar programs validate hierarchy and groups atomically | declarative content expressions are inspectable | grammar remains schema identity rather than document payload | Plite compiles mechanics and Plate declares product grammar | programs compile once per revision | local nested validation proof is broader'
  ),
  'WG-DOC-002C': semantic(
    'semantic roles and feature descriptors solve different lookup jobs | Plate feature ownership is more direct than one universal role registry | roles remain runtime schema metadata | feature packages own product semantics | descriptor indexes avoid repeated role scans | local feature and browser proof is broader'
  ),
  'WG-DOC-002D': semantic(
    'explicit schema-owned atom and selectability policy is safer than deriving atom behavior from render shape | Plite exposes compiled runtime schema lookup without coupling policy to decoration APIs | node JSON remains independent of atom behavior | named schema slots own reconfiguration rather than a render-shape facet | lookup is compiled on both sides but activation rollback remains separately unresolved | local schema contracts directly prove state-scoped queries while donor proof only covers its coupled shape model'
  ),
  'WG-DOC-014A': semantic(
    'a private immutable host representation can normalize DOM traversal but adds another model | direct host codecs have simpler public types | both keep host nodes outside persisted AST data | codec internals should own any intermediate representation | an extra immutable tree is unjustified without measured reuse | local roundtrip and browser tests are broader'
  ),
  'WG-DOC-014B': semantic(
    'both designs bind rendering and parsing to configured schema behavior | split serialize and deserialize contracts are easier to compose by host | output remains transient host data | Plate feature rules and DOM codecs split policy from mechanics | compiled rules avoid repeated discovery | local static and browser roundtrip proof is broader'
  ),
  'WG-DOC-015A': semantic(
    'local compiled deserializers preserve precedence and plugin ownership | scoped codec APIs infer configured output types | parsed nodes remain structural JSON | the DOM compiler owns ranking while features own rules | rule indexes compile once | local precedence and conflict tests are broader'
  ),
  'WG-DOC-015B': semantic(
    'full-document parsing validates configured output before publication | editor-scoped deserialize APIs avoid nominal parser instances | decoded documents remain schema-validated JSON | the DOM host owns parsing and schema owns validation | one compiled pass handles the document | local HTML roundtrip proof is broader'
  ),
  'WG-DOC-015C': semantic(
    'contextual fragments fit through local schema and clipboard laws | typed fragment codecs expose insertion context | open content remains structural fragment data | schema fitting and DOM decoding have separate owners | fitting occurs once at the boundary | local clipboard and invalid-fragment proof is broader'
  ),
  'WG-PRODUCT-003D2': semantic(
    'Plate hover cards and floating links cover cursor target presentation | component and hook families expose direct composition | tooltip state remains transient | copied registry owns hover presentation | floating geometry updates only while active | browser demos cover hover teardown'
  ),
  'WG-PRODUCT-003D3': semantic(
    'Plate paste policy recognizes URLs over selected text | feature handlers infer link configuration | the resulting href persists as structural data | the link plugin owns paste policy | one handler produces one transaction | clipboard and link browser proof is broader'
  ),
  'WG-STATE-006B': semantic(
    'local transaction resolution validates before one atomic publication | update callbacks infer the configured editor | failed drafts never become observable state | transaction core owns resolution and publication | a failed transaction performs no compensating commit | local rollback and nested update tests are broader'
  ),
  'WG-TABLE-007A': semantic(
    'Plate provides accessible dimension selection and table insertion | copied components call scoped table commands | picker state remains transient | registry owns presentation and table owns mutation | local state confines pointer updates | standalone table demos prove interaction'
  ),
  'WG-TABLE-007B': semantic(
    'Plate exposes table manipulation controls over configured commands | copied menus bind typed table portals | menu state remains transient | registry owns presentation and table owns behavior | subscribed controls update only when relevant | table demos cover menu actions'
  ),
  'WG-STATE-002B': semantic(
    'donor field codecs serialize values but require caller-supplied field maps and have no version envelope | explicit local codecs expose persistence boundaries | local schema identity guards serialized state while donor raw codecs do not | field owners declare codecs and local core owns schema compatibility | decode runs only at persistence boundaries | local roundtrip and migration proof is broader'
  ),
  'WG-PROOF-002B': semantic(
    'local history tests cover current grouping inversion persistence and schema behavior | package APIs remain directly exercised | history fixtures bind current schema identity | the history package owns proof | focused branch cases remain bounded | donor history results resolve stale dist and cannot close current source'
  ),
  'WG-PROOF-002C': semantic(
    'local adapter cases and donor transform fixtures exercise distinct synchronization models | direct transport APIs expose each model honestly | collaboration fixtures preserve their wire shapes | adapters own integration proof | no common convergence benchmark exists | donor green tests resolve stale dist so current-head parity remains unproved'
  ),
  'WG-PROOF-003': semantic(
    'Plate table suites exercise current spans paste selection and commands while donor tests resolve old dist | scoped plugin APIs are tested | fixtures use structural table JSON | the table package owns proof | focused grids keep suites bounded | local integration and browser breadth is current-source evidence'
  ),
  'WG-PROOF-004A': semantic(
    'local browser matrices execute current editor DOM coordinates and serialization while donor browser tests load stale dist | host APIs run in actual React and DOM | real DOM and clipboard state is exercised | browser runners remain separate from packages | browser timings are gated | donor green counts do not prove its frozen source head'
  ),
  'WG-PROOF-004B': semantic(
    'local selection input and composition matrices execute current source across engines | browser-facing APIs are exercised through real events | composition state remains transient | DOM hosts own their browser proof | focused routes bound runtime | donor Chrome results resolve stale dist and miss current input changes'
  ),
  'PLATE-PLUGIN-IDENTITY': semantic(
    'Wordgard separates schema-relative node names and Plite separates extension identity while Plate proves a broader JSON plugin ecosystem but universally invents type from name | Plite gives capability extensions the cleanest current authoring shape | Wordgard keeps persisted node identity schema-relative instead of equating it with extension identity | no current side owns the full hybrid target because Plate mixes capability and AST ownership | aliases and reverse catalogs retain avoidable runtime machinery | Plate has broad current ecosystem proof but no side proves the identity hard cut target'
  ),
  'LOCAL-LIFECYCLE-PHASE': semantic(
    'Plite can roll back staged registry publication but activates only after finalization while Wordgard deactivates a crashing plugin; neither provides failure-atomic activation | both expose useful lifecycle pieces without one honest rollback contract | lifecycle state remains runtime-only | the two systems choose different recovery owners | activation rollback cost and compensating cleanup remain unmeasured | neither current proof set closes the dossier target'
  ),
  'LOCAL-SCHEMA-DEFAULT-SIDECHANNEL': semantic(
    'donor grammar-owned defaults are exact while local construction still permits a global default-block sidechannel | typed constructors expose most of the desired API | default selection belongs in compiled schema identity | the donor grammar owner is cleaner than the current compiler and OverridePlugin split | the sidechannel adds lookup and configuration drift | local schema tests prove construction behavior but not the completed hard cut'
  ),
  'LOCAL-HISTORY-IDLE-GROUP': semantic(
    'Wordgard alone implements a clock-based idle boundary between otherwise mergeable edits | one delay option makes user-intent grouping explicit | timers remain transient history state | history owns the timer and branch lifecycle | boundary checks are constant-time | donor timing tests provide the direct oracle'
  ),
  'LOCAL-MAX-LENGTH-POLICY': semantic(
    'current local enforcement clamps command paths and mutates policy through editor and React side storage rather than rejecting one atomic commit | callers see multiple enforcement entrypoints instead of one authoring policy | persisted JSON has no intrinsic maximum but current bypass ownership is implicit | command helpers public state and React effects split policy ownership | repeated clamping and side storage add machinery | focused tests cover paths but not one atomic validator and bypass contract'
  ),
  'LOCAL-RUNTIME-API-TREESHAKING': semantic(
    'current runtime API objects and used donor namespaces both retain sibling properties in available probes | both offer namespace-like discovery with imperfect property elimination | module organization does not affect editor data | API objects and build rewriting split ownership awkwardly | emitted sibling retention is demonstrated while cross-bundler parity remains incomplete | stale donor dist and missing clean-pack runtime outputs make the current proof insufficient on both sides'
  ),
  'LOCAL-MATH-CSS-BOUNDARY': semantic(
    'the live equation plugin hides a CSS import inside a package marked side-effect free | consumers have no explicit stylesheet entrypoint to express ownership | styles remain outside AST data | package metadata and plugin runtime currently disagree about the CSS owner | bundlers may legitimately eliminate the hidden stylesheet | static rendering and package-consumer proof is incomplete'
  ),
  'LOCAL-MEDIA-KEYBOARD-RESIZE': semantic(
    'Wordgard supports command-driven and pointer resizing while Plate currently exposes only pointer resizing | the donor command surface makes keyboard adoption explicit | both persist width as node data | donor schema behavior owns resize commands while local UI directly writes generic node width | both paths can remain scoped to one media node | donor keyboard evidence is stronger while local pointer demos remain useful'
  ),
}))
  setSemanticProfile(id, value);

const intactSpecs = Object.entries(intactStatus).map(([id, status]) => {
  const previous = previousById.get(id);
  if (!previous) throw new Error(`Missing prior row for intact concept ${id}`);
  return makeSpec({
    id,
    lane: previous.lane,
    origin: 'reference',
    status,
    title:
      id === 'WG-COLLAB-001'
        ? 'Versioned local-update queue, acknowledgement, and remote transform loop'
        : id === 'WG-DOC-001'
          ? 'Nominal node objects and privileged document root semantics'
          : id === 'WG-VIEW-012B'
            ? 'Input-rule matching and feature policy'
            : previous.title,
  });
});

const splitSpecs = splitDefinitions.map(([id, title, parent, status]) => {
  const previous = previousById.get(parent);
  if (!previous) throw new Error(`Missing split parent ${parent}`);
  return makeSpec({
    id,
    lane: previous.lane,
    origin: 'reference',
    parent,
    status,
    title,
  });
});

const siteSpecs = siteDefinitions.map(
  ([id, title, lane, siteSourceId, status]) => {
    const localSources = sourceGroupById.get(id) ?? { plate: [], plite: [] };
    return makeSpec({
      id,
      lane,
      origin: 'reference',
      parent:
        splitSiteParents[id] ??
        (siteParentSources[id]?.[0] &&
        !Object.hasOwn(intactStatus, siteParentSources[id][0])
          ? siteParentSources[id][0]
          : undefined),
      sources: {
        plate: localSources.plate,
        plite: localSources.plite,
        wordgard: unique([
          ...(siteParentSources[id] ?? []),
          siteSourceId,
          ...(siteSourcesByRow.get(id) ?? []),
        ]),
      },
      status,
      title,
    });
  }
);

const localSpecs = localDefinitions.map((definition) =>
  makeSpec({
    ...definition,
    priority:
      definition.priority ?? priorityAndDossier[definition.id]?.priority ?? '—',
  })
);

const allSpecs = [...intactSpecs, ...splitSpecs, ...siteSpecs, ...localSpecs];
const allIds = allSpecs.map(({ id }) => id);
if (new Set(allIds).size !== allIds.length) {
  throw new Error('Atomic matrix contains duplicate row IDs');
}

const coveredParents = new Set([
  ...Object.keys(intactStatus),
  ...splitDefinitions.map(([, , parent]) => parent),
  ...Object.values(siteParentSources).flat(),
  ...Object.values(splitSiteParents),
]);
const uncoveredParents = previousRows
  .map(({ id }) => id)
  .filter((id) => !coveredParents.has(id));
if (uncoveredParents.length > 0) {
  throw new Error(
    `Prior source concepts lost during atomic split: ${uncoveredParents}`
  );
}

export const forumCorpusCoverage = Object.freeze({
  anonymousRetrieval: Object.freeze({
    inaccessiblePosts: 23,
    inaccessibleTopics: 3,
    retrievedTopics: 14,
    visiblePosts: 48,
  }),
  corpusTopics: 71,
  limitation:
    'Forum evidence establishes requirement intent only. Anonymous retrieval exposed 14 topics and 48 posts; 3 topics and 23 posts were inaccessible, and post 8 was missing from the visible sequence. No forum citation is treated as implementation or behavior proof.',
  missingPostNumbers: Object.freeze([8]),
  relevantTopicCount: 17,
  relevantTopicCountIsApproximate: true,
  requirements: Object.freeze({
    'LOCAL-EXTERNAL-MODEL-SYNC': Object.freeze({ posts: [24, 30, 63, 72] }),
    'LOCAL-HOST-EDITOR-CAPABILITY': Object.freeze({
      posts: [9, 10, 23, 31, 56, 61],
    }),
    'LOCAL-MARKDOWN-SERIALIZATION-BOUNDARY': Object.freeze({
      posts: [20, 27],
    }),
    'LOCAL-OFFLINE-MERGE-REVIEW': Object.freeze({ posts: [62, 66, 72] }),
    'LOCAL-VERTICAL-WRITING-INPUT': Object.freeze({
      coverageOnly: [
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:90-158',
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:625-648',
        'packages/plite-react/src/editable/keyboard-input-strategy.ts:882-896',
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
      posts: [50, 51, 60, 61],
    }),
    'LOCAL-VERTICAL-WRITING-LAYOUT': Object.freeze({
      coverageOnly: [
        '../wordgard/src/state/textblock.ts:29-48',
        '../wordgard/src/state/textblock.ts:141-175',
        'packages/plite-dom/src/plugin/dom-geometry.ts:65-105',
        'packages/plite-dom/src/plugin/dom-geometry.ts:1041-1085',
        'packages/plite-dom/src/plugin/dom-geometry.ts:1185-1217',
        'docs/plite/selection-navigation-coverage.md:198-201',
      ],
      posts: [50, 51, 60, 61],
    }),
  }),
});

export const matrixTruth = Object.freeze(allSpecs.map(row));

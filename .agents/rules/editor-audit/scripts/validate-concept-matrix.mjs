#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredColumns = [
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
const dimensionColumns = [
  'Correctness',
  'API/types',
  'Data/collab',
  'Ownership/lifecycle',
  'Runtime/perf',
  'Proof/host',
];
const mappingColumns = ['Reference mapping', 'Plite mapping', 'Plate mapping'];
const classificationValues = [
  'reference stronger',
  'Plite stronger',
  'Plate stronger',
  'Plite/Plate stack stronger',
  'equivalent',
  'different tradeoff',
  'insufficient evidence',
];
const preferredValues = [
  'reference',
  'Plite',
  'Plate',
  'Plite/Plate stack',
  'tie',
  'different tradeoff',
  'insufficient evidence',
];
const originValues = ['reference', 'Plite', 'Plate', 'Plite/Plate', 'shared'];
const referenceAdaptationValues = [
  'adapt',
  'keep-local',
  'reject',
  'defer',
  'not-applicable',
];
const localDebtValues = [
  'material',
  'non-material',
  'none',
  'insufficient evidence',
];
const proofAdaptationValues = [
  'adapt',
  'keep-local',
  'reject',
  'defer',
  'not-applicable',
];
const priorCandidateValues = ['reaffirm', 'supersede', 'reject'];
const verdictValues = [
  'keep',
  'steal',
  'rearchitect',
  'hard-cut',
  'move',
  'reject',
  'defer',
];
const priorityValues = ['P0', 'P1', 'P2', 'P3', '—'];
const comparisonPattern =
  /^(?:reference stronger|Plite stronger|Plate stronger|Plite\/Plate stack stronger|equivalent|different tradeoff|insufficient evidence)\s+(?:—|-|:)\s+\S/i;
const dimensionPattern =
  /^(?:reference stronger|Plite stronger|Plate stronger|Plite\/Plate stack stronger|equivalent|different tradeoff|insufficient evidence|not-applicable)\s+(?:—|-|:)\s+\S/i;
const mappingPattern =
  /^(?:exact|partial|absent|not-applicable)\s+(?:—|-|:)\s+\S/i;
const preferredPattern =
  /^(?:reference|Plite|Plate|Plite\/Plate stack|tie|different tradeoff|insufficient evidence)\s+(?:—|-|:)\s+\S/i;
const referenceAdaptationPattern =
  /^(?:adapt|keep-local|reject|defer|not-applicable)\s+(?:—|-|:)\s+\S/i;
const localDebtPattern =
  /^(?:material|non-material|none|insufficient evidence)\s+(?:—|-|:)\s+\S/i;
const proofAdaptationPattern =
  /^(?:adapt|keep-local|reject|defer|not-applicable)\s+(?:—|-|:)\s+\S/i;
const verdictPattern =
  /^(?:keep|steal|rearchitect|hard-cut|move|reject|defer)\s+(?:—|-|:)\s+\S/i;
const evidencePattern = /`[^`]+`|\[[^\]]+\]\([^)]+\)/;
const placeholderPattern = /^(?:|—|-|n\/a|none|pending|tbd|todo|unknown)$/i;
const exactContractFacets = [
  'public',
  'owner',
  'consumers',
  'lifecycle',
  'proof',
];
const partialContractFacets = ['covers', 'missing', 'proof'];
const materialVerdicts = new Set(['steal', 'rearchitect', 'hard-cut', 'move']);
const preferredByClassification = {
  'different tradeoff': 'different tradeoff',
  equivalent: 'tie',
  'insufficient evidence': 'insufficient evidence',
  'Plate stronger': 'Plate',
  'Plite stronger': 'Plite',
  'Plite/Plate stack stronger': 'Plite/Plate stack',
  'reference stronger': 'reference',
};
const mappingByWinner = {
  Plate: ['Plate mapping'],
  'Plate stronger': ['Plate mapping'],
  Plite: ['Plite mapping'],
  'Plite/Plate stack': ['Plite mapping', 'Plate mapping'],
  'Plite/Plate stack stronger': ['Plite mapping', 'Plate mapping'],
  'Plite stronger': ['Plite mapping'],
  reference: ['Reference mapping'],
  'reference stronger': ['Reference mapping'],
};

const parseMarkdownRow = (line) => {
  const cells = [];
  let cell = '';
  let escaped = false;
  let inCode = false;

  for (const character of line.trim()) {
    if (escaped) {
      cell += character;
      escaped = false;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      continue;
    }
    if (character === '`') {
      inCode = !inCode;
      cell += character;
      continue;
    }
    if (character === '|' && !inCode) {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += character;
  }
  cells.push(cell.trim());

  if (cells[0] === '') cells.shift();
  if (cells.at(-1) === '') cells.pop();

  return cells;
};

const getConcepts = (manifest) => {
  if (!Array.isArray(manifest.concepts)) {
    throw new Error(
      'manifest concepts must be an array of { id, origin } entries'
    );
  }

  return manifest.concepts.map((concept) => {
    if (
      !concept ||
      typeof concept !== 'object' ||
      typeof concept.id !== 'string' ||
      concept.id.trim() === '' ||
      !originValues.includes(concept.origin)
    ) {
      throw new Error(
        'manifest concepts must use non-empty IDs and origin reference, Plite, Plate, Plite/Plate, or shared'
      );
    }

    return concept;
  });
};

const stripCode = (value) => value.replace(/^`|`$/g, '').trim();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeQualitativeCell = (value, concept) =>
  value
    .replace(/^[^—:]+(?:—|-|:)\s*/u, '')
    .replace(new RegExp(escapeRegExp(concept), 'gi'), '')
    .replace(/^[:\s-]+|[:\s-]+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
const summarizeGroups = (groups) =>
  Object.fromEntries(
    Object.entries(groups).map(([name, ids]) => [
      name,
      { count: ids.length, ids },
    ])
  );
const leadingValue = (value) => value.split(/\s+(?:—|-|:)\s+/)[0].trim();
const groupBy = (values) =>
  Object.fromEntries(values.map((value) => [value, []]));
const hasEvidence = (value) => evidencePattern.test(value);
const contractFacetValue = (mapping, facet, facets) => {
  const nextFacets = facets
    .filter((candidate) => candidate !== facet)
    .join('|');
  const match = mapping.match(
    new RegExp(
      `\\b${facet}\\s*=\\s*(.+?)(?=;\\s*(?:${nextFacets})\\s*=|\\s+(?:—|-|:)\\s+\\S|$)`,
      'i'
    )
  );

  return match?.[1]?.trim();
};
const hasContractEvidence = (value) =>
  Boolean(value && (hasEvidence(value) || /^N\/A\s*\(.+\)$/i.test(value)));

const validateManifestCandidates = (manifest, expected) => {
  if (!Array.isArray(manifest.priorCandidates)) {
    throw new Error('manifest priorCandidates must be an array');
  }

  const candidates = new Map();
  for (const candidate of manifest.priorCandidates) {
    if (
      !candidate ||
      typeof candidate.id !== 'string' ||
      candidate.id.trim() === '' ||
      !Array.isArray(candidate.conceptIds) ||
      candidate.conceptIds.length === 0 ||
      typeof candidate.evidence !== 'string' ||
      candidate.evidence.trim() === ''
    ) {
      throw new Error(
        'each prior candidate needs id, non-empty conceptIds, and evidence'
      );
    }
    if (candidates.has(candidate.id)) {
      throw new Error(`duplicate prior candidate ID: ${candidate.id}`);
    }
    const unknownConceptIds = candidate.conceptIds.filter(
      (id) => !expected.has(id)
    );
    if (unknownConceptIds.length > 0) {
      throw new Error(
        `prior candidate ${
          candidate.id
        } has unknown concept IDs: ${unknownConceptIds.join(', ')}`
      );
    }
    candidates.set(candidate.id, candidate);
  }

  return candidates;
};

export const validateConceptMatrix = ({ ledger, manifest }) => {
  const concepts = getConcepts(manifest);
  const expectedIds = concepts.map(({ id }) => id);
  if (expectedIds.length === 0) {
    throw new Error('manifest concepts must contain at least one concept');
  }
  const expected = new Set(expectedIds);
  const duplicateManifestIds = expectedIds.filter(
    (id, index) => expectedIds.indexOf(id) !== index
  );
  if (duplicateManifestIds.length > 0) {
    throw new Error(
      `manifest contains duplicate concept IDs: ${[
        ...new Set(duplicateManifestIds),
      ].join(', ')}`
    );
  }

  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const priorCandidateById = validateManifestCandidates(manifest, expected);
  const lines = ledger.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    if (!line.trim().startsWith('|')) return false;
    const cells = parseMarkdownRow(line);

    return (
      cells.length === requiredColumns.length &&
      cells.every((column, index) => column === requiredColumns[index])
    );
  });

  if (headerIndex < 0) {
    throw new Error(
      `concept matrix header must exactly equal: ${requiredColumns.join(', ')}`
    );
  }

  const headers = parseMarkdownRow(lines[headerIndex]);
  const separator = parseMarkdownRow(lines[headerIndex + 1] ?? '');
  if (
    separator.length !== headers.length ||
    separator.some((cell) => !/^:?-{3,}:?$/.test(cell))
  ) {
    throw new Error('concept matrix header lacks a valid separator row');
  }

  const rawRows = [];
  for (let index = headerIndex + 2; index < lines.length; index++) {
    if (!lines[index].trim().startsWith('|')) break;
    rawRows.push({
      cells: parseMarkdownRow(lines[index]),
      line: index + 1,
    });
  }

  const classifications = groupBy(classificationValues);
  const preferredBases = groupBy(preferredValues);
  const origins = groupBy(originValues);
  const referenceAdaptations = groupBy(referenceAdaptationValues);
  const localDebt = groupBy(localDebtValues);
  const proofAdaptations = groupBy(proofAdaptationValues);
  const priorCandidateDispositions = groupBy(priorCandidateValues);
  const verdicts = groupBy(verdictValues);
  const priorities = groupBy(priorityValues);
  const counts = new Map();
  const qualitativeProfiles = new Map();
  const reconciledPriorCandidates = new Set();
  const groupedIds = [];
  const unknownIds = [];
  const rowErrors = [];

  for (const rawRow of rawRows) {
    if (rawRow.cells.length !== headers.length) {
      rowErrors.push(
        `line ${rawRow.line} has ${rawRow.cells.length} cells; expected ${headers.length}`
      );
      continue;
    }

    const row = Object.fromEntries(
      headers.map((header, index) => [header, rawRow.cells[index]])
    );
    const id = stripCode(row.ID);
    if (!expected.has(id)) {
      const target = /(?:\.\.|,|\*|\bthrough\b)/i.test(id)
        ? groupedIds
        : unknownIds;
      target.push(`${id} (line ${rawRow.line})`);
      continue;
    }
    counts.set(id, (counts.get(id) ?? 0) + 1);

    if (placeholderPattern.test(row.Concept)) {
      rowErrors.push(`${id} Concept is unresolved: ${row.Concept}`);
    }
    if (!originValues.includes(row.Origin)) {
      rowErrors.push(`${id} Origin is invalid: ${row.Origin}`);
    } else {
      origins[row.Origin].push(id);
      if (row.Origin !== conceptById.get(id).origin) {
        rowErrors.push(
          `${id} Origin ${row.Origin} contradicts manifest origin ${
            conceptById.get(id).origin
          }`
        );
      }
    }

    const mappingStatuses = {};
    for (const column of mappingColumns) {
      const mapping = row[column];
      if (!mappingPattern.test(mapping)) {
        rowErrors.push(
          `${id} ${column} must be exact, partial, absent, or not-applicable with evidence: ${mapping}`
        );
        continue;
      }
      const status = leadingValue(mapping).toLowerCase();
      mappingStatuses[column] = status;
      if (!hasEvidence(mapping)) {
        rowErrors.push(
          `${id} ${column} needs an exact code owner or link: ${mapping}`
        );
      }
      if (status === 'exact') {
        const missingFacets = exactContractFacets.filter(
          (facet) =>
            !hasContractEvidence(
              contractFacetValue(mapping, facet, exactContractFacets)
            )
        );
        if (missingFacets.length > 0) {
          rowErrors.push(
            `${id} ${column} exact contract must name evidence-backed public, owner, consumers, lifecycle, and proof; missing ${missingFacets.join(
              ', '
            )}`
          );
        }
      }
      if (status === 'partial') {
        const missingFacets = partialContractFacets.filter(
          (facet) =>
            !hasContractEvidence(
              contractFacetValue(mapping, facet, partialContractFacets)
            )
        );
        if (missingFacets.length > 0) {
          rowErrors.push(
            `${id} ${column} partial contract must name evidence-backed covers, missing, and proof; missing ${missingFacets.join(
              ', '
            )}`
          );
        }
      }
    }

    for (const column of dimensionColumns) {
      const comparison = row[column];
      if (!dimensionPattern.test(comparison)) {
        rowErrors.push(
          `${id} ${column} lacks a qualitative comparison and reason: ${comparison}`
        );
        continue;
      }
      if (!hasEvidence(comparison)) {
        rowErrors.push(
          `${id} ${column} needs a source or symbol citation: ${comparison}`
        );
      }
      const winner = leadingValue(comparison);
      const requiredMappings = mappingByWinner[winner] ?? [];
      for (const mapping of requiredMappings) {
        if (!['exact', 'partial'].includes(mappingStatuses[mapping])) {
          rowErrors.push(
            `${id} ${column} cannot prefer ${winner.replace(
              / stronger$/,
              ''
            )} when ${mapping} is ${mappingStatuses[mapping]}`
          );
        }
      }
    }
    const qualitativeSignature = JSON.stringify(
      dimensionColumns.map((column) =>
        normalizeQualitativeCell(row[column], row.Concept)
      )
    );
    const profileIds = qualitativeProfiles.get(qualitativeSignature) ?? [];
    profileIds.push(id);
    qualitativeProfiles.set(qualitativeSignature, profileIds);

    let classification;
    if (!comparisonPattern.test(row.Classification)) {
      rowErrors.push(
        `${id} Classification lacks a comparison and reason: ${row.Classification}`
      );
    } else {
      classification = leadingValue(row.Classification);
      classifications[classification].push(id);
      if (!hasEvidence(row.Classification)) {
        rowErrors.push(
          `${id} Classification needs a source or symbol citation: ${row.Classification}`
        );
      }
      for (const mapping of mappingByWinner[classification] ?? []) {
        if (!['exact', 'partial'].includes(mappingStatuses[mapping])) {
          rowErrors.push(
            `${id} Classification cannot prefer ${classification.replace(
              / stronger$/,
              ''
            )} when ${mapping} is ${mappingStatuses[mapping]}`
          );
        }
      }
    }

    let preferred;
    if (!preferredPattern.test(row['Preferred base'])) {
      rowErrors.push(
        `${id} Preferred base lacks an owner and reason: ${row['Preferred base']}`
      );
    } else {
      preferred = leadingValue(row['Preferred base']);
      preferredBases[preferred].push(id);
      if (!hasEvidence(row['Preferred base'])) {
        rowErrors.push(
          `${id} Preferred base needs a source or symbol citation: ${row['Preferred base']}`
        );
      }
      for (const mapping of mappingByWinner[preferred] ?? []) {
        if (!['exact', 'partial'].includes(mappingStatuses[mapping])) {
          rowErrors.push(
            `${id} cannot prefer ${preferred} when ${mapping} is ${mappingStatuses[mapping]}`
          );
        }
      }
    }
    if (
      classification &&
      preferred &&
      preferredByClassification[classification] !== preferred
    ) {
      rowErrors.push(
        `${id} Preferred base ${preferred} contradicts ${classification}`
      );
    }

    const dispositionCells = [
      {
        column: 'Reference adaptation',
        groups: referenceAdaptations,
        pattern: referenceAdaptationPattern,
      },
      {
        column: 'Local debt',
        groups: localDebt,
        pattern: localDebtPattern,
      },
      {
        column: 'Proof adaptation',
        groups: proofAdaptations,
        pattern: proofAdaptationPattern,
      },
    ];
    const dispositions = {};
    for (const { column, groups, pattern } of dispositionCells) {
      if (!pattern.test(row[column])) {
        rowErrors.push(
          `${id} ${column} lacks an allowed disposition and reason: ${row[column]}`
        );
        continue;
      }
      const value = leadingValue(row[column]).toLowerCase();
      dispositions[column] = value;
      groups[value].push(id);
      if (!hasEvidence(row[column])) {
        rowErrors.push(
          `${id} ${column} needs a source or dossier citation: ${row[column]}`
        );
      }
    }
    if (
      dispositions['Reference adaptation'] === 'not-applicable' &&
      !['absent', 'not-applicable'].includes(
        mappingStatuses['Reference mapping']
      )
    ) {
      rowErrors.push(
        `${id} Reference adaptation cannot be not-applicable when the reference mapping is ${mappingStatuses['Reference mapping']}`
      );
    }
    if (
      dispositions['Proof adaptation'] === 'not-applicable' &&
      !['absent', 'not-applicable'].includes(
        mappingStatuses['Reference mapping']
      )
    ) {
      rowErrors.push(
        `${id} Proof adaptation cannot be not-applicable when the reference mapping is ${mappingStatuses['Reference mapping']}`
      );
    }
    if (
      classification === 'reference stronger' &&
      !['adapt', 'defer'].includes(dispositions['Reference adaptation'])
    ) {
      rowErrors.push(
        `${id} reference stronger requires adapting or explicitly deferring the reference mechanism`
      );
    }

    const priorCell = row['Prior candidates'];
    if (/^none\s+(?:—|-|:)\s+\S/i.test(priorCell)) {
      if (!hasEvidence(priorCell)) {
        rowErrors.push(
          `${id} Prior candidates none claim needs an evidence-backed search`
        );
      }
    } else {
      for (const clause of priorCell.split(/\s*<br\s*\/?>\s*/i)) {
        const match = clause.match(
          /^`([^`]+)`\s+(reaffirm|supersede|reject)\s+(?:—|-|:)\s+(.+)$/i
        );
        if (!match) {
          rowErrors.push(
            `${id} Prior candidates must use \`ID\` reaffirm|supersede|reject with evidence: ${clause}`
          );
          continue;
        }
        const [, candidateId, disposition, reason] = match;
        const candidate = priorCandidateById.get(candidateId);
        if (!candidate) {
          rowErrors.push(`${id} cites unknown prior candidate ${candidateId}`);
          continue;
        }
        if (!candidate.conceptIds.includes(id)) {
          rowErrors.push(
            `${id} is not in prior candidate ${candidateId} conceptIds`
          );
        }
        if (!hasEvidence(reason)) {
          rowErrors.push(
            `${id} prior candidate ${candidateId} disposition needs a dossier citation`
          );
        }
        if (reconciledPriorCandidates.has(candidateId)) {
          rowErrors.push(
            `${id} reconciles prior candidate ${candidateId} more than once`
          );
        }
        reconciledPriorCandidates.add(candidateId);
        priorCandidateDispositions[disposition.toLowerCase()].push(candidateId);
      }
    }

    let verdict;
    if (!verdictPattern.test(row.Verdict)) {
      rowErrors.push(
        `${id} Verdict lacks an allowed verdict and reason: ${row.Verdict}`
      );
    } else {
      verdict = leadingValue(row.Verdict).toLowerCase();
      verdicts[verdict].push(id);
    }
    const priorityValid = /^(?:P[0-3]|—)$/.test(row.Priority);
    if (!priorityValid) {
      rowErrors.push(`${id} Priority must be P0-P3 or —: ${row.Priority}`);
    } else {
      priorities[row.Priority].push(id);
    }
    const materialSignal =
      dispositions['Reference adaptation'] === 'adapt' ||
      dispositions['Local debt'] === 'material' ||
      dispositions['Proof adaptation'] === 'adapt';
    const materialVerdict = materialVerdicts.has(verdict);
    if (materialSignal && !materialVerdict) {
      rowErrors.push(
        `${id} material adaptation or debt requires steal, rearchitect, hard-cut, or move`
      );
    }
    if (materialVerdict && !/^P[0-3]$/.test(row.Priority)) {
      rowErrors.push(`${id} material verdict requires priority P0-P3`);
    }
    if (!materialVerdict && row.Priority !== '—') {
      rowErrors.push(`${id} non-material verdict requires priority —`);
    }
    if (
      dispositions['Local debt'] === 'insufficient evidence' &&
      verdict !== 'defer'
    ) {
      rowErrors.push(`${id} insufficient local-debt evidence requires defer`);
    }
  }

  const duplicates = expectedIds.filter((id) => (counts.get(id) ?? 0) > 1);
  const missing = expectedIds.filter((id) => !counts.has(id));
  const missingPriorCandidates = [...priorCandidateById.keys()].filter(
    (id) => !reconciledPriorCandidates.has(id)
  );
  const errors = [];
  if (duplicates.length > 0) {
    errors.push(`duplicate concept rows: ${duplicates.join(', ')}`);
  }
  if (groupedIds.length > 0) {
    errors.push(`grouped concept row IDs: ${groupedIds.join(', ')}`);
  }
  if (unknownIds.length > 0) {
    errors.push(`unknown concept row IDs: ${unknownIds.join(', ')}`);
  }
  if (missing.length > 0) {
    errors.push(`missing concept rows: ${missing.join(', ')}`);
  }
  for (const ids of qualitativeProfiles.values()) {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length > 1) {
      errors.push(
        `canned qualitative profile reused across concepts: ${uniqueIds.join(
          ', '
        )}`
      );
    }
  }
  if (missingPriorCandidates.length > 0) {
    errors.push(
      `unreconciled prior candidates: ${missingPriorCandidates.join(', ')}`
    );
  }
  errors.push(...rowErrors);

  if (errors.length > 0) {
    throw new Error(
      `Concept matrix validation failed:\n- ${errors.join('\n- ')}`
    );
  }

  return {
    classifications: summarizeGroups(classifications),
    concepts: expectedIds.length,
    integrity: {
      cannedProfiles: 0,
      duplicateRows: 0,
      groupedIds: 0,
      missingPriorCandidates: 0,
      missingRows: 0,
      unknownIds: 0,
      unresolvedCells: 0,
    },
    localDebt: summarizeGroups(localDebt),
    origins: summarizeGroups(origins),
    preferredBases: summarizeGroups(preferredBases),
    priorCandidates: summarizeGroups(priorCandidateDispositions),
    priorities: summarizeGroups(priorities),
    proofAdaptations: summarizeGroups(proofAdaptations),
    referenceAdaptations: summarizeGroups(referenceAdaptations),
    rows: rawRows.length,
    verdicts: summarizeGroups(verdicts),
  };
};

const parseArgs = (args) => {
  const parsed = {};

  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--manifest' || argument === '--ledger') {
      parsed[argument.slice(2)] = args[++index];
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }

  if (!parsed.manifest || !parsed.ledger) {
    throw new Error(
      'usage: validate-concept-matrix.mjs --manifest <manifest.json> --ledger <ledger.md>'
    );
  }

  return parsed;
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result = validateConceptMatrix({
      ledger: readFileSync(args.ledger, 'utf8'),
      manifest: JSON.parse(readFileSync(args.manifest, 'utf8')),
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

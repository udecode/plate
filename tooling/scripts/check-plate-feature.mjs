#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const notApplicablePattern = /^N\/A:\s*\S/;
const unresolvedPattern = /^(?:pending|todo\b|tbd\b)|\{\{/i;
const flowModePattern =
  /^Flow mode:[ \t]*(?:\r?\n[ \t]*)*(?:-[ \t]*)?([^\r\n]+)$/m;
const scriptPath = fileURLToPath(import.meta.url);

export const requiredSurfaces = [
  'API',
  'Package',
  'React adapter',
  'Registry UI',
  'Composition',
  'Scale proof',
  'Registry metadata/examples',
  'Docs',
  'Release artifacts',
];

const flowModes = new Map([
  [
    'new public feature entrypoint',
    {
      excluded: [],
      required: requiredSurfaces.filter((surface) => surface !== 'Scale proof'),
    },
  ],
  [
    'existing package plus React/registry',
    {
      excluded: [],
      required: [
        'Package',
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ],
    },
  ],
  [
    'headless package',
    {
      excluded: [
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ],
      required: ['Package'],
    },
  ],
  [
    'registry-only',
    {
      excluded: ['Package', 'React adapter'],
      required: ['Registry UI', 'Composition', 'Registry metadata/examples'],
    },
  ],
]);

const splitRow = (line) =>
  line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());

const isResolved = (value) =>
  Boolean(value) &&
  !unresolvedPattern.test(value) &&
  !notApplicablePattern.test(value);

const readTable = (source, heading, firstColumn, columnCount) => {
  const start = source.indexOf(heading);

  if (start === -1) throw new Error(`Missing ${heading}`);

  const lines = source.slice(start + heading.length).split('\n');
  const tableStart = lines.findIndex((line) =>
    line.startsWith(`| ${firstColumn} |`)
  );

  if (tableStart === -1) throw new Error(`Missing ${heading} table.`);

  const rows = [];
  for (const line of lines.slice(tableStart + 2)) {
    if (!line.startsWith('|')) break;
    const cells = splitRow(line);
    if (cells.length !== columnCount) {
      throw new Error(`Malformed ${heading} row: ${line}`);
    }
    rows.push(cells);
  }

  return rows;
};

export const readFeatureManifest = (source) =>
  readTable(source, 'Feature Manifest:', 'Surface', 7);

export const validateFeaturePlan = (source) => {
  const errors = [];
  let rows = [];

  try {
    rows = readFeatureManifest(source);
  } catch (error) {
    return [error.message];
  }

  const bySurface = new Map(rows.map((row) => [row[0], row]));
  if (bySurface.size !== rows.length) {
    errors.push('Feature Manifest contains duplicate surfaces.');
  }

  for (const surface of requiredSurfaces) {
    const row = bySurface.get(surface);
    if (!row) {
      errors.push(`Missing manifest surface: ${surface}`);
      continue;
    }

    const [, applies, owner, artifacts, consumer, proof, status] = row;
    if (!['yes', 'no'].includes(applies)) {
      errors.push(`${surface}: Applies must be yes or no.`);
    }
    if ([owner, artifacts, consumer, proof, status].some((value) => !value)) {
      errors.push(`${surface}: every manifest cell must be non-empty.`);
    }
    if (applies === 'yes' && status !== 'complete') {
      errors.push(`${surface}: applicable row must be complete.`);
    }
    if (
      applies === 'yes' &&
      [owner, artifacts, consumer, proof].some((value) => !isResolved(value))
    ) {
      errors.push(`${surface}: applicable evidence contains a placeholder.`);
    }
    if (
      applies === 'no' &&
      ![artifacts, proof, status].every((value) =>
        notApplicablePattern.test(value)
      )
    ) {
      errors.push(
        `${surface}: excluded row needs N/A reasons in Artifacts, Proof, and Status.`
      );
    }
  }

  const extras = rows
    .map(([surface]) => surface)
    .filter((surface) => !requiredSurfaces.includes(surface));
  if (extras.length > 0) {
    errors.push(`Unexpected manifest surfaces: ${extras.join(', ')}`);
  }

  const flowMode = source.match(flowModePattern)?.[1]?.trim();
  const flowContract = flowMode ? flowModes.get(flowMode) : undefined;
  if (!flowContract) {
    errors.push(
      `Flow mode must be one of: ${[...flowModes.keys()].join(', ')}.`
    );
  } else {
    for (const surface of flowContract.required) {
      if (bySurface.get(surface)?.[1] !== 'yes') {
        errors.push(`${flowMode}: ${surface} must apply.`);
      }
    }
    for (const surface of flowContract.excluded) {
      if (bySurface.get(surface)?.[1] !== 'no') {
        errors.push(`${flowMode}: ${surface} must be excluded.`);
      }
    }
  }

  return errors;
};

const isMain = process.argv[1] && resolve(process.argv[1]) === scriptPath;
if (isMain) {
  const [planPath] = process.argv.slice(2);
  if (!planPath) throw new Error('Usage: check-plate-feature.mjs <plan>');
  const errors = validateFeaturePlan(readFileSync(resolve(planPath), 'utf-8'));
  if (errors.length > 0) throw new Error(errors.join('\n'));
  console.log(
    `Plate feature plan: complete (${requiredSurfaces.length} surfaces).`
  );
}

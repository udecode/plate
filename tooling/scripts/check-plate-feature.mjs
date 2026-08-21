#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computePackageFingerprint } from '../../.agents/rules/plate-next/scripts/version.mjs';

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const notApplicablePattern = /^N\/A:\s*\S/;
const unresolvedPattern = /^(?:pending|todo\b|tbd\b)|\{\{/i;
const flowModePattern = /^Flow mode:[ \t]*(?:\n-[ \t]*)?([^\n]+)$/m;
const packageFileRowPattern =
  /^- \[([ x])\] `([^`]+)` — score: ([^—]+) — verdict: ([^—]+) — owner: ([^—]+) — evidence: ([^—]+) — next: (.+)\.?$/;
const sectionHeadingPattern = /^[A-Z][^:]+:$/;
const packageSlugPattern = /^[a-z0-9][a-z0-9-]*$/;
const packageFingerprintPattern = /^sha256:[a-f0-9]{64}$/;
const manifestFilePattern = /^- File: `([^`]+)`$/;
const manifestCountPattern = /\((\d+) files?\)\.?$/;
const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(scriptPath), '../..');

export const requiredSurfaces = [
  'API',
  'Package',
  'React adapter',
  'Registry UI',
  'Composition',
  'Registry metadata/examples',
  'Docs',
  'Release artifacts',
  'Proof',
  'Plate Next attestation',
  'Review/handoff',
];

const flowModes = new Map([
  ['new package', { excluded: [], required: requiredSurfaces }],
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
        'Plate Next attestation',
        'Proof',
        'Review/handoff',
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
      required: [
        'Package',
        'Plate Next attestation',
        'Proof',
        'Review/handoff',
      ],
    },
  ],
  [
    'registry-only',
    {
      excluded: ['Package', 'React adapter', 'Plate Next attestation'],
      required: [
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
        'Proof',
        'Review/handoff',
      ],
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

const readSectionLines = (source, heading) => {
  const start = source.indexOf(heading);
  if (start === -1) return null;

  const lines = source
    .slice(start + heading.length)
    .split('\n')
    .slice(1);
  const end = lines.findIndex((line) => sectionHeadingPattern.test(line));

  return end === -1 ? lines : lines.slice(0, end);
};

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

export const validateFeaturePlan = (
  source,
  { planPath, registry, root = defaultRoot } = {}
) => {
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

  if (bySurface.get('Package')?.[1] === 'yes') {
    for (const surface of ['Package', 'Plate Next attestation']) {
      if (!bySurface.get(surface)?.[3].includes('#package-file-evidence')) {
        errors.push(`${surface}: Artifacts must link #package-file-evidence.`);
      }
    }

    const sectionLines = readSectionLines(source, 'Package file evidence:');
    if (!sectionLines) {
      errors.push('Missing Package file evidence section.');
    } else {
      const manifest = sectionLines
        .find((line) => line.startsWith('- Manifest command / file count:'))
        ?.split(':')
        .slice(1)
        .join(':')
        .trim();
      const packageSlug = sectionLines
        .find((line) => line.startsWith('- Package:'))
        ?.split(':')
        .slice(1)
        .join(':')
        .trim();
      const fingerprint = sectionLines
        .find((line) => line.startsWith('- Package fingerprint:'))
        ?.split(':')
        .slice(1)
        .join(':')
        .trim();
      if (!isResolved(manifest)) {
        errors.push(
          'Package file evidence needs a resolved manifest command and file count.'
        );
      }
      if (!packageSlugPattern.test(packageSlug ?? '')) {
        errors.push('Package file evidence needs a valid package slug.');
      }
      if (!packageFingerprintPattern.test(fingerprint ?? '')) {
        errors.push(
          'Package file evidence needs a full sha256 package fingerprint.'
        );
      }

      const manifestPaths = sectionLines
        .map((line) => line.match(manifestFilePattern)?.[1])
        .filter(Boolean);
      const reviewLines = sectionLines.filter((line) => line.startsWith('- ['));
      const fileRows = reviewLines
        .map((line) => line.match(packageFileRowPattern))
        .filter(Boolean);
      const reviewPaths = fileRows.map((row) => row[2]);
      const manifestCount = Number(manifest?.match(manifestCountPattern)?.[1]);
      const hasDuplicateManifestPaths =
        new Set(manifestPaths).size !== manifestPaths.length;
      const hasDuplicateReviewPaths =
        new Set(reviewPaths).size !== reviewPaths.length;
      if (
        manifestPaths.length === 0 ||
        manifestCount !== manifestPaths.length ||
        hasDuplicateManifestPaths
      ) {
        errors.push(
          'Package file evidence manifest count and unique file list must match.'
        );
      }
      if (
        fileRows.length !== reviewLines.length ||
        reviewPaths.length !== manifestPaths.length ||
        hasDuplicateReviewPaths ||
        [...reviewPaths].sort(compareStrings).join('\0') !==
          [...manifestPaths].sort(compareStrings).join('\0')
      ) {
        errors.push(
          'Package file evidence needs one valid unique review row per manifest file.'
        );
      }
      for (const [
        ,
        checked,
        path,
        score,
        verdict,
        owner,
        evidence,
        next,
      ] of fileRows) {
        if (
          checked !== 'x' ||
          score.trim() !== '100' ||
          ![path, verdict, owner, evidence, next].every(isResolved)
        ) {
          errors.push(`Package file evidence is unresolved: ${path}.`);
        }
      }
      if (sectionLines.some((line) => line.startsWith('- [ ]'))) {
        errors.push('Package file evidence contains unchecked rows.');
      }

      if (packageSlugPattern.test(packageSlug ?? '')) {
        try {
          const current = computePackageFingerprint(root, packageSlug);
          const expectedPaths = current.files.map(
            (path) => `packages/${packageSlug}/${path}`
          );

          if (
            current.fileCount !== manifestPaths.length ||
            [...expectedPaths].sort(compareStrings).join('\0') !==
              [...manifestPaths].sort(compareStrings).join('\0')
          ) {
            errors.push(
              'Package file evidence does not match the current package source manifest.'
            );
          }
          if (current.fingerprint !== fingerprint) {
            errors.push(
              'Package file evidence fingerprint does not match current package source.'
            );
          }

          const planRelativePath = planPath
            ? relative(root, resolve(planPath)).split(sep).join('/')
            : null;
          const currentRegistry =
            registry ??
            JSON.parse(
              readFileSync(
                resolve(root, '.agents/rules/plate-next/versions.json'),
                'utf-8'
              )
            );
          const packageEntry = currentRegistry.packages?.[packageSlug];
          if (
            !planRelativePath?.startsWith('docs/plans/') ||
            !planRelativePath.endsWith('.md')
          ) {
            errors.push(
              'Package attestation requires the checked repo-relative docs/plans/*.md path.'
            );
          } else if (
            !packageEntry ||
            packageEntry.appliedVersion !== currentRegistry.latestVersion ||
            packageEntry.fingerprint !== current.fingerprint ||
            packageEntry.evidence !== planRelativePath
          ) {
            errors.push(
              'Package attestation is not current or does not reference this exact plan and fingerprint.'
            );
          }
        } catch (error) {
          errors.push(error.message);
        }
      }
    }
  }

  let completionRows = [];
  try {
    completionRows = readTable(source, 'Completion Gates:', 'Gate', 4);
  } catch (error) {
    errors.push(error.message);
  }
  const p2Index = completionRows.findIndex(
    ([gate]) => gate === 'P2 autoreview'
  );
  const goalIndex = completionRows.findIndex(
    ([gate]) => gate === 'Goal plan complete'
  );
  const p2Gate = completionRows[p2Index];
  const goalGate = completionRows[goalIndex];

  if (!p2Gate || p2Gate[1] !== 'yes') {
    errors.push('Missing required P2 autoreview completion gate.');
  } else if (!isResolved(p2Gate[3])) {
    errors.push('P2 autoreview completion gate needs resolved evidence.');
  }
  if (!goalGate || goalGate[1] !== 'yes') {
    errors.push('Missing required Goal plan complete gate.');
  }
  if (p2Index === -1 || goalIndex === -1 || p2Index > goalIndex) {
    errors.push('P2 autoreview must appear before Goal plan complete.');
  }

  return errors;
};

const isMain = process.argv[1] && resolve(process.argv[1]) === scriptPath;
if (isMain) {
  const [planPath] = process.argv.slice(2);
  if (!planPath) throw new Error('Usage: check-plate-feature.mjs <plan>');
  const resolvedPlanPath = resolve(planPath);
  const errors = validateFeaturePlan(readFileSync(resolvedPlanPath, 'utf-8'), {
    planPath: resolvedPlanPath,
  });
  if (errors.length > 0) throw new Error(errors.join('\n'));
  console.log(
    `Plate feature plan: complete (${requiredSurfaces.length} surfaces).`
  );
}

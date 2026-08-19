#!/usr/bin/env node

import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  readdirSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { resourcePairs, retiredGeneratedPaths } from './sync-resources.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = resolve(dirname(scriptPath), '../../../..');
export const doctrinePaths = [
  '.agents/AGENTS.md',
  '.agents/rules/plate-feature.mdc',
  '.agents/rules/plate-feature/rules/manifest.md',
  '.agents/rules/plate-feature/rules/phases.md',
  '.agents/rules/plate-feature/rules/proof-routing.md',
  '.agents/rules/plate-next.mdc',
  '.agents/rules/plate-next/rules/audit-modes.md',
  '.agents/rules/plate-next/rules/ownership-and-correction.md',
  '.agents/rules/plate-next/rules/review-law.md',
  '.agents/rules/plate-next/scripts/version.mjs',
  '.agents/rules/best-api.mdc',
  '.agents/rules/best-api/rules/authoring-and-inference.md',
  '.agents/rules/best-api/rules/behavior-and-ownership.md',
  '.agents/rules/best-api/rules/schema-and-identity.md',
  '.agents/rules/docs-creator.mdc',
  '.agents/rules/docs-creator/rules/lane-templates.md',
  '.agents/rules/docs-creator/rules/style-and-structure.md',
  '.agents/rules/plate-plugin-creator.mdc',
  '.agents/rules/plate-plugin-creator/references/plugin-authoring-audit.md',
  '.agents/rules/plate-plugin-creator/rules/capabilities.md',
  '.agents/rules/plate-plugin-creator/rules/creation-flow.md',
  '.agents/rules/plate-plugin-creator/rules/typing.md',
  '.agents/rules/plate-ui.mdc',
  '.agents/rules/plate-ui/references/component-audit.md',
  '.agents/rules/plate-ui/rules/component-family.md',
  '.agents/rules/plate-ui/rules/component-shape.md',
  '.agents/rules/plate-ui/rules/cross-platform.md',
  '.agents/rules/plate-ui/rules/ownership.md',
  '.agents/rules/plate-ui/rules/react-performance.md',
  '.agents/rules/plate-ui/rules/registry.md',
  '.agents/rules/plate-ui/rules/shadcn-proofing.md',
  '.agents/rules/plate-next/scripts/sync-resources.mjs',
  '.agents/rules/plate-next/scripts/version.test.mjs',
  'docs/plans/templates/plate-feature.md',
  'docs/plans/templates/packs/plate-next-attestation.md',
  'docs/plans/templates/plate-next.md',
  'tooling/scripts/check-plate-feature.mjs',
  'tooling/scripts/check-plate-feature.test.mjs',
];
export const requiredGeneratedResources = resourcePairs;

export const requiredGeneratedSkills = [
  {
    generatedPath: '.agents/skills/plate-feature/SKILL.md',
    heading: '# Plate Feature',
    name: 'plate-feature',
    sourcePath: '.agents/rules/plate-feature.mdc',
  },
  {
    generatedPath: '.agents/skills/plate-next/SKILL.md',
    heading: '# Plate Next',
    name: 'plate-next',
    sourcePath: '.agents/rules/plate-next.mdc',
  },
  {
    generatedPath: '.agents/skills/plate-plugin-creator/SKILL.md',
    heading: '# Plate Plugin Creator',
    name: 'plate-plugin-creator',
    sourcePath: '.agents/rules/plate-plugin-creator.mdc',
  },
  {
    generatedPath: '.agents/skills/best-api/SKILL.md',
    heading: '# Best API',
    name: 'best-api',
    sourcePath: '.agents/rules/best-api.mdc',
  },
  {
    generatedPath: '.agents/skills/docs-creator/SKILL.md',
    heading: '# Docs Creator',
    name: 'docs-creator',
    sourcePath: '.agents/rules/docs-creator.mdc',
  },
  {
    generatedPath: '.agents/skills/plate-ui/SKILL.md',
    heading: '# Plate UI',
    name: 'plate-ui',
    sourcePath: '.agents/rules/plate-ui.mdc',
  },
];
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
]);
const ignoredFiles = new Set([
  '.DS_Store',
  '.npmignore',
  'CHANGELOG.md',
  'README.md',
  'tsconfig.tsbuildinfo',
]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const doctrineVersionPattern = /Current doctrine version: `(\d+)`\./;
const frontmatterPattern = /^---\n([\s\S]*?)\n---/;
const reviewedPackageBlockPattern =
  /const reviewedPackageSlugs = \[([\s\S]*?)\n\];/;
const reviewedPackageSlugPattern = /'([^']+)'/g;
const sha256Pattern = /^sha256:[a-f0-9]{64}$/;
const compare = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value === null || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort(compare)
      .map((key) => [key, canonicalize(value[key])])
  );
};

export const readDeclaredDoctrineVersion = (source) => {
  const value = source.match(doctrineVersionPattern)?.[1];

  if (!value) {
    throw new Error(
      'Could not find the visible current doctrine version in plate-next.mdc.'
    );
  }

  return Number(value);
};

export const computeDoctrineFingerprint = (root) => {
  const hash = createHash('sha256');

  hash.update('plate-next-doctrine-fingerprint:v2\0');

  for (const path of doctrinePaths) {
    hash.update(path);
    hash.update('\0');
    hash.update(readFileSync(join(root, path)));
    hash.update('\0');
  }

  const registry = JSON.parse(
    readFileSync(join(root, '.agents/rules/plate-next/versions.json'), 'utf8')
  );
  const versions = Array.isArray(registry.versions)
    ? registry.versions.map((entry, index, entries) => {
        if (index !== entries.length - 1 || entry === null) return entry;
        const { doctrineFingerprint: _currentFingerprint, ...currentEntry } =
          entry;

        return currentEntry;
      })
    : registry.versions;

  hash.update('plate-next-version-history:v1\0');
  hash.update(
    JSON.stringify(
      canonicalize({ schemaVersion: registry.schemaVersion, versions })
    )
  );
  hash.update('\0');

  return `sha256:${hash.digest('hex')}`;
};

export const haveMatchingRequiredResources = (root) =>
  requiredGeneratedResources.every(([sourcePath, generatedPath]) => {
    const source = join(root, sourcePath);
    const generated = join(root, generatedPath);

    return (
      existsSync(source) &&
      existsSync(generated) &&
      readFileSync(source).equals(readFileSync(generated))
    );
  }) &&
  retiredGeneratedPaths.every(
    (generatedPath) => !existsSync(join(root, generatedPath))
  );

export const haveMatchingSkillSource = (
  source,
  generated,
  {
    heading = '# Plate Next',
    name = 'plate-next',
    sourcePath = '.agents/rules/plate-next.mdc',
  } = {}
) => {
  const sourceFrontmatter = source.match(frontmatterPattern);
  if (!sourceFrontmatter || !source.includes(heading)) return false;

  const sourceBody = source.slice(sourceFrontmatter[0].length);
  const expected = `---\n${sourceFrontmatter[1]}\nname: ${name}\nmetadata:\n  skiller:\n    source: ${sourcePath}\n---${sourceBody}`;

  return generated === expected;
};

export const haveMatchingRequiredSkills = (root) =>
  requiredGeneratedSkills.every(
    ({ generatedPath, heading, name, sourcePath }) => {
      const source = join(root, sourcePath);
      const generated = join(root, generatedPath);

      return (
        existsSync(source) &&
        existsSync(generated) &&
        haveMatchingSkillSource(
          readFileSync(source, 'utf8'),
          readFileSync(generated, 'utf8'),
          { heading, name, sourcePath }
        )
      );
    }
  );

export const readReviewedPackageSlugs = (source) => {
  const body = source.match(reviewedPackageBlockPattern)?.[1];

  if (!body) {
    throw new Error(
      'Could not find reviewedPackageSlugs in tooling/scripts/check-core.mjs.'
    );
  }

  return [...body.matchAll(reviewedPackageSlugPattern)]
    .map((match) => match[1])
    .sort(compare);
};

const collectPackageFiles = (packageDirectory, directory = packageDirectory) =>
  readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => compare(left.name, right.name))
    .flatMap((entry) => {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
      if (entry.isFile() && ignoredFiles.has(entry.name)) return [];
      if (entry.isFile() && entry.name.endsWith('.log')) return [];

      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectPackageFiles(packageDirectory, path);
      }
      if (!entry.isFile() && !entry.isSymbolicLink()) return [];

      return [path];
    });

export const computePackageFingerprint = (root, slug) => {
  const packageDirectory = join(root, 'packages', slug);

  if (!existsSync(packageDirectory)) {
    throw new Error(`Missing tracked package directory: packages/${slug}`);
  }

  const files = collectPackageFiles(packageDirectory);
  const hash = createHash('sha256');

  hash.update('plate-next-package-fingerprint:v2\0');

  const packagePaths = files.map((path) =>
    relative(packageDirectory, path).split(sep).join('/')
  );
  const updateRecordField = (value) => {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const length = Buffer.allocUnsafe(8);

    length.writeBigUInt64BE(BigInt(bytes.length));
    hash.update(length);
    hash.update(bytes);
  };

  for (let index = 0; index < files.length; index++) {
    const path = files[index];
    const packagePath = packagePaths[index];
    const kind = lstatSync(path).isSymbolicLink() ? 'symlink' : 'file';
    const contents =
      kind === 'symlink' ? Buffer.from(readlinkSync(path)) : readFileSync(path);

    updateRecordField(packagePath);
    updateRecordField(kind);
    updateRecordField(contents);
  }

  return {
    fileCount: files.length,
    files: packagePaths,
    fingerprint: `sha256:${hash.digest('hex')}`,
  };
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isValidEvidencePlan = (root, value) =>
  typeof value === 'string' &&
  value.startsWith('docs/plans/') &&
  value.endsWith('.md') &&
  !value.includes('\\') &&
  !value.split('/').includes('..') &&
  (!root || existsSync(join(root, value)));

export const selectDoctrineBaseRef = ({ dirty, override, versionCommits }) => {
  if (override) return override;
  if (dirty) return 'HEAD';
  if (versionCommits.length < 2) {
    throw new Error(
      'Could not find the prior Plate Next registry revision; set PLATE_NEXT_BASE to an immutable base ref.'
    );
  }

  return versionCommits[1];
};

const readBaseRegistry = (root) => {
  const doctrineInputs = [
    ...doctrinePaths,
    '.agents/rules/plate-next/versions.json',
  ];
  const diff = spawnSync(
    'git',
    ['diff', '--quiet', 'HEAD', '--', ...doctrineInputs],
    { cwd: root }
  );
  if (![0, 1].includes(diff.status)) {
    throw new Error('Could not inspect the Plate Next doctrine baseline.');
  }

  const versionHistory = spawnSync(
    'git',
    [
      'log',
      '--format=%H',
      '-n',
      '2',
      '--',
      '.agents/rules/plate-next/versions.json',
    ],
    { cwd: root, encoding: 'utf8' }
  );
  if (versionHistory.status !== 0) {
    throw new Error('Could not inspect Plate Next registry history.');
  }
  const baseRef = selectDoctrineBaseRef({
    dirty: diff.status === 1,
    override: process.env.PLATE_NEXT_BASE,
    versionCommits: versionHistory.stdout.trim().split('\n').filter(Boolean),
  });
  const result = spawnSync(
    'git',
    ['show', `${baseRef}:.agents/rules/plate-next/versions.json`],
    { cwd: root, encoding: 'utf8' }
  );
  if (result.status !== 0) {
    throw new Error(
      `Could not read Plate Next baseline ${baseRef}; set PLATE_NEXT_BASE to an immutable base ref.`
    );
  }

  return { baseRef, registry: JSON.parse(result.stdout) };
};

export const validateRegistry = ({
  baseRegistry,
  currentDoctrineFingerprint,
  declaredVersion,
  generatedResourcesMatch,
  generatedSkillsMatch,
  registry,
  reviewedSlugs,
  root,
}) => {
  const errors = [];

  if (!isPlainObject(registry)) {
    return ['Version registry must be an object.'];
  }
  const latestHistoryEntry = Array.isArray(registry.versions)
    ? registry.versions.at(-1)
    : undefined;

  if (registry.schemaVersion !== 1) {
    errors.push('schemaVersion must be 1.');
  }
  if (!Number.isInteger(registry.latestVersion)) {
    errors.push('latestVersion must be an integer.');
  }
  if (!Array.isArray(registry.versions)) {
    errors.push('versions must be an array.');
  } else {
    registry.versions.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        errors.push(`versions[${index}] must be an object.`);

        return;
      }
      if (entry.version !== index) {
        errors.push(
          `versions must be contiguous from 0; expected ${index}, received ${entry.version}.`
        );
      }
      if (typeof entry.summary !== 'string' || entry.summary.length === 0) {
        errors.push(`versions[${index}].summary must be a non-empty string.`);
      }
      if (
        !Array.isArray(entry.migrationChecks) ||
        entry.migrationChecks.length === 0 ||
        entry.migrationChecks.some(
          (check) => typeof check !== 'string' || check.length === 0
        )
      ) {
        errors.push(
          `versions[${index}].migrationChecks must contain non-empty strings.`
        );
      }
      if (
        entry.version > 0 &&
        !sha256Pattern.test(entry.doctrineFingerprint ?? '')
      ) {
        errors.push(
          `versions[${index}].doctrineFingerprint must be a sha256 digest.`
        );
      }
    });

    if (
      Number.isInteger(registry.latestVersion) &&
      registry.versions.at(-1)?.version !== registry.latestVersion
    ) {
      errors.push(
        'latestVersion must equal the final immutable version-history entry.'
      );
    }
  }
  if (
    declaredVersion !== undefined &&
    declaredVersion !== registry.latestVersion
  ) {
    errors.push(
      `Visible doctrine version ${declaredVersion} does not match latestVersion ${registry.latestVersion}.`
    );
  }
  if (
    currentDoctrineFingerprint &&
    latestHistoryEntry?.doctrineFingerprint !== currentDoctrineFingerprint
  ) {
    errors.push(
      'Current Plate Next doctrine fingerprint does not match the latest version entry; bump the doctrine version.'
    );
  }
  if (baseRegistry) {
    const baseVersions = Array.isArray(baseRegistry.versions)
      ? baseRegistry.versions
      : [];
    const currentPrefix = Array.isArray(registry.versions)
      ? registry.versions.slice(0, baseVersions.length)
      : [];

    if (
      JSON.stringify(canonicalize(currentPrefix)) !==
      JSON.stringify(canonicalize(baseVersions))
    ) {
      errors.push(
        'Current version history must preserve the immutable base versions as an exact prefix.'
      );
    }
    if (registry.latestVersion < baseRegistry.latestVersion) {
      errors.push(
        'latestVersion cannot move behind the immutable base registry.'
      );
    } else if (
      registry.latestVersion === baseRegistry.latestVersion &&
      currentDoctrineFingerprint !==
        baseRegistry.versions?.at(-1)?.doctrineFingerprint
    ) {
      errors.push(
        'Fingerprint inputs changed without a doctrine version increment from the immutable base.'
      );
    }
  }
  if (generatedSkillsMatch === false) {
    errors.push(
      'Required generated doctrine skills are stale; run pnpm install and revalidate.'
    );
  }
  if (generatedResourcesMatch === false) {
    errors.push(
      'Required generated skill resources are missing or stale; run pnpm install and revalidate.'
    );
  }

  if (!isPlainObject(registry.packages)) {
    errors.push('packages must be an object.');

    return errors;
  }
  if (!isPlainObject(registry.retiredPackages)) {
    errors.push('retiredPackages must be an object.');

    return errors;
  }

  const packageSlugs = Object.keys(registry.packages).sort(compare);
  const retiredSlugs = Object.keys(registry.retiredPackages).sort(compare);
  const expectedSlugs = [...reviewedSlugs].sort(compare);
  const missingSlugs = expectedSlugs.filter(
    (slug) => !packageSlugs.includes(slug)
  );
  const extraSlugs = packageSlugs.filter(
    (slug) => !expectedSlugs.includes(slug)
  );

  if (missingSlugs.length > 0) {
    errors.push(`Missing tracked packages: ${missingSlugs.join(', ')}.`);
  }
  if (extraSlugs.length > 0) {
    errors.push(`Unenrolled packages in registry: ${extraSlugs.join(', ')}.`);
  }
  const overlappingSlugs = packageSlugs.filter((slug) =>
    retiredSlugs.includes(slug)
  );

  if (overlappingSlugs.length > 0) {
    errors.push(
      `Packages cannot be active and retired: ${overlappingSlugs.join(', ')}.`
    );
  }

  for (const slug of packageSlugs) {
    const entry = registry.packages[slug];

    if (!isPlainObject(entry)) {
      errors.push(`packages.${slug} must be an object.`);

      continue;
    }
    if (
      !Number.isInteger(entry.appliedVersion) ||
      entry.appliedVersion < 0 ||
      entry.appliedVersion > registry.latestVersion
    ) {
      errors.push(
        `packages.${slug}.appliedVersion must be between 0 and latestVersion.`
      );
    }

    if (entry.appliedVersion > 0) {
      if (!sha256Pattern.test(entry.fingerprint ?? '')) {
        errors.push(
          `packages.${slug}.fingerprint must be a sha256 digest after attestation.`
        );
      }
      if (!datePattern.test(entry.verifiedAt ?? '')) {
        errors.push(
          `packages.${slug}.verifiedAt must be YYYY-MM-DD after attestation.`
        );
      }
      if (!isValidEvidencePlan(root, entry.evidence)) {
        errors.push(
          `packages.${slug}.evidence must name an existing repo-relative docs/plans/*.md file after attestation.`
        );
      }
    }

    if (root && !existsSync(join(root, 'packages', slug, 'package.json'))) {
      errors.push(`Tracked package is missing package.json: packages/${slug}.`);
    }
  }

  for (const slug of retiredSlugs) {
    const entry = registry.retiredPackages[slug];

    if (!isPlainObject(entry)) {
      errors.push(`retiredPackages.${slug} must be an object.`);

      continue;
    }
    if (
      !Number.isInteger(entry.appliedVersion) ||
      entry.appliedVersion < 0 ||
      entry.appliedVersion > registry.latestVersion
    ) {
      errors.push(
        `retiredPackages.${slug}.appliedVersion must be between 0 and latestVersion.`
      );
    }
    if (!datePattern.test(entry.retiredAt ?? '')) {
      errors.push(`retiredPackages.${slug}.retiredAt must be YYYY-MM-DD.`);
    }
    if (!isValidEvidencePlan(root, entry.evidence)) {
      errors.push(
        `retiredPackages.${slug}.evidence must name an existing repo-relative docs/plans/*.md retirement plan.`
      );
    }
    if (root && existsSync(join(root, 'packages', slug, 'package.json'))) {
      errors.push(`Retired package still has package.json: packages/${slug}.`);
    }
  }

  return errors;
};

export const classifyPackage = ({
  currentFingerprint,
  entry,
  latestVersion,
}) => {
  const fingerprintState =
    entry.fingerprint === null
      ? 'unattested'
      : entry.fingerprint === currentFingerprint
        ? 'unchanged'
        : 'changed';

  if (entry.appliedVersion < latestVersion) {
    return {
      fingerprintState,
      reason: [
        `doctrine v${entry.appliedVersion} -> v${latestVersion}`,
        fingerprintState === 'changed' ? 'package source changed' : null,
      ]
        .filter(Boolean)
        .join('; '),
      status: 'stale',
    };
  }
  if (fingerprintState === 'changed') {
    return {
      fingerprintState,
      reason: 'package source changed after attestation',
      status: 'drifted',
    };
  }

  return {
    fingerprintState,
    reason: `attested at doctrine v${latestVersion}`,
    status: 'current',
  };
};

export const getPackageStatuses = ({ registry, root, slugs }) =>
  slugs.map((slug) => {
    const retiredEntry = registry.retiredPackages[slug];

    if (retiredEntry) {
      return {
        appliedVersion: retiredEntry.appliedVersion,
        fileCount: null,
        fingerprintState: 'retired',
        latestVersion: registry.latestVersion,
        reason: `retired ${retiredEntry.retiredAt}`,
        slug,
        status: 'retired',
      };
    }

    const entry = registry.packages[slug];
    const current = entry.fingerprint
      ? computePackageFingerprint(root, slug)
      : null;
    const classification = classifyPackage({
      currentFingerprint: current?.fingerprint ?? null,
      entry,
      latestVersion: registry.latestVersion,
    });

    return {
      appliedVersion: entry.appliedVersion,
      fileCount: current?.fileCount ?? null,
      latestVersion: registry.latestVersion,
      slug,
      ...classification,
    };
  });

const loadContext = (root = defaultRoot) => {
  const registryPath = join(root, '.agents/rules/plate-next/versions.json');
  const checkCorePath = join(root, 'tooling/scripts/check-core.mjs');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const ruleSource = readFileSync(
    join(root, '.agents/rules/plate-next.mdc'),
    'utf8'
  );
  const generatedSkillsMatch = haveMatchingRequiredSkills(root);
  const generatedResourcesMatch = haveMatchingRequiredResources(root);
  const currentDoctrineFingerprint = computeDoctrineFingerprint(root);
  const declaredVersion = readDeclaredDoctrineVersion(ruleSource);
  const reviewedSlugs = readReviewedPackageSlugs(
    readFileSync(checkCorePath, 'utf8')
  );
  const baseline = readBaseRegistry(root);
  const errors = validateRegistry({
    baseRegistry: baseline.registry,
    currentDoctrineFingerprint,
    declaredVersion,
    generatedResourcesMatch,
    generatedSkillsMatch,
    registry,
    reviewedSlugs,
    root,
  });

  return {
    currentDoctrineFingerprint,
    declaredVersion,
    generatedResourcesMatch,
    generatedSkillsMatch,
    errors,
    baseRef: baseline.baseRef,
    registry,
    registryPath,
    reviewedSlugs,
    root,
  };
};

const selectSlugs = (context, target) => {
  if (!target || target === 'all') {
    const slugs = [
      ...Object.keys(context.registry.packages),
      ...Object.keys(context.registry.retiredPackages),
    ];

    return slugs.sort((left, right) => {
      const leftVersion =
        context.registry.packages[left]?.appliedVersion ??
        Number.POSITIVE_INFINITY;
      const rightVersion =
        context.registry.packages[right]?.appliedVersion ??
        Number.POSITIVE_INFINITY;

      return leftVersion - rightVersion || compare(left, right);
    });
  }
  if (
    !context.registry.packages[target] &&
    !context.registry.retiredPackages[target]
  ) {
    throw new Error(
      `Unknown tracked package "${target}". Run status to list tracked packages.`
    );
  }

  return [target];
};

const summarize = (statuses) =>
  statuses.reduce(
    (counts, entry) => {
      counts[entry.status] += 1;

      return counts;
    },
    { current: 0, drifted: 0, retired: 0, stale: 0 }
  );

const printStatus = ({ json, registry, statuses }) => {
  const counts = summarize(statuses);

  if (json) {
    console.log(
      JSON.stringify(
        {
          counts,
          latestVersion: registry.latestVersion,
          packages: statuses,
        },
        null,
        2
      )
    );

    return;
  }

  console.log(
    `Plate Next v${registry.latestVersion}: ${statuses.length} tracked | ${counts.current} current | ${counts.stale} stale | ${counts.drifted} drifted | ${counts.retired} retired`
  );

  for (const entry of statuses) {
    console.log(
      `${entry.status.toUpperCase().padEnd(7)} packages/${entry.slug} v${
        entry.appliedVersion
      } fingerprint=${entry.fingerprintState} (${entry.reason})`
    );
  }
};

const printUsage = () => {
  console.log(`Usage:
  node .agents/rules/plate-next/scripts/version.mjs validate [--json]
  node .agents/rules/plate-next/scripts/version.mjs status [all|<package>] [--json]
  node .agents/rules/plate-next/scripts/version.mjs pending [all|<package>] [--json]
  node .agents/rules/plate-next/scripts/version.mjs check [all|<package>] [--json]
  node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint [--json]
  node .agents/rules/plate-next/scripts/version.mjs fingerprint <package> [--json]`);
};

export const main = (argv = process.argv.slice(2), root = defaultRoot) => {
  const json = argv.includes('--json');
  const positional = argv.filter((argument) => argument !== '--json');
  const [command = 'status', target, ...extra] = positional;

  if (extra.length > 0) {
    throw new Error(`Unexpected arguments: ${extra.join(' ')}`);
  }

  const context = loadContext(root);

  if (command === 'doctrine-fingerprint') {
    const result = {
      doctrineFingerprint: context.currentDoctrineFingerprint,
      version: context.declaredVersion,
    };

    console.log(
      json
        ? JSON.stringify(result, null, 2)
        : `${result.doctrineFingerprint} Plate Next v${result.version}`
    );

    return;
  }

  if (context.errors.length > 0) {
    if (json) {
      console.log(
        JSON.stringify({ errors: context.errors, valid: false }, null, 2)
      );
    } else {
      for (const error of context.errors) console.error(`- ${error}`);
    }
    process.exitCode = 1;

    return;
  }

  if (command === 'validate') {
    const result = {
      latestVersion: context.registry.latestVersion,
      packageCount: context.reviewedSlugs.length,
      retiredPackageCount: Object.keys(context.registry.retiredPackages).length,
      valid: true,
    };

    console.log(
      json
        ? JSON.stringify(result, null, 2)
        : `Plate Next v${result.latestVersion}: registry valid (${result.packageCount} active, ${result.retiredPackageCount} retired).`
    );

    return;
  }

  if (command === 'fingerprint') {
    if (!target || target === 'all') {
      throw new Error('fingerprint requires one tracked package slug.');
    }
    selectSlugs(context, target);
    if (context.registry.retiredPackages[target]) {
      throw new Error(`Cannot fingerprint retired package "${target}".`);
    }
    const result = { slug: target, ...computePackageFingerprint(root, target) };

    console.log(
      json
        ? JSON.stringify(result, null, 2)
        : `${result.fingerprint} packages/${target} (${result.fileCount} files)`
    );

    return;
  }

  if (!['check', 'pending', 'status'].includes(command)) {
    printUsage();
    process.exitCode = 1;

    return;
  }

  const statuses = getPackageStatuses({
    registry: context.registry,
    root,
    slugs: selectSlugs(context, target),
  });
  const pending = statuses.filter((entry) =>
    ['drifted', 'stale'].includes(entry.status)
  );

  if (command === 'pending') {
    printStatus({ json, registry: context.registry, statuses: pending });

    return;
  }

  printStatus({ json, registry: context.registry, statuses });

  if (command === 'check' && pending.length > 0) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

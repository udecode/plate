#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  concepts,
  exclusions,
  explicitFileOwners,
  sourceOwners,
} from './audit-spec.mjs';

const artifactRoot = path.dirname(fileURLToPath(import.meta.url));
const wordgardRoot = '/Users/zbeyens/git/wordgard';
const rawPath = path.join(artifactRoot, 'raw-source-inventory.json');
const outputPath = path.join(artifactRoot, 'source-manifest.json');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const conceptIds = new Set(concepts.map(({ id }) => id));

const git = (...args) =>
  execFileSync('git', ['-C', wordgardRoot, ...args], {
    encoding: 'utf8',
  }).trim();

const head = git('rev-parse', 'HEAD');
const branch = git('branch', '--show-current');
const upstream = git(
  'rev-parse',
  '--abbrev-ref',
  '--symbolic-full-name',
  '@{upstream}'
);
const origin = git('remote', 'get-url', 'origin');
const dirty = git('status', '--porcelain');

if (dirty) {
  throw new Error(`Wordgard checkout is dirty:\n${dirty}`);
}
if (head !== raw.authority.commit) {
  throw new Error(
    `raw inventory head ${raw.authority.commit} does not match Wordgard ${head}`
  );
}

const pickOwner = (rules, line) => {
  let picked = rules[0];

  for (const rule of rules) {
    if (rule.from > line) break;
    picked = rule;
  }

  return picked.conceptId;
};

const files = raw.files.map((file) => {
  const exclusionReason = exclusions[file.path];
  const rules = sourceOwners[file.path];
  const explicitOwner = explicitFileOwners[file.path];

  if (exclusionReason) {
    return {
      ...file,
      conceptIds: [],
      declarations: (file.declarations ?? []).map((declaration, index) => ({
        ...declaration,
        id: `${file.path}:${declaration.line}:${declaration.column}:${declaration.kind}:${index}`,
        exclusionReason,
        status: 'excluded',
      })),
      exclusionReason,
      status: 'excluded',
    };
  }

  if (!rules && !explicitOwner) {
    throw new Error(`no concept owner for ${file.path}`);
  }

  const declarations = (file.declarations ?? []).map((declaration, index) => {
    const conceptId = rules
      ? pickOwner(rules, declaration.line)
      : explicitOwner;

    if (!conceptIds.has(conceptId)) {
      throw new Error(
        `unknown concept ${conceptId} for ${file.path}:${declaration.line}`
      );
    }

    return {
      ...declaration,
      conceptId,
      id: `${file.path}:${declaration.line}:${declaration.column}:${declaration.kind}:${index}`,
      status: 'mapped',
    };
  });
  const fileConceptIds = [
    ...new Set(
      declarations.length > 0
        ? declarations.map(({ conceptId }) => conceptId)
        : [explicitOwner ?? rules[0].conceptId]
    ),
  ].sort();

  return {
    ...file,
    conceptIds: fileConceptIds,
    declarations,
    status: 'mapped',
  };
});

const allDeclarations = files.flatMap(({ declarations }) => declarations);
const mappedDeclarations = allDeclarations.filter(
  ({ status }) => status === 'mapped'
);
const excludedDeclarations = allDeclarations.filter(
  ({ status }) => status === 'excluded'
);
const mappedFiles = files.filter(({ status }) => status === 'mapped');
const excludedFiles = files.filter(({ status }) => status === 'excluded');
const conceptCoverage = Object.fromEntries(
  concepts.map(({ id }) => {
    const owningFiles = mappedFiles.filter(({ conceptIds: ids }) =>
      ids.includes(id)
    );
    const declarations = mappedDeclarations.filter(
      ({ conceptId }) => conceptId === id
    );

    return [
      id,
      {
        declarations: declarations.length,
        files: owningFiles.map(({ path: filePath }) => filePath),
      },
    ];
  })
);
const uncoveredConcepts = Object.entries(conceptCoverage)
  .filter(([, value]) => value.files.length === 0)
  .map(([id]) => id);

if (uncoveredConcepts.length > 0) {
  throw new Error(`concepts without source ownership: ${uncoveredConcepts}`);
}

const mappedDeclarationIds = new Set(mappedDeclarations.map(({ id }) => id));
const excludedDeclarationIds = new Set(
  excludedDeclarations.map(({ id }) => id)
);
const duplicateDeclarationIds = allDeclarations
  .map(({ id }) => id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);
const unexplainedDeclarations = allDeclarations.filter(
  ({ id }) => !mappedDeclarationIds.has(id) && !excludedDeclarationIds.has(id)
);
const unexplainedFiles = files.filter(
  ({ status }) => status !== 'mapped' && status !== 'excluded'
);

const manifest = {
  schemaVersion: 2,
  kind: 'wordgard-full-current-source-concept-manifest',
  generatedAt: new Date().toISOString(),
  authority: {
    branch,
    clean: true,
    head,
    license: 'MIT',
    origin,
    package: 'wordgard@0.3.1',
    upstream,
  },
  policy: {
    conceptInventory:
      'Derived from the complete current tracked source graph before historical comparison rows were consulted.',
    declarationUnit:
      'Every TypeScript AST declaration node, including nested declarations, parameters, and object members, maps to exactly one semantic concept or exact file exclusion.',
    exclusions:
      'Only legal metadata, historical prose, release-only plumbing, and one binary demo fixture are excluded.',
  },
  summary: {
    concepts: concepts.length,
    declarations: allDeclarations.length,
    excludedDeclarations: excludedDeclarations.length,
    excludedFiles: excludedFiles.length,
    files: files.length,
    mappedDeclarations: mappedDeclarations.length,
    mappedFiles: mappedFiles.length,
    parseDiagnostics: raw.summary.parseDiagnosticCount,
    unexplainedDeclarations: unexplainedDeclarations.length,
    unexplainedFiles: unexplainedFiles.length,
  },
  validation: {
    duplicateConceptIds:
      concepts.length - new Set(concepts.map(({ id }) => id)).size,
    duplicateDeclarationIds: duplicateDeclarationIds.length,
    missingConceptOwners: uncoveredConcepts.length,
    unknownConceptAssignments: 0,
    unexplainedDeclarations: unexplainedDeclarations.length,
    unexplainedFiles: unexplainedFiles.length,
  },
  concepts: concepts.map((definition) => ({
    ...definition,
    coverage: conceptCoverage[definition.id],
  })),
  files,
};

const invalid = Object.entries(manifest.validation).filter(
  ([, value]) => value !== 0
);
if (invalid.length > 0) {
  throw new Error(`manifest validation failed: ${JSON.stringify(invalid)}`);
}

fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({
    concepts: manifest.summary.concepts,
    declarations: manifest.summary.declarations,
    excludedDeclarations: manifest.summary.excludedDeclarations,
    excludedFiles: manifest.summary.excludedFiles,
    files: manifest.summary.files,
    mappedDeclarations: manifest.summary.mappedDeclarations,
    mappedFiles: manifest.summary.mappedFiles,
    parseDiagnostics: manifest.summary.parseDiagnostics,
    unexplainedDeclarations: manifest.summary.unexplainedDeclarations,
    unexplainedFiles: manifest.summary.unexplainedFiles,
  })}\n`
);

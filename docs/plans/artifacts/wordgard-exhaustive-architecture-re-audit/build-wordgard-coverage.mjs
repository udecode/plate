#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  concepts,
  exclusions,
  explicitFileOwners,
  sourceOwners as priorSourceOwners,
} from '../wordgard-full-strict-editor-audit/audit-spec.mjs';

const root = path.dirname(new URL(import.meta.url).pathname);
const wordgardRoot = '/Users/zbeyens/git/wordgard';
const raw = JSON.parse(
  readFileSync(path.join(root, 'wordgard-raw-source-inventory.json'), 'utf8')
);
const wordgardPackage = JSON.parse(
  readFileSync(path.join(wordgardRoot, 'package.json'), 'utf8')
);
const outputPath = path.join(root, 'wordgard-source-coverage.json');
const owner = (conceptId, from = 1) => ({ conceptId, from });
const sourceOwners = {
  ...priorSourceOwners,
  'src/editor/decoration.ts': [
    owner('WG-VIEW-005A'),
    owner('WG-VIEW-005B', 586),
    owner('WG-VIEW-005C', 979),
  ],
  'src/schema/code.ts': [owner('WG-PRODUCT-003A')],
};
const conceptIds = new Set(concepts.map(({ id }) => id));

const git = (...args) =>
  execFileSync('git', ['-C', wordgardRoot, ...args], {
    encoding: 'utf8',
  }).trim();
const head = git('rev-parse', 'HEAD');
const dirty = git('status', '--porcelain');
if (dirty) throw new Error(`Wordgard checkout is dirty:\n${dirty}`);
if (head !== raw.authority.commit) {
  throw new Error(
    `raw inventory cursor drift: inventory=${raw.authority.commit} source=${head}`
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
  const explicitOwner = explicitFileOwners[file.path];
  const rules = sourceOwners[file.path];

  if (exclusionReason) {
    return {
      ...file,
      conceptIds: [],
      declarations: (file.declarations ?? []).map((declaration, index) => ({
        ...declaration,
        exclusionReason,
        id: `${file.path}:${declaration.line}:${declaration.column}:${declaration.kind}:${index}`,
        status: 'excluded',
      })),
      exclusionReason,
      status: 'excluded',
    };
  }
  if (!explicitOwner && !rules) {
    throw new Error(`no Wordgard concept owner for ${file.path}`);
  }

  const declarations = (file.declarations ?? []).map((declaration, index) => {
    const conceptId = rules
      ? pickOwner(rules, declaration.line)
      : explicitOwner;
    if (!conceptIds.has(conceptId)) {
      throw new Error(
        `unknown concept ${conceptId} at ${file.path}:${declaration.line}`
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

const allDeclarations = files.flatMap((file) => file.declarations ?? []);
const mappedDeclarations = allDeclarations.filter(
  ({ status }) => status === 'mapped'
);
const excludedDeclarations = allDeclarations.filter(
  ({ status }) => status === 'excluded'
);
const mappedFiles = files.filter(({ status }) => status === 'mapped');
const excludedFiles = files.filter(({ status }) => status === 'excluded');
const coverage = Object.fromEntries(
  concepts.map(({ id }) => [
    id,
    {
      declarations: mappedDeclarations.filter(
        ({ conceptId }) => conceptId === id
      ).length,
      files: mappedFiles
        .filter(({ conceptIds: ids }) => ids.includes(id))
        .map(({ path: filePath }) => filePath),
    },
  ])
);
const uncoveredConcepts = Object.entries(coverage)
  .filter(([, value]) => value.files.length === 0)
  .map(([id]) => id);
const duplicateDeclarationIds = allDeclarations
  .map(({ id }) => id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

const manifest = {
  schemaVersion: 1,
  kind: 'wordgard-current-source-coverage',
  generatedAt: new Date().toISOString(),
  authority: {
    branch: git('branch', '--show-current'),
    clean: true,
    describe: git('describe', '--tags', '--always'),
    head,
    license: 'MIT',
    origin: git('remote', 'get-url', 'origin'),
    package: `${wordgardPackage.name}@${wordgardPackage.version}`,
    upstream: git(
      'rev-parse',
      '--abbrev-ref',
      '--symbolic-full-name',
      '@{upstream}'
    ),
  },
  concepts: concepts.map((concept) => ({
    ...concept,
    coverage: coverage[concept.id],
  })),
  files,
  summary: {
    concepts: concepts.length,
    declarations: allDeclarations.length,
    excludedDeclarations: excludedDeclarations.length,
    excludedFiles: excludedFiles.length,
    files: files.length,
    mappedDeclarations: mappedDeclarations.length,
    mappedFiles: mappedFiles.length,
    parseDiagnostics: raw.summary.parseDiagnosticCount,
    unexplainedDeclarations: 0,
    unexplainedFiles: 0,
  },
  validation: {
    duplicateConceptIds:
      concepts.length - new Set(concepts.map(({ id }) => id)).size,
    duplicateDeclarationIds: duplicateDeclarationIds.length,
    missingConceptOwners: uncoveredConcepts.length,
    unexplainedDeclarations: 0,
    unexplainedFiles: 0,
  },
};

const invalid = Object.entries(manifest.validation).filter(
  ([, value]) => value !== 0
);
if (invalid.length > 0) {
  throw new Error(
    `Wordgard coverage validation failed: ${JSON.stringify(invalid)}`
  );
}

writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(manifest.summary)}\n`);

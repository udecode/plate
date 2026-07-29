import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(artifactDir, '../../../..');
const planPath = resolve(
  root,
  process.argv[2] ??
    'docs/plans/2026-07-25-multi-editor-full-architecture-audit.md'
);
const registryPath = resolve(root, 'docs/editor-audits/index.json');

let checkCount = 0;
const failures = [];
const warnings = [];

const relative = (path) =>
  path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;

const check = (condition, label, detail = '') => {
  checkCount++;

  if (!condition) {
    failures.push(detail ? `${label}: ${detail}` : label);
  }
};

const warn = (condition, label, detail = '') => {
  if (!condition) {
    warnings.push(detail ? `${label}: ${detail}` : label);
  }
};

const requireFile = (path, label = relative(path)) => {
  check(
    existsSync(path) && statSync(path).isFile() && statSync(path).size > 0,
    `required artifact ${label}`
  );

  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

const loadJson = (path, label = relative(path)) => {
  const text = requireFile(path, label);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    check(false, `valid JSON ${label}`, error.message);

    return null;
  }
};

const fullSha = /^[0-9a-f]{40}$/;
const sha256Cursor = /^sha256:[0-9a-f]{64}$/;

const git = (cwd, args) => {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    check(
      false,
      `git ${args.join(' ')} in ${cwd}`,
      error.stderr?.toString().trim() || error.message
    );

    return '';
  }
};

const validateReference = ({ branch, commit, label, path, upstream }) => {
  check(fullSha.test(commit), `${label} immutable commit`, commit);
  check(existsSync(path), `${label} checkout exists`, path);

  if (!existsSync(path)) return;

  check(git(path, ['rev-parse', 'HEAD']) === commit, `${label} exact HEAD`);
  check(git(path, ['status', '--porcelain']) === '', `${label} clean checkout`);

  if (branch) {
    check(
      git(path, ['branch', '--show-current']) === branch,
      `${label} branch`,
      branch
    );
  }
  if (upstream) {
    check(
      git(path, [
        'rev-parse',
        '--abbrev-ref',
        '--symbolic-full-name',
        '@{upstream}',
      ]) === upstream,
      `${label} upstream`,
      upstream
    );
  }
};

const conceptIds = (concepts) =>
  Array.isArray(concepts)
    ? concepts.map((concept) => concept.id)
    : Object.keys(concepts ?? {});

const reportHasConcept = (reportText, id) => {
  if (reportText.includes(id)) return true;

  const match = /^(.*-)(\d+)$/.exec(id);
  if (!match) return false;

  const [, prefix, rawNumber] = match;
  const number = Number(rawNumber);
  const groupedPattern = new RegExp(
    `${prefix.replace(
      /[.*+?^${}()|[\\]\\\\]/g,
      '\\\\$&'
    )}(\\d+(?:(?:\\.\\.|,)\\d+)*)`,
    'g'
  );

  return [...reportText.matchAll(groupedPattern)].some((group) =>
    group[1].split(',').some((part) => {
      const [start, end = start] = part.split('..');

      return number >= Number(start) && number <= Number(end);
    })
  );
};

const validateConceptReport = (manifest, reportText, label) => {
  const ids = conceptIds(manifest?.concepts);

  check(ids.length > 0, `${label} concept inventory non-empty`);

  const missing = ids.filter((id) => !reportHasConcept(reportText, id));
  check(
    missing.length === 0,
    `${label} ledger accounts for every concept`,
    missing.slice(0, 8).join(', ')
  );
};

const requiredArtifacts = [
  'wordgard-architecture-report.md',
  'wordgard-source-manifest.json',
  'lexical-architecture-ledger.md',
  'lexical-source-manifest.json',
  'prosemirror-concept-ledger.md',
  'prosemirror-provenance.md',
  'prosemirror-source-manifest.json',
  'plite-concepts.md',
  'plite-pressure-audit.md',
  'plite-source-manifest.json',
  'plate-concept-inventory.md',
  'plate-coverage-manifest.json',
];

for (const artifact of requiredArtifacts) {
  requireFile(resolve(artifactDir, artifact));
}

for (const editor of ['wordgard', 'lexical', 'prosemirror']) {
  for (const artifact of ['inventory.md', 'report.md', 'test-index.md']) {
    requireFile(
      resolve(root, `docs/editor-test-harvester/${editor}/${artifact}`)
    );
  }
  for (const artifact of [
    'classified-issues.json',
    'classified-issues.tsv',
    'issue-closure-ledger.md',
    'issue-closure-ledger.tsv',
    'issue-refresh.json',
    'issue-refresh.md',
  ]) {
    requireFile(
      resolve(root, `docs/editor-issue-harvester/${editor}/full/${artifact}`)
    );
  }
}

const plan = requireFile(planPath, relative(planPath));
const wordgard = loadJson(
  resolve(artifactDir, 'wordgard-source-manifest.json')
);
const lexical = loadJson(resolve(artifactDir, 'lexical-source-manifest.json'));
const prosemirror = loadJson(
  resolve(artifactDir, 'prosemirror-source-manifest.json')
);
const plite = loadJson(resolve(artifactDir, 'plite-source-manifest.json'));
const plate = loadJson(resolve(artifactDir, 'plate-coverage-manifest.json'));

if (wordgard) {
  const summary = wordgard.summary;

  check(summary.unmappedFiles === 0, 'Wordgard zero unmapped files');
  check(
    summary.unmappedDeclarationItems === 0,
    'Wordgard zero unmapped declarations'
  );
  check(
    summary.trackedFiles ===
      summary.mappedFiles + summary.excludedFiles + summary.unmappedFiles,
    'Wordgard file accounting closes'
  );
  check(
    summary.declarationItems ===
      summary.mappedDeclarationItems +
        summary.excludedDeclarationItems +
        summary.unmappedDeclarationItems,
    'Wordgard declaration accounting closes'
  );
  check(
    conceptIds(wordgard.concepts).length === summary.semanticConcepts,
    'Wordgard concept count closes'
  );

  const invalidRows = wordgard.files.filter(
    (row) =>
      !(
        (row.status === 'mapped' && row.conceptIds?.length > 0) ||
        (row.status === 'excluded' && row.exclusionReason)
      )
  );
  check(
    invalidRows.length === 0,
    'Wordgard file rows mapped or exactly excluded',
    invalidRows
      .slice(0, 5)
      .map((row) => row.path)
      .join(', ')
  );

  validateReference({
    branch: wordgard.authority.branch,
    commit: wordgard.authority.commit,
    label: 'Wordgard',
    path: wordgard.authority.repository,
    upstream: wordgard.authority.upstream,
  });
}

if (lexical) {
  const summary = lexical.summary;

  check(summary.unexplainedUnits === 0, 'Lexical zero unexplained units');
  check(
    summary.unexplainedDeclarations === 0,
    'Lexical zero unexplained declarations'
  );
  check(
    summary.trackedUnits === summary.relevantUnits + summary.excludedUnits,
    'Lexical unit accounting closes'
  );
  check(
    summary.declarations ===
      summary.mappedDeclarations + summary.excludedDeclarations,
    'Lexical declaration accounting closes'
  );

  const invalidRows = lexical.units.filter(
    (row) =>
      !(
        (row.kind !== 'excluded' && row.concepts?.length > 0) ||
        (row.exclusion && row.concepts?.length === 0)
      )
  );
  check(
    invalidRows.length === 0,
    'Lexical unit rows mapped or exactly excluded',
    invalidRows
      .slice(0, 5)
      .map((row) => row.path)
      .join(', ')
  );

  validateReference({
    commit: lexical.repository.commit,
    label: 'Lexical',
    path: resolve(root, lexical.repository.path),
  });
}

if (prosemirror) {
  const totals = prosemirror.totals;

  check(totals.unexplainedFiles === 0, 'ProseMirror zero unexplained files');
  check(
    totals.trackedFiles === totals.mappedFiles + totals.excludedFiles,
    'ProseMirror file accounting closes'
  );
  check(
    prosemirror.repositories.length === totals.repositories,
    'ProseMirror module accounting closes'
  );
  check(
    sha256Cursor.test(prosemirror.moduleSetCursor),
    'ProseMirror composite module cursor'
  );

  const repositoryRows = [
    { label: 'ProseMirror meta', ...prosemirror.meta },
    ...prosemirror.repositories.map((repository) => ({
      label: `ProseMirror ${repository.module}`,
      ...repository,
    })),
  ];
  const invalidRows = repositoryRows.flatMap((repository) =>
    repository.files
      .filter(
        (row) =>
          !(
            (row.disposition === 'mapped' && row.conceptIds?.length > 0) ||
            (row.disposition === 'excluded' && row.explanation)
          )
      )
      .map((row) => `${repository.label}:${row.path}`)
  );
  check(
    invalidRows.length === 0,
    'ProseMirror file rows mapped or exactly excluded',
    invalidRows.slice(0, 5).join(', ')
  );

  for (const repository of repositoryRows) {
    validateReference({
      branch: repository.branch,
      commit: repository.head,
      label: repository.label,
      path: repository.root,
      upstream: repository.upstream,
    });
  }
}

if (plite) {
  check(plite.coverage.unmappedFiles.length === 0, 'Plite zero unmapped files');
  check(
    plite.coverage.unmappedDeclarations.length === 0,
    'Plite zero unmapped declarations'
  );
  check(
    plite.summary.files === plite.entries.length &&
      plite.coverage.mappedFiles === plite.entries.length,
    'Plite file accounting closes'
  );
  check(
    plite.summary.declarations === plite.coverage.mappedDeclarations,
    'Plite declaration accounting closes'
  );

  const invalidRows = plite.entries.filter((row) => !row.conceptIds?.length);
  check(
    invalidRows.length === 0,
    'Plite rows carry concept ownership',
    invalidRows
      .slice(0, 5)
      .map((row) => row.path)
      .join(', ')
  );
}

if (plate) {
  check(
    plate.summary.files ===
      plate.summary.includedFiles + plate.summary.excludedFiles,
    'Plate file accounting closes'
  );
  check(
    plate.files.length === plate.summary.files,
    'Plate manifest row count closes'
  );
  check(
    plate.conceptIds.length === 45,
    'Plate concept count closes',
    `${plate.conceptIds.length}/45`
  );

  const invalidRows = plate.files.filter(
    (row) => !(row.concepts?.length > 0 || row.exclusion)
  );
  check(
    invalidRows.length === 0,
    'Plate rows mapped or exactly excluded',
    invalidRows
      .slice(0, 5)
      .map((row) => row.path)
      .join(', ')
  );
}

if (wordgard && lexical && prosemirror && plite && plate) {
  validateConceptReport(
    wordgard,
    requireFile(resolve(artifactDir, 'wordgard-architecture-report.md')),
    'Wordgard'
  );
  validateConceptReport(
    lexical,
    requireFile(resolve(artifactDir, 'lexical-architecture-ledger.md')),
    'Lexical'
  );
  validateConceptReport(
    prosemirror,
    requireFile(resolve(artifactDir, 'prosemirror-concept-ledger.md')),
    'ProseMirror'
  );
  validateConceptReport(
    plite,
    requireFile(resolve(artifactDir, 'plite-concepts.md')),
    'Plite'
  );

  const plateReport = requireFile(
    resolve(artifactDir, 'plate-concept-inventory.md')
  );
  const missingPlateConcepts = plate.conceptIds.filter(
    (id) => !plateReport.includes(id)
  );
  check(
    missingPlateConcepts.length === 0,
    'Plate ledger accounts for every concept',
    missingPlateConcepts.slice(0, 8).join(', ')
  );
}

const architectureCursors = {
  lexical: lexical?.repository.commit,
  prosemirror: prosemirror?.meta.head,
  wordgard: wordgard?.authority.commit,
};
const testCursorEvidence = {
  lexical: requireFile(
    resolve(root, 'docs/editor-test-harvester/lexical/report.md')
  ),
  prosemirror: requireFile(
    resolve(root, 'docs/editor-test-harvester/prosemirror/report.md')
  ),
  wordgard: requireFile(
    resolve(root, 'docs/editor-test-harvester/wordgard/inventory.md')
  ),
};

for (const editor of ['wordgard', 'lexical', 'prosemirror']) {
  check(
    testCursorEvidence[editor].includes(architectureCursors[editor]),
    `${editor} test harvest matches architecture cursor`
  );
}
if (prosemirror) {
  check(
    testCursorEvidence.prosemirror.includes(prosemirror.moduleSetCursor),
    'ProseMirror test harvest matches composite module cursor'
  );
}

const issueRefreshes = {};

for (const editor of ['wordgard', 'lexical', 'prosemirror']) {
  const base = resolve(root, `docs/editor-issue-harvester/${editor}/full`);
  const refresh = loadJson(resolve(base, 'issue-refresh.json'));
  const classified = loadJson(resolve(base, 'classified-issues.json'));

  issueRefreshes[editor] = refresh;
  if (!refresh || !classified) continue;

  check(
    Array.isArray(classified),
    `${editor} classified issue rows are an array`
  );
  check(
    classified.length === refresh.resultingLedgerCount,
    `${editor} issue ledger total closes`
  );
  check(
    refresh.hostVerification.issueCount === refresh.resultingLedgerCount,
    `${editor} host and ledger totals agree`
  );
  check(
    refresh.hostVerification.openIssueCount +
      refresh.hostVerification.closedIssueCount ===
      refresh.hostVerification.issueCount,
    `${editor} open/closed issue totals close`
  );
  check(
    refresh.providerIssueCount + refresh.providerMissingLiveVerifiedCount ===
      refresh.resultingLedgerCount,
    `${editor} provider omissions close`
  );
  check(
    refresh.addedUncheckedCount === refresh.addedUncheckedIssues.length,
    `${editor} added-unchecked count closes`
  );
  check(
    refresh.metadataChangedNeedsRereadCount ===
      refresh.metadataChangedNeedsReread.length,
    `${editor} metadata-reread count closes`
  );
  check(
    refresh.providerMissingLiveVerifiedCount ===
      refresh.providerMissingLiveVerified.length,
    `${editor} provider-omission count closes`
  );
  check(
    /^[0-9a-f]{64}$/.test(refresh.rawSha256),
    `${editor} issue raw cursor is a SHA-256`
  );
  check(
    !Number.isNaN(Date.parse(refresh.refreshedAt)),
    `${editor} issue refresh timestamp`
  );
}

if (plan) {
  const markdownLinks = [...plan.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => match[1])
    .filter((link) => !/^(?:https?:|#)/.test(link));

  for (const link of markdownLinks) {
    const withoutAnchor = link.split('#')[0];
    const target = resolve(dirname(planPath), withoutAnchor);

    check(existsSync(target), `plan artifact link ${link}`);
  }

  const rankedRows = [
    ...plan.matchAll(
      /^\|\s*(\d+)\s*\|\s*`(A(?:10|[1-9]))`\s*\|\s*(P[0-3])\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|$/gm
    ),
  ];
  const rankedById = new Map(
    rankedRows.map((match) => [
      match[2],
      {
        dependentOwner: match[6].trim(),
        primaryOwner: match[5].trim(),
        priority: match[3],
      },
    ])
  );
  const requiredPacketTerms = {
    A1: ['config', 'session'],
    A2: ['priority', 'order'],
    A3: ['exclusive', 'propert'],
    A4: ['query middleware', 'primaryRange'],
    A5: ['clipboard', 'plite-dom'],
    A6: ['descriptor', 'dependenc', 'conflict'],
  };

  check(rankedById.size === 6, 'ranked material set is exactly A1-A6');

  for (let index = 1; index <= 6; index++) {
    const id = `A${index}`;
    const startMatch = new RegExp(`^## ${id} \\u2014 .*?$`, 'm').exec(plan);
    const ranking = rankedById.get(id);

    check(Boolean(startMatch), `${id} dossier exists`);
    check(Boolean(ranking), `${id} ranking row exists`);
    if (!startMatch || !ranking) continue;

    const start = startMatch.index;
    const rest = plan.slice(start + startMatch[0].length);
    const nextHeading = /^## /m.exec(rest);
    const dossier = plan.slice(
      start,
      nextHeading
        ? start + startMatch[0].length + nextHeading.index
        : plan.length
    );

    for (const term of requiredPacketTerms[id]) {
      check(
        dossier.toLowerCase().includes(term.toLowerCase()),
        `${id} owns accepted ${term} packet`
      );
    }
    check(
      dossier.includes(`### Why this clears ${ranking.priority}`),
      `${id} rationale priority matches ranking`,
      ranking.priority
    );
    check(
      /^### Current.*public.*shape$/im.test(dossier),
      `${id} current public shape`
    );
    check(
      /^### (?:Current and )?proposed.*public.*shape$/im.test(dossier) ||
        /^### Proposed public.*shape$/im.test(dossier),
      `${id} proposed public shape`
    );
    check(
      /^### Current.*internal.*shape$/im.test(dossier) ||
        /^### Current public\/internal shape$/im.test(dossier) ||
        /^### Current public and internal shape$/im.test(dossier),
      `${id} current internal shape`
    );
    check(
      /^### Proposed.*internal.*shape$/im.test(dossier) ||
        /^### Proposed public and internal shape$/im.test(dossier),
      `${id} proposed internal shape`
    );
    check(
      (dossier.match(/^```(?:ts|typescript)$/gm) ?? []).length >= 2,
      `${id} realistic before/after TypeScript examples`
    );
    check(
      /^\| Delete \|/m.test(dossier) || /^### Deletion$/m.test(dossier),
      `${id} deletion ledger`
    );
    check(
      /^\| Adopt \|/m.test(dossier) || /^### Adoption$/m.test(dossier),
      `${id} adoption ledger`
    );
    check(
      /^\| [^|]*(?:proof|Proof)[^|]*\|/m.test(dossier) ||
        /^### Proof(?: and performance)?$/m.test(dossier),
      `${id} proof ledger`
    );
    check(
      /^\| Dependencies \|/m.test(dossier) ||
        /^### Ownership and dependencies$/m.test(dossier),
      `${id} dependency ledger`
    );
    check(
      /^\| Owner \|/m.test(dossier) ||
        /^### Ownership and dependencies$/m.test(dossier),
      `${id} planning-owner ledger`
    );
    check(
      /best-api|plite-plan|plate-plan/.test(
        `${ranking.primaryOwner} ${ranking.dependentOwner}`
      ),
      `${id} ranked planning ownership`
    );

    check(
      dossier.includes('@platejs/'),
      `${id} public example uses a real package-qualified import or type`
    );
  }

  const expectedClosureRows = [
    `Wordgard ${wordgard?.summary.semanticConcepts}/${wordgard?.summary.semanticConcepts}`,
    `Lexical ${conceptIds(lexical?.concepts).length}/${
      conceptIds(lexical?.concepts).length
    }`,
    `ProseMirror ${conceptIds(prosemirror?.concepts).length}/${
      conceptIds(prosemirror?.concepts).length
    }`,
    `Plite ${conceptIds(plite?.concepts).length}/${
      conceptIds(plite?.concepts).length
    }`,
    `Plate ${plate?.conceptIds.length}/${plate?.conceptIds.length}`,
  ];

  for (const row of expectedClosureRows) {
    check(plan.includes(row), `plan closure count ${row}`);
  }
  check(
    plan.includes('Unmapped source units/declarations: 0.'),
    'plan records zero unmapped'
  );
  check(plan.includes('Material proposals: 6;'), 'plan records 6 proposals');
  check(
    plan.includes('Unresolved material candidates: 0'),
    'plan records zero unresolved candidates'
  );
  check(
    plan.includes('Product implementation performed: none.'),
    'plan preserves planning-only boundary'
  );

  for (const [editor, refresh] of Object.entries(issueRefreshes)) {
    if (!refresh) continue;

    check(
      plan.includes(
        refresh.hostVerification.issueCount.toLocaleString('en-US')
      ),
      `plan records ${editor} issue total`
    );
    check(
      plan.includes(refresh.hostVerification.verifiedAt),
      `plan records ${editor} issue verification cursor`
    );
  }
}

const registry = loadJson(registryPath, relative(registryPath));

if (registry) {
  check(registry.version === 1, 'audit registry schema version 1');
  check(Array.isArray(registry.audits), 'audit registry audits array');

  const planRelative = relative(planPath);
  const audit = registry.audits?.find(
    (entry) =>
      entry.artifact === planRelative ||
      resolve(root, entry.artifact ?? '') === planPath
  );

  check(Boolean(audit), 'registry links this audit artifact', planRelative);

  if (audit) {
    check(
      typeof audit.id === 'string' && audit.id.length > 0,
      'registry stable audit id'
    );
    check(audit.target === 'full', 'registry target is full');
    check(
      Number.isInteger(audit.artifactVersion) && audit.artifactVersion > 0,
      'registry artifact version'
    );
    check(Array.isArray(audit.references), 'registry reference cursor array');

    const expectedReferences = [
      {
        branch: wordgard?.authority.branch,
        commit: wordgard?.authority.commit,
        issue: 'wordgard',
        localPath: '../wordgard',
        source: wordgard?.authority.origin,
        upstream: wordgard?.authority.upstream,
      },
      {
        branch: 'main',
        commit: lexical?.repository.commit,
        issue: 'lexical',
        localPath: '../lexical',
        source: 'https://github.com/facebook/lexical.git',
        upstream: 'origin/main',
      },
      {
        branch: prosemirror?.meta.branch,
        commit: prosemirror?.meta.head,
        issue: 'prosemirror',
        localPath: '../prosemirror',
        source: prosemirror?.meta.remote,
        upstream: prosemirror?.meta.upstream,
      },
    ];

    for (const expected of expectedReferences) {
      const reference = audit.references?.find(
        (entry) =>
          resolve(root, entry.localPath ?? '') ===
          resolve(root, expected.localPath)
      );

      check(Boolean(reference), `registry reference ${expected.localPath}`);
      if (!reference) continue;

      check(
        reference.auditedCommit === expected.commit,
        `${expected.issue} registry architecture cursor`
      );
      check(
        reference.source === expected.source,
        `${expected.issue} registry source`
      );
      check(
        reference.branch === expected.branch,
        `${expected.issue} registry branch`
      );
      check(
        reference.upstream === expected.upstream,
        `${expected.issue} registry upstream`
      );
      check(
        reference.testHarvestCommit === expected.commit,
        `${expected.issue} registry test cursor`
      );
      check(
        !Number.isNaN(Date.parse(reference.auditedAt)),
        `${expected.issue} registry audited timestamp`
      );
      check(
        !Number.isNaN(Date.parse(reference.issueHarvestCheckedAt)),
        `${expected.issue} registry issue timestamp`
      );
      check(
        reference.issueHarvestCheckedAt ===
          issueRefreshes[expected.issue]?.hostVerification?.verifiedAt,
        `${expected.issue} registry issue cursor matches refresh receipt`
      );
      check(
        typeof reference.repoKey === 'string' && reference.repoKey.length > 0,
        `${expected.issue} registry repo key`
      );
      check(
        reference.issueLedger &&
          existsSync(resolve(root, reference.issueLedger)),
        `${expected.issue} registry issue-ledger link`
      );
    }

    const pmReference = audit.references?.find(
      (entry) =>
        resolve(root, entry.localPath ?? '') === resolve(root, '../prosemirror')
    );

    if (pmReference && prosemirror) {
      const nestedModules = Array.isArray(pmReference.modules)
        ? pmReference.modules
        : [];
      if (nestedModules.length > 0) {
        check(
          pmReference.moduleSetCursor === prosemirror.moduleSetCursor,
          'ProseMirror registry composite architecture cursor'
        );
      } else {
        warn(
          pmReference.moduleSetCursor === prosemirror.moduleSetCursor,
          'ProseMirror registry omits the optional composite cursor; per-module cursors remain authoritative'
        );
      }
      const registeredModules =
        nestedModules.length > 0
          ? nestedModules
          : audit.references.filter((entry) =>
              prosemirror.repositories.some(
                (repository) =>
                  entry.source === repository.remote ||
                  resolve(root, entry.localPath ?? '') === repository.root
              )
            );

      check(
        registeredModules.length === prosemirror.repositories.length,
        'ProseMirror registry records every module cursor',
        `${registeredModules.length}/${prosemirror.repositories.length}`
      );

      for (const repository of prosemirror.repositories) {
        const registered = registeredModules.find(
          (entry) =>
            entry.module === repository.module ||
            entry.source === repository.remote ||
            resolve(root, entry.localPath ?? '') === repository.root
        );

        check(
          Boolean(registered),
          `ProseMirror registry module ${repository.module}`
        );
        if (!registered) continue;

        check(
          resolve(root, registered.localPath ?? '') === repository.root,
          `ProseMirror ${repository.module} registry local path`,
          `${registered.localPath} != ${repository.root}`
        );
        check(
          registered.source === repository.remote,
          `ProseMirror ${repository.module} registry source`
        );
        check(
          registered.branch === repository.branch,
          `ProseMirror ${repository.module} registry branch`
        );
        check(
          registered.upstream === repository.upstream,
          `ProseMirror ${repository.module} registry upstream`
        );
        check(
          registered.auditedCommit === repository.head,
          `ProseMirror ${repository.module} registry architecture cursor`
        );
        check(
          registered.testHarvestCommit === repository.head,
          `ProseMirror ${repository.module} registry test cursor`
        );
        check(
          !Number.isNaN(Date.parse(registered.auditedAt)),
          `ProseMirror ${repository.module} registry audited timestamp`
        );
      }
    }

    const repoKeys = audit.references.map((reference) => reference.repoKey);
    check(
      new Set(repoKeys).size === repoKeys.length,
      'registry repo keys are unique'
    );
  }
}

for (const warning of warnings) {
  process.stderr.write(`WARN ${warning}\n`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`FAIL ${failure}\n`);
  }
  process.stderr.write(
    `Audit closure failed: ${failures.length} failure(s), ${checkCount} checks.\n`
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Audit closure passed: ${checkCount} checks, zero failures.\n`
  );
}

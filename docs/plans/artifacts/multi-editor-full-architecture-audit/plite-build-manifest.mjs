#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const babelParser = require('@babel/parser');
const artifactRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactRoot, '../../../..');
const outputPath = path.join(artifactRoot, 'plite-source-manifest.json');
const checkOnly = process.argv.includes('--check');

const concepts = Object.freeze({
  'PL-01': 'JSON document, roots, and multi-root ownership',
  'PL-02': 'locations, traversal, and structural queries',
  'PL-03': 'immutable snapshots, indexes, and runtime identity',
  'PL-04': 'canonical DocumentChange algebra',
  'PL-05': 'transaction construction and change application',
  'PL-06': 'read, update, and correction lifecycle',
  'PL-07': 'selection model and extensible selection protocol',
  'PL-08': 'anchors and transaction-scoped draft references',
  'PL-09': 'compiled schema, identity, and vocabulary',
  'PL-10': 'content grammar, ContentSlice, and fitting',
  'PL-11': 'properties, marks, defaults, and lifecycle laws',
  'PL-12': 'canonical representation and corrections',
  'PL-13': 'extension configuration and atomic publication',
  'PL-14': 'typed extension API, state, and transaction groups',
  'PL-15': 'typed command descriptors and dispatch',
  'PL-16': 'query middleware',
  'PL-17': 'facets and dependency-aware derived state',
  'PL-18': 'state fields, effects, annotations, and value codecs',
  'PL-19': 'commits, lazy impact queries, and subscriptions',
  'PL-20': 'host codecs and clipboard',
  'PL-21': 'DOM mapping, geometry, coverage, and scheduling',
  'PL-22': 'browser input, composition, selection, and DOM repair',
  'PL-23': 'React provider, rendering, and selectors',
  'PL-24': 'decorations, projections, annotations, and widgets',
  'PL-25': 'history, inversion, mapping, and persistence',
  'PL-26': 'Yjs collaboration, awareness, and remote changes',
  'PL-27': 'layout, pagination, and partial DOM rendering',
  'PL-28': 'hyperscript and fixture authoring',
  'PL-29': 'browser contracts, harnesses, and release proof',
  'PL-30': 'benchmarks, CI gates, and proof orchestration',
  'PL-31': 'package boundaries, exports, docs, and adoption',
  'PL-32': 'accessibility and assistive output',
});

const directoryRoots = [
  'packages/plite',
  'packages/plite-dom',
  'packages/plite-history',
  'packages/plite-hyperscript',
  'packages/plite-layout',
  'packages/plite-react',
  'packages/browser',
  'packages/yjs',
  'apps/plite',
  'benchmarks/editor',
  'benchmarks/slate-v2',
  'docs/plite',
  'tooling/plite/donor',
];

const fileRoots = [
  '.github/workflows/plite-ci.yml',
  'benchmarks/targets/slate-v2.json',
  'config/plite-source-test-setup.ts',
  'package.json',
  'tooling/config/test-suites.mjs',
  'tooling/scripts/bench-targets.mjs',
  'tooling/scripts/bench-targets.slow.test.mjs',
  'tooling/scripts/bench-targets.test.mjs',
  'tooling/scripts/check-plite-docs.mjs',
  'tooling/scripts/check-plite-docs.test.mjs',
  'tooling/scripts/check-plite-release-artifacts.mjs',
  'tooling/scripts/check-plite-release-artifacts.slow.test.mjs',
  'tooling/scripts/check-plite-release-artifacts.test.mjs',
  'tooling/scripts/check-plite.mjs',
  'tooling/scripts/check-plite.test.mjs',
  'tooling/scripts/plite-source-aliases.slow.test.mjs',
  'tooling/scripts/plite-source-aliases.test.mjs',
  'tooling/scripts/run-bounded-process.mjs',
  'tooling/scripts/run-bounded-process.slow.test.mjs',
  'tooling/scripts/run-bounded-process.test.mjs',
  'tooling/scripts/test-suite-routing.test.mjs',
];

const ignoredDirectories = new Set([
  '.next',
  '.tmp',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'test-results',
  'tmp',
]);

const normalizePath = (file) =>
  path.relative(repoRoot, file).split(path.sep).join('/');

const collectFiles = (entryPath) => {
  if (!fs.existsSync(entryPath)) return [];
  const stat = fs.lstatSync(entryPath);

  if (stat.isSymbolicLink()) return [];
  if (!stat.isDirectory()) return [entryPath];

  return fs
    .readdirSync(entryPath, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
      if (entry.name === '.DS_Store') return [];

      return collectFiles(path.join(entryPath, entry.name));
    });
};

const sourceFiles = [
  ...new Set([
    ...directoryRoots.flatMap((entry) =>
      collectFiles(path.join(repoRoot, entry))
    ),
    ...fileRoots.flatMap((entry) => collectFiles(path.join(repoRoot, entry))),
  ]),
].sort((left, right) =>
  normalizePath(left).localeCompare(normalizePath(right))
);

const add = (set, ...ids) => ids.forEach((id) => set.add(id));

const inferTestConcepts = (relative, set) => {
  const lower = relative.toLowerCase();

  if (/selection|caret|range|point|focus/.test(lower)) add(set, 'PL-07');
  if (/anchor/.test(lower)) add(set, 'PL-08');
  if (/schema/.test(lower)) add(set, 'PL-09', 'PL-10', 'PL-11');
  if (/slice|paste|clipboard|html|codec/.test(lower))
    add(set, 'PL-10', 'PL-20');
  if (/change|transform|compose|invert|rebase/.test(lower)) add(set, 'PL-04');
  if (/transaction|update|normaliz|correction/.test(lower)) {
    add(set, 'PL-05', 'PL-06', 'PL-12');
  }
  if (/command/.test(lower)) add(set, 'PL-15');
  if (/query/.test(lower)) add(set, 'PL-02', 'PL-16');
  if (/facet/.test(lower)) add(set, 'PL-17');
  if (/effect|field|annotation|codec/.test(lower)) add(set, 'PL-18');
  if (/commit|subscription|selector|render/.test(lower)) add(set, 'PL-19');
  if (
    /dom|browser|ime|input|composition|android|webkit|firefox|chromium/.test(
      lower
    )
  ) {
    add(set, 'PL-21', 'PL-22');
  }
  if (/react|render|selector|hook/.test(lower)) add(set, 'PL-23');
  if (/projection|decoration|annotation|widget/.test(lower)) add(set, 'PL-24');
  if (/history|undo|redo/.test(lower)) add(set, 'PL-25');
  if (/yjs|collab|awareness|hocuspocus/.test(lower)) add(set, 'PL-26');
  if (/layout|page|pagination|virtual|huge-document|partial-dom/.test(lower)) {
    add(set, 'PL-27');
  }
  if (/hyperscript|fixture/.test(lower)) add(set, 'PL-28');
  if (/accessib|aria|announcement|screen-reader/.test(lower)) add(set, 'PL-32');
};

const inferConcepts = (relative) => {
  const set = new Set();
  const lower = relative.toLowerCase();
  const isProof =
    /(^|\/)(test|tests|__tests__)\//.test(lower) ||
    /\.(spec|test|slow)\.[cm]?[jt]sx?$/.test(lower);

  if (relative === 'package.json') {
    add(set, 'PL-30', 'PL-31');
  } else if (
    relative.startsWith('.github/') ||
    relative.startsWith('tooling/') ||
    relative.startsWith('benchmarks/')
  ) {
    add(set, 'PL-30');
    inferTestConcepts(relative, set);
  } else if (relative.startsWith('docs/plite/')) {
    add(set, 'PL-31');
    inferTestConcepts(relative, set);
  } else if (relative.startsWith('apps/plite/')) {
    add(set, 'PL-29', 'PL-30');
    inferTestConcepts(relative, set);
  } else if (relative.startsWith('packages/browser/')) {
    add(set, 'PL-29');
    if (/selection|caret|dom|zero-width/.test(lower))
      add(set, 'PL-21', 'PL-22');
  } else if (relative.startsWith('packages/yjs/')) {
    add(set, 'PL-26');
    if (/change|bridge|delta|event/.test(lower)) add(set, 'PL-04');
    if (/extension|provider/.test(lower)) add(set, 'PL-13');
    if (/effect|codec|schema/.test(lower)) add(set, 'PL-18');
  } else if (relative.startsWith('packages/plite-history/')) {
    add(set, 'PL-25');
    if (/codec|json|effect/.test(lower)) add(set, 'PL-18');
    if (/map|change/.test(lower)) add(set, 'PL-04');
  } else if (relative.startsWith('packages/plite-hyperscript/')) {
    add(set, 'PL-28');
  } else if (relative.startsWith('packages/plite-layout/')) {
    add(set, 'PL-27');
    if (/codec|field|break/.test(lower)) add(set, 'PL-18');
    if (/react/.test(lower)) add(set, 'PL-23');
  } else if (relative.startsWith('packages/plite-dom/')) {
    if (/clipboard|host-codec|dom-html/.test(lower)) add(set, 'PL-20');
    if (/input|integrity|phase|root-runtime|environment|mutation/.test(lower)) {
      add(set, 'PL-21', 'PL-22');
    }
    if (/coverage/.test(lower)) add(set, 'PL-21', 'PL-27');
    if (/dom-editor|geometry|node-path|weak-maps|utils\//.test(lower)) {
      add(set, 'PL-21');
    }
    if (/with-dom|package\.json|index\.[cm]?[jt]s/.test(lower)) {
      add(set, 'PL-13', 'PL-31');
    }
    if (/dom-event-range-targets/.test(lower)) add(set, 'PL-21', 'PL-22');
  } else if (relative.startsWith('packages/plite-react/')) {
    if (
      /annotation|widget|projection|decoration|mapped-view|view-source/.test(
        lower
      )
    ) {
      add(set, 'PL-24');
    }
    if (/dom-strategy|virtualized|coverage/.test(lower)) add(set, 'PL-27');
    if (
      /editable\/|selection|input|composition|repair|mutation|caret|android/.test(
        lower
      )
    ) {
      add(set, 'PL-22');
    }
    if (/component|hook|context|plugin|react|shell|root-key/.test(lower)) {
      add(set, 'PL-23');
    }
    if (/selector|runtime-live|node-ref/.test(lower)) add(set, 'PL-19');
    if (/announcement|aria/.test(lower)) add(set, 'PL-32');
    if (/package\.json|index\.[cm]?[jt]s/.test(lower)) add(set, 'PL-31');
  } else if (relative.startsWith('packages/plite/')) {
    if (/core\/change|document-change|root-change/.test(lower))
      add(set, 'PL-04');
    if (/builder|transaction-spec|public-state|transaction/.test(lower)) {
      add(set, 'PL-05');
    }
    if (/schema/.test(lower)) add(set, 'PL-09');
    if (/slice|fit/.test(lower)) add(set, 'PL-10');
    if (/property|mark|leaf-lifecycle/.test(lower)) add(set, 'PL-11');
    if (/representation|correction|normaliz/.test(lower)) add(set, 'PL-12');
    if (/extension/.test(lower)) add(set, 'PL-13', 'PL-14');
    if (/command/.test(lower)) add(set, 'PL-15');
    if (/query-middleware/.test(lower)) add(set, 'PL-16');
    if (/facet/.test(lower)) add(set, 'PL-17');
    if (/effect|field|codec|transaction-values/.test(lower)) add(set, 'PL-18');
    if (/commit|subscription|change-impact/.test(lower)) add(set, 'PL-19');
    if (/clipboard/.test(lower)) add(set, 'PL-20');
    if (/selection/.test(lower)) add(set, 'PL-07');
    if (/anchor|draft-ref/.test(lower)) add(set, 'PL-08');
    if (/snapshot|document-index|runtime-id|runtime-state/.test(lower)) {
      add(set, 'PL-03');
    }
    if (/path|point|range|location|node|travers|editor\//.test(lower)) {
      add(set, 'PL-02');
    }
    if (
      /editor-runtime|create-editor|public-state|normaliz|correction/.test(
        lower
      )
    ) {
      add(set, 'PL-06');
    }
    if (/document|root|element|text|interfaces\/editor/.test(lower)) {
      add(set, 'PL-01');
    }
    if (/package\.json|index\.[cm]?[jt]s/.test(lower)) add(set, 'PL-31');
    if (/clone|initial-value/.test(lower)) add(set, 'PL-01', 'PL-12');
    if (
      /editor-lifecycle-api|editor-query-runtime|insert-limit|semantic-update-method|target-runtime|tx-only|update-policy/.test(
        lower
      )
    ) {
      add(set, 'PL-06');
    }
    if (/get-fragment/.test(lower)) add(set, 'PL-10', 'PL-20');
    if (/listener-state/.test(lower)) add(set, 'PL-19');
    if (/profiling/.test(lower)) add(set, 'PL-30');
    if (/resolved-token-cursor/.test(lower)) add(set, 'PL-02', 'PL-03');
    if (/screen-reader-announcement/.test(lower)) add(set, 'PL-32');
    if (/fail-invariant/.test(lower)) add(set, 'PL-06');
    if (/types\/types|utils\/string|utils\/types/.test(lower)) {
      add(set, 'PL-02', 'PL-07');
    }
    if (/utils\/weak-maps/.test(lower)) add(set, 'PL-03');
    if (
      /utils\/(?:deep-equal|format-debug-value|is-object|modify)/.test(lower)
    ) {
      add(set, 'PL-06');
    }
  }

  if (
    /\/(?:changelog|readme)\.md$|\/(?:package|tsconfig(?:\.[^.]+)?|tsdown\.config)\.(?:json|[cm]?[jt]s)$/i.test(
      relative
    )
  ) {
    add(set, 'PL-31');
  }
  if (relative.startsWith('config/')) add(set, 'PL-30', 'PL-31');
  if (set.size === 0 && relative.startsWith('packages/plite-dom/')) {
    add(set, 'PL-21');
  }
  if (set.size === 0 && relative.startsWith('packages/plite-react/')) {
    add(set, 'PL-23');
  }
  if (set.size === 0 && relative.startsWith('packages/plite/')) {
    add(set, 'PL-31');
  }

  if (isProof) {
    add(set, 'PL-30');
    inferTestConcepts(relative, set);
  }

  return [...set].sort();
};

const declarationKind = (node) => {
  if (node.type === 'ClassDeclaration') return 'class';
  if (node.type === 'FunctionDeclaration') return 'function';
  if (node.type === 'TSInterfaceDeclaration') return 'interface';
  if (node.type === 'TSTypeAliasDeclaration') return 'type';
  if (node.type === 'TSEnumDeclaration') return 'enum';
  if (node.type === 'TSModuleDeclaration') return 'namespace';
  if (node.type === 'VariableDeclaration') return 'variable';

  return null;
};

const bindingNames = (name, result = []) => {
  if (!name) return result;
  if (name.type === 'Identifier') {
    result.push(name.name);
  } else if (name.type === 'ObjectPattern') {
    for (const property of name.properties) {
      bindingNames(
        property.type === 'RestElement' ? property.argument : property.value,
        result
      );
    }
  } else if (name.type === 'ArrayPattern') {
    for (const element of name.elements) bindingNames(element, result);
  } else if (name.type === 'AssignmentPattern') {
    bindingNames(name.left, result);
  } else if (name.type === 'RestElement') {
    bindingNames(name.argument, result);
  }

  return result;
};

const declarationNames = (node) => {
  if (node.type === 'VariableDeclaration') {
    return node.declarations.flatMap((declaration) =>
      bindingNames(declaration.name)
    );
  }
  if (node.id?.type === 'Identifier') {
    return [node.id.name];
  }

  return ['<anonymous>'];
};

const extractCodeDeclarations = (relative, content) => {
  const plugins = ['decorators-legacy', 'explicitResourceManagement'];

  if (/\.(?:[cm]?js|jsx|tsx)$/u.test(relative)) plugins.push('jsx');
  if (/\.[cm]?tsx?$/u.test(relative)) plugins.push('typescript');

  let source;

  try {
    source = babelParser.parse(content, {
      errorRecovery: true,
      plugins,
      sourceFilename: relative,
      sourceType: 'unambiguous',
    });
  } catch (error) {
    throw new Error(`Cannot parse ${relative}: ${error.message}`, {
      cause: error,
    });
  }
  const declarations = [];

  for (const statement of source.program.body) {
    const exported =
      statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration' ||
      statement.type === 'ExportAllDeclaration';

    if (statement.type === 'ExportAllDeclaration') {
      declarations.push({
        exported: true,
        kind: 're-export',
        line: statement.loc?.start.line ?? null,
        name: `* from ${statement.source.value}`,
      });
      continue;
    }
    if (
      statement.type === 'ExportNamedDeclaration' &&
      statement.declaration === null
    ) {
      for (const specifier of statement.specifiers) {
        declarations.push({
          exported: true,
          kind: 're-export',
          line: statement.loc?.start.line ?? null,
          name: specifier.exported.name ?? specifier.exported.value,
        });
      }
      continue;
    }

    const declaration =
      statement.type === 'ExportNamedDeclaration' ||
      statement.type === 'ExportDefaultDeclaration'
        ? statement.declaration
        : statement;
    const kind = declarationKind(declaration);

    if (!kind) continue;
    const line = statement.loc?.start.line ?? null;
    const names =
      statement.type === 'ExportDefaultDeclaration' &&
      declarationNames(declaration)[0] === '<anonymous>'
        ? ['default']
        : declarationNames(declaration);

    for (const name of names) {
      declarations.push({
        exported,
        kind,
        line,
        name,
      });
    }
  }

  return declarations;
};

const extractMarkdownDeclarations = (content) =>
  content.split(/\r?\n/u).flatMap((line, index) => {
    const match = /^(#{1,6})\s+(.+?)\s*$/u.exec(line);

    return match
      ? [
          {
            exported: false,
            kind: `heading-${match[1].length}`,
            line: index + 1,
            name: match[2],
          },
        ]
      : [];
  });

const extractJsonDeclarations = (content) => {
  try {
    const parsed = JSON.parse(content);

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.keys(parsed).map((name) => ({
          exported: false,
          kind: 'json-key',
          line: null,
          name,
        }))
      : [];
  } catch {
    return [];
  }
};

const extractYamlDeclarations = (content) =>
  content.split(/\r?\n/u).flatMap((line, index) => {
    const match = /^([A-Za-z0-9_-]+):(?:\s|$)/u.exec(line);

    return match
      ? [
          {
            exported: false,
            kind: 'yaml-key',
            line: index + 1,
            name: match[1],
          },
        ]
      : [];
  });

const extractDeclarations = (relative, content) => {
  if (/\.[cm]?[jt]sx?$/u.test(relative)) {
    return extractCodeDeclarations(relative, content);
  }
  if (relative.endsWith('.md')) return extractMarkdownDeclarations(content);
  if (relative.endsWith('.json')) return extractJsonDeclarations(content);
  if (/\.ya?ml$/u.test(relative)) return extractYamlDeclarations(content);

  return [];
};

const scopeFor = (relative) => {
  const exactRoot = directoryRoots.find(
    (root) => relative === root || relative.startsWith(`${root}/`)
  );

  return exactRoot ?? 'proof-toolchain';
};

const roleFor = (relative) => {
  const lower = relative.toLowerCase();

  if (relative.startsWith('docs/')) return 'documentation';
  if (relative.startsWith('benchmarks/')) return 'benchmark';
  if (
    /(^|\/)(test|tests|__tests__)\//.test(lower) ||
    /\.(?:api\.)?(?:spec|test|slow)\.[cm]?[jt]sx?$/.test(lower)
  ) {
    return 'test';
  }
  if (
    relative.startsWith('tooling/') ||
    relative.startsWith('.github/') ||
    relative.startsWith('apps/plite/scripts/')
  ) {
    return 'proof-tooling';
  }
  if (/\/src\//.test(relative) || relative.startsWith('apps/plite/src/')) {
    return 'source';
  }

  return 'package-metadata';
};

const entries = sourceFiles.map((file) => {
  const relative = normalizePath(file);
  const content = fs.readFileSync(file, 'utf8');
  const conceptIds = inferConcepts(relative);

  return {
    bytes: Buffer.byteLength(content),
    conceptIds,
    declarations: extractDeclarations(relative, content),
    lines: content === '' ? 0 : content.split(/\r?\n/u).length,
    path: relative,
    role: roleFor(relative),
    sha256: createHash('sha256').update(content).digest('hex'),
    scope: scopeFor(relative),
  };
});

const unmappedFiles = entries
  .filter((entry) => entry.conceptIds.length === 0)
  .map((entry) => entry.path);
const unmappedDeclarations = entries.flatMap((entry) =>
  entry.conceptIds.length === 0
    ? entry.declarations.map((declaration) => ({
        ...declaration,
        path: entry.path,
      }))
    : []
);

const countBy = (values) =>
  Object.fromEntries(
    [
      ...values.reduce((map, value) => {
        map.set(value, (map.get(value) ?? 0) + 1);
        return map;
      }, new Map()),
    ].sort(([left], [right]) => left.localeCompare(right))
  );

const extensionFor = (relative) => {
  const base = path.basename(relative);
  const dot = base.indexOf('.');

  return dot < 0 ? '<none>' : base.slice(dot);
};

const scopeCounts = Object.fromEntries(
  [...new Set(entries.map((entry) => entry.scope))].sort().map((scope) => {
    const scoped = entries.filter((entry) => entry.scope === scope);

    return [
      scope,
      {
        bytes: scoped.reduce((total, entry) => total + entry.bytes, 0),
        declarations: scoped.reduce(
          (total, entry) => total + entry.declarations.length,
          0
        ),
        files: scoped.length,
        lines: scoped.reduce((total, entry) => total + entry.lines, 0),
      },
    ];
  })
);

const roleCounts = Object.fromEntries(
  [...new Set(entries.map((entry) => entry.role))].sort().map((role) => {
    const scoped = entries.filter((entry) => entry.role === role);

    return [
      role,
      {
        bytes: scoped.reduce((total, entry) => total + entry.bytes, 0),
        declarations: scoped.reduce(
          (total, entry) => total + entry.declarations.length,
          0
        ),
        files: scoped.length,
        lines: scoped.reduce((total, entry) => total + entry.lines, 0),
      },
    ];
  })
);

const publicEntrypoints = entries
  .filter((entry) => {
    if (!/\/src\/(?:internal\/)?index\.ts$/u.test(entry.path)) return false;

    return (
      entry.path.startsWith('packages/plite') ||
      entry.path.startsWith('packages/browser/') ||
      entry.path.startsWith('packages/yjs/')
    );
  })
  .map((entry) => ({
    exportedDeclarations: entry.declarations.filter(
      (declaration) => declaration.exported
    ).length,
    path: entry.path,
  }));

const manifest = {
  concepts,
  coverage: {
    mappedDeclarations:
      entries.reduce((total, entry) => total + entry.declarations.length, 0) -
      unmappedDeclarations.length,
    mappedFiles: entries.length - unmappedFiles.length,
    unmappedDeclarations,
    unmappedFiles,
  },
  entries,
  provenance: {
    head: execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim(),
    roots: [...directoryRoots, ...fileRoots],
    sourceDigest: createHash('sha256')
      .update(
        entries.map((entry) => `${entry.path}\0${entry.sha256}\0`).join('')
      )
      .digest('hex'),
  },
  publicEntrypoints,
  summary: {
    bytes: entries.reduce((total, entry) => total + entry.bytes, 0),
    conceptFileCounts: countBy(entries.flatMap((entry) => entry.conceptIds)),
    declarations: entries.reduce(
      (total, entry) => total + entry.declarations.length,
      0
    ),
    extensionCounts: countBy(entries.map((entry) => extensionFor(entry.path))),
    files: entries.length,
    lines: entries.reduce((total, entry) => total + entry.lines, 0),
    roleCounts,
    scopeCounts,
  },
  version: 1,
};

if (unmappedFiles.length > 0 || unmappedDeclarations.length > 0) {
  console.error(
    JSON.stringify({ unmappedDeclarations, unmappedFiles }, null, 2)
  );
  process.exit(1);
}

const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (checkOnly) {
  const existing = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, 'utf8')
    : '';

  if (existing !== serialized) {
    console.error(
      'Plite source manifest is stale. Run plite-build-manifest.mjs.'
    );
    process.exit(1);
  }

  console.log(
    `Plite source manifest verified: ${manifest.summary.files} files, ${manifest.summary.declarations} declarations, 0 unmapped.`
  );
} else {
  fs.writeFileSync(outputPath, serialized);
  console.log(
    `Wrote ${path.relative(repoRoot, outputPath)}: ${
      manifest.summary.files
    } files, ${manifest.summary.declarations} declarations, 0 unmapped.`
  );
}

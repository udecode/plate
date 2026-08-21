import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, it } from 'node:test';

const repoRoot = resolve(import.meta.dir, '../../..');

const plitePackageDirectories = {
  '@platejs/browser': 'browser',
  '@platejs/plite': 'plite',
  '@platejs/plite-dom': 'plite-dom',
  '@platejs/plite-history': 'plite-history',
  '@platejs/plite-hyperscript': 'plite-hyperscript',
  '@platejs/plite-layout': 'plite-layout',
  '@platejs/plite-react': 'plite-react',
  '@platejs/yjs': 'yjs',
} as const;

const publicDocsRoots = [
  resolve(repoRoot, 'content/docs/plite'),
  resolve(repoRoot, 'content/docs/api/plite'),
];
const publicDocsIndex = 'content/docs/api/plite.mdx';
const publicExamplesRoot = resolve(
  repoRoot,
  'apps/www/src/app/(app)/examples/plite'
);
const browserProofRoot = resolve(repoRoot, 'apps/plite/tests/plite-browser');

const collectFiles = (directory: string, pattern: RegExp): string[] => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory)
    .flatMap((entry) => {
      const absolutePath = join(directory, entry);
      const stat = statSync(absolutePath);

      if (stat.isDirectory()) {
        if (
          entry === '.next' ||
          entry === 'dist' ||
          entry === 'node_modules' ||
          entry === 'out'
        ) {
          return [];
        }

        return collectFiles(absolutePath, pattern);
      }

      return stat.isFile() && pattern.test(absolutePath)
        ? [relative(repoRoot, absolutePath).replaceAll('\\', '/')]
        : [];
    })
    .sort();
};

const readSource = (relativePath: string) =>
  readFileSync(resolve(repoRoot, relativePath), 'utf-8');

const publicDocs = [
  publicDocsIndex,
  ...publicDocsRoots.flatMap((root) => collectFiles(root, /\.mdx?$/)),
]
  .filter((path) => !path.endsWith('.cn.mdx'))
  .sort();
const publicExamples = collectFiles(publicExamplesRoot, /\.(ts|tsx)$/);
const browserProofSpecs = collectFiles(browserProofRoot, /\.test\.ts$/);
const publicAuthoringFiles = [...publicDocs, ...publicExamples].sort();

const bannedPublicSurface = [
  {
    pattern: /(?<!schema\.)\b(?:elementProperty|textProperty)\b/,
    reason:
      'schema property declarations should use schema.elementProperty or schema.textProperty',
  },
  {
    pattern: /\bTransforms\./,
    reason: 'public Plite docs/examples should use editor.update',
  },
  {
    pattern:
      /\b(?:tx\.fragment\.insert|editor\.update(?:\([^)]*\))?\.fragment\.insert)\b/,
    reason: 'decoded content should use fitted slice replacement',
  },
  {
    pattern: /\boperations\.apply\b/,
    reason: 'canonical changes should use the changes transaction group',
  },
  {
    pattern:
      /\b(?:EditorTransformMiddleware|getEditorTransformRegistry|setEditorTransformRegistry)\b/,
    reason: 'pure command handlers replace transform middleware registries',
  },
  {
    pattern: /\b(?:extension\s+`transforms`|transforms\s*:)/i,
    reason: 'extension commands own typed semantic actions',
  },
  {
    pattern: /\beditor\.(selection|children|marks|intents)\b/,
    reason: 'public Plite docs/examples should use editor.read',
  },
  {
    pattern: /\beditor\.(apply|onChange)\b/,
    reason: 'public Plite docs/examples should not teach mutable hooks',
  },
  {
    pattern: /\busePliteView(State|Effect)\b/,
    reason: 'public Plite docs/examples should use root-named hooks',
  },
  {
    pattern: /\broot:\s*['"]main['"]/,
    reason: 'primary roots are implicit in public Plite APIs',
  },
  {
    pattern:
      /\b(?:change|commit\.changes)\.(?:changes|classifications|preserveEmptyRoots)\b|\.toJSON\(\)\.changes\b/,
    reason: 'DocumentChange keeps compact root changes private',
  },
  {
    pattern:
      /\b(?:roots|rootClassifications)\.(?:get|has)\(\s*['"]main['"]\s*\)|\broots\.main\b/,
    reason: 'the primary document never appears inside named-root collections',
  },
  {
    pattern: /\b(Slate v2|Plate Slate)\b|\bslate-v2\b/,
    reason: 'public Plite docs/examples should use Plite terminology',
  },
  {
    pattern:
      /\b(site\/examples|docs\/concepts|docs\/walkthroughs|playwright\/integration\/examples)\b/,
    reason: 'public Plite docs/examples should point at current repo paths',
  },
];

const bannedPublicTypeSlop = [
  /\bReactEditor<any>\b/,
  /:\s*any\b/,
  /\bany\[\]|\bArray<\s*any\s*>/,
  /\bas any\b/,
  /\bas never\b/,
  /@ts-expect-error/,
  /@ts-ignore/,
  /eslint-\u0064isable|biome-\u0069gnore/,
];

const getPackageExportSpecifiers = () => {
  const specifiers = new Set<string>();

  for (const [packageName, directoryName] of Object.entries(
    plitePackageDirectories
  )) {
    const packageJson = JSON.parse(
      readFileSync(
        resolve(repoRoot, 'packages', directoryName, 'package.json'),
        'utf-8'
      )
    ) as { exports?: Record<string, unknown> };

    for (const exportPath of Object.keys(packageJson.exports ?? {})) {
      if (exportPath === './package.json') {
        continue;
      }

      specifiers.add(
        exportPath === '.'
          ? packageName
          : `${packageName}/${exportPath.replace(/^\.\//, '')}`
      );
    }
  }

  return specifiers;
};

const importSpecifierPattern =
  /(?:from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

const getImportedPliteSpecifiers = (source: string) =>
  [...source.matchAll(importSpecifierPattern)]
    .map((match) => match[1] ?? match[2])
    .filter(
      (specifier): specifier is string =>
        typeof specifier === 'string' &&
        (specifier === '@platejs/browser' ||
          specifier.startsWith('@platejs/browser/') ||
          specifier === '@platejs/plite' ||
          specifier.startsWith('@platejs/plite') ||
          specifier === '@platejs/yjs' ||
          specifier.startsWith('@platejs/yjs/'))
    );

describe('Plite public surface contract', () => {
  it('scans the current Plate docs, examples, and browser proof roots', () => {
    assert.ok(publicDocs.length >= 50, 'expected Plite docs to be present');
    assert.ok(
      publicExamples.length >= 30,
      'expected Plite example sources to be present'
    );
    assert.ok(
      browserProofSpecs.length >= 30,
      'expected Plite browser proof specs to be present'
    );
  });

  it('keeps public docs and examples on current Plite API vocabulary', () => {
    const failures: string[] = [];

    for (const relativePath of publicAuthoringFiles) {
      const source = readSource(relativePath);

      for (const { pattern, reason } of bannedPublicSurface) {
        if (pattern.test(source)) {
          failures.push(`${relativePath}: ${reason}`);
        }
      }
    }

    assert.deepEqual(failures, []);
  });

  it('keeps public examples free of avoidable type slop', () => {
    const failures: string[] = [];

    for (const relativePath of publicExamples) {
      const source = readSource(relativePath);

      for (const pattern of bannedPublicTypeSlop) {
        if (pattern.test(source)) {
          failures.push(`${relativePath}: ${pattern}`);
        }
      }
    }

    assert.deepEqual(failures, []);
  });

  it('keeps public docs and examples importing real Plite package entrypoints', () => {
    const exportedSpecifiers = getPackageExportSpecifiers();
    const failures: string[] = [];

    for (const relativePath of publicAuthoringFiles) {
      for (const specifier of getImportedPliteSpecifiers(
        readSource(relativePath)
      )) {
        if (!exportedSpecifiers.has(specifier)) {
          failures.push(`${relativePath}: ${specifier}`);
        }
      }
    }

    assert.deepEqual(failures, []);
  });

  it('keeps app browser proof routes on /examples/plite/*', () => {
    const failures = browserProofSpecs
      .filter((relativePath) => {
        const source = readSource(relativePath);

        return (
          source.includes('/examples/') && !source.includes('/examples/plite/')
        );
      })
      .sort();

    assert.deepEqual(failures, []);
  });
});

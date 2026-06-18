import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const packageJsonPath = fileURLToPath(
  new URL('../../../package.json', import.meta.url)
);
const packagesPath = fileURLToPath(
  new URL('../../../packages', import.meta.url)
);
const changesetsPath = fileURLToPath(
  new URL('../../../.changeset', import.meta.url)
);

describe('release scripts contract', () => {
  it('keeps direct release entrypoints versioned before publish', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.scripts.changesetversion,
      'changeset version && bun install'
    );
    assert.ok(
      !/\bgit\s+add\b/.test(packageJson.scripts.changesetversion),
      'changesetversion must not stage the checkout as a side effect'
    );
    assert.equal(
      packageJson.scripts.release,
      'bun changesetversion && bun prerelease && changeset publish'
    );
    assert.equal(
      packageJson.scripts['release:latest'],
      'bun changesetversion && bun prerelease && changeset publish'
    );
    assert.equal(
      packageJson.scripts['release:next'],
      'bun changesetversion && bun prerelease && changeset publish --tag next'
    );
    assert.equal(
      packageJson.scripts['release:experimental'],
      'bun changesetversion && bun prerelease && changeset publish --tag experimental'
    );
    assert.equal(
      packageJson.scripts['internal:release:next'],
      'bun changesetversion && bun prerelease && changeset publish --tag next'
    );
  });

  it('keeps publish-only scripts available for CI after versioning', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };

    assert.equal(
      packageJson.scripts['release:publish:latest'],
      'changeset publish'
    );
    assert.equal(
      packageJson.scripts['release:publish:next'],
      'changeset publish --tag next'
    );
    assert.equal(
      packageJson.scripts['release:publish:experimental'],
      'changeset publish --tag experimental'
    );
  });

  it('keeps direct tsc typecheck scripts read-only', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };

    const emittingTypecheckScripts = Object.entries(packageJson.scripts)
      .filter(
        ([name, script]) =>
          name.startsWith('typecheck') && /\btsc\b/.test(script)
      )
      .filter(([, script]) => !/(?:^|\s)--noEmit(?:\s|$)/.test(script));

    assert.deepEqual(emittingTypecheckScripts, []);
  });

  it('keeps root Bun package tests from hiding package .test contracts', () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      scripts: Record<string, string>;
    };
    const testBun = packageJson.scripts['test:bun'];

    assert.match(testBun, /--path-ignore-patterns ''/);
    assert.match(testBun, /packages\/slate-yjs\/test/);
    assert.match(testBun, /bun --filter slate-browser test:core/);
    assert.doesNotMatch(testBun, /packages\/slate-browser\/test\/core/);
  });

  it('keeps consumer-facing package dependency ranges publishable', () => {
    const violations: string[] = [];
    const consumerDependencyFields = [
      'dependencies',
      'peerDependencies',
      'optionalDependencies',
    ] as const;

    for (const packageName of readdirSync(packagesPath)) {
      const packageJsonPath = join(packagesPath, packageName, 'package.json');

      if (!existsSync(packageJsonPath)) continue;

      const packageJson = JSON.parse(
        readFileSync(packageJsonPath, 'utf8')
      ) as Partial<
        Record<
          (typeof consumerDependencyFields)[number],
          Record<string, string>
        >
      > & {
        private?: boolean;
      };

      if (packageJson.private) continue;

      for (const field of consumerDependencyFields) {
        for (const [dependencyName, range] of Object.entries(
          packageJson[field] ?? {}
        )) {
          if (range.startsWith('workspace:')) {
            violations.push(`${packageName}.${field}.${dependencyName}`);
          }
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it('keeps public package npm metadata complete', () => {
    const violations: string[] = [];

    for (const packageName of readdirSync(packagesPath).sort()) {
      const packageJsonPath = join(packagesPath, packageName, 'package.json');

      if (!existsSync(packageJsonPath)) continue;

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        bugs?: { url?: string };
        description?: string;
        homepage?: string;
        keywords?: string[];
        license?: string;
        name?: string;
        private?: boolean;
        repository?: string;
      };

      if (packageJson.private) continue;

      const prefix = packageJson.name ?? packageName;
      const hasPackageReadme =
        existsSync(join(packagesPath, packageName, 'README.md')) ||
        existsSync(join(packagesPath, packageName, 'Readme.md'));

      if (!packageJson.description) violations.push(`${prefix}.description`);
      if (packageJson.license !== 'MIT') violations.push(`${prefix}.license`);
      if (
        packageJson.repository !== 'https://github.com/ianstormtaylor/slate.git'
      ) {
        violations.push(`${prefix}.repository`);
      }
      if (packageJson.homepage !== 'https://docs.slatejs.org/') {
        violations.push(`${prefix}.homepage`);
      }
      if (
        packageJson.bugs?.url !==
        'https://github.com/ianstormtaylor/slate/issues'
      ) {
        violations.push(`${prefix}.bugs.url`);
      }
      if (
        !Array.isArray(packageJson.keywords) ||
        packageJson.keywords.length === 0
      ) {
        violations.push(`${prefix}.keywords`);
      } else {
        const duplicateKeywords = packageJson.keywords.filter(
          (keyword, index) => packageJson.keywords!.indexOf(keyword) !== index
        );

        if (!packageJson.keywords.includes('@platejs/slate')) {
          violations.push(`${prefix}.keywords.slate`);
        }
        if (duplicateKeywords.length > 0) {
          violations.push(`${prefix}.keywords.duplicates`);
        }
      }
      if (!hasPackageReadme) violations.push(`${prefix}.readme`);
    }

    assert.deepEqual(violations, []);
  });

  it('keeps public package export maps typed and ESM-explicit', () => {
    const violations: string[] = [];

    for (const packageName of readdirSync(packagesPath).sort()) {
      const packageJsonPath = join(packagesPath, packageName, 'package.json');

      if (!existsSync(packageJsonPath)) continue;

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        exports?: Record<string, unknown>;
        name?: string;
        private?: boolean;
      };

      if (packageJson.private) continue;

      const prefix = packageJson.name ?? packageName;
      const exportMap = packageJson.exports;

      if (
        !exportMap ||
        Array.isArray(exportMap) ||
        typeof exportMap !== 'object'
      ) {
        violations.push(`${prefix}.exports`);
        continue;
      }

      for (const [subpath, entry] of Object.entries(exportMap)) {
        if (!entry || Array.isArray(entry) || typeof entry !== 'object') {
          violations.push(`${prefix}.exports.${subpath}`);
          continue;
        }

        const conditions = entry as Record<string, unknown>;

        for (const condition of ['types', 'import', 'default'] as const) {
          if (typeof conditions[condition] !== 'string') {
            violations.push(`${prefix}.exports.${subpath}.${condition}`);
          }
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it('keeps pending changesets to one major, one minor, and one patch per package', () => {
    const releasesByPackage = new Map<string, Set<string>>();
    const duplicateReleases: string[] = [];

    for (const file of readdirSync(changesetsPath).sort()) {
      if (!file.endsWith('.md') || file === 'README.md') continue;

      const source = readFileSync(join(changesetsPath, file), 'utf8');

      for (const match of source.matchAll(
        /^"([^"]+)":\s*(major|minor|patch)$/gm
      )) {
        const [, packageName, bump] = match;
        const releases =
          releasesByPackage.get(packageName) ?? new Set<string>();

        if (releases.has(bump)) {
          duplicateReleases.push(`${packageName}:${bump}:${file}`);
        }

        releases.add(bump);
        releasesByPackage.set(packageName, releases);
      }
    }

    assert.deepEqual(duplicateReleases, []);

    for (const [packageName, releases] of releasesByPackage) {
      assert.ok(
        releases.size <= 3,
        `${packageName} should have at most one major, one minor, and one patch changeset`
      );
    }
  });
});

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
const releasePackageDirectories = [
  'browser',
  'plite',
  'plite-dom',
  'plite-history',
  'plite-hyperscript',
  'plite-layout',
  'plite-react',
  'yjs',
];

const readRootPackageJson = () =>
  JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
    scripts: Record<string, string>;
  };

const readReleasePackageJson = (packageDirectory: string) =>
  JSON.parse(
    readFileSync(join(packagesPath, packageDirectory, 'package.json'), 'utf-8')
  ) as {
    bugs?: string | { url?: string };
    dependencies?: Record<string, string>;
    description?: string;
    exports?: Record<string, unknown>;
    homepage?: string;
    keywords?: string[];
    license?: string;
    name?: string;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    private?: boolean;
    repository?: string | { directory?: string; type?: string; url?: string };
  };

describe('release scripts contract', () => {
  it('keeps direct release entrypoints routed through the release script', () => {
    const packageJson = readRootPackageJson();

    assert.ok(
      !/\bgit\s+add\b/.test(packageJson.scripts['ci:release']),
      'release scripts must not stage the checkout as a side effect'
    );
    assert.equal(
      packageJson.scripts['ci:release'],
      'node tooling/scripts/release-packages.mjs'
    );
    assert.equal(
      packageJson.scripts['g:release:beta'],
      'node tooling/scripts/release-packages.mjs --channel beta'
    );
    assert.equal(packageJson.scripts['g:release:next'], 'pnpm g:release:beta');
  });

  it('keeps legacy direct publish entrypoints out of the root scripts', () => {
    const packageJson = readRootPackageJson();

    assert.equal(packageJson.scripts['release:publish:latest'], undefined);
    assert.equal(packageJson.scripts['release:publish:next'], undefined);
    assert.equal(
      packageJson.scripts['release:publish:experimental'],
      undefined
    );
  });

  it('keeps direct tsc typecheck scripts read-only', () => {
    const packageJson = readRootPackageJson();

    const emittingTypecheckScripts = Object.entries(packageJson.scripts)
      .filter(
        ([name, script]) =>
          name.startsWith('typecheck') && /\btsc\b/.test(script)
      )
      .filter(([, script]) => !/(?:^|\s)--noEmit(?:\s|$)/.test(script));

    assert.deepEqual(emittingTypecheckScripts, []);
  });

  it('keeps root Bun package tests from hiding package .test contracts', () => {
    const packageJson = readRootPackageJson();
    const testBun = packageJson.scripts['test:bun'];

    assert.equal(testBun, undefined);
    assert.equal(packageJson.scripts['test:plite'], 'pnpm plite:test');
    assert.match(
      packageJson.scripts['plite:test'],
      /--filter @platejs\/plite\b.* test/
    );
    assert.match(
      packageJson.scripts['plite:test'],
      /--filter @platejs\/browser\b.* test/
    );
    assert.equal(
      packageJson.scripts['plite:browser:test'],
      'pnpm --filter @platejs/browser test'
    );
  });

  it('keeps consumer-facing package dependency ranges publishable', () => {
    const violations: string[] = [];
    const consumerDependencyFields = [
      'dependencies',
      'peerDependencies',
      'optionalDependencies',
    ] as const;

    for (const packageName of releasePackageDirectories) {
      const packageJson = readReleasePackageJson(packageName);

      if (packageJson.private) continue;

      for (const field of consumerDependencyFields) {
        for (const [dependencyName, range] of Object.entries(
          packageJson[field] ?? {}
        )) {
          if (range === 'workspace:*') {
            violations.push(`${packageName}.${field}.${dependencyName}`);
          }
        }
      }
    }

    assert.deepEqual(violations, []);
  });

  it('keeps public package npm metadata complete', () => {
    const violations: string[] = [];

    for (const packageName of releasePackageDirectories) {
      const packageJson = readReleasePackageJson(packageName);

      if (packageJson.private) continue;

      const prefix = packageJson.name ?? packageName;
      const hasPackageReadme =
        existsSync(join(packagesPath, packageName, 'README.md')) ||
        existsSync(join(packagesPath, packageName, 'Readme.md'));

      if (!packageJson.description) violations.push(`${prefix}.description`);
      if (packageJson.license !== 'MIT') violations.push(`${prefix}.license`);
      if (
        typeof packageJson.repository !== 'object' ||
        packageJson.repository.type !== 'git' ||
        packageJson.repository.url !== 'https://github.com/udecode/plate.git' ||
        packageJson.repository.directory !== `packages/${packageName}`
      ) {
        violations.push(`${prefix}.repository`);
      }
      if (packageJson.homepage !== 'https://platejs.org') {
        violations.push(`${prefix}.homepage`);
      }
      const bugsUrl =
        typeof packageJson.bugs === 'string'
          ? packageJson.bugs
          : packageJson.bugs?.url;

      if (bugsUrl !== 'https://github.com/udecode/plate/issues') {
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

        if (!packageJson.keywords.includes('@platejs/plite')) {
          violations.push(`${prefix}.keywords.plite`);
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

    for (const packageName of releasePackageDirectories) {
      const packageJson = readReleasePackageJson(packageName);

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
        if (subpath === './package.json') {
          if (entry !== './package.json') {
            violations.push(`${prefix}.exports.${subpath}`);
          }
          continue;
        }

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

      const source = readFileSync(join(changesetsPath, file), 'utf-8');

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

import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  collectPackageTestFiles,
  createGenericTypecheckGates,
  discoverGenericTypeConfigs,
} from './check-core.mjs';

const temporaryRoots = [];
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

const createPackage = (config) => {
  const root = mkdtempSync(join(tmpdir(), 'check-core-'));
  const packageDir = join(root, 'packages', 'example');
  const testDir = join(packageDir, 'test');

  temporaryRoots.push(root);
  mkdirSync(testDir, { recursive: true });
  writeFileSync(
    join(packageDir, 'package.json'),
    JSON.stringify({ name: '@platejs/example' })
  );
  writeFileSync(
    join(testDir, 'tsconfig.generic-types.json'),
    typeof config === 'string' ? config : JSON.stringify(config)
  );

  return { packageDir, root, testDir };
};

test('typechecks generic files from their owning config and excludes them from Bun', () => {
  const { packageDir, root, testDir } = createPackage({
    files: ['./generic-command-contract.ts'],
  });
  const genericFile = join(testDir, 'generic-command-contract.ts');
  const runtimeContract = join(testDir, 'runtime-contract.ts');
  const runtimeTest = join(testDir, 'runtime.test.ts');

  writeFileSync(genericFile, 'declare const editor: unknown; void editor;');
  writeFileSync(
    runtimeContract,
    "import test from 'node:test'; test('ok', () => {});"
  );
  writeFileSync(
    runtimeTest,
    "import test from 'node:test'; test('ok', () => {});"
  );

  const configs = discoverGenericTypeConfigs(root);
  const gates = createGenericTypecheckGates(root, configs);
  const runtimeFiles = collectPackageTestFiles(
    { dir: packageDir, roots: ['test'] },
    new Set(configs.flatMap((config) => config.files))
  );

  assert.deepEqual(
    configs.map(({ files, name }) => ({ files, name })),
    [{ files: [genericFile], name: '@platejs/example' }]
  );
  assert.deepEqual(gates, [
    {
      args: [
        'exec',
        'tsc',
        '-p',
        'packages/example/test/tsconfig.generic-types.json',
        '--noEmit',
      ],
      command: 'pnpm',
      label: '@platejs/example generic type contracts (1 file)',
    },
  ]);
  assert.deepEqual(runtimeFiles, [runtimeContract, runtimeTest]);
});

test('rejects ambient value declarations from the Bun runtime inventory', () => {
  const { packageDir, root, testDir } = createPackage({
    files: ['./owned-contract.ts'],
  });
  const ownedContract = join(testDir, 'owned-contract.ts');
  const unownedContract = join(testDir, 'unowned-contract.ts');

  writeFileSync(ownedContract, 'declare const owned: unknown; void owned;');
  writeFileSync(
    unownedContract,
    'declare const unowned: unknown; void unowned;'
  );

  const configs = discoverGenericTypeConfigs(root);

  assert.throws(
    () =>
      collectPackageTestFiles(
        { dir: packageDir, roots: ['test'] },
        new Set(configs.flatMap((config) => config.files))
      ),
    /Runtime test contract .*unowned-contract\.ts contains a top-level ambient value declaration/
  );
});

test('owns every current Plite generic config outside its Bun inventory', () => {
  const configs = discoverGenericTypeConfigs(repoRoot);
  const genericFiles = new Set(configs.flatMap((config) => config.files));

  for (const name of [
    '@platejs/plite',
    '@platejs/plite-dom',
    '@platejs/plite-history',
    '@platejs/plite-react',
  ]) {
    assert.equal(
      configs.some((config) => config.name === name),
      true,
      name
    );
  }

  for (const config of configs) {
    const packageDir = dirname(dirname(config.configPath));
    const roots = ['src', 'test'].filter((root) =>
      existsSync(join(packageDir, root))
    );
    const runtimeFiles = collectPackageTestFiles(
      { dir: packageDir, roots },
      genericFiles
    );

    for (const file of config.files) {
      assert.equal(runtimeFiles.includes(file), false, file);
    }
  }
});

test('rejects malformed and missing generic type declarations', () => {
  const malformed = createPackage('{');

  assert.throws(
    () => discoverGenericTypeConfigs(malformed.root),
    /Invalid generic type config/
  );

  const missingList = createPackage({ compilerOptions: {} });

  assert.throws(
    () => discoverGenericTypeConfigs(missingList.root),
    /must declare a non-empty files array/
  );

  const missingFile = createPackage({ files: ['./missing-contract.ts'] });

  assert.throws(
    () => discoverGenericTypeConfigs(missingFile.root),
    /declares missing file/
  );
});

test('rejects generic type declarations outside the package test root', () => {
  const fixture = createPackage({ files: ['../outside-contract.ts'] });

  writeFileSync(join(fixture.packageDir, 'outside-contract.ts'), 'export {};');

  assert.throws(
    () => discoverGenericTypeConfigs(fixture.root),
    /outside its package test root/
  );
});

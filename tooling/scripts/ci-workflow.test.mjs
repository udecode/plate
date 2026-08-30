import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ciWorkflowPath = new URL(
  '../../.github/workflows/ci.yml',
  import.meta.url
);
const packageJsonPath = new URL('../../package.json', import.meta.url);
const wwwPackageJsonPath = new URL(
  '../../apps/www/package.json',
  import.meta.url
);
const wwwNextConfigPath = new URL(
  '../../apps/www/next.config.ts',
  import.meta.url
);
const wwwVercelConfigPath = new URL(
  '../../apps/www/vercel.json',
  import.meta.url
);

test('root CI bounds Turbo concurrency without changing check coverage', async () => {
  const [workflow, packageJson] = await Promise.all([
    readFile(ciWorkflowPath, 'utf-8'),
    readFile(packageJsonPath, 'utf-8').then(JSON.parse),
  ]);

  assert.match(
    workflow,
    /name: ✅ Check push[\s\S]{0,200}run: bun run check:push/
  );
  assert.match(workflow, /name: ✅ Check PR[\s\S]{0,200}run: bun check/);
  assert.match(packageJson.scripts.check, /pnpm typecheck/);
  assert.doesNotMatch(packageJson.scripts.check, /test:slowest/);
  assert.equal(packageJson.scripts['check:push'], 'pnpm check');
  assert.equal(packageJson.scripts.typecheck, 'pnpm g:typecheck');
  assert.match(packageJson.scripts['g:typecheck'], /--concurrency=2$/);
  assert.doesNotMatch(packageJson.scripts['g:typecheck'], /--only/u);
  assert.match(workflow, /\$\{\{ github\.workspace \}\}\/\.turbo/u);
  assert.match(workflow, /restore-keys:/u);
  assert.match(workflow, /bun-version: 1\.3\.12/u);
  for (const ownedPath of [
    "'apps/plite/scripts/**'",
    "'benchmarks/**'",
    "'config/**'",
  ]) {
    assert.equal(workflow.split(ownedPath).length - 1, 2, ownedPath);
  }
  assert.equal(workflow.match(/pnpm plite:test/g)?.length, 1);
  assert.equal(workflow.match(/pnpm plite:public-types/g)?.length, 1);
});

test('Vercel uses the repo-owned bounded www build', async () => {
  const [nextConfig, packageJson, vercelConfig, wwwPackageJson] =
    await Promise.all([
      readFile(wwwNextConfigPath, 'utf-8'),
      readFile(packageJsonPath, 'utf-8').then(JSON.parse),
      readFile(wwwVercelConfigPath, 'utf-8').then(JSON.parse),
      readFile(wwwPackageJsonPath, 'utf-8').then(JSON.parse),
    ]);

  assert.equal(vercelConfig.buildCommand, 'pnpm -w build:www:ci');
  assert.equal(
    packageJson.scripts['build:www:ci'],
    'turbo run build --filter=www... --concurrency=2'
  );
  assert.match(
    wwwPackageJson.scripts.build,
    /PLATE_WWW_WEBPACK=1 next build --webpack$/
  );
  assert.match(nextConfig, /process\.env\.PLATE_WWW_WEBPACK/);
  assert.match(nextConfig, /serverExternalPackages: \['ts-morph'\]/);
  assert.match(nextConfig, /transpilePackages: \['ts-morph'\]/);
  assert.match(nextConfig, /webpackBuildWorker: true/);
  assert.match(nextConfig, /webpackMemoryOptimizations: true/);
});

test('www typecheck refreshes complete Next route types', async () => {
  const packageJson = JSON.parse(await readFile(wwwPackageJsonPath, 'utf-8'));

  assert.match(
    packageJson.scripts.typecheck,
    /check-registry-source\.mts && next typegen && tsc --noEmit/
  );
});

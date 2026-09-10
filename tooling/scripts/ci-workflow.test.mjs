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

test('browser CI keeps coverage aggregation aligned with its affected build', async () => {
  const workflow = await readFile(
    new URL('../../.github/workflows/plite-ci.yml', import.meta.url),
    'utf-8'
  );
  const job = (name) =>
    workflow.split(`  ${name}:\n`)[1]?.split(/^ {2}[a-z][\w-]*:/m)[0];

  assert.match(
    job('proof-plan'),
    /browser: \$\{\{ steps.plan.outputs.browser \}\}/
  );
  assert.match(job('proof-plan'), /--dry-run --github-output/);
  assert.match(job('browser-build'), /needs: proof-plan/);
  assert.match(
    job('browser-build'),
    /needs.proof-plan.outputs.browser == 'true'/
  );
  assert.match(
    job('browser-chromium-merge'),
    /needs.browser-chromium.result != 'skipped'/
  );
  assert.match(job('browser-chromium'), /needs: browser-build/);
  assert.match(
    job('browser-build'),
    /run: node apps\/plite\/scripts\/build-app-if-stale.mjs/
  );
});

test('root CI retains package proof and watched inputs', async () => {
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
  assert.doesNotMatch(packageJson.scripts['g:typecheck'], /--only/u);
  assert.match(workflow, /\$\{\{ github\.workspace \}\}\/\.turbo/u);
  assert.match(workflow, /restore-keys:/u);
  for (const ownedPath of [
    "'apps/plite/scripts/**'",
    "'benchmarks/**'",
    "'config/**'",
  ]) {
    assert.equal(workflow.split(ownedPath).length - 1, 2, ownedPath);
  }
  assert.equal(workflow.match(/pnpm plite:test/g)?.length, 1);
  assert.equal(workflow.match(/pnpm plite:public-types/g)?.length, 1);
  assert.equal(workflow.match(/pnpm --filter @platejs\/cli test/g)?.length, 1);
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
  assert.match(packageJson.scripts['build:www:ci'], /--filter=www\.\.\./);
  assert.match(
    wwwPackageJson.scripts.build,
    /PLATE_WWW_WEBPACK=1 next build --webpack$/
  );
  assert.match(nextConfig, /process\.env\.PLATE_WWW_WEBPACK/);
});

test('www typecheck refreshes complete Next route types', async () => {
  const packageJson = JSON.parse(await readFile(wwwPackageJsonPath, 'utf-8'));

  const commands = packageJson.scripts.typecheck.split(' && ');
  const typegenIndex = commands.indexOf('next typegen');
  assert.ok(typegenIndex !== -1);
  assert.match(commands[typegenIndex - 1], /check-registry-source\.mts$/);
  assert.match(
    commands[typegenIndex + 1],
    /(?:tsc|typescript\/bin\/tsc) --noEmit/
  );
});

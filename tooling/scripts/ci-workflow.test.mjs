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
  assert.match(
    job('proof-plan'),
    /github\.event_name != 'pull_request'[\s\S]*github\.event\.pull_request\.head\.repo\.full_name != github\.repository[\s\S]*!startsWith\(github\.event\.pull_request\.head\.ref, 'changeset-release\/'\)/
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

const runCommands = (workflow) => {
  const commands = [];
  const lines = workflow.split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(\s*)run: (.*)$/u.exec(lines[index]);
    if (!match) continue;
    if (match[2] !== '|') {
      commands.push(match[2].trim());
      continue;
    }
    const block = [];
    while (
      index + 1 < lines.length &&
      (lines[index + 1].trim() === '' ||
        lines[index + 1].search(/\S/u) > match[1].length)
    ) {
      index += 1;
      block.push(lines[index].trim());
    }
    commands.push(block.filter(Boolean).join('\n'));
  }
  return commands;
};

test('pnpm check is the only gate the CI job runs', async () => {
  const [workflow, packageJson] = await Promise.all([
    readFile(ciWorkflowPath, 'utf-8'),
    readFile(packageJsonPath, 'utf-8').then(JSON.parse),
  ]);
  const gates = runCommands(workflow).filter((command) =>
    /\b(?:check|lint|test|tsc|typecheck|vitest)\b/u.test(command)
  );

  assert.equal(packageJson.scripts.check, 'node tooling/scripts/check.mjs');
  assert.deepEqual(
    gates,
    ['pnpm check'],
    'ci.yml gates only through pnpm check; add a new gate as a step in tooling/scripts/check.mjs.'
  );
  assert.match(workflow, /\$\{\{ github\.workspace \}\}\/\.turbo/u);
  assert.match(workflow, /restore-keys:/u);
});

test('every check script is a pnpm check step or says why it stays manual', async () => {
  const [packageJson, wwwPackageJson] = await Promise.all([
    readFile(packageJsonPath, 'utf-8').then(JSON.parse),
    readFile(wwwPackageJsonPath, 'utf-8').then(JSON.parse),
  ]);
  const { manualOnly, steps } = await import('./check.mjs');
  const scripts = {
    root: packageJson.scripts,
    www: wwwPackageJson.scripts,
  };
  const reachable = new Set();
  const commands = new Set(steps.map((step) => step.run));
  const queue = steps.map((step) => ['root', step.run]);

  while (queue.length > 0) {
    const [scope, command] = queue.pop();
    for (const [, filter, name] of command.matchAll(
      /pnpm (?:--filter (\S+) )?(?:run )?([\w:.-]+)/gu
    )) {
      const target = filter === 'www' ? 'www' : filter ? null : scope;
      const script = target && scripts[target][name];
      const key = `${target} ${name}`;
      if (!script || reachable.has(key)) continue;
      reachable.add(key);
      commands.add(script);
      queue.push([target, script]);
    }
  }

  const missing = Object.entries(scripts).flatMap(([scope, entries]) =>
    Object.entries(entries)
      .filter(
        ([name, command]) =>
          (/(?:^|:)(?:check|test|typecheck)(?::|$)/u.test(name) ||
            /--check\b/u.test(command)) &&
          name !== 'check' &&
          !reachable.has(`${scope} ${name}`) &&
          !commands.has(command) &&
          !Object.hasOwn(manualOnly, name)
      )
      .map(([name]) => `${scope} ${name}`)
  );

  assert.deepEqual(
    missing,
    [],
    'Add each check script to the steps in tooling/scripts/check.mjs, or to its manualOnly map with the reason it stays manual.'
  );
  const covered = Object.keys(manualOnly).filter((name) => {
    const scope = Object.hasOwn(packageJson.scripts, name) ? 'root' : 'www';
    const command = scripts[scope][name];
    assert.ok(
      command,
      `manualOnly names ${name}, which no package.json defines.`
    );
    return reachable.has(`${scope} ${name}`) || commands.has(command);
  });
  assert.deepEqual(
    covered,
    [],
    'pnpm check already runs these manualOnly scripts; delete their entries.'
  );
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

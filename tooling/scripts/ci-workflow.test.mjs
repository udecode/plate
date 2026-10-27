import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

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
    ['pnpm check --build'],
    'ci.yml gates only through pnpm check --build, which adds the production build; add a new gate as a step in tooling/scripts/check.mjs.'
  );
  assert.match(workflow, /\$\{\{ github\.workspace \}\}\/\.turbo/u);
  assert.match(workflow, /restore-keys:/u);
});

test('pnpm check runs the production build only with --build or by name', async () => {
  const { selectSteps } = await import('./check.mjs');
  const names = (args) => selectSteps(args).map((step) => step.name);

  assert.equal(names([]).includes('www-build'), false);
  assert.equal(names(['--build']).includes('www-build'), true);
  assert.deepEqual(names(['www-build']), ['www-build']);
  assert.deepEqual(
    names(['www', '--build']),
    ['www', 'www-build'],
    '--build adds the production build to named steps'
  );
});

test('pnpm check --affected runs the steps each change reaches', async () => {
  const { planAffected } = await import('./check.mjs');
  const skipped = (files) =>
    planAffected(files)
      .filter(({ command }) => !command)
      .map(({ step }) => step.name);
  const prose = [
    'AGENTS.md',
    '.agents/skills/plan-page/SKILL.md',
    'docs/plans/2026-10-19-landing-check.decisions.tsv',
    'docs/plans/2026-10-19-landing-check.md',
  ];

  assert.deepEqual(
    {
      prose: skipped(prose),
      skillsLock: skipped(prose).filter(
        (name) => !skipped([...prose, 'skills-lock.json']).includes(name)
      ),
      docsData: skipped(['docs/plite/reference/public-route-map.json']),
      browserSpec: skipped(['apps/www/tests/browser/suggestion.spec.ts']),
      cli: skipped(['packages/cli/src/generate.ts']),
      plite: skipped(['packages/plitejs/test/index.spec.ts']),
      lockfile: skipped(['pnpm-lock.yaml']),
    },
    {
      prose: [
        'lint',
        'lint-type-aware',
        'lint-baseline',
        'typecheck',
        'plite-app-typecheck',
        'type-tests',
        'test',
        'plite-test',
        'authored-order',
        'autoformat-rules',
        'public-types',
        'cli-test',
        'core-audits',
        'plite-bridge',
        'hook-generics',
        'value-records',
        'entrypoint-graph',
        'review-ledger',
        'knowledge',
        'toolbar-variants',
        'barrels',
        'www',
      ],
      skillsLock: ['lint'],
      docsData: [
        'test',
        'plite-test',
        'authored-order',
        'autoformat-rules',
        'cli-test',
        'review-ledger',
        'knowledge',
        'www',
      ],
      browserSpec: [
        'test',
        'plite-test',
        'authored-order',
        'autoformat-rules',
        'cli-test',
        'review-ledger',
        'knowledge',
      ],
      cli: [
        'plite-test',
        'authored-order',
        'autoformat-rules',
        'review-ledger',
        'knowledge',
      ],
      plite: ['autoformat-rules', 'review-ledger', 'knowledge'],
      lockfile: ['review-ledger'],
    }
  );
});

test('pnpm check --affected runs a tooling script with its tests and the steps that call it', async () => {
  const { planAffected } = await import('./check.mjs');
  const commands = (files) =>
    Object.fromEntries(
      planAffected(files).map(({ step, command }) => [step.name, command])
    );
  const planner = commands(['tooling/scripts/check.mjs']);

  assert.equal(planner.typecheck, null);
  assert.match(
    planner.test,
    /^pnpm test .*'tooling\/scripts\/ci-workflow\.test\.mjs'/u
  );
  assert.equal(
    commands(['tooling/scripts/check-plite-docs.mjs'])['core-audits'],
    'pnpm check:core'
  );
  assert.equal(
    commands(['tooling/scripts/brl.sh']).typecheck,
    'pnpm typecheck'
  );
  assert.doesNotMatch(
    commands(['.agents/skills/cleanup/scripts/scan.test.mjs']).test ?? '',
    /\.agents\/skills\//u
  );
});

test('pnpm check --affected runs an agent config file with the scripts that read it', async () => {
  const { planAffected } = await import('./check.mjs');
  const config = Object.fromEntries(
    planAffected(['.agents/pstack.json']).map(({ step, command }) => [
      step.name,
      command,
    ])
  );

  assert.equal(config.typecheck, null);
  assert.match(config.test, /'tooling\/scripts\/triage\.test\.mjs'/u);
});

test('pnpm check refuses --write with --build instead of dropping the build', () => {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('check.mjs', import.meta.url)),
      '--write',
      '--build',
    ],
    { encoding: 'utf-8' }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--build runs a step with no writer/u);
});

test('pnpm check refuses an unknown flag instead of ignoring it', () => {
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('check.mjs', import.meta.url)), '--list', '--help'],
    { encoding: 'utf-8' }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown flag: --help/u);
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

  const scriptsDir = new URL('./', import.meta.url);
  const fileRefs = (text) => [
    ...[...text.matchAll(/tooling\/scripts\/([\w.-]+\.mjs)/gu)].map(
      (match) => match[1]
    ),
    ...[...text.matchAll(/['"]\.\/([\w.-]+\.mjs)['"]/gu)].map(
      (match) => match[1]
    ),
  ];
  const reachFiles = async (startCommands) => {
    const files = new Set();
    const pending = [...startCommands].flatMap(fileRefs);
    while (pending.length > 0) {
      const file = pending.pop();
      if (files.has(file)) continue;
      files.add(file);
      const text = await readFile(new URL(file, scriptsDir), 'utf-8').catch(
        () => ''
      );
      pending.push(...fileRefs(text));
    }
    return files;
  };
  const gated = await reachFiles(commands);
  const manual = await reachFiles(
    Object.keys(manualOnly).map(
      (name) => packageJson.scripts[name] ?? wwwPackageJson.scripts[name]
    )
  );
  const scriptFiles = await readdir(scriptsDir);
  const orphans = scriptFiles
    .filter((file) => /^check-.*\.mjs$|-check\.mjs$/u.test(file))
    .filter((file) => !file.endsWith('.test.mjs'))
    .filter((file) => !gated.has(file) && !manual.has(file));

  assert.deepEqual(
    orphans,
    [],
    'Each check script file runs from a pnpm check step or a manualOnly script; wire it in or delete it.'
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
    /PLATE_WWW_WEBPACK=1 node scripts\/build-next\.mjs --webpack$/
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

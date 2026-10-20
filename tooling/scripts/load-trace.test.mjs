import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { globSync } from 'tinyglobby';

import {
  entrypointPackageNames,
  repoRoot,
} from '../entrypoints/entrypoint-turbo.mjs';
import { testModuleEffects } from '../entrypoints/test-module-effects.mjs';
import {
  effectProblems,
  runTraced,
  taskClosure,
  taskDependencies,
  taskInputFiles,
  traceProblems,
  tracedEnv,
} from './load-trace.mjs';

const fixtureDir = path.join(import.meta.dirname, '__fixtures__/load-trace');
const fixtureFile = (name) => path.join(fixtureDir, name);
const repoFile = (filename) => path.relative(repoRoot, filename);
const tempDir = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'load-trace-test-'));
const noHash = { files: new Set(), inputs: new Set() };
const declaredGlobs = Object.values(testModuleEffects).flatMap((effects) =>
  typeof effects === 'string'
    ? []
    : [...(effects.reads ?? []), ...(effects.runs ?? [])]
);
const declaredHash = {
  files: new Set(globSync(declaredGlobs, { cwd: repoRoot, dot: true })),
  inputs: new Set(declaredGlobs.map((glob) => `$TURBO_ROOT$/${glob}`)),
};
const unhashed = (names) =>
  names.map(
    (name) =>
      `${repoFile(fixtureFile(name))} was loaded but is outside the task's hash`
  );
const undeclared = (name, uses) =>
  `${repoFile(fixtureFile(name))} ${uses}, and tooling/entrypoints/test-module-effects.mjs does not say what that reaches`;
const writeTrace = (traceDir, loaded) => {
  fs.writeFileSync(path.join(traceDir, 'p.start'), '');
  fs.writeFileSync(path.join(traceDir, 'p.json'), JSON.stringify(loaded));
};
const fixtureProblems = (problems) =>
  problems.filter((problem) => problem.includes('__fixtures__'));
const registryModules = [
  'child.ts',
  'common.cjs',
  'computed.ts',
  'data.json',
  'evaluated.ts',
  'exited.ts',
  'exiting.ts',
  'query.ts',
  'registry.fixture.ts',
];

const runBun = (args, cwd = fixtureDir) => {
  const traceDir = tempDir();
  const run = spawnSync('bun', args, {
    cwd,
    encoding: 'utf-8',
    env: tracedEnv(traceDir),
  });

  assert.equal(run.status, 0, run.stderr);

  return traceDir;
};

const runVitest = (config, filters = []) => {
  const traceDir = tempDir();
  const run = spawnSync(
    'pnpm',
    ['exec', 'vitest', 'run', ...filters, '--config', fixtureFile(config)],
    {
      cwd: path.join(repoRoot, 'packages/plitejs'),
      encoding: 'utf-8',
      env: tracedEnv(traceDir),
    }
  );

  assert.equal(run.status, 0, run.stdout + run.stderr);

  return traceDir;
};

for (const [label, args, cwd] of [
  ['the fixture folder', ['test', './registry.fixture.ts'], fixtureDir],
  [
    "the platejs runner's command line",
    [
      `--config=${path.join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      `./${repoFile(fixtureFile('registry.fixture.ts'))}`,
    ],
    repoRoot,
  ],
]) {
  test(`the trace holds every module a Bun test and its Bun children load, from ${label}`, () => {
    const traceDir = runBun(args, cwd);
    const problems = traceProblems({
      effects: {
        ...testModuleEffects,
        [repoFile(fixtureFile('registry.fixture.ts'))]:
          'starts the children this test traces',
      },
      hash: declaredHash,
      runs: [{ command: 'bun test', traceDir }],
      testFiles: [fixtureFile('registry.fixture.ts')],
    });

    assert.ok(
      problems.includes(
        "tooling/config/load-trace-preload.ts was loaded but is outside the task's hash"
      )
    );
    assert.deepEqual(fixtureProblems(problems), unhashed(registryModules));
    assert.deepEqual(
      problems.filter(
        (problem) => !problem.endsWith("outside the task's hash")
      ),
      []
    );
  });
}

test('the trace holds every module a Vitest test loads, and refuses createRequire and computed imports without an entry', () => {
  const traceDir = runVitest('vitest/vitest.config.mjs', [
    'computed.fixture',
    'native.fixture',
  ]);
  const problems = traceProblems({
    effects: testModuleEffects,
    hash: noHash,
    runs: [{ command: 'vitest run', traceDir }],
    testFiles: ['computed.fixture.ts', 'native.fixture.ts'].map((name) =>
      fixtureFile(`vitest/${name}`)
    ),
  });

  assert.deepEqual(fixtureProblems(problems), [
    ...unhashed([
      'vitest/computed.fixture.ts',
      'vitest/computed.ts',
      'vitest/native.fixture.ts',
      'vitest/vitest.config.mjs',
    ]),
    undeclared(
      'vitest/computed.fixture.ts',
      'loads a module by a computed path'
    ),
    undeclared('vitest/native.fixture.ts', 'loads node:module'),
  ]);
});

test('a Vitest test that loads a module through the require Vitest injects needs an entry', () => {
  const traceDir = runVitest('vitest/vitest.config.mjs', ['required.fixture']);

  assert.ok(
    fixtureProblems(
      traceProblems({
        effects: testModuleEffects,
        hash: noHash,
        runs: [{ command: 'vitest run', traceDir }],
        testFiles: [fixtureFile('vitest/required.fixture.ts')],
      })
    ).includes(
      undeclared(
        'vitest/required.fixture.ts',
        'loads a module by a computed path'
      )
    )
  );
});

test('a Vitest config that loads a module by a computed path needs an entry', () => {
  const traceDir = runVitest('vitest/computed-config.vitest.config.mjs');

  assert.ok(
    fixtureProblems(
      traceProblems({
        effects: testModuleEffects,
        hash: noHash,
        runs: [{ command: 'vitest run', traceDir }],
        testFiles: [fixtureFile('vitest/computed.fixture.ts')],
      })
    ).includes(
      undeclared(
        'vitest/computed-config.vitest.config.mjs',
        'loads a module by a computed path'
      )
    )
  );
});

test('a helper that evicts itself after a computed require still fails the check through its loader', () => {
  const testFile = fixtureFile('evicting-helper/evicting-helper.fixture.ts');
  const traceDir = runBun(
    ['test', `./${path.basename(testFile)}`],
    path.dirname(testFile)
  );
  const problems = fixtureProblems(
    traceProblems({
      effects: testModuleEffects,
      hash: { ...declaredHash, files: new Set([repoFile(testFile)]) },
      runs: [{ command: 'bun test', traceDir }],
      testFiles: [testFile],
    })
  );

  assert.deepEqual(problems, [
    undeclared(
      'evicting-helper/evicting-helper.fixture.ts',
      'loads a module by a computed path'
    ),
  ]);
});

for (const [name, uses] of [
  ['aliased-require.ts', 'uses require other than in a direct call'],
  ['bun-destructured.ts', 'uses the Bun global'],
  ['bun-import.ts', 'loads bun'],
  ['bun-shell.ts', 'uses Bun.$'],
  ['computed-builtin.ts', 'loads a module by a computed path'],
  ['computed-require.ts', 'loads a module by a computed path'],
  ['mapped-require.ts', 'uses require other than in a direct call'],
  ['module-require.ts', 'uses require other than in a direct call'],
  ['process-binding.ts', 'uses process.binding'],
  ['registry-keys.ts', 'reads the module registry'],
  ['require-call.ts', 'uses require other than in a direct call'],
  ['template-builtin.ts', 'loads node:fs'],
  ['typescript-compiler.ts', 'runs the TypeScript compiler'],
]) {
  test(`a module that ${uses} (${name}) needs an entry`, () => {
    const file = repoFile(fixtureFile(`forms/${name}`));

    assert.deepEqual(effectProblems(file, {}, noHash), [
      undeclared(`forms/${name}`, uses),
    ]);
  });
}

test('a module that evicts through createRequire fails even with an entry', () => {
  const file = repoFile(fixtureFile('forms/registry-alias.ts'));

  assert.deepEqual(
    effectProblems(file, { [file]: 'evicts on purpose' }, noHash),
    [
      `${file} evicts modules from the module registry, which hides what it loads`,
    ]
  );
});

test('a module that passes the module registry to other code fails even with an entry, and one that lists its keys passes with one', () => {
  const passed = repoFile(fixtureFile('forms/registry-passed.ts'));
  const keys = repoFile(fixtureFile('forms/registry-keys.ts'));

  assert.deepEqual(
    effectProblems(passed, { [passed]: 'forgets modules on purpose' }, noHash),
    [
      `${passed} passes the module registry around, so the check cannot see what it changes`,
    ]
  );
  assert.deepEqual(
    effectProblems(keys, { [keys]: 'lists the loaded modules' }, noHash),
    []
  );
});

for (const name of ['method-import.ts', 'plain-bun.ts', 'require-reads.ts']) {
  test(`a module that only reads plain Bun members, imports types or calls an import method (${name}) needs no entry`, () => {
    assert.deepEqual(
      effectProblems(repoFile(fixtureFile(`forms/${name}`)), {}, noHash),
      []
    );
  });
}

test('a loaded module that reads files, starts processes or evicts modules must be declared and hashed', () => {
  const traceDir = tempDir();
  const names = ['evicting', 'plain', 'reader', 'spawner'].map((name) =>
    repoFile(fixtureFile(`effects/${name}.ts`))
  );
  const [evicting, , reader, spawner] = names;
  const data = repoFile(fixtureFile('data.json'));
  const run = (effects, inputs, files = names) =>
    traceProblems({
      effects,
      hash: { files: new Set(files), inputs: new Set(inputs) },
      runs: [{ command: 'bun test', traceDir }],
      testFiles: [],
    }).filter((problem) => !problem.includes('configures loaded modules'));

  writeTrace(
    traceDir,
    names.map((name) => path.join(repoRoot, name))
  );

  assert.deepEqual(run({ [reader]: { reads: [data] } }, []), [
    `${evicting} evicts modules from the module registry, which hides what it loads`,
    `${reader} reaches ${data}, which the task's hash leaves out`,
    `${spawner} uses Bun.spawnSync, and tooling/entrypoints/test-module-effects.mjs does not say what that reaches`,
  ]);
  assert.deepEqual(
    run(
      { [reader]: { reads: [data] }, [spawner]: 'prints the Bun version' },
      [`$TURBO_ROOT$/${data}`],
      [...names, data]
    ),
    [
      `${evicting} evicts modules from the module registry, which hides what it loads`,
    ]
  );
});

test('the check scans what a loaded module imports for its values and what its entry runs, even when the trace holds neither', () => {
  const traceDir = tempDir();
  const parent = repoFile(fixtureFile('runs/parent.ts'));
  const helper = repoFile(fixtureFile('runs/helper.ts'));
  const evicting = repoFile(fixtureFile('effects/evicting.ts'));
  const imported = repoFile(fixtureFile('runs/imported.ts'));
  const run = (effects) =>
    traceProblems({
      effects,
      hash: {
        files: new Set([parent, helper, evicting, imported]),
        inputs: new Set(
          [helper, evicting].map((file) => `$TURBO_ROOT$/${file}`)
        ),
      },
      runs: [{ command: 'bun test', traceDir }],
      testFiles: [],
    }).filter((problem) => !problem.includes('configures loaded modules'));

  writeTrace(traceDir, [path.join(repoRoot, parent)]);

  const effects = {
    [evicting]: 'evicts on purpose',
    [parent]: { runs: [helper, evicting] },
  };

  assert.deepEqual(run(effects), [
    `${evicting} evicts modules from the module registry, which hides what it loads`,
    `${helper} loads node:fs, and tooling/entrypoints/test-module-effects.mjs does not say what that reaches`,
    `${imported} loads node:fs, and tooling/entrypoints/test-module-effects.mjs does not say what that reaches`,
  ]);
  assert.deepEqual(
    run({
      ...effects,
      [helper]: 'reads only the fixture data',
      [imported]: 'checks only that its folder exists',
      [parent]: { runs: [helper] },
    }),
    []
  );
});

test("a declared glob whose files the task's own exclusions drop fails the check", () => {
  const reader = repoFile(fixtureFile('effects/reader.ts'));
  const glob = `${repoFile(fixtureDir)}/*.json`;

  assert.deepEqual(
    effectProblems(
      reader,
      { [reader]: { reads: [glob] } },
      { files: new Set([reader]), inputs: new Set([`$TURBO_ROOT$/${glob}`]) }
    ),
    [
      `${reader} reaches ${repoFile(fixtureFile('data.json'))}, which the task's hash excludes`,
    ]
  );
});

test('a loaded module whose tsconfig.json or the file it extends is outside the hash fails the check', () => {
  const traceDir = tempDir();
  const nested = repoFile(fixtureFile('tsconfig/nested.ts'));
  const configs = ['tsconfig/base.json', 'tsconfig/tsconfig.json'].map((name) =>
    repoFile(fixtureFile(name))
  );
  const run = (files) =>
    traceProblems({
      effects: {},
      hash: { files: new Set(files), inputs: new Set() },
      runs: [{ command: 'bun test', traceDir }],
      testFiles: [],
    });

  writeTrace(traceDir, [fixtureFile('tsconfig/nested.ts')]);

  assert.deepEqual(
    run([nested]),
    configs.map(
      (config) =>
        `${config} configures loaded modules but is outside the task's hash`
    )
  );
  assert.deepEqual(run([nested, ...configs]), []);
});

test('a loaded module whose tsconfig.json extends a package fails the check', () => {
  const traceDir = tempDir();

  writeTrace(traceDir, [fixtureFile('tsconfig/package/module.ts')]);

  assert.throws(
    () =>
      traceProblems({
        effects: {},
        hash: noHash,
        runs: [{ command: 'bun test', traceDir }],
        testFiles: [],
      }),
    /extends @tsconfig\/strictest\/tsconfig\.json, which the hash model cannot follow/
  );
});

test('a test process without a trace fails the check', () => {
  const silentDir = tempDir();
  const emptyDir = tempDir();

  fs.writeFileSync(path.join(silentDir, '7-a.start'), '');

  assert.deepEqual(
    traceProblems({
      effects: {},
      hash: noHash,
      runs: [
        { command: 'bun test a', traceDir: silentDir },
        { command: 'bun test b', traceDir: emptyDir },
      ],
      testFiles: [fixtureFile('registry.fixture.ts')],
    }),
    [
      'process 7-a of `bun test a` started but left no load trace',
      '`bun test b` left no load trace',
      `${repoFile(fixtureFile('registry.fixture.ts'))} ran but appears in no load trace`,
    ]
  );
});

test('the hash check skips dependencies, outside files and virtual modules', () => {
  const traceDir = tempDir();
  const outside = path.join(tempDir(), 'outside.ts');

  fs.writeFileSync(outside, '');
  writeTrace(traceDir, [
    fixtureFile('computed.ts'),
    `${fixtureFile('query.ts')}?v=1`,
    path.join(repoRoot, 'node_modules/tinyglobby/package.json'),
    outside,
    path.join(fixtureDir, '[eval]'),
    '\0virtual:entry',
    'bun:main',
  ]);

  assert.deepEqual(
    fixtureProblems(
      traceProblems({
        effects: {},
        hash: {
          files: new Set([repoFile(fixtureFile('computed.ts'))]),
          inputs: new Set(),
        },
        runs: [{ command: 'bun test', traceDir }],
        testFiles: [],
      })
    ),
    unhashed(['query.ts'])
  );
});

test('a test task that passes with a load outside its hash fails, and one inside it passes', () => {
  const taskId = 'plitejs#test:partition:core';
  const runWith = (loaded, status = 0) =>
    runTraced({ taskId, testFiles: [] }, (traceEnv) => {
      writeTrace(traceEnv('bun test', undefined).TEST_LOAD_TRACE_DIR, loaded);

      return status;
    });

  assert.equal(runWith([fixtureFile('computed.ts')]), 1);
  assert.equal(
    runWith([path.join(repoRoot, 'packages/plitejs/src/index.ts')]),
    0
  );
  assert.equal(runWith([fixtureFile('computed.ts')], 3), 3);
});

test('the hash model lists the files and dependencies Turbo hashes for every package test task', () => {
  const dryRun = spawnSync(
    path.join(repoRoot, 'node_modules/.bin/turbo'),
    [
      'run',
      'test',
      ...entrypointPackageNames.map((name) => `--filter=${name}`),
      '--dry=json',
    ],
    { cwd: repoRoot, encoding: 'utf-8', maxBuffer: 1 << 30 }
  );

  assert.equal(dryRun.status, 0, dryRun.stderr);

  const turboTasks = new Map(
    JSON.parse(dryRun.stdout.slice(dryRun.stdout.indexOf('{'))).tasks.map(
      (task) => [task.taskId, task]
    )
  );
  const testTasks = [...turboTasks.keys()].filter((taskId) =>
    taskId.includes('#test:partition:')
  );

  assert.ok(testTasks.length > 0);

  for (const taskId of new Set(testTasks.flatMap(taskClosure))) {
    const task = turboTasks.get(taskId);

    assert.deepEqual(
      taskInputFiles(taskId).sort(),
      Object.keys(task.inputs)
        .map((file) => path.posix.join(task.directory, file))
        .sort(),
      taskId
    );
    assert.deepEqual(
      taskDependencies(taskId).sort((a, b) => a.localeCompare(b)),
      [...task.dependencies].sort((a, b) => a.localeCompare(b)),
      taskId
    );
  }
});

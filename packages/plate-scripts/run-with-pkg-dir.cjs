#!/usr/bin/env node
'use strict';
/**
 * Cross-platform script to run package scripts with INIT_CWD and PROJECT_CWD set.
 * Runs commands directly to avoid shell variable expansion issues on Windows (${VAR:-default} is bash-only).
 */
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const [command, ...rawCommandArgs] = process.argv.slice(2);
const commandArgs =
  rawCommandArgs[0] === '--' ? rawCommandArgs.slice(1) : rawCommandArgs;
if (!command) {
  console.error('Usage: plate-pkg <command> [args...]');
  process.exit(1);
}

const PROJECT_CWD = path.resolve(__dirname, '..', '..');
const INIT_CWD = process.cwd();

const tsdownConfig = path.join(PROJECT_CWD, 'tooling/config/tsdown.config.ts');

function run(cmd, cmdArgs = [], options = {}) {
  const spawnOptions = {
    stdio: 'inherit',
    cwd: INIT_CWD,
    env: { ...process.env, INIT_CWD, PROJECT_CWD },
    ...options,
  };
  // On Windows, .cmd files must be run through cmd.exe
  if (
    process.platform === 'win32' &&
    (cmd.endsWith('.cmd') || cmd.endsWith('.CMD'))
  ) {
    return spawnSync('cmd', ['/c', cmd, ...cmdArgs], spawnOptions);
  }
  return spawnSync(cmd, cmdArgs, spawnOptions);
}

function runPnpm(script, scriptArgs = []) {
  const pnpmCmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  return run(pnpmCmd, ['exec', script, ...scriptArgs]);
}

const runTsdown = (watch = false) => {
  const tsdownBin = path.join(
    PROJECT_CWD,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'tsdown.cmd' : 'tsdown'
  );
  const args = ['--config', tsdownConfig, '--log-level', 'warn'];
  if (watch) args.push('--watch');
  const result = run(tsdownBin, [...args, ...commandArgs]);

  if (!watch && result.status === 0) {
    const buildTsconfig = path.join(INIT_CWD, 'tsconfig.build.json');

    return runPnpm('tsc', ['-p', buildTsconfig]);
  }

  return result;
};

let result;
switch (command) {
  case 'p:build':
  case 'p:tsdown':
    result = runTsdown(false);
    break;
  case 'p:build:watch':
    result = runTsdown(true);
    break;
  case 'p:clean':
    result = runPnpm('rimraf', ['dist', ...commandArgs]);
    break;
  case 'p:lint':
    result = runPnpm('biome', ['check', INIT_CWD, ...commandArgs]);
    break;
  case 'p:lint:fix':
    result = runPnpm('biome', ['check', INIT_CWD, '--fix', ...commandArgs]);
    break;
  case 'p:test': {
    const bunTestArgs = [
      'test',
      '--preload',
      path.join(PROJECT_CWD, 'tooling/config/bunTestSetup.ts'),
      ...commandArgs,
    ];
    result = runPnpm('bun', bunTestArgs);
    break;
  }
  case 'p:test:watch': {
    const bunTestArgs = [
      'test',
      '--watch',
      '--preload',
      path.join(PROJECT_CWD, 'tooling/config/bunTestSetup.ts'),
      ...commandArgs,
    ];
    result = runPnpm('bun', bunTestArgs);
    break;
  }
  case 'p:typecheck':
    result = runPnpm('tsc', [
      '-p',
      path.join(INIT_CWD, 'tsconfig.json'),
      ...commandArgs,
    ]);
    break;
  case 'p:brl': {
    const sh = process.platform === 'win32' ? 'sh' : 'sh';
    result = run(
      sh,
      [path.join(PROJECT_CWD, 'tooling/scripts/brl.sh'), ...commandArgs],
      {
        env: { ...process.env, INIT_CWD, PROJECT_CWD },
      }
    );
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}

process.exit(result?.status ?? 1);

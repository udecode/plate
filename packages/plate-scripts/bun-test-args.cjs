'use strict';

const path = require('node:path');

const BUN_TEST_OPTIONS_WITH_VALUES = new Set([
  '--coverage-dir',
  '--coverage-reporter',
  '--max-concurrency',
  '--path-ignore-patterns',
  '--reporter',
  '--reporter-outfile',
  '--rerun-each',
  '--retry',
  '--seed',
  '--test-name-pattern',
  '--timeout',
  '-t',
]);

const normalizePath = (value) => value.split(path.sep).join('/');

const toProjectPattern = (projectCwd, packageCwd, pattern) =>
  normalizePath(
    path.relative(
      projectCwd,
      path.isAbsolute(pattern) ? pattern : path.resolve(packageCwd, pattern)
    )
  );

const scopeTestArgs = (projectCwd, packageCwd, commandArgs) => {
  const scopedArgs = [];
  let expectsOptionValue = false;
  let hasPattern = false;
  let literalPatterns = false;

  for (const argument of commandArgs) {
    if (expectsOptionValue) {
      scopedArgs.push(argument);
      expectsOptionValue = false;
      continue;
    }
    if (argument === '--') {
      scopedArgs.push(argument);
      literalPatterns = true;
      continue;
    }
    if (!literalPatterns && argument.startsWith('-')) {
      scopedArgs.push(argument);
      expectsOptionValue = BUN_TEST_OPTIONS_WITH_VALUES.has(argument);
      continue;
    }

    scopedArgs.push(toProjectPattern(projectCwd, packageCwd, argument));
    hasPattern = true;
  }

  if (!hasPattern) {
    scopedArgs.push(`${normalizePath(path.relative(projectCwd, packageCwd))}/`);
  }

  return scopedArgs;
};

const createBunTestArgs = ({
  commandArgs = [],
  packageCwd,
  projectCwd,
  watch = false,
}) => [
  `--config=${path.join(projectCwd, 'bunfig.toml')}`,
  `--cwd=${projectCwd}`,
  'test',
  ...(watch ? ['--watch'] : []),
  ...scopeTestArgs(projectCwd, packageCwd, commandArgs),
];

module.exports = { createBunTestArgs };

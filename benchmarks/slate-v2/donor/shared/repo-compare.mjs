import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const nodeExecutable = process.versions.bun
  ? execFileSync('node', ['-p', 'process.execPath'], { encoding: 'utf8' }).trim()
  : process.execPath;

export const parsePackageManager = async (repo) => {
  const pkg = JSON.parse(await readFile(resolve(repo, 'package.json'), 'utf8'));
  const value = pkg.packageManager || '';

  if (value.startsWith('bun@')) {
    return 'bun';
  }

  if (value.startsWith('yarn@')) {
    return 'yarn';
  }

  if (value.startsWith('pnpm@')) {
    return 'pnpm';
  }

  return 'node';
};

export const run = (command, args, cwd, env = {}) =>
  new Promise((resolvePromise, rejectPromise) => {
    const streamStderr = env.BENCHMARK_PROGRESS === '1';
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderr += text;

      if (streamStderr) {
        process.stderr.write(text);
      }
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise({ stdout, stderr });
        return;
      }

      rejectPromise(
        new Error(
          `${command} ${args.join(' ')} failed in ${cwd}\n${stdout}\n${stderr}`
        )
      );
    });
  });

export const buildRepo = async (repo, packageManager, filter) => {
  if (packageManager === 'bun') {
    await run('bunx', ['turbo', 'build', '--filter', filter, '--force'], repo);
    return;
  }

  if (packageManager === 'yarn') {
    await run('yarn', ['build:rollup'], repo);
    return;
  }

  if (packageManager === 'pnpm') {
    await run('pnpm', ['turbo', 'build', '--filter', filter, '--force'], repo);
    return;
  }

  throw new Error(
    `Unsupported package manager for compare build: ${packageManager}`
  );
};

const linkWorkspacePackages = async (repo, runDirectory) => {
  const nodeModules = resolve(runDirectory, 'node_modules');

  for (const packageName of [
    'platejs',
    'plitejs',
    'slate',
    'slate-react',
    'slate-history',
  ]) {
    const packageDirectory = resolve(repo, 'packages', packageName);

    try {
      const manifest = JSON.parse(
        await readFile(resolve(packageDirectory, 'package.json'), 'utf8')
      );

      if (manifest.name !== packageName) continue;
    } catch {
      continue;
    }

    await mkdir(nodeModules, { recursive: true });
    await symlink(
      packageDirectory,
      resolve(nodeModules, packageName),
      process.platform === 'win32' ? 'junction' : 'dir'
    );
  }
};

export const benchmarkRepo = async ({
  benchmarkSource,
  env,
  repo,
}) => {
  const tempDir = resolve(repo, '.tmp', 'benchmarks');
  const runDirectory = resolve(
    tempDir,
    `run-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  const filePath = resolve(runDirectory, 'runner.mjs');

  await mkdir(runDirectory, { recursive: true });
  await linkWorkspacePackages(repo, runDirectory);
  await writeFile(filePath, benchmarkSource);

  let failed = false;

  try {
    const args = [];
    for (const [file, flag] of [
      ['.pnp.cjs', '--require'],
      ['.pnp.loader.mjs', '--experimental-loader'],
    ]) {
      const loader = resolve(repo, file);
      if (existsSync(loader)) args.push(flag, loader);
    }
    args.push(relative(repo, filePath));
    const result = await run(nodeExecutable, args, repo, env);

    return JSON.parse(result.stdout.trim());
  } catch (error) {
    failed = true;
    throw error;
  } finally {
    if (!failed || process.env.BENCHMARK_KEEP_FAILED_RUNNER !== '1') {
      await rm(runDirectory, { force: true, recursive: true });
    }
  }
};

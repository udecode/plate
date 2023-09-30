/* eslint-disable no-console */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import chokidar from 'chokidar';
import { GlobSync } from 'glob';

const foundPackageJson = new GlobSync('packages/*/package.json').found;

type PathToPackageNameMap = Map<string, string>;

const allPackages = foundPackageJson.reduce<PathToPackageNameMap>(
  (all, current) => {
    try {
      const packageJson = readFileSync(current, 'utf8');

      const packageJsonParsed = JSON.parse(packageJson) as {
        dependencies: Record<string, string>;
        name: string | undefined;
      };

      const packageName = packageJsonParsed.name;

      if (!packageName) {
        return all;
      }

      all.set(current, packageName);
    } catch (_) {}

    return all;
  },
  new Map()
);

const spawnWithPiping = async (command: string, args: string[]) => {
  const task = spawn(command, args, {
    stdio: 'inherit',
    detached: false,
    windowsHide: true,
  });

  task.stdout?.pipe(process.stdout);

  task.stderr?.pipe(process.stderr!);

  await new Promise<void>((resolve) => {
    task.on('close', () => {
      resolve();
    });
  });
};

chokidar
  .watch('packages/**/src/**/*.{ts,tsx}', {
    ignored: ['packages/**/node_modules', 'packages/**/dist'],
    persistent: true,
  })
  .on('change', async (path) => {
    const pkgJsonPath = path.replace(/\/src\/.*/, '/package.json');

    console.log(`Change detected in ${pkgJsonPath}`);

    const packageName = allPackages.get(pkgJsonPath);

    if (!packageName) {
      return;
    }

    console.log(`Change detected in ${packageName} rebuilding...`);

    console.time(`Build complete for ${packageName}`);

    await spawnWithPiping('turbo', ['run', 'build', `--filter=${packageName}`]);

    await spawnWithPiping('turbo', [
      'run',
      'build',
      `--filter=...^${packageName}`,
      '--filter=!www',
      '--filter=!e2e-examples',
      '--concurrency=90%',
    ]);

    console.timeEnd(`Build complete for ${packageName}`);
    console.log('Watching packages for changes...');
  })
  .on('ready', () => {
    console.log('Watching packages for changes...');
  })
  .on('error', (error) => {
    console.log(`Watcher error: ${error}`);
  });

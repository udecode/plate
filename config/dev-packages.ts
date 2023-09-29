/* eslint-disable no-console */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import chokidar from 'chokidar';
import { GlobSync } from 'glob';

const foundPackageJson = new GlobSync('packages/**/package.json').found;

type PackagesWithDependents = Map<string, Set<string>>;
type PathToPackageNameMap = Map<string, string>;

type AllPackages = {
  packagesWithDependents: PackagesWithDependents;
  pathToPackageNameMap: PathToPackageNameMap;
};

const allPackages = foundPackageJson.reduce<AllPackages>(
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

      all.pathToPackageNameMap.set(current, packageName);

      Object.keys(packageJsonParsed.dependencies)
        .filter((dependency: string) => dependency.startsWith('@udecode'))
        .forEach((dependency) => {
          const packageEntry =
            all.packagesWithDependents.get(dependency) || new Set();

          packageEntry.add(packageName);

          all.packagesWithDependents.set(dependency, packageEntry);
        });
    } catch (_) {}

    return all;
  },
  {
    packagesWithDependents: new Map(),
    pathToPackageNameMap: new Map(),
  }
);

const buildDependents = async (
  packageName: string,
  set = new Set<string>()
) => {
  const dependents = [
    ...(allPackages.packagesWithDependents.get(packageName) || []),
  ];

  if (dependents.length === 0) {
    return;
  }

  //comment this out to disable building dependents
  for (const dep of dependents) {
    if (set.has(dep)) {
      continue;
    }

    set.add(dep);

    const command = `yarn workspace ${dep} build`;
    console.log(`Building ${dep} ...`);
    const out = execSync(command);

    console.log(`Build complete for ${dep}:\n${out.toString()}`);

    buildDependents(dep, set);
  }
};

chokidar
  .watch('packages/**/src/**/*.{ts,tsx}', {
    ignored: ['packages/**/node_modules', 'packages/**/dist'],
    persistent: true,
  })
  .on('change', async (path) => {
    const pkgJsonPath = path.replace(/\/src\/.*/, '/package.json');

    const packageName = allPackages.pathToPackageNameMap.get(pkgJsonPath);

    if (!packageName) {
      return;
    }

    console.log(`Change detected in ${packageName} rebuilding...`);

    const command = `yarn workspace ${packageName} build`;

    const out = await execSync(command);

    console.log(`Build complete for ${packageName}:\n${out.toString()}`);

    buildDependents(packageName);

    console.log(`Rebuild complete`);
  })
  .on('ready', () => {
    console.log('Initial scan complete. Ready for changes');
  })
  .on('error', (error) => {
    console.log(`Watcher error: ${error}`);
  });

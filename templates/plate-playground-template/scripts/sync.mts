// sync plate packages
import { exec, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_PATH = path.join(__dirname, '../', './package.json');

async function getPackageJson() {
  try {
    const files = await fs.readFile(TARGET_PATH, 'utf8');

    return JSON.parse(files);
  } catch (error) {
    console.error('Error reading package.json:', error.message);

    throw error;
  }
}

async function fetchPackageVersion(pkg: string) {
  try {
    const { stdout } = await execPromise(`npm view ${pkg} version`);

    return stdout.trim();
  } catch (error) {
    console.error(`Error fetching version for ${pkg}:`, error.message);

    return null;
  }
}

async function fetchLatestVersions(packages: string[], packageJson: any) {
  console.info('Fetching latest plate versions in parallel...');

  const versionPromises = packages.map(async (pkg) => {
    const version = await fetchPackageVersion(pkg);

    if (version) {
      const currentVersion =
        packageJson.dependencies[pkg]?.replace(/^\D*/, '') ?? 'Not installed';

      return [pkg, { currentVersion, version }];
    }

    return null;
  });

  const results = await Promise.all(versionPromises);

  return new Map(results.filter(Boolean) as any);
}

async function updatePackageVersions(
  packageJson: any,
  versionMap: Map<string, { currentVersion: string; version: string }>
) {
  const updatedPackages: any[] = [];

  for (const [name, versions] of versionMap) {
    if (packageJson.dependencies[name]) {
      const { currentVersion, version: newVersion } = versions;

      if (currentVersion !== newVersion) {
        packageJson.dependencies[name] = newVersion;
        updatedPackages.push({ currentVersion, name, newVersion });
      }
    }
  }

  await fs.writeFile(TARGET_PATH, JSON.stringify(packageJson, null, 2));

  return updatedPackages;
}

async function main() {
  try {
    // Read package.json
    const packageJson = await getPackageJson();

    // Filter @udecode packages
    const INCLUDE_PACKAGES = Object.keys(packageJson.dependencies).filter(
      (pkg) => pkg.startsWith('@udecode')
    );

    // Fetch latest versions in parallel
    const versionMap = await fetchLatestVersions(INCLUDE_PACKAGES, packageJson);

    // Update package.json with new versions
    const updatedPackages = await updatePackageVersions(
      packageJson,
      versionMap as any
    );

    // Log results
    if (updatedPackages.length > 0) {
      console.log('\nThe following packages were updated.');
      updatedPackages.forEach(({ currentVersion, name, newVersion }) => {
        console.log(
          '\u001B[32m%s\u001B[0m',
          `${name}: ${currentVersion} -> ${newVersion}`
        );
      });

      console.info('\nRunning pnpm install...');

      try {
        const args = process.argv.slice(2);
        const shouldInstall = args.includes('--install');

        if (!shouldInstall) {
          console.info('Skipping pnpm install. Use --install flag to run it.');

          return;
        }

        execSync('pnpm install', { stdio: 'inherit' });
        console.info('pnpm install completed successfully.');
      } catch (error) {
        console.error('Error running pnpm install:', error.message);
        process.exit(1);
      }
    } else {
      console.info('\nNo packages were updated.');
    }
  } catch (error) {
    console.error('Error updating packages:', error.message);
    process.exit(1);
  }
}

main();

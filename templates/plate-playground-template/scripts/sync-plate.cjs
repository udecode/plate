// sync plate packages
const { exec } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const util = require('node:util');

const execPromise = util.promisify(exec);

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

async function fetchPackageVersion(pkg) {
  try {
    const { stdout } = await execPromise(`npm view ${pkg} version`);

    return stdout.trim();
  } catch (error) {
    console.error(`Error fetching version for ${pkg}:`, error.message);

    return null;
  }
}

async function fetchLatestVersions(packages, packageJson) {
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

  return new Map(results.filter(Boolean));
}

async function updatePackageVersions(packageJson, versionMap) {
  const updatedPackages = [];

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
      versionMap
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
      const { execSync } = require('node:child_process');

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

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const TARGET_PATH = path.join(__dirname, '../', './package.json');
const files = fs.readFileSync(TARGET_PATH);
const json = JSON.parse(files);

const INCLUDE_PACKAGES = new Set(
  Object.keys(json.dependencies).filter((pkg) => pkg.startsWith('@udecode'))
);

const versionMap = new Map();
const updatedPackages = [];

function fetchLatestVersions() {
  console.info('Fetching latest versions...');
  INCLUDE_PACKAGES.forEach((pkg) => {
    try {
      const version = execSync(`npm view ${pkg} version`, {
        encoding: 'utf8',
      }).trim();
      const currentVersion = json.dependencies[pkg]
        ? json.dependencies[pkg].replace(/^\D*/, '')
        : 'Not installed';
      console.info();
      console.info(`fetch success Package: ${pkg}`);
      console.info(`Current version: ${currentVersion}`);
      console.info(`Latest version: ${version}`);
      console.info(
        '#################################################################################'
      );
      versionMap.set(pkg, { currentVersion, version }); // Store both current and latest versions
    } catch (error) {
      console.error(`Error fetching version for ${pkg}: ${error.message}`);
    }
  });
}

function updatedVersion() {
  console.info('Updating package.json...');
  versionMap.forEach((versions, name) => {
    if (json.dependencies[name] && INCLUDE_PACKAGES.has(name)) {
      const currentVersion = versions.currentVersion;
      const newVersion = versions.version;

      if (currentVersion !== newVersion) {
        json.dependencies[name] = newVersion;
        updatedPackages.push({ currentVersion, name, newVersion });
      }
    }
  });

  fs.writeFileSync(TARGET_PATH, JSON.stringify(json, null, 2));

  console.info('Update success');
}

fetchLatestVersions();
updatedVersion();

if (updatedPackages.length > 0) {
  console.info('The following packages were updated:');
  updatedPackages.forEach((pkg) => {
    console.info(`${pkg.name}: ${pkg.currentVersion} -> ${pkg.newVersion}`);
  });
} else {
  console.info('No packages were updated.');
}

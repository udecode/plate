#!/usr/bin/env node

import { exec, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { Command } from 'commander';
import prompts from 'prompts';
import { z } from 'zod';
import packageJson from '../package.json';
import { getPackageManager } from './utils/get-package-manager';
import { handleError } from './utils/handle-error';
import { logger } from './utils/logger';
import { spinner as createSpinner } from './utils/spinner';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

const execPromise = promisify(exec);
const VERSION_PREFIX_REGEX = /^\D*/;

const DepSyncOptionsSchema = z.object({
  packageSpecifier: z.string().min(1, 'Package specifier is required.'),
  targetVersion: z.string().optional(),
  install: z.boolean().default(false),
  yes: z.boolean().default(false),
  cwd: z.string().default(process.cwd()),
  silent: z.boolean().default(false), // Added for global silent control
  latest: z.boolean().optional(), // Added for --latest flag
});

type DepSyncOptions = z.infer<typeof DepSyncOptionsSchema>;

async function getPackageJson(
  cwd: string,
  options: Pick<DepSyncOptions, 'silent'>
): Promise<any> {
  const targetPath = path.join(cwd, './package.json');
  const sp = createSpinner(`Reading package.json from ${targetPath}`, {
    silent: options.silent,
  })?.start();
  try {
    const fileContent = await fs.readFile(targetPath, 'utf8');
    sp?.succeed('Successfully read package.json');
    return JSON.parse(fileContent);
  } catch (error) {
    sp?.fail(`Error reading package.json at ${targetPath}`);
    handleError(error); // handleError will exit
    return null; // Should not be reached
  }
}

async function fetchPackageVersion(
  pkg: string,
  targetVersionString: string | undefined
): Promise<string | null> {
  try {
    const versionSpecifier = targetVersionString
      ? `${pkg}@"<=${targetVersionString}"`
      : pkg;
    const { stdout } = await execPromise(
      `npm view ${versionSpecifier} version --json`
    );
    const versions = JSON.parse(stdout);
    const latestMatchingVersion = Array.isArray(versions)
      ? versions.at(-1)
      : versions;

    if (latestMatchingVersion) {
      return latestMatchingVersion.trim();
    }
    return null;
  } catch (error: any) {
    logger.error(error.message);
    return null;
  }
}

async function fetchPackageVersions(
  packagesToFetch: string[],
  currentPackageJson: any,
  options: DepSyncOptions
): Promise<Map<string, { currentVersion: string; version: string }>> {
  const specifierDisplay = options.packageSpecifier
    ? ` matching "${options.packageSpecifier}"`
    : '';
  const fetchingMessage = options.targetVersion
    ? `Fetching latest package versions${specifierDisplay} (up to ${options.targetVersion})`
    : `Fetching latest package versions${specifierDisplay}`;
  logger.info(fetchingMessage);

  const sp = createSpinner('Fetching package versions in parallel...', {
    silent: options.silent,
  })?.start();

  const versionPromises = packagesToFetch.map(async (pkg) => {
    const version = await fetchPackageVersion(pkg, options.targetVersion);
    if (version) {
      const currentVersion =
        currentPackageJson.dependencies?.[pkg]?.replace(
          VERSION_PREFIX_REGEX,
          ''
        ) ||
        currentPackageJson.devDependencies?.[pkg]?.replace(
          VERSION_PREFIX_REGEX,
          ''
        ) ||
        'Not installed';
      return [pkg, { currentVersion, version }];
    }
    return null;
  });

  const results = await Promise.all(versionPromises);
  const versionMap = new Map<
    string,
    { currentVersion: string; version: string }
  >(results.filter(Boolean) as any);
  sp?.succeed('Finished fetching package versions.');
  return versionMap;
}

async function preparePackageUpdates(
  currentPackageJson: any,
  versionMap: Map<string, { currentVersion: string; version: string }>
): Promise<{
  updatedPackages: Array<{
    name: string;
    currentVersion: string;
    newVersion: string;
  }>;
  newPackageJsonString: string;
}> {
  const updatedPackages: Array<{
    name: string;
    currentVersion: string;
    newVersion: string;
  }> = [];
  const newPackageJson = JSON.parse(JSON.stringify(currentPackageJson)); // Deep clone

  for (const [name, versions] of Array.from(versionMap.entries())) {
    let changed = false;
    if (
      newPackageJson.dependencies?.[name] &&
      newPackageJson.dependencies[name].replace(VERSION_PREFIX_REGEX, '') !==
        versions.version
    ) {
      newPackageJson.dependencies[name] = versions.version; // Or keep prefix if present: `^${versions.version}`
      changed = true;
    }
    if (
      newPackageJson.devDependencies?.[name] &&
      newPackageJson.devDependencies[name].replace(VERSION_PREFIX_REGEX, '') !==
        versions.version
    ) {
      newPackageJson.devDependencies[name] = versions.version;
      changed = true;
    }

    if (changed) {
      updatedPackages.push({
        name,
        currentVersion: versions.currentVersion,
        newVersion: versions.version,
      });
    }
  }
  return {
    updatedPackages,
    newPackageJsonString: JSON.stringify(newPackageJson, null, 2),
  };
}

async function runSync(options: DepSyncOptions) {
  let mainSpinner = createSpinner('Starting dependency synchronization...', {
    silent: options.silent,
  })?.start();

  let packageFilterFn: (pkgName: string) => boolean;
  let matchDescription: string;

  if (options.packageSpecifier.endsWith('*')) {
    const prefix = options.packageSpecifier.slice(0, -1);
    packageFilterFn = (pkgName) => pkgName.startsWith(prefix);
    matchDescription = `packages starting with "${prefix}"`;
  } else if (
    options.packageSpecifier.startsWith('@') &&
    !options.packageSpecifier.includes('/')
  ) {
    const scopeAsExact = options.packageSpecifier;
    const scopeAsPrefix = `${options.packageSpecifier}/`;
    packageFilterFn = (pkgName) =>
      pkgName.startsWith(scopeAsPrefix) || pkgName === scopeAsExact;
    matchDescription = `packages in scope "${options.packageSpecifier}"`;
  } else {
    packageFilterFn = (pkgName) => pkgName === options.packageSpecifier;
    matchDescription = `package "${options.packageSpecifier}"`;
  }

  logger.info(`\nSynchronizing ${matchDescription}`);
  if (options.targetVersion) {
    logger.info(`Targeting version: ${options.targetVersion}`);
  }
  logger.info(`Working directory: ${options.cwd}`);

  if (!options.yes) {
    mainSpinner.stop();
    mainSpinner.clear();
    mainSpinner = createSpinner('Processing packages...', {
      silent: options.silent,
    })?.start();
  }

  const currentPackageJson = await getPackageJson(options.cwd, options);
  if (!currentPackageJson) return; // Error handled in getPackageJson

  const allDependencies = {
    ...currentPackageJson.dependencies,
    ...currentPackageJson.devDependencies,
  };

  const packagesToFetch = Object.keys(allDependencies).filter(packageFilterFn);

  if (packagesToFetch.length === 0) {
    mainSpinner.warn(
      `No packages found in dependencies for ${matchDescription}.`
    );
    if (
      options.packageSpecifier &&
      !options.packageSpecifier.endsWith('*') &&
      !options.packageSpecifier.includes('/')
    ) {
      logger.info(
        `Did you mean '${options.packageSpecifier}/*' or an exact package name like '${options.packageSpecifier}/some-package'?`
      );
    }
    return;
  }
  logger.info(
    `Found ${packagesToFetch.length} package${packagesToFetch.length === 1 ? '' : 's'} to check: ${packagesToFetch.join(', ')}`
  );

  const versionMap = await fetchPackageVersions(
    packagesToFetch,
    currentPackageJson,
    options
  );

  if (versionMap.size === 0 && packagesToFetch.length > 0) {
    mainSpinner.warn(
      'Could not fetch versions for any of the targeted packages.'
    );
    return;
  }
  if (versionMap.size === 0 && packagesToFetch.length === 0) {
    // This case is already handled by the packagesToFetch.length === 0 check above, but good for clarity
    mainSpinner.info('No packages matched the specifier.');
    return;
  }

  const { updatedPackages, newPackageJsonString } = await preparePackageUpdates(
    currentPackageJson,
    versionMap
  );
  mainSpinner.succeed('Package analysis complete.');

  if (updatedPackages.length > 0) {
    logger.info('The following packages will be updated:');
    updatedPackages.forEach(({ name, currentVersion, newVersion }) => {
      logger.log(`  ${name}: ${currentVersion} -> ${newVersion}`);
    });
    logger.break();

    let proceed = options.yes;
    if (!options.yes) {
      const { confirmUpdate } = await prompts({
        type: 'confirm',
        name: 'confirmUpdate',
        message: 'Apply these changes to package.json?',
        initial: true,
      });
      proceed = confirmUpdate;
    }

    if (proceed) {
      const writeSpinner = createSpinner('Updating package.json...', {
        silent: options.silent,
      })?.start();
      try {
        await fs.writeFile(
          path.join(options.cwd, './package.json'),
          newPackageJsonString
        );
        writeSpinner?.succeed('package.json updated successfully.');
      } catch (error) {
        writeSpinner?.fail('Error writing to package.json.');
        handleError(error);
        return;
      }

      // Decide whether to run install
      let shouldRunInstall = false;
      if (options.install) {
        // --install flag IS present
        shouldRunInstall = true;
      } else if (options.yes) {
        // --install flag IS NOT present, but --yes IS present
        shouldRunInstall = true;
      } else {
        // --install is NOT present, --yes is NOT present
        const { confirmInstall } = await prompts({
          type: 'confirm',
          name: 'confirmInstall',
          message:
            'Run package manager install command to apply these changes?',
          initial: true,
        });
        shouldRunInstall = confirmInstall;
      }

      if (shouldRunInstall) {
        const pm = await getPackageManager(options.cwd);
        const installCommand = `${pm} install`;
        const installSpinner = createSpinner(
          `Running \`${installCommand}\`...`,
          { silent: options.silent }
        )?.start();
        try {
          execSync(installCommand, {
            cwd: options.cwd,
            stdio: options.silent ? 'pipe' : 'inherit',
          });
          installSpinner?.succeed(`Successfully ran \`${installCommand}\``);
        } catch (error) {
          installSpinner?.fail(`Error running \`${installCommand}\``);
          handleError(error); // Will exit
          return;
        }
      } else if (
        updatedPackages.length > 0 &&
        !options.install &&
        options.yes
      ) {
        logger.info(
          'Skipping package installation as --install was not provided with --yes.'
        );
      } else if (updatedPackages.length > 0 && !shouldRunInstall) {
        logger.info('Skipping package installation.');
      }
    } else {
      logger.info('Changes to package.json were not applied by user.');
    }
  } else {
    logger.success('All specified packages are already up to date.');
    // Removed redundant logging here as installation prompting is handled above or not applicable
  }
  logger.break();
}

async function main() {
  const program = new Command();
  program
    .name('depset')
    .description(
      'Synchronize package dependencies to their latest or a specific version.'
    )
    .version(
      packageJson.version || '0.1.0',
      '-v, --version',
      'display the version number'
    )
    .argument(
      '[package-specifier]',
      'Package name or pattern (e.g., "@scope/foo*", "my-package", "@myorg")'
    )
    .argument(
      '[target-version]',
      'Target version (e.g., "1.2.3") - defaults to latest if omitted'
    )
    .option(
      '-i, --install',
      'Automatically run install after updating package.json',
      false
    )
    .option('-y, --yes', 'Skip all confirmation prompts', false)
    .option(
      '-c, --cwd <path>',
      'Set the current working directory',
      process.cwd()
    )
    .option('-s, --silent', 'Silence all output except for errors', false)
    .option(
      '-L, --latest',
      'Use the latest version, skip version prompt',
      false
    ) // Added --latest option
    .action(async (packageSpecifierArg, targetVersionArg, cliOpts) => {
      try {
        let pkgSpec = packageSpecifierArg;
        let targetVer = targetVersionArg;

        if (!pkgSpec && !cliOpts.yes) {
          const response = await prompts({
            type: 'text',
            name: 'packageSpecifier',
            message: 'Enter the package name or pattern to synchronize:',
            validate: (value) =>
              value && value.trim().length > 0
                ? true
                : 'Package specifier cannot be empty.',
          });
          if (!response.packageSpecifier) {
            logger.warn('Package specifier is required. Exiting.');
            return;
          }
          pkgSpec = response.packageSpecifier;
        } else if (!pkgSpec && cliOpts.yes) {
          logger.error('Error: package-specifier is required.');
          process.exit(1);
        }

        if (!targetVer && !cliOpts.yes && !cliOpts.latest) {
          // Skip if --latest is used
          const versionResponse = await prompts({
            type: 'text',
            name: 'targetVersion',
            message:
              'Enter the target version (e.g., "1.2.3", or leave blank for latest):',
          });
          targetVer = versionResponse.targetVersion || undefined;
        } else if (cliOpts.latest) {
          targetVer = undefined; // Ensure targetVer is undefined if --latest is used
        }

        // Merge CLI options with defaults from schema for parsing
        const rawOptions = {
          packageSpecifier: pkgSpec,
          targetVersion: targetVer,
          install: cliOpts.install,
          yes: cliOpts.yes,
          cwd: cliOpts.cwd,
          silent: cliOpts.silent,
          latest: cliOpts.latest, // Added latest to rawOptions
        };
        const options = DepSyncOptionsSchema.parse(rawOptions);
        if (options.silent) {
          // Suppress non-error console logs if silent is true
          logger.info = () => {};
          logger.success = () => {};
          logger.warn = () => {};
          logger.log = () => {};
          logger.break = () => {};
        }
        await runSync(options);
      } catch (error) {
        // Ensure logger still works for handleError even if silenced
        const originalLogger = { ...logger };
        if (cliOpts.silent) {
          logger.error = console.error; // Fallback for errors
          logger.break = () => console.log('');
        }
        handleError(error);
        // Restore logger if it was modified
        if (cliOpts.silent) {
          Object.assign(logger, originalLogger);
        }
      }
    });

  await program.parseAsync(process.argv);
}

main();

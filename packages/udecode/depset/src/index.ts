#!/usr/bin/env node

import { execFile, execFileSync } from 'node:child_process';
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

const execFilePromise = promisify(execFile);
const VERSION_PREFIX_REGEX = /^\D*/;

const PackageJsonSchema = z
  .object({
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
  })
  .passthrough();
const NpmVersionsSchema = z.union([z.string(), z.array(z.string())]);

const DepSyncOptionsSchema = z.object({
  packageSpecifier: z.string().min(1, 'Package specifier is required.'),
  targetVersion: z.string().optional(),
  install: z.boolean().default(false),
  yes: z.boolean().default(false),
  cwd: z.string().default(process.cwd()),
  silent: z.boolean().default(false),
});

type DepSyncOptions = z.infer<typeof DepSyncOptionsSchema>;
type PackageJson = z.infer<typeof PackageJsonSchema>;

const CliOptionsSchema = z.object({
  cwd: z.string(),
  install: z.boolean(),
  latest: z.boolean(),
  silent: z.boolean(),
  yes: z.boolean(),
});

async function getPackageJson(
  cwd: string,
  options: Pick<DepSyncOptions, 'silent'>
): Promise<PackageJson> {
  const targetPath = path.join(cwd, './package.json');
  const sp = createSpinner(`Reading package.json from ${targetPath}`, {
    silent: options.silent,
  })?.start();
  try {
    const fileContent = await fs.readFile(targetPath, 'utf-8');
    sp?.succeed('Successfully read package.json');
    return PackageJsonSchema.parse(JSON.parse(fileContent));
  } catch (error) {
    sp?.fail(`Error reading package.json at ${targetPath}`);
    return handleError(error);
  }
}

async function fetchPackageVersion(
  pkg: string,
  targetVersionString: string | undefined
): Promise<string | null> {
  try {
    const versionSpecifier = targetVersionString
      ? `${pkg}@<=${targetVersionString}`
      : pkg;
    const { stdout } = await execFilePromise('npm', [
      'view',
      versionSpecifier,
      'version',
      '--json',
    ]);
    const versions = NpmVersionsSchema.parse(JSON.parse(stdout));
    const latestMatchingVersion = Array.isArray(versions)
      ? versions.at(-1)
      : versions;

    if (latestMatchingVersion) {
      return latestMatchingVersion.trim();
    }
    return null;
  } catch (error) {
    logger.error(error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function fetchPackageVersions(
  packagesToFetch: string[],
  currentPackageJson: PackageJson,
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
      return [pkg, { currentVersion, version }] as const;
    }
    return null;
  });

  const results = await Promise.all(versionPromises);
  const versionMap = new Map(results.filter((result) => result !== null));
  sp?.succeed('Finished fetching package versions.');
  return versionMap;
}

async function preparePackageUpdates(
  currentPackageJson: PackageJson,
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
  const newPackageJson = structuredClone(currentPackageJson);

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
      proceed = confirmUpdate === true;
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
      }

      // Decide whether to run install
      let shouldRunInstall = options.install;
      if (!options.install && !options.yes) {
        const { confirmInstall } = await prompts({
          type: 'confirm',
          name: 'confirmInstall',
          message:
            'Run package manager install command to apply these changes?',
          initial: true,
        });
        shouldRunInstall = z.boolean().parse(confirmInstall);
      }

      if (shouldRunInstall) {
        const pm = await getPackageManager(options.cwd);
        const installCommand = `${pm} install`;
        const installSpinner = createSpinner(
          `Running \`${installCommand}\`...`,
          { silent: options.silent }
        )?.start();
        try {
          execFileSync(pm, ['install'], {
            cwd: options.cwd,
            stdio: options.silent ? 'pipe' : 'inherit',
          });
          installSpinner?.succeed(`Successfully ran \`${installCommand}\``);
        } catch (error) {
          installSpinner?.fail(`Error running \`${installCommand}\``);
          handleError(error);
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
    )
    .action(
      async (
        packageSpecifierArg: string | undefined,
        targetVersionArg: string | undefined,
        rawCliOptions: unknown
      ) => {
        try {
          const cliOpts = CliOptionsSchema.parse(rawCliOptions);
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
            pkgSpec = z.string().parse(response.packageSpecifier);
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
            targetVer = z
              .string()
              .optional()
              .parse(versionResponse.targetVersion || undefined);
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
          const silent =
            typeof rawCliOptions === 'object' &&
            rawCliOptions !== null &&
            'silent' in rawCliOptions &&
            rawCliOptions.silent === true;

          if (silent) {
            logger.error = console.error;
            logger.break = () => console.log('');
          }
          handleError(error);
        }
      }
    );

  await program.parseAsync(process.argv);
}

void main();

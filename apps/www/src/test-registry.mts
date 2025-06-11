#!/usr/bin/env node

/*
 * Test Registry Script
 *
 * Usage:
 *   pnpm test-registry                    # Test all configured items
 *   pnpm test-registry <item1> <item2>    # Test specific items
 *
 * Options:
 *   --force           Ignore cache for individual test groups and rerun them
 *   --force-template  Rebuild the base template (slow, rarely needed)
 *
 * Config file: scripts/test-registry-config.json
 */

import type { RegistryItem } from 'shadcn/registry';

import kleur from 'kleur';
import { type ListrTaskWrapper, Listr } from 'listr2';
import { exec, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import ora from 'ora'; // For the initial template setup spinner
import { rimraf } from 'rimraf';
import { z } from 'zod'; // Import Zod

import { registryBlocks } from '../src/registry/registry-blocks';
import { registryKits } from '../src/registry/registry-kits';

const registryItems = [...registryBlocks, ...registryKits];

const execAsync = promisify(exec);

const DIR_NAME = 'test-registry';
const TEMPLATE_DIR_NAME = 'template';
const CONFIG_FILE_NAME = 'scripts/test-registry-config.json';
const META_CACHE_FILENAME = '.meta.cache'; // New constant for the cache file name

const BASE_TEST_DIR = path.resolve(process.cwd(), '..', '..', '..', DIR_NAME);
const TEMPLATE_DIR = path.join(BASE_TEST_DIR, TEMPLATE_DIR_NAME);
// const CACHE_DIR = path.join(BASE_TEST_DIR, '.cache'); // CACHE_DIR is no longer needed for group caches

const TEMPLATE_CACHE_MARKER = path.join(TEMPLATE_DIR, '.template-success');
const CONFIG_FILE_PATH = path.join(process.cwd(), CONFIG_FILE_NAME);

// Zod Schema for Config
const TestGroupSchema = z.union([z.string(), z.array(z.string())]);
const ConfigSchema = z.object({
  blocks: z.union([z.boolean(), z.array(z.string())]).optional(),
  groups: z.array(TestGroupSchema).optional(),
  kits: z.union([z.boolean(), z.array(z.string())]).optional(),
  scripts: z.array(z.string()).optional(),
});

// Type inferred from Zod schema
type Config = z.infer<typeof ConfigSchema>;

type FileItem = {
  path: string;
  type: string;
  target?: string;
};

const defaultConfig: Config = {
  blocks: true, // Default to testing all blocks
  groups: [],
  kits: false, // Default to not testing kits
  scripts: [], // Default to no additional scripts
};

const copyDirRecursiveSync = (src: string, dest: string) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyDirRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const createOrUpdateTemplate = async (force = false) => {
  const templateSpinner = ora({
    stream: process.stdout,
    text: kleur.cyan('Setting up template...'),
  }).start();

  if (!force && fs.existsSync(TEMPLATE_CACHE_MARKER)) {
    templateSpinner.succeed(kleur.green('Template (cached)'));
    return true;
  }

  try {
    templateSpinner.text = kleur.cyan('Cleaning...');
    if (fs.existsSync(TEMPLATE_DIR)) {
      await rimraf(TEMPLATE_DIR);
    }
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });

    templateSpinner.text = kleur.cyan('Creating Next.js app...');
    execSync(
      `npx create-next-app@latest ${TEMPLATE_DIR_NAME} --tailwind --eslint --typescript --app --no-src-dir --use-pnpm --turbopack --import-alias '@/*' --silent`,
      { cwd: BASE_TEST_DIR, stdio: 'pipe' }
    );

    templateSpinner.text = kleur.cyan('Initializing shadcn...');
    execSync(`npx shadcn@latest init --base-color neutral -y -s`, {
      cwd: TEMPLATE_DIR,
      stdio: 'pipe',
    });

    fs.writeFileSync(TEMPLATE_CACHE_MARKER, new Date().toISOString());
    templateSpinner.succeed(kleur.green('Template'));
    return true;
  } catch (error: any) {
    templateSpinner.fail(kleur.red('Template failed'));
    console.error(kleur.red('Template creation failed:'));
    if (error.stderr?.toString().trim()) {
      console.error(kleur.dim(error.stderr.toString().trim()));
    } else if (error.stdout?.toString().trim()) {
      console.error(kleur.dim(error.stdout.toString().trim()));
    }
    if (error.message) {
      console.error(kleur.yellow(error.message));
    }
    if (!error.stderr && !error.stdout && !error.message) {
      console.error(error);
    }
    return false;
  }
};

const runCommand = async (
  command: string,
  options: { cwd: string },
  task: ListrTaskWrapper<any, any, any>,
  stepTitle?: string
) => {
  if (stepTitle) {
    task.output = kleur.dim(stepTitle);
  }
  try {
    const { stderr, stdout } = await execAsync(command, {
      ...options,
      encoding: 'utf8',
    });
    if (stderr) {
      task.output = kleur.yellow(stderr); // Log stderr as a warning or info
    }
    if (stdout) {
      task.output = kleur.dim(stdout); // Log stdout if needed, or ignore for less verbosity
    }
    return { stderr, stdout };
  } catch (error: any) {
    let errorString = kleur.red(`Command failed: ${command}\n`);

    if (error.stdout?.toString().trim()) {
      errorString += kleur.dim(error.stdout.toString().trim()) + '\n';
    }

    if (error.stderr?.toString().trim()) {
      errorString += kleur.dim(error.stderr.toString().trim()) + '\n';
    }

    if (
      !error.stdout?.toString().trim() &&
      !error.stderr?.toString().trim() &&
      error.message
    ) {
      errorString += kleur.yellow(`Error: ${error.message}\n`);
    }

    throw new Error(errorString);
  }
};

const testItemsGroup = async (
  itemNames: string[], // Items to install (e.g., ['image'] or ['table', 'resizable'])
  groupDirName: string, // Name for the directory under BASE_TEST_DIR (e.g., 'image' or 'table-resizable')
  // Also used for the .cache file name in CACHE_DIR (e.g., image.cache)
  baseTemplateSourceDir: string, // Source to clone from (TEMPLATE_DIR or a cached block dir)
  preserveOutputOnSuccess: boolean, // If true, targetDir is NOT rimraf'd on success
  force = false,
  task: ListrTaskWrapper<any, any, any>,
  baseBlockNameIfCloned?: string, // Name of the block used as base, if cloned
  runAdditionalScripts = false, // Whether to run additional scripts from config
  additionalScripts: string[] = [] // Scripts to run after TypeScript check
): Promise<void> => {
  const targetDir = path.join(BASE_TEST_DIR, groupDirName);
  // const itemGroupCacheFile = path.join(CACHE_DIR, `${groupDirName}.cache`);
  const itemGroupCacheFile = path.join(targetDir, META_CACHE_FILENAME);
  let effectiveSkipReason = '';

  if (!force && fs.existsSync(itemGroupCacheFile)) {
    let cacheIsValid = false;
    let outdatedOrCorrupted = false;

    try {
      const cachedContent = fs.readFileSync(itemGroupCacheFile, 'utf8');
      const parsedCachedArray: RegistryItem[] = JSON.parse(
        cachedContent
      ) as RegistryItem[];

      if (!Array.isArray(parsedCachedArray)) {
        throw new TypeError('Cache content is not an array.');
      }

      const currentDefinitionsForComparison: Partial<RegistryItem>[] = [];
      for (const itemName of itemNames) {
        let currentDef: Partial<RegistryItem> | undefined;
        const blockRegEntry = registryBlocks.find((b) => b.name === itemName);
        if (blockRegEntry) {
          currentDef = {
            dependencies: blockRegEntry.dependencies || [],
            files: blockRegEntry.files || [],
            name: blockRegEntry.name,
            registryDependencies: blockRegEntry.registryDependencies || [],
          };
        } else {
          const kitRegEntry = registryKits.find((k) => k.name === itemName);
          if (kitRegEntry) {
            currentDef = {
              dependencies: (kitRegEntry as any).dependencies || [], // Assuming structure
              files: (kitRegEntry as any).files || [], // Assuming structure
              name: kitRegEntry.name,
              registryDependencies:
                (kitRegEntry as any).registryDependencies || [], // Assuming structure
            };
          }
        }
        if (currentDef) {
          currentDefinitionsForComparison.push(currentDef);
        } else {
          task.output = kleur.yellow(
            `Warning: ${itemName} not found in registry`
          );
        }
      }

      if (parsedCachedArray.length === currentDefinitionsForComparison.length) {
        let allMatch = true;
        for (const currentBlock of currentDefinitionsForComparison) {
          const cachedBlock = parsedCachedArray.find(
            (cb) => cb.name === currentBlock.name
          );
          if (!cachedBlock) {
            allMatch = false;
            const message = kleur.yellow(
              `Cache invalid: ${currentBlock.name} missing from cache`
            );
            task.output = message;
            break;
          }

          let blockDetailsMatch = true;

          // 1. Compare dependencies (order-insensitive)
          const currentDeps = new Set(currentBlock.dependencies || []);
          const cachedDeps = new Set(cachedBlock.dependencies || []);
          if (
            currentDeps.size !== cachedDeps.size ||
            !Array.from(currentDeps).every((dep) => cachedDeps.has(dep))
          ) {
            blockDetailsMatch = false;
            const addedDeps = Array.from(currentDeps).filter(
              (d) => !cachedDeps.has(d)
            );
            const removedDeps = Array.from(cachedDeps).filter(
              (d) => !currentDeps.has(d)
            );
            let depDiffMsg = `Cache invalid: ${currentBlock.name} dependencies changed`;
            if (addedDeps.length > 0)
              depDiffMsg += ` (+${addedDeps.join(', ')})`;
            if (removedDeps.length > 0)
              depDiffMsg += ` (-${removedDeps.join(', ')})`;
            const message = kleur.yellow(depDiffMsg);
            task.output = task.output ? task.output + '\n' + message : message;
          }

          // 2. Compare registryDependencies (order-insensitive)
          if (blockDetailsMatch) {
            const currentRegDeps = new Set(
              currentBlock.registryDependencies || []
            );
            const cachedRegDeps = new Set(
              cachedBlock.registryDependencies || []
            );
            if (
              currentRegDeps.size !== cachedRegDeps.size ||
              !Array.from(currentRegDeps).every((dep) => cachedRegDeps.has(dep))
            ) {
              blockDetailsMatch = false;
              const addedRegDeps = Array.from(currentRegDeps).filter(
                (d) => !cachedRegDeps.has(d)
              );
              const removedRegDeps = Array.from(cachedRegDeps).filter(
                (d) => !currentRegDeps.has(d)
              );
              let regDepDiffMsg = `Cache invalid: ${currentBlock.name} registryDeps changed`;
              if (addedRegDeps.length > 0)
                regDepDiffMsg += ` (+${addedRegDeps.join(', ')})`;
              if (removedRegDeps.length > 0)
                regDepDiffMsg += ` (-${removedRegDeps.join(', ')})`;
              const message = kleur.yellow(regDepDiffMsg);
              task.output = task.output
                ? task.output + '\n' + message
                : message;
            }
          }

          // 3. Compare files (order-insensitive for the array of files)
          if (blockDetailsMatch) {
            const currentFiles: FileItem[] = currentBlock.files || [];
            const cachedFiles: FileItem[] = cachedBlock.files || [];

            if (currentFiles.length === cachedFiles.length) {
              const sortFiles = (files: FileItem[]) =>
                [...files].sort((a, b) => a.path.localeCompare(b.path));
              const sortedCurrentFiles = sortFiles(currentFiles);
              const sortedCachedFiles = sortFiles(cachedFiles);

              for (let i = 0; i < sortedCurrentFiles.length; i++) {
                const cf = sortedCurrentFiles[i]; // current file
                const bf = sortedCachedFiles[i]; // cached (base) file

                const diffLines: string[] = [];
                if (cf.path !== bf.path) {
                  diffLines.push(
                    `  path:\n    ${kleur.red(`- ${path.basename(bf.path)}`)}\n    ${kleur.green(`+ ${path.basename(cf.path)}`)}`
                  );
                }
                if (cf.target !== bf.target) {
                  diffLines.push(
                    `  target:\n    ${kleur.red(`- "${bf.target ?? 'undefined'}"`)}\n    ${kleur.green(`+ "${cf.target ?? 'undefined'}"`)}`
                  );
                }
                if (cf.type !== bf.type) {
                  diffLines.push(
                    `  type:\n    ${kleur.red(`- "${bf.type}"`)}\n    ${kleur.green(`+ "${cf.type}"`)}`
                  );
                }

                if (diffLines.length > 0) {
                  blockDetailsMatch = false;
                  const message = kleur.yellow(
                    `Cache invalid: ${currentBlock.name} file changed\n${diffLines.join('\n')}`
                  );
                  task.output = task.output
                    ? task.output + '\n' + message
                    : message;
                  break;
                }
              }
            } else {
              blockDetailsMatch = false;
              const message = kleur.yellow(
                `Cache invalid: ${currentBlock.name} files count ${cachedFiles.length} → ${currentFiles.length}`
              );
              task.output = task.output
                ? task.output + '\n' + message
                : message;
            }
          }

          if (!blockDetailsMatch) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) {
          cacheIsValid = true;
          effectiveSkipReason = `${groupDirName} (cached)`;
        }
      } else {
        const message = kleur.yellow(
          `Cache invalid: item count ${parsedCachedArray.length} → ${currentDefinitionsForComparison.length}`
        );
        task.output = message;
      }
    } catch (error: any) {
      const message = kleur.yellow(`Cache corrupted: ${error.message}`);
      task.output = message;
      outdatedOrCorrupted = true;
    }

    if (!cacheIsValid || outdatedOrCorrupted) {
      effectiveSkipReason = ''; // Ensure it runs
      if (fs.existsSync(itemGroupCacheFile)) {
        try {
          await rimraf(itemGroupCacheFile); // Delete invalid/outdated/corrupted cache
        } catch (rimrafError) {
          const message = kleur.yellow(
            `Failed to remove cache: ${rimrafError}`
          );
          task.output = message;
        }
      }
    }

    if (!cacheIsValid) {
      effectiveSkipReason = '';
    }
  } else if (!force) {
    effectiveSkipReason = '';
  } else if (force) {
    effectiveSkipReason = '';
  }

  if (effectiveSkipReason) {
    task.skip(kleur.green(effectiveSkipReason));
    return;
  }

  const pinnedOutput = task.output ? task.output + '\n' : '';

  try {
    const npxPrefix = 'npx -q';
    const pnpmTscCmd = 'pnpm tsc --noEmit';

    task.output = pinnedOutput + kleur.dim(`Cleaning...`);
    if (fs.existsSync(targetDir)) {
      await rimraf(targetDir);
    }
    fs.mkdirSync(targetDir, { recursive: true });

    task.output =
      pinnedOutput +
      kleur.dim(`Cloning ${path.basename(baseTemplateSourceDir)}...`);
    copyDirRecursiveSync(baseTemplateSourceDir, targetDir);

    if (itemNames.length > 0) {
      let itemsForShadcnAdd = [...itemNames];
      if (baseBlockNameIfCloned && baseTemplateSourceDir !== TEMPLATE_DIR) {
        itemsForShadcnAdd = itemsForShadcnAdd.filter(
          (name) => name !== baseBlockNameIfCloned
        );
      }

      if (itemsForShadcnAdd.length > 0) {
        const shadcnAddItems = itemsForShadcnAdd
          .map((name) => `http://localhost:3000/rd/${name}`)
          .join(' ');
        await runCommand(
          `${npxPrefix} shadcn@latest add ${shadcnAddItems} -o`,
          { cwd: targetDir },
          task,
          `Installing ${itemsForShadcnAdd.join(', ')}...`
        );
      }
    }

    await runCommand(pnpmTscCmd, { cwd: targetDir }, task, `Type checking...`);

    // Run additional scripts if specified (only for blocks)
    if (runAdditionalScripts && additionalScripts.length > 0) {
      for (const script of additionalScripts) {
        await runCommand(script, { cwd: targetDir }, task, `${script}...`);
      }
    }

    // --- SUCCESS PATH ---
    const definitionsForCacheFile: Partial<RegistryItem>[] = [];
    for (const itemName of itemNames) {
      let definition: Partial<RegistryItem> | undefined;

      const item = registryItems.find((b) => b.name === itemName);
      if (item) {
        definition = {
          dependencies: item.dependencies || [],
          files: item.files || [],
          name: item.name,
          registryDependencies: item.registryDependencies || [],
        };
      } else {
        throw new Error(`${itemName} not found in registry`);
      }

      if (definition) {
        definitionsForCacheFile.push(definition);
      } else {
        task.output =
          (task.output ? task.output + '\n' : '') +
          kleur.yellow(`Warning: ${itemName} not found in registry`);
      }
    }
    fs.writeFileSync(
      itemGroupCacheFile,
      JSON.stringify(definitionsForCacheFile, null, 2)
    );

    if (preserveOutputOnSuccess) {
      task.output =
        pinnedOutput +
        kleur.green(`✓ Verified ${groupDirName} (output preserved)`);
    } else {
      // await rimraf(targetDir);
      task.output =
        pinnedOutput +
        kleur.green(`✓ Verified ${groupDirName} (temp dir cleaned)`);
    }
    // --- END OF SUCCESS PATH ---
  } catch (error) {
    // --- FAILURE PATH for this group ---
    // runCommand already sets task.output with detailed error.
    task.output =
      pinnedOutput + (task.output || '') + `\n` + kleur.red(`Test failed`);

    if (fs.existsSync(itemGroupCacheFile)) {
      try {
        await rimraf(itemGroupCacheFile);
        task.output =
          task.output +
          '\n' +
          kleur.yellow(`Cache cleaned: ${path.basename(itemGroupCacheFile)}`);
      } catch (rimrafError) {
        task.output =
          task.output +
          '\n' +
          kleur.yellow(`Failed to clean cache: ${rimrafError}`);
      }
    }
    throw error; // Re-throw to ensure Listr handles it as a failed task
  }
};

const loadConfig = (): Config => {
  if (fs.existsSync(CONFIG_FILE_PATH)) {
    try {
      const configFileContents = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      const parsedConfig = JSON.parse(configFileContents);

      const validationResult = ConfigSchema.safeParse(parsedConfig);
      if (!validationResult.success) {
        console.warn(kleur.yellow(`Invalid config, using defaults`));
        validationResult.error.errors.forEach((err) => {
          console.warn(kleur.yellow(`${err.path.join('.')}: ${err.message}`));
        });
        return defaultConfig;
      }
      return { ...defaultConfig, ...validationResult.data };
    } catch (error: any) {
      console.warn(kleur.yellow(`Config parse error: ${error.message}`));
      return defaultConfig;
    }
  } else {
    console.log(kleur.dim(`No config found, using defaults`));
    return defaultConfig;
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const cliItemNames = args.filter((arg) => !arg.startsWith('--'));
  const force = args.includes('--force');
  const cleanTemplate = args.includes('--force-template');

  const config = loadConfig();
  const failedGroupNames: string[] = [];

  if (!fs.existsSync(BASE_TEST_DIR))
    fs.mkdirSync(BASE_TEST_DIR, { recursive: true });
  // if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true }); // CACHE_DIR no longer used this way

  const plainTemplateReady = await createOrUpdateTemplate(cleanTemplate);
  if (!plainTemplateReady) {
    console.error(kleur.red('Template failed, exiting'));
    process.exit(1);
  }

  let totalSuccessCount = 0;
  let totalFailedCount = 0;
  let totalSkippedCount = 0;

  const listrOptions = {
    collectErrors: 'full' as const,
    concurrent: false,
    exitOnError: false,
    rendererOptions: {
      collapseErrors: false,
      collapseSubtasks: false,
      formatOutput: 'wrap' as const,
      removeEmptyLines: false,
      showErrorMessage: true,
    },
  };

  if (cliItemNames.length > 0) {
    // CLI Mode: Test a single group
    const groupDirName = cliItemNames.join('-');
    const itemsToInstall = [...cliItemNames];
    const shouldPreserveOutput =
      itemsToInstall.length === 1 &&
      registryBlocks.some((b) => b.name === itemsToInstall[0]);
    let baseDirToClone = TEMPLATE_DIR;
    let baseBlockNameForCli: string | undefined;

    if (!shouldPreserveOutput && itemsToInstall.length > 0) {
      const firstItem = itemsToInstall[0];
      if (registryBlocks.some((b) => b.name === firstItem)) {
        const potentialCacheDir = path.join(BASE_TEST_DIR, firstItem);
        // const potentialCacheMetaFile = path.join(CACHE_DIR, `${firstItem}.cache`);
        const potentialCacheMetaFile = path.join(
          potentialCacheDir,
          META_CACHE_FILENAME
        );
        if (
          fs.existsSync(potentialCacheDir) &&
          fs.existsSync(potentialCacheMetaFile)
        ) {
          baseDirToClone = potentialCacheDir;
          baseBlockNameForCli = firstItem; // Set the base block name
          console.log(kleur.dim(`Using cached ${firstItem} as base`));
        } else {
          console.log(
            kleur.dim(`No valid cache for ${firstItem}, using template`)
          );
        }
      }
    }

    console.log(
      kleur.blue(`Running CLI specified test: ${kleur.bold(groupDirName)}`)
    );
    const cliTask = {
      title: kleur.magenta(groupDirName),
      task: (_: any, taskWrapper: ListrTaskWrapper<any, any, any>) =>
        testItemsGroup(
          itemsToInstall,
          groupDirName,
          baseDirToClone,
          shouldPreserveOutput,
          force,
          taskWrapper,
          baseBlockNameForCli, // Pass it here
          shouldPreserveOutput, // Only run scripts for single blocks
          shouldPreserveOutput ? config.scripts || [] : [] // Pass scripts only for blocks
        ),
    };
    const listrCli = new Listr([cliTask], listrOptions);
    try {
      await listrCli.run();
    } catch (error) {
      // Listr handles error display
    }
    listrCli.tasks.forEach((task) => {
      if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
        totalSuccessCount++;
      } else if (task.hasFailed()) {
        totalFailedCount++;
        failedGroupNames.push(groupDirName); // cliTask title is complex, use groupDirName
      } else if (task.isSkipped()) {
        totalSkippedCount++;
      }
    });
  } else {
    // Config-Driven Mode: Two phases
    const sourceBlockTasks: any[] = [];
    const dependentGroupTasks: any[] = [];

    // Phase 1: Source Blocks
    let blocksToTestAsSources: string[] = [];
    if (config.blocks === true) {
      blocksToTestAsSources = registryBlocks.map((b) => b.name);
    } else if (Array.isArray(config.blocks)) {
      blocksToTestAsSources = config.blocks;
    }

    blocksToTestAsSources.forEach((blockName) => {
      if (!registryBlocks.some((b) => b.name === blockName)) {
        console.warn(
          kleur.yellow(`Block "${blockName}" not found in registry, skipping`)
        );
        return;
      }
      sourceBlockTasks.push({
        id: blockName, // For tracking failures
        title: kleur.magenta(blockName),
        task: (_: any, taskWrapper: ListrTaskWrapper<any, any, any>) =>
          testItemsGroup(
            [blockName],
            blockName, // groupDirName is the blockName itself
            TEMPLATE_DIR,
            true, // preserveOutputOnSuccess
            force,
            taskWrapper,
            undefined, // No base block name
            true, // runAdditionalScripts (this is a block)
            config.scripts || [] // Pass additional scripts from config
          ),
      });
    });

    // Phase 2: Dependent Groups (Kits and Custom Groups)
    // Kits
    let kitsToTest: string[] = [];
    if (config.kits === true) {
      kitsToTest = registryKits.map((k) => k.name);
    } else if (Array.isArray(config.kits)) {
      kitsToTest = config.kits;
    }

    kitsToTest.forEach((kitName) => {
      const kitDef = registryKits.find((k) => k.name === kitName);
      if (!kitDef) {
        console.warn(
          kleur.yellow(`Kit "${kitName}" not found in registry, skipping`)
        );
        return;
      }
      const groupDirName = `editor-basic-${kitName}`; // Example naming
      const itemsToInstall = [kitName]; // Shadcn add kitName should pull dependencies including editor-basic
      dependentGroupTasks.push({
        id: groupDirName,
        title: kleur.magenta(groupDirName) + kleur.yellow(' (kit)'),
        task: (_: any, taskWrapper: ListrTaskWrapper<any, any, any>) => {
          const editorBasicCacheDir = path.join(BASE_TEST_DIR, 'editor-basic');
          // const editorBasicCacheMetaFile = path.join(
          //   CACHE_DIR,
          //   'editor-basic.cache'
          // );
          const editorBasicCacheMetaFile = path.join(
            editorBasicCacheDir,
            META_CACHE_FILENAME
          );
          if (
            !fs.existsSync(editorBasicCacheDir) ||
            !fs.existsSync(editorBasicCacheMetaFile)
          ) {
            taskWrapper.skip(
              kleur.yellow(
                `Skipped: editor-basic cache not found for kit ${kitName}`
              )
            );
            return Promise.resolve();
          }
          return testItemsGroup(
            itemsToInstall,
            groupDirName,
            editorBasicCacheDir,
            false, // preserveOutputOnSuccess
            force,
            taskWrapper,
            'editor-basic', // Kits always build on editor-basic
            false, // Don't run additional scripts for kits
            [] // No additional scripts for kits
          );
        },
      });
    });

    // Custom Groups from config.groups
    if (config.groups && Array.isArray(config.groups)) {
      config.groups.forEach((groupEntry) => {
        let items: string[];
        let groupNameString: string; // For task title and dir name

        if (typeof groupEntry === 'string') {
          items = [groupEntry];
          groupNameString = groupEntry;
        } else if (Array.isArray(groupEntry) && groupEntry.length > 0) {
          items = [...groupEntry];
          groupNameString = groupEntry.join('-');
        } else {
          console.warn(
            kleur.yellow(`Invalid group entry in config: ${groupEntry}`)
          );
          return; // Invalid group entry
        }

        // Avoid re-testing single blocks that are already source tests
        if (
          items.length === 1 &&
          sourceBlockTasks.some((sbt) => sbt.id === items[0])
        ) {
          console.log(
            kleur.dim(`Skipping ${groupNameString} (already in source tests)`)
          );
          return;
        }

        dependentGroupTasks.push({
          id: groupNameString,
          title: kleur.magenta(groupNameString),
          task: (_: any, taskWrapper: ListrTaskWrapper<any, any, any>) => {
            let baseDir = TEMPLATE_DIR;
            let skipReason = '';
            const firstItemName = items[0];
            let clonedBaseName: string | undefined;

            if (registryBlocks.some((b) => b.name === firstItemName)) {
              const potentialCacheDir = path.join(BASE_TEST_DIR, firstItemName);
              // const potentialCacheMetaFile = path.join(
              //   CACHE_DIR,
              //   `${firstItemName}.cache`
              // );
              const potentialCacheMetaFile = path.join(
                potentialCacheDir,
                META_CACHE_FILENAME
              );
              if (
                fs.existsSync(potentialCacheDir) &&
                fs.existsSync(potentialCacheMetaFile)
              ) {
                baseDir = potentialCacheDir;
                clonedBaseName = firstItemName;
              } else {
                skipReason = `Skipped: ${firstItemName} cache not found`;
              }
            }

            if (skipReason) {
              taskWrapper.skip(kleur.yellow(skipReason));
              return Promise.resolve();
            }
            return testItemsGroup(
              items,
              groupNameString, // groupDirName
              baseDir,
              true, // preserveOutputOnSuccess
              force,
              taskWrapper,
              clonedBaseName, // Pass the cloned base name
              false, // Don't run additional scripts for custom groups
              [] // No additional scripts for custom groups
            );
          },
        });
      });
    }

    // Deduplicate tasks by title to avoid issues if a group is defined in multiple ways
    // This is a simple deduplication, might need more robust ID if titles can collide meaningfully
    const uniqueDependentGroupTasks = dependentGroupTasks.filter(
      (task, index, self) => index === self.findIndex((t) => t.id === task.id)
    );

    if (sourceBlockTasks.length > 0) {
      console.log(kleur.blue(`\n--- ${sourceBlockTasks.length} blocks ---`));
      const listrPhase1 = new Listr(sourceBlockTasks, listrOptions);
      try {
        await listrPhase1.run();
      } catch (error) {
        /* Handled by Listr */
      }
      listrPhase1.tasks.forEach((task) => {
        const taskDef = sourceBlockTasks.find((t) =>
          // Match based on the simple title part if possible, or a unique ID
          task.title?.startsWith(kleur.magenta(t.id))
        );
        const nameForReporting = taskDef
          ? taskDef.id
          : task.title || 'Unnamed Task';

        if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
          totalSuccessCount++;
        } else if (task.hasFailed()) {
          totalFailedCount++;
          failedGroupNames.push(nameForReporting);
        } else if (task.isSkipped()) {
          totalSkippedCount++;
        }
      });
    }

    if (uniqueDependentGroupTasks.length > 0) {
      console.log(
        kleur.blue(
          `\n--- ${uniqueDependentGroupTasks.length} group${
            uniqueDependentGroupTasks.length === 1 ? '' : 's'
          } ---`
        )
      );
      const listrPhase2 = new Listr(uniqueDependentGroupTasks, listrOptions);
      try {
        await listrPhase2.run();
      } catch (error) {
        /* Handled by Listr */
      }
      listrPhase2.tasks.forEach((task) => {
        const taskDef = uniqueDependentGroupTasks.find((t) =>
          task.title?.startsWith(kleur.magenta(t.id))
        );
        const nameForReporting = taskDef
          ? taskDef.id
          : task.title || 'Unnamed Task';

        if (task.isCompleted() && !task.hasFailed() && !task.isSkipped()) {
          totalSuccessCount++;
        } else if (task.hasFailed()) {
          totalFailedCount++;
          failedGroupNames.push(nameForReporting);
        } else if (task.isSkipped()) {
          totalSkippedCount++;
        }
      });
    }
  }

  console.log('\n---');
  console.log(kleur.bold('Summary:'));
  console.log(kleur.green(`✓ ${totalSuccessCount} passed`));
  console.log(kleur.yellow(`⏭ ${totalSkippedCount} skipped`));
  if (totalFailedCount > 0) {
    console.log(
      kleur.red(
        `✗ ${totalFailedCount} failed: ${kleur.bold(failedGroupNames.join(', '))}`
      )
    );
    console.log('---\n');
    process.exit(1);
  } else {
    console.log(kleur.red(`✗ 0 failed`)); // Keep dim for consistency if preferred: kleur.dim(`✗ 0`)
    console.log('---');
  }
};

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error(
    kleur.red('✖ An unexpected error occurred in the test script:')
  );
  console.error(error);
  process.exit(1);
});

import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, promises as fs } from 'fs';
import ora from 'ora';
import path from 'path';
import prompts from 'prompts';
import * as z from 'zod';

import { getConfig } from '../utils/get-config';
import { getPackageManager } from '../utils/get-package-manager';
import { handleError } from '../utils/handle-error';
import { logger } from '../utils/logger';
import {
  fetchTree,
  getItemTargetPath,
  getRegistryBaseColor,
  getRegistryIndex,
  resolveTree,
} from '../utils/registry';
import { transform } from '../utils/transformers';

const addOptionsSchema = z.object({
  all: z.boolean(),
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  overwrite: z.boolean(),
  path: z.string().optional(),
  yes: z.boolean(),
});

export const add = new Command()
  .name('add')
  .description('add a component to your project')
  .argument('[components...]', 'the components to add')
  .option('-y, --yes', 'skip confirmation prompt.', true)
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .option('-a, --all', 'add all available components', false)
  .option('-p, --path <path>', 'the path to add the component to.')
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
      });

      const cwd = path.resolve(options.cwd);

      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }

      const config = await getConfig(cwd);

      if (!config) {
        logger.warn(
          `Configuration is missing. Please run ${chalk.green(
            `init`
          )} to create a plate-components.json file.`
        );
        process.exit(1);
      }

      const registryIndex = await getRegistryIndex();

      let selectedComponents = options.all
        ? registryIndex.map((entry) => entry.name)
        : options.components;

      if (!options.components?.length && !options.all) {
        const { components } = await prompts({
          choices: registryIndex.map((entry) => ({
            selected: options.all
              ? true
              : options.components?.includes(entry.name),
            title: entry.name,
            value: entry.name,
          })),
          hint: 'Space to select. A to toggle all. Enter to submit.',
          instructions: false,
          message: 'Which components would you like to add?',
          name: 'components',
          type: 'multiselect',
        });
        selectedComponents = components;
      }
      if (!selectedComponents?.length) {
        logger.warn('No components selected. Exiting.');
        process.exit(0);
      }

      const tree = await resolveTree(registryIndex, selectedComponents);
      const payload = await fetchTree(config.style, tree);
      const baseColor = await getRegistryBaseColor(config.tailwind.baseColor);

      if (payload.length === 0) {
        logger.warn('Selected components not found. Exiting.');
        process.exit(0);
      }
      if (!options.yes) {
        const { proceed } = await prompts({
          initial: true,
          message: `Ready to install components and dependencies. Proceed?`,
          name: 'proceed',
          type: 'confirm',
        });

        if (!proceed) {
          process.exit(0);
        }
      }

      const spinner = ora(`Installing components...`).start();

      for (const item of payload) {
        spinner.text = `Installing ${item.name}...`;
        const targetDir = await getItemTargetPath(
          config,
          item,
          options.path ? path.resolve(cwd, options.path) : undefined
        );

        if (!targetDir) {
          continue;
        }
        if (!existsSync(targetDir)) {
          await fs.mkdir(targetDir, { recursive: true });
        }

        const existingComponent = item.files.filter((file) =>
          existsSync(path.resolve(targetDir, file.name))
        );

        if (existingComponent.length > 0 && !options.overwrite) {
          if (selectedComponents.includes(item.name)) {
            spinner.stop();
            const { overwrite } = await prompts({
              initial: false,
              message: `Component ${item.name} already exists. Would you like to overwrite?`,
              name: 'overwrite',
              type: 'confirm',
            });

            if (!overwrite) {
              logger.info(
                `Skipped ${item.name}. To overwrite, run with the ${chalk.green(
                  '--overwrite'
                )} flag.`
              );

              continue;
            }

            spinner.start(`Installing ${item.name}...`);
          } else {
            continue;
          }
        }

        for (const file of item.files) {
          const filePath = path.resolve(targetDir, file.name);

          // Run transformers.
          const content = await transform({
            baseColor,
            config,
            filename: file.name,
            raw: file.content,
          });

          await fs.writeFile(filePath, content);
        }

        const packageManager = await getPackageManager(cwd);

        // Install dependencies.
        if (item.dependencies?.length) {
          await execa(
            packageManager,
            [
              packageManager === 'npm' ? 'install' : 'add',
              ...item.dependencies,
            ],
            {
              cwd,
            }
          );
        }
        // Install devDependencies.
        if (item.devDependencies?.length) {
          await execa(
            packageManager,
            [
              packageManager === 'npm' ? 'install' : 'add',
              '-D',
              ...item.devDependencies,
            ],
            {
              cwd,
            }
          );
        }
      }

      spinner.succeed(`Done.`);
    } catch (error) {
      handleError(error);
    }
  });

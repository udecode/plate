import { existsSync, promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
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
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  path: z.string().optional(),
});

export const add = new Command()
  .name('add')
  .description('add a component to your project')
  .argument('[components...]', 'the components to add')
  .option('-y, --yes', 'skip confirmation prompt.', false)
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
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
          )} to create a components.json file.`
        );
        process.exit(1);
      }

      const registryIndex = await getRegistryIndex();

      let selectedComponents = options.components;
      if (!options.components?.length) {
        const { components } = await prompts({
          type: 'multiselect',
          name: 'components',
          message: 'Which components would you like to add?',
          hint: 'Space to select. A to toggle all. Enter to submit.',
          instructions: false,
          choices: registryIndex.map((entry) => ({
            title: entry.name,
            value: entry.name,
          })),
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
          type: 'confirm',
          name: 'proceed',
          message: `Ready to install components and dependencies. Proceed?`,
          initial: true,
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
            logger.warn(
              `Component ${item.name} already exists. Use ${chalk.green(
                '--overwrite'
              )} to overwrite.`
            );
            process.exit(1);
          }

          continue;
        }

        for (const file of item.files) {
          const filePath = path.resolve(targetDir, file.name);

          // Run transformers.
          const content = await transform({
            filename: file.name,
            raw: file.content,
            config,
            baseColor,
          });

          await fs.writeFile(filePath, content);
        }

        // Install dependencies.
        if (item.dependencies?.length) {
          const packageManager = await getPackageManager(cwd);
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
      }
      spinner.succeed(`Done.`);
    } catch (error) {
      handleError(error);
    }
  });

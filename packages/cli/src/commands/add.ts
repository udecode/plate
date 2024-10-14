import { Command } from 'commander';
import deepmerge from 'deepmerge';
import path from 'path';
import prompts from 'prompts';
import { z } from 'zod';

import { runInit } from '@/src/commands/init';
import { preFlightAdd } from '@/src/preflights/preflight-add';
import { addComponents } from '@/src/utils/add-components';
import { createProject } from '@/src/utils/create-project';
import * as ERRORS from '@/src/utils/errors';
import { handleError } from '@/src/utils/handle-error';
import { highlighter } from '@/src/utils/highlighter';
import { logger } from '@/src/utils/logger';
import { getRegistryIndex } from '@/src/utils/registry';
import { updateAppIndex } from '@/src/utils/update-app-index';

import { type Config, resolveConfigPaths } from '../utils/get-config';

export const addOptionsSchema = z.object({
  all: z.boolean(),
  components: z.array(z.string()).optional(),
  cwd: z.string(),
  list: z.boolean().optional(),
  overwrite: z.boolean(),
  path: z.string().optional(),
  registry: z.string().optional(),
  silent: z.boolean(),
  srcDir: z.boolean().optional(),
  yes: z.boolean(),
});

export const add = new Command()
  .name('add')
  .description('add a component to your project')
  .argument(
    '[components...]',
    'the components to add or a url to the component.'
  )
  .option('-y, --yes', 'skip confirmation prompt.', false)
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .option('-a, --all', 'add all available components', false)
  .option('-p, --path <path>', 'the path to add the component to.')
  .option('-s, --silent', 'mute output.', false)
  .option(
    '--src-dir',
    'use the src directory when creating a new project.',
    false
  )
  .option('-r, --registry <registry>', 'registry name or url')
  .option('-l, --list', 'list all available registries', false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        cwd: path.resolve(opts.cwd),
        ...opts,
      });

      // Confirm if user is installing themes.
      // For now, we assume a theme is prefixed with "theme-".
      const isTheme = options.components?.some((component) =>
        component.includes('theme-')
      );

      if (!options.yes && isTheme) {
        logger.break();
        const { confirm } = await prompts({
          message: highlighter.warn(
            'You are about to install a new theme. \nExisting CSS variables will be overwritten. Continue?'
          ),
          name: 'confirm',
          type: 'confirm',
        });

        if (!confirm) {
          logger.break();
          logger.log('Theme installation cancelled.');
          logger.break();
          process.exit(1);
        }
      }

      // eslint-disable-next-line prefer-const
      let { config, errors } = await preFlightAdd(options);

      // No components.json file. Prompt the user to run init.
      if (errors[ERRORS.MISSING_CONFIG]) {
        const { proceed } = await prompts({
          initial: true,
          message: `You need to create a ${highlighter.info(
            'components.json'
          )} file to add components. Proceed?`,
          name: 'proceed',
          type: 'confirm',
        });

        if (!proceed) {
          logger.break();
          process.exit(1);
        }

        config = await runInit({
          cwd: options.cwd,
          defaults: false,
          force: true,
          isNewProject: false,
          silent: true,
          skipPreflight: false,
          srcDir: options.srcDir,
          url: options.registry,
          yes: true,
        });
      }

      const registryConfig = await getRegistryConfig(config as any, options);

      if (!options.components?.length) {
        options.components = await promptForRegistryComponents(
          options,
          registryConfig.url
        );
      }

      let shouldUpdateAppIndex = false;

      if (errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
        const { projectPath } = await createProject({
          cwd: options.cwd,
          force: options.overwrite,
          srcDir: options.srcDir,
        });

        if (!projectPath) {
          logger.break();
          process.exit(1);
        }

        options.cwd = projectPath;

        config = await runInit({
          cwd: options.cwd,
          defaults: false,
          force: true,
          isNewProject: true,
          silent: true,
          skipPreflight: true,
          srcDir: options.srcDir,
          url: options.registry,
          yes: true,
        });

        shouldUpdateAppIndex =
          options.components?.length === 1 &&
          !!/\/chat\/b\//.exec(options.components[0]);
      }
      if (!config) {
        throw new Error(
          `Failed to read config at ${highlighter.info(options.cwd)}.`
        );
      }

      await addComponents(options.components, registryConfig, options);

      // If we're adding a single component and it's from the v0 registry,
      // let's update the app/page.tsx file to import the component.
      if (shouldUpdateAppIndex) {
        await updateAppIndex(options.components[0], config);
      }
    } catch (error) {
      logger.break();
      handleError(error);
    }
  });

async function getRegistryConfig(
  config: Config,
  opts: z.infer<typeof addOptionsSchema>
): Promise<Config> {
  const { registry } = opts;

  if (
    opts.list &&
    config.registries &&
    Object.keys(config.registries).length > 0
  ) {
    const { selectedRegistry } = await prompts({
      choices: [
        { title: 'default', value: 'default' },
        ...Object.entries(config.registries).map(([name]) => ({
          title: name,
          value: name,
        })),
      ],
      message: 'Select a registry:',
      name: 'selectedRegistry',
      type: 'select',
    });

    return selectedRegistry === 'default'
      ? { ...config }
      : await resolveConfigPaths(
          opts.cwd,
          deepmerge(config, config.registries[selectedRegistry]) as Config
        );
  }
  // If a registry is specified
  if (registry) {
    // If it's a URL, use it directly
    if (registry.startsWith('http://') || registry.startsWith('https://')) {
      // Find registry by url
      if (config.registries) {
        const registryConfig = Object.values(config.registries)?.find(
          (reg) => reg.url === registry
        );

        if (registryConfig) {
          return await resolveConfigPaths(
            opts.cwd,
            deepmerge(config, registryConfig) as Config
          );
        }
      }

      return { ...config, url: registry };
    }
    // If it's a named registry in the config, use that
    if (config.registries?.[registry]) {
      return await resolveConfigPaths(
        opts.cwd,
        deepmerge(config, config.registries[registry]) as Config
      );
    }

    // If it's neither a URL nor a known registry name, warn the user and fallback to the default config
    logger.warn(
      `Registry "${registry}" not found in configuration. Using the default registry.`
    );

    return { ...config };
  }

  // If no registry is specified and no registries in config, use the default config
  return { ...config };
}

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>,
  registryUrl?: string
) {
  const registryIndex = await getRegistryIndex(registryUrl);

  if (!registryIndex) {
    logger.break();
    handleError(new Error('Failed to fetch registry index.'));

    return [];
  }
  if (options.all) {
    return registryIndex.map((entry) => entry.name);
  }
  if (options.components?.length) {
    return options.components;
  }

  const { components } = await prompts({
    choices: registryIndex
      .filter((entry) => entry.type === 'registry:ui')
      .map((entry) => ({
        selected: options.all ? true : options.components?.includes(entry.name),
        title: entry.name,
        value: entry.name,
      })),
    hint: 'Space to select. A to toggle all. Enter to submit.',
    instructions: false,
    message: 'Which components would you like to add?',
    name: 'components',
    type: 'multiselect',
  });

  if (!components?.length) {
    logger.warn('No components selected. Exiting.');
    logger.info('');
    process.exit(1);
  }

  const result = z.array(z.string()).safeParse(components);

  if (!result.success) {
    logger.error('');
    handleError(new Error('Something went wrong. Please try again.'));

    return [];
  }

  return result.data;
}

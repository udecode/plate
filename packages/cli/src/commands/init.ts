/* eslint-disable unicorn/no-process-exit */

import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, promises as fs } from 'fs';
import template from 'lodash.template';
import ora from 'ora';
import path from 'path';
import prompts from 'prompts';
import * as z from 'zod';

import type { Config } from '../utils/get-config';

import {
  DEFAULT_COMPONENTS,
  DEFAULT_PLATE_UI,
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
} from '../utils/get-config';
import { getPackageManager } from '../utils/get-package-manager';
import { getProjectConfig, preFlight } from '../utils/get-project-info';
import { handleError } from '../utils/handle-error';
import { logger } from '../utils/logger';
import {
  getRegistryBaseColor,
  getRegistryBaseColors,
  getRegistryStyles,
} from '../utils/registry';
import * as templates from '../utils/templates';
import { applyPrefixesCss } from '../utils/transformers/transform-tw-prefix';

const PROJECT_DEPENDENCIES = [
  '@udecode/cn',
  'tailwindcss-animate',
  'class-variance-authority',
  'tailwind-merge',
];

const initOptionsSchema = z.object({
  cwd: z.string(),
  defaults: z.boolean(),
  yes: z.boolean(),
});

export const init = new Command()
  .name('init')
  .description('initialize your project and install dependencies')
  .option('-y, --yes', 'skip confirmation prompt.', false)
  .option('-d, --defaults,', 'use default configuration.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse(opts);
      const cwd = path.resolve(options.cwd);

      // Ensure target directory exists.
      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }

      await preFlight(cwd);

      const projectConfig = await getProjectConfig(cwd);

      if (projectConfig) {
        const config = await promptForMinimalConfig(
          cwd,
          projectConfig,
          opts.defaults
        );
        await runInit(cwd, config);
      } else {
        // Read config.
        const existingConfig = await getConfig(cwd);
        const config = await promptForConfig(cwd, existingConfig, options.yes);
        await runInit(cwd, config);
      }

      logger.info('');
      logger.info(
        `${chalk.green(
          'Success!'
        )} Project initialization completed. You may now add components.`
      );
      logger.info('');
    } catch (error) {
      handleError(error);
    }
  });

export async function promptForConfig(
  cwd: string,
  defaultConfig: Config | null = null,
  skip = false
) {
  const highlight = (text: string) => chalk.cyan(text);

  const styles = await getRegistryStyles();
  const baseColors = await getRegistryBaseColors();

  const options = await prompts([
    {
      choices: styles.map((style) => ({
        title: style.label,
        value: style.name,
      })),
      message: `Which ${highlight('style')} would you like to use?`,
      name: 'style',
      type: 'select',
    },
    {
      choices: baseColors.map((color) => ({
        title: color.label,
        value: color.name,
      })),
      message: `Which color would you like to use as ${highlight(
        'base color'
      )}?`,
      name: 'tailwindBaseColor',
      type: 'select',
    },
    {
      initial: defaultConfig?.tailwind.css ?? DEFAULT_TAILWIND_CSS,
      message: `Where is your ${highlight('global CSS')} file?`,
      name: 'tailwindCss',
      type: 'text',
    },
    {
      active: 'yes',
      inactive: 'no',
      initial: defaultConfig?.tailwind.cssVariables ?? true,
      message: `Would you like to use ${highlight(
        'CSS variables'
      )} for colors?`,
      name: 'tailwindCssVariables',
      type: 'toggle',
    },
    {
      initial: '',
      message: `Are you using a custom ${highlight(
        'tailwind prefix eg. tw-'
      )}? (Leave blank if not)`,
      name: 'tailwindPrefix',
      type: 'text',
    },
    {
      initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
      message: `Where is your ${highlight('tailwind.config.js')} located?`,
      name: 'tailwindConfig',
      type: 'text',
    },
    {
      initial: defaultConfig?.aliases.components ?? DEFAULT_COMPONENTS,
      message: `Configure the import alias for ${highlight('components')}:`,
      name: 'components',
      type: 'text',
    },
    {
      initial: defaultConfig?.aliases['plate-ui'] ?? DEFAULT_PLATE_UI,
      message: `Configure the import alias for ${highlight('plate-ui')}:`,
      name: 'plate-ui',
      type: 'text',
    },
    {
      active: 'yes',
      inactive: 'no',
      initial: defaultConfig?.rsc ?? true,
      message: `Are you using ${highlight('React Server Components')}?`,
      name: 'rsc',
      type: 'toggle',
    },
  ]);

  const config = rawConfigSchema.parse({
    $schema: 'https://platejs.org/schema.json',
    aliases: {
      components: options.components,
      'plate-ui': options['plate-ui'],
    },
    rsc: options.rsc,
    style: options.style,
    tailwind: {
      baseColor: options.tailwindBaseColor,
      config: options.tailwindConfig,
      css: options.tailwindCss,
      cssVariables: options.tailwindCssVariables,
      prefix: options.tailwindPrefix,
    },
    tsx: true,
  });

  if (!skip) {
    const { proceed } = await prompts({
      initial: true,
      message: `Write configuration to ${highlight(
        'plate-components.json'
      )}. Proceed?`,
      name: 'proceed',
      type: 'confirm',
    });

    if (!proceed) {
      process.exit(0);
    }
  }

  // Write to file.
  logger.info('');
  const spinner = ora(`Writing plate-components.json...`).start();
  const targetPath = path.resolve(cwd, 'plate-components.json');
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8');
  spinner.succeed();

  return await resolveConfigPaths(cwd, config);
}

export async function promptForMinimalConfig(
  cwd: string,
  defaultConfig: Config,
  defaults = false
) {
  const highlight = (text: string) => chalk.cyan(text);
  let style = defaultConfig.style;
  let baseColor = defaultConfig.tailwind.baseColor;
  let cssVariables = defaultConfig.tailwind.cssVariables;

  if (!defaults) {
    const styles = await getRegistryStyles();
    const baseColors = await getRegistryBaseColors();

    const options = await prompts([
      {
        choices: styles.map((style) => ({
          title: style.label,
          value: style.name,
        })),
        message: `Which ${highlight('style')} would you like to use?`,
        name: 'style',
        type: 'select',
      },
      {
        choices: baseColors.map((color) => ({
          title: color.label,
          value: color.name,
        })),
        message: `Which color would you like to use as ${highlight(
          'base color'
        )}?`,
        name: 'tailwindBaseColor',
        type: 'select',
      },
      {
        active: 'yes',
        inactive: 'no',
        initial: defaultConfig?.tailwind.cssVariables,
        message: `Would you like to use ${highlight(
          'CSS variables'
        )} for colors?`,
        name: 'tailwindCssVariables',
        type: 'toggle',
      },
    ]);

    style = options.style;
    baseColor = options.tailwindBaseColor;
    cssVariables = options.tailwindCssVariables;
  }

  const config = rawConfigSchema.parse({
    $schema: defaultConfig?.$schema,
    aliases: defaultConfig?.aliases,
    rsc: defaultConfig?.rsc,
    style,
    tailwind: {
      ...defaultConfig?.tailwind,
      baseColor,
      cssVariables,
    },
  });

  // Write to file.
  logger.info('');
  const spinner = ora(`Writing plate-components.json...`).start();
  const targetPath = path.resolve(cwd, 'plate-components.json');
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8');
  spinner.succeed();

  return await resolveConfigPaths(cwd, config);
}

export async function runInit(cwd: string, config: Config) {
  const spinner = ora(`Initializing project...`)?.start();

  // Ensure all resolved paths directories exist.
  for (const [, resolvedPath] of Object.entries(config.resolvedPaths)) {
    // Determine if the path is a file or directory.
    // TODO: is there a better way to do this?
    const dirname = path.extname(resolvedPath)
      ? path.dirname(resolvedPath)
      : resolvedPath;

    if (!existsSync(dirname)) {
      await fs.mkdir(dirname, { recursive: true });
    }
  }

  // const tailwindConfigExtension = path.extname(
  //   config.resolvedPaths.tailwindConfig
  // );

  const tailwindConfigTemplate = config.tailwind.cssVariables
    ? templates.TAILWIND_CONFIG_WITH_VARIABLES
    : templates.TAILWIND_CONFIG;
  // if (tailwindConfigExtension === '.ts') {
  //   tailwindConfigTemplate = config.tailwind.cssVariables
  //     ? templates.TAILWIND_CONFIG_TS_WITH_VARIABLES
  //     : templates.TAILWIND_CONFIG_TS;
  // }

  // Write tailwind config.
  await fs.writeFile(
    config.resolvedPaths.tailwindConfig,
    template(tailwindConfigTemplate)({
      prefix: config.tailwind.prefix,
    }),
    'utf8'
  );

  // Write css file.
  const baseColor = await getRegistryBaseColor(config.tailwind.baseColor);

  if (baseColor) {
    await fs.writeFile(
      config.resolvedPaths.tailwindCss,
      config.tailwind.cssVariables
        ? config.tailwind.prefix
          ? applyPrefixesCss(baseColor.cssVarsTemplate, config.tailwind.prefix)
          : baseColor.cssVarsTemplate
        : baseColor.inlineColorsTemplate,
      'utf8'
    );
  }

  spinner?.succeed();

  // Install dependencies.
  const dependenciesSpinner = ora(`Installing dependencies...`)?.start();
  const packageManager = await getPackageManager(cwd);

  // TODO: add support for other icon libraries.
  const deps = [
    ...PROJECT_DEPENDENCIES,
    config.style === 'new-york' ? '@radix-ui/react-icons' : 'lucide-react',
  ];

  await execa(
    packageManager,
    [packageManager === 'npm' ? 'install' : 'add', ...deps],
    {
      cwd,
    }
  );
  dependenciesSpinner?.succeed();
}

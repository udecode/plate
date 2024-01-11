/* eslint-disable unicorn/no-process-exit */

import { existsSync, promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import template from 'lodash.template';
import ora from 'ora';
import prompts from 'prompts';
import * as z from 'zod';

import {
  DEFAULT_COMPONENTS,
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
} from '../utils/get-config';
import { getPackageManager } from '../utils/get-package-manager';
import { handleError } from '../utils/handle-error';
import { logger } from '../utils/logger';
import {
  getRegistryBaseColor,
  getRegistryBaseColors,
  getRegistryStyles,
} from '../utils/registry';
import * as templates from '../utils/templates';
import { applyPrefixesCss } from '../utils/transformers/transform-tw-prefix';

import type { Config } from '../utils/get-config';

const PROJECT_DEPENDENCIES = [
  'tailwindcss-animate',
  'class-variance-authority',
  'tailwind-merge',
];

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
});

export const init = new Command()
  .name('init')
  .description('initialize your project and install dependencies')
  .option('-y, --yes', 'skip confirmation prompt.', false)
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

      // Read config.
      const existingConfig = await getConfig(cwd);
      const config = await promptForConfig(cwd, existingConfig, options.yes);

      await runInit(cwd, config);

      logger.info('');
      logger.info(
        `${chalk.green('Success!')} Project initialization completed.`
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
      type: 'select',
      name: 'style',
      message: `Which ${highlight('style')} would you like to use?`,
      choices: styles.map((style) => ({
        title: style.label,
        value: style.name,
      })),
    },
    {
      type: 'select',
      name: 'tailwindBaseColor',
      message: `Which color would you like to use as ${highlight(
        'base color'
      )}?`,
      choices: baseColors.map((color) => ({
        title: color.label,
        value: color.name,
      })),
    },
    {
      type: 'text',
      name: 'tailwindCss',
      message: `Where is your ${highlight('global CSS')} file?`,
      initial: defaultConfig?.tailwind.css ?? DEFAULT_TAILWIND_CSS,
    },
    {
      type: 'toggle',
      name: 'tailwindCssVariables',
      message: `Would you like to use ${highlight(
        'CSS variables'
      )} for colors?`,
      initial: defaultConfig?.tailwind.cssVariables ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      name: 'tailwindPrefix',
      message: `Are you using a custom ${highlight(
        'tailwind prefix eg. tw-'
      )}? (Leave blank if not)`,
      initial: '',
    },
    {
      type: 'text',
      name: 'tailwindConfig',
      message: `Where is your ${highlight('tailwind.config.js')} located?`,
      initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
    },
    {
      type: 'text',
      name: 'components',
      message: `Configure the import alias for ${highlight('components')}:`,
      initial: defaultConfig?.aliases['components'] ?? DEFAULT_COMPONENTS,
    },
    {
      type: 'text',
      name: 'plate-ui',
      message: `Configure the import alias for ${highlight('plate-ui')}:`,
      initial:
        defaultConfig?.aliases['plate-ui'] ??
        defaultConfig?.aliases['ui'] ??
        DEFAULT_COMPONENTS,
    },
    {
      type: 'toggle',
      name: 'rsc',
      message: `Are you using ${highlight('React Server Components')}?`,
      initial: defaultConfig?.rsc ?? true,
      active: 'yes',
      inactive: 'no',
    },
  ]);

  const config = rawConfigSchema.parse({
    $schema: 'https://platejs.org/schema.json',
    style: options.style,
    tailwind: {
      config: options.tailwindConfig,
      css: options.tailwindCss,
      baseColor: options.tailwindBaseColor,
      cssVariables: options.tailwindCssVariables,
      prefix: options.tailwindPrefix,
    },
    rsc: options.rsc,
    tsx: true,
    aliases: {
      components: options.components,
      'plate-ui': options['plate-ui'],
    },
  });

  if (!skip) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Write configuration to ${highlight(
        'components.json'
      )}. Proceed?`,
      initial: true,
    });

    if (!proceed) {
      process.exit(0);
    }
  }

  // Write to file.
  logger.info('');
  const spinner = ora(`Writing components.json...`).start();
  const targetPath = path.resolve(cwd, 'components.json');
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

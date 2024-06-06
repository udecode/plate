import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import { loadConfig } from 'tsconfig-paths';
import * as z from 'zod';

import { resolveImport } from './resolve-import';

/**
 * This module is primarily concerned with loading and validating a project's
 * configuration. It makes use of `cosmiconfig` to find and load a configuration
 * file, in this case, it's looking for a `plate-components.json` or
 * `components.json` file in the root directory of your project. The schema for
 * this config file is defined with the `zod` library. In case there's no
 * configuration file available, it provides a set of default paths and
 * configuration options.
 */

export const DEFAULT_STYLE = 'default';

export const DEFAULT_PLATE_UI = '@/components/plate-ui';

export const DEFAULT_COMPONENTS = '@/components';

export const DEFAULT_TAILWIND_CSS = 'src/styles/globals.css';

export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js';

export const DEFAULT_TAILWIND_BASE_COLOR = 'slate';

// TODO: Figure out if we want to support all cosmiconfig formats.
const explorerPlateComponents = cosmiconfig('components', {
  searchPlaces: ['plate-components.json'],
});
const explorerComponents = cosmiconfig('components', {
  searchPlaces: ['components.json'],
});

export const rawConfigSchema = z.object({
  $schema: z.string().optional(),
  aliases: z.object({
    components: z.string(),
    'plate-ui': z.string().optional(),
    ui: z.string().optional(),
  }),
  rsc: z.coerce.boolean().default(false),
  style: z.string(),
  tailwind: z.object({
    baseColor: z.string(),
    config: z.string(),
    css: z.string(),
    cssVariables: z.boolean().default(true),
    prefix: z.string().default('').optional(),
  }),
});

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    components: z.string(),
    'plate-ui': z.string(),
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    ui: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd);

  if (!config) {
    return null;
  }

  return await resolveConfigPaths(cwd, config);
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {
  // Read tsconfig.json.
  const tsConfig = loadConfig(cwd);

  if (tsConfig.resultType === 'failed') {
    throw new Error(
      `Failed to load tsconfig.json. ${tsConfig.message ?? ''}`.trim()
    );
  }

  const ui = config.aliases.ui
    ? await resolveImport(config.aliases.ui, tsConfig)
    : await resolveImport(config.aliases.components, tsConfig);

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      components: await resolveImport(config.aliases.components, tsConfig),
      'plate-ui': config.aliases['plate-ui']
        ? await resolveImport(config.aliases['plate-ui'], tsConfig)
        : ui,
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      ui: ui,
    },
  });
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  let filename = 'plate-components';

  try {
    let configResult = await explorerPlateComponents.search(cwd);

    if (!configResult) {
      filename = 'components';
      configResult = await explorerComponents.search(cwd);

      if (!configResult) {
        return null;
      }
    }

    return rawConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/${filename}.json.`);
  }
}

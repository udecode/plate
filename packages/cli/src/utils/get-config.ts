import path from 'path';
import { cosmiconfig } from 'cosmiconfig';
import { loadConfig } from 'tsconfig-paths';
import * as z from 'zod';

import { resolveImport } from './resolve-import';

/**
 * This module is primarily concerned with loading and validating a project's
 * configuration. It makes use of `cosmiconfig` to find and load a configuration
 * file, in this case, it's looking for a `components.json` file in the root
 * directory of your project. The schema for this config file is defined with
 * the `zod` library. In case there's no configuration file available, it
 * provides a set of default paths and configuration options.
 */

export const DEFAULT_STYLE = 'default';
export const DEFAULT_COMPONENTS = '@/components';
export const DEFAULT_UTILS = '@/lib/utils';
export const DEFAULT_TAILWIND_CSS = 'src/styles/globals.css';
export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js';
export const DEFAULT_TAILWIND_BASE_COLOR = 'slate';

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
const explorer = cosmiconfig('components', {
  searchPlaces: ['components.json'],
});

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    style: z.string(),
    rsc: z.coerce.boolean().default(false),
    tailwind: z.object({
      config: z.string(),
      css: z.string(),
      baseColor: z.string(),
      cssVariables: z.boolean().default(true),
    }),
    aliases: z.object({
      components: z.string(),
      utils: z.string(),
    }),
  })
  .strict();

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    utils: z.string(),
    components: z.string(),
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
  const tsConfig = await loadConfig(cwd);

  if (tsConfig.resultType === 'failed') {
    throw new Error(
      `Failed to load tsconfig.json. ${tsConfig.message ?? ''}`.trim()
    );
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      utils: await resolveImport(config.aliases['utils'], tsConfig),
      components: await resolveImport(config.aliases['components'], tsConfig),
    },
  });
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd);

    if (!configResult) {
      return null;
    }

    return rawConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/components.json.`);
  }
}

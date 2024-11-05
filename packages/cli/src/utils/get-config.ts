import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import { loadConfig } from 'tsconfig-paths';
import { z } from 'zod';

import { highlighter } from '@/src/utils/highlighter';
import { resolveImport } from '@/src/utils/resolve-import';

export const DEFAULT_STYLE = 'default';

export const DEFAULT_COMPONENTS = '@/components';

export const DEFAULT_UTILS = '@/lib/utils';

export const DEFAULT_TAILWIND_CSS = 'app/globals.css';

export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js';

export const DEFAULT_TAILWIND_BASE_COLOR = 'slate';

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
const explorer = cosmiconfig('components', {
  searchPlaces: ['components.json'],
});

const registrySchema = z.object({
  aliases: z
    .object({
      components: z.string().optional(),
      hooks: z.string().optional(),
      lib: z.string().optional(),
      ui: z.string().optional(),
      utils: z.string().optional(),
    })
    .optional(),
  rsc: z.coerce.boolean().optional(),
  style: z.string().optional(),
  tailwind: z
    .object({
      baseColor: z.string().optional(),
      config: z.string().optional(),
      css: z.string().optional(),
      cssVariables: z.boolean().optional(),
      prefix: z.string().optional(),
    })
    .optional(),
  tsx: z.coerce.boolean().optional(),
  url: z.string(),
});

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    aliases: z.object({
      components: z.string(),
      hooks: z.string().optional(),
      lib: z.string().optional(),
      ui: z.string().optional(),
      utils: z.string(),
    }),
    name: z.string().optional(),
    registries: z.record(z.string(), registrySchema).optional(),
    rsc: z.coerce.boolean().default(false),
    style: z.string(),
    tailwind: z.object({
      baseColor: z.string(),
      config: z.string(),
      css: z.string(),
      cssVariables: z.boolean().default(true),
      prefix: z.string().default('').optional(),
    }),
    tsx: z.coerce.boolean().default(true),
    url: z.string().optional(),
  })
  .strict();

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    components: z.string(),
    cwd: z.string(),
    hooks: z.string(),
    lib: z.string(),
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
    ui: z.string(),
    utils: z.string(),
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
      `Failed to load ${config.tsx ? 'tsconfig' : 'jsconfig'}.json. ${
        tsConfig.message ?? ''
      }`.trim()
    );
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      components: await resolveImport(config.aliases.components, tsConfig),
      cwd,
      hooks: config.aliases.hooks
        ? await resolveImport(config.aliases.hooks, tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases.components, tsConfig)) ?? cwd,
            '..',
            'hooks'
          ),
      // TODO: Make this configurable.
      // For now, we assume the lib and hooks directories are one level up from the components directory.
      lib: config.aliases.lib
        ? await resolveImport(config.aliases.lib, tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases.utils, tsConfig)) ?? cwd,
            '..'
          ),
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      ui: config.aliases.ui
        ? await resolveImport(config.aliases.ui, tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases.components, tsConfig)) ?? cwd,
            'ui'
          ),
      utils: await resolveImport(config.aliases.utils, tsConfig),
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
    const componentPath = `${cwd}/components.json`;

    throw new Error(
      `Invalid configuration found in ${highlighter.info(componentPath)}.`
    );
  }
}

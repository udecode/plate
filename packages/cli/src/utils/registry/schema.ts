import { z } from 'zod';

// TODO: Extract this to a shared package.
export const registryItemTypeSchema = z.enum([
  'registry:style',
  'registry:lib',
  'registry:example',
  'registry:block',
  'registry:component',
  'registry:ui',
  'registry:hook',
  'registry:theme',
  'registry:page',
]);

export const registryItemFileSchema = z.object({
  content: z.string().optional(),
  path: z.string(),
  target: z.string().optional(),
  type: registryItemTypeSchema,
});

export const registryItemTailwindSchema = z.object({
  config: z
    .object({
      content: z.array(z.string()).optional(),
      plugins: z.array(z.string()).optional(),
      theme: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

export const registryItemCssVarsSchema = z.object({
  dark: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
});

export const registryItemSchema = z.object({
  cssVars: registryItemCssVarsSchema.optional(),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  devDependencies: z.array(z.string()).optional(),
  docs: z.string().optional(),
  files: z.array(registryItemFileSchema).optional(),
  meta: z.record(z.string(), z.any()).optional(),
  name: z.string(),
  registryDependencies: z.array(z.string()).optional(),
  tailwind: registryItemTailwindSchema.optional(),
  type: registryItemTypeSchema,
});

export type RegistryItem = z.infer<typeof registryItemSchema>;

export const registryIndexSchema = z.array(
  registryItemSchema.extend({
    files: z.array(z.union([z.string(), registryItemFileSchema])).optional(),
  })
);

export const stylesSchema = z.array(
  z.object({
    label: z.string(),
    name: z.string(),
  })
);

export const iconsSchema = z.record(
  z.string(),
  z.record(z.string(), z.string())
);

export const registryBaseColorSchema = z.object({
  cssVars: z.object({
    dark: z.record(z.string(), z.string()),
    light: z.record(z.string(), z.string()),
  }),
  cssVarsTemplate: z.string(),
  inlineColors: z.object({
    dark: z.record(z.string(), z.string()),
    light: z.record(z.string(), z.string()),
  }),
  inlineColorsTemplate: z.string(),
});

export const registryResolvedItemsTreeSchema = registryItemSchema.pick({
  cssVars: true,
  dependencies: true,
  devDependencies: true,
  docs: true,
  files: true,
  tailwind: true,
});

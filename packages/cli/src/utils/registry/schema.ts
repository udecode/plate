import * as z from 'zod';

// TODO: Extract this to a shared package.
export const registryItemSchema = z.object({
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  files: z.array(z.string()),
  name: z.string(),
  registryDependencies: z.array(z.string()).optional(),
  type: z.enum([
    'components:plate-ui',
    'components:component',
    'components:example',
  ]),
});

export const registryIndexSchema = z.array(registryItemSchema);

export const registryItemWithContentSchema = registryItemSchema.extend({
  files: z.array(
    z.object({
      content: z.string(),
      name: z.string(),
    })
  ),
});

export const registryWithContentSchema = z.array(registryItemWithContentSchema);

export const stylesSchema = z.array(
  z.object({
    label: z.string(),
    name: z.string(),
  })
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

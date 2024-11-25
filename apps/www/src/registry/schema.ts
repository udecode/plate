import * as z from 'zod';

export const blockChunkSchema = z.object({
  code: z.string().optional(),
  component: z.any(),
  container: z
    .object({
      className: z.string().nullish(),
    })
    .optional(),
  description: z.string(),
  descriptionSrc: z.string().optional(),
  file: z.string(),
  name: z.string(),
});

export const registryItemTypeSchema = z.enum([
  'registry:pro',
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
  config: z.object({
    content: z.array(z.string()).optional(),
    plugins: z.array(z.string()).optional(),
    theme: z.record(z.string(), z.any()).optional(),
  }),
});

export const registryItemCssVarsSchema = z.object({
  dark: z.record(z.string(), z.string()).optional(),
  light: z.record(z.string(), z.string()).optional(),
});

export const registryItemSchema = z.object({
  category: z.string().optional(),
  chunks: z.array(blockChunkSchema).optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  descriptionSrc: z.string().optional(),
  devDependencies: z.array(z.string()).optional(),
  doc: z
    .object({
      description: z.string().optional(),
      docs: z
        .array(
          z.object({
            route: z.string().optional(),
            title: z.string().optional(),
          })
        )
        .optional(),
      examples: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
      label: z.union([z.array(z.string()), z.string()]).optional(),
      links: z
        .object({
          api: z.string().optional(),
          doc: z.string().optional(),
        })
        .optional(),
      props: z
        .array(
          z.object({
            default: z.any().optional(),
            description: z.string().optional(),
            name: z.string(),
            type: z.string(),
          })
        )
        .optional(),
      slug: z.string().optional(),
      title: z.string().optional(),
      toc: z.boolean().optional(),
      usage: z.array(z.string()).optional(),
    })
    .optional(),
  docs: z.string().optional(),
  external: z.boolean().optional(),
  files: z.array(registryItemFileSchema).optional(),
  items: z.array(z.string()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
  name: z.string(),
  registryDependencies: z.array(z.string()).optional(),
  subcategory: z.string().optional(),
  tailwind: registryItemTailwindSchema.optional(),
  type: registryItemTypeSchema,
});

export const registryEntrySchema = registryItemSchema.extend({
  category: z.string().optional(),
  subcategory: z.string().optional(),
});

export const registrySchema = z.array(registryItemSchema);

export type RegistryEntry = z.infer<typeof registryItemSchema>;

export type Registry = z.infer<typeof registrySchema>;

export const blockSchema = registryItemSchema.extend({
  code: z.string(),
  component: z.any(),
  container: z
    .object({
      className: z.string().nullish(),
      height: z.string().nullish(),
    })
    .optional(),
  highlightedCode: z.string(),
  src: z.string().optional(),
  type: z.literal('registry:block'),
});

export type Block = z.infer<typeof blockSchema>;

export type BlockChunk = z.infer<typeof blockChunkSchema>;

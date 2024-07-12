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
  file: z.string(),
  name: z.string(),
});

export const registryEntrySchema = z.object({
  category: z.string().optional(),
  chunks: z.array(blockChunkSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  devDependencies: z.array(z.string()).optional(),
  external: z.boolean().optional(),
  files: z.array(z.string()),
  items: z.array(z.string()).optional(),
  name: z.string(),
  registryDependencies: z.array(z.string()).optional(),
  source: z.string().optional(),
  subcategory: z.string().optional(),
  type: z.enum([
    'components:plate-ui',
    'components:component',
    'components:example',
    'components:block',
  ]),
});

export const registrySchema = z.array(registryEntrySchema);

export type RegistryEntry = z.infer<typeof registryEntrySchema>;

export type Registry = z.infer<typeof registrySchema>;

export const blockSchema = registryEntrySchema.extend({
  code: z.string(),
  component: z.any(),
  container: z
    .object({
      className: z.string().nullish(),
      height: z.string().nullish(),
    })
    .optional(),
  highlightedCode: z.string(),
  style: z.enum(['default', 'new-york']),
  type: z.literal('components:block'),
});

export type Block = z.infer<typeof blockSchema>;

export type BlockChunk = z.infer<typeof blockChunkSchema>;

import * as z from 'zod';

export const registrySchema = z.array(
  z.object({
    name: z.string(),
    dependencies: z.array(z.string()).optional(),
    devDependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    files: z.array(z.string()),
    items: z.array(z.string()).optional(),
    external: z.boolean().optional(),
    type: z.enum([
      'components:plate-ui',
      'components:component',
      'components:example',
    ]),
  })
);

export type Registry = z.infer<typeof registrySchema>;

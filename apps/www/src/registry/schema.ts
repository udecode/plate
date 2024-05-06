import * as z from 'zod';

export const registrySchema = z.array(
  z.object({
    dependencies: z.array(z.string()).optional(),
    devDependencies: z.array(z.string()).optional(),
    external: z.boolean().optional(),
    files: z.array(z.string()),
    items: z.array(z.string()).optional(),
    name: z.string(),
    registryDependencies: z.array(z.string()).optional(),
    type: z.enum([
      'components:plate-ui',
      'components:component',
      'components:example',
    ]),
  })
);

export type Registry = z.infer<typeof registrySchema>;

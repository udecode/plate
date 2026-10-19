import { registryItemFileSchema, registryItemSchema } from 'shadcn/schema';
import { z } from 'zod';

import type { BlockViewerContext } from '@/components/block-viewer';
import type { FileTree } from '@/lib/rehype-utils';

const blockViewerItemSchema: z.ZodType<BlockViewerContext['item']> =
  registryItemSchema.and(
    z.object({
      meta: z
        .object({
          descriptionSrc: z.string().optional(),
          iframeMinWidth: z.number().optional(),
          isPro: z.boolean().optional(),
          src: z.string().optional(),
        })
        .catchall(z.unknown())
        .optional(),
    })
  );

const highlightedFilesSchema: z.ZodType<
  BlockViewerContext['highlightedFiles']
> = z
  .array(
    registryItemFileSchema.and(
      z.object({
        highlightedContent: z.string(),
      })
    )
  )
  .nullable();

const fileTreeNodeSchema: z.ZodType<FileTree> = z.lazy(() =>
  z.object({
    children: z.array(fileTreeNodeSchema).optional(),
    name: z.string(),
    path: z.string().optional(),
  })
);

export const generatedPropSchemas = {
  dependencies: z.array(z.string()),
  highlightedFiles: highlightedFilesSchema,
  item: blockViewerItemSchema,
  tree: z.array(fileTreeNodeSchema).nullable(),
};

export const parseGeneratedItem = (
  value: string | undefined
): BlockViewerContext['item'] | undefined => {
  if (value === undefined) return undefined;

  const parsed: unknown = JSON.parse(value);

  if (Array.isArray(parsed) && parsed.length === 0) return undefined;

  return generatedPropSchemas.item.parse(parsed);
};

export const parseRegistryItem = (
  value: unknown
): BlockViewerContext['item'] | undefined => {
  const result = generatedPropSchemas.item.safeParse(value);

  return result.success ? result.data : undefined;
};

export const createRegistryItemFallback = (
  name: string
): BlockViewerContext['item'] =>
  generatedPropSchemas.item.parse({
    files: [],
    name,
    type: 'registry:component',
  });

export const parseGeneratedProp = <T>(
  value: string,
  schema: z.ZodType<T>
): T => {
  const parsed: unknown = JSON.parse(value);

  return schema.parse(parsed);
};

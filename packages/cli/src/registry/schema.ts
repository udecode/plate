import { z } from "zod"

// Note: if you edit the schema here, you must also edit the schema in the
// apps/www/public/schema/registry-item.json file.

export const registryItemTypeSchema = z.enum([
  "registry:pro",
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:page",
  "registry:file",

  // Internal use only
  "registry:theme",
  "registry:example",
  "registry:style",
  "registry:internal",
])

export const registryItemFileSchema = z.discriminatedUnion("type", [
  // Target is required for registry:file and registry:page
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: z.enum(["registry:file", "registry:page"]),
    target: z.string(),
  }),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: registryItemTypeSchema.exclude(["registry:file", "registry:page"]),
    target: z.string().optional(),
  }),
])

export const registryItemTailwindSchema = z.object({
  config: z
    .object({
      content: z.array(z.string()).optional(),
      theme: z.record(z.string(), z.any()).optional(),
      plugins: z.array(z.string()).optional(),
    })
    .optional(),
})

export const registryItemCssVarsSchema = z.object({
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

export const registryItemSchema = z.object({
  categories: z.array(z.string()).optional(),
  category: z.string().optional(),
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
  rsc: z.boolean().optional(),
  subcategory: z.string().optional(),
  tailwind: registryItemTailwindSchema.optional(),
  type: registryItemTypeSchema,

  $schema: z.string().optional(),
  title: z.string().optional(),
  author: z.string().min(2).optional(),
})

export type RegistryItem = z.infer<typeof registryItemSchema>

export const registrySchema = z.object({
  name: z.string(),
  homepage: z.string(),
  items: z.array(registryItemSchema),
})

export type Registry = z.infer<typeof registrySchema>

export const registryIndexSchema = z.array(registryItemSchema)

export const stylesSchema = z.array(
  z.object({
    name: z.string(),
    label: z.string(),
  })
)

export const iconsSchema = z.record(
  z.string(),
  z.record(z.string(), z.string())
)

export const registryBaseColorSchema = z.object({
  inlineColors: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  cssVars: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  inlineColorsTemplate: z.string(),
  cssVarsTemplate: z.string(),
})

export const registryResolvedItemsTreeSchema = registryItemSchema.pick({
  dependencies: true,
  devDependencies: true,
  files: true,
  tailwind: true,
  cssVars: true,
  docs: true,
})

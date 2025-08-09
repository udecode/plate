import * as React from "react"

import type { RegistryItem, registryItemFileSchema } from "shadcn/registry"
import type { z } from "zod"

import { BlockViewer } from "@/components/block-viewer"
import { ComponentPreviewInternal } from "@/components/component-preview-internal"
import { highlightCode } from "@/lib/highlight-code"
import { createFileTreeForRegistryItemFiles, getRegistryItem } from "@/lib/rehype-utils"
import { cn } from "@/lib/utils"

export interface BlockDisplayProps {
  item: RegistryItem
  block?: boolean
  name?: string
}

export async function BlockDisplay({ block = true, item: itemProp, name }: BlockDisplayProps) {
  const effectiveName = name ?? itemProp?.name ?? '';
  const item = itemProp ?? await getCachedRegistryItem(effectiveName)

  if (!item?.files && !item?.meta?.isPro) {
    return null
  }

  const [tree, highlightedFiles] = item.files ? await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
  ]) : [null, null]

  return (
    <BlockViewer blocks={block} highlightedFiles={highlightedFiles} item={item} tree={tree}
    >
      <ComponentPreviewInternal
        name={item.name}
        className={cn(
          "my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0",
          item.meta?.containerClassName
        )}
        hideCode
      />
    </BlockViewer>
  )
}

const getCachedRegistryItem = React.cache(async (name: string) => {
  return await getRegistryItem(name)
})

const getCachedFileTree = React.cache(
  async (files: { path: string; target?: string }[]) => {
    if (!files) {
      return null
    }

    // eslint-disable-next-line @typescript-eslint/await-thenable
    return await createFileTreeForRegistryItemFiles(files)
  }
)

const getCachedHighlightedFiles = React.cache(
  async (files: z.infer<typeof registryItemFileSchema>[]) => {
    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        highlightedContent: await highlightCode(file.content ?? ""),
      }))
    )
  }
)

import * as React from "react"

import type { registryItemFileSchema } from "shadcn/registry"
import type { z } from "zod"

import { BlockViewer } from "@/components/block-viewer"
import { ComponentPreview } from "@/components/component-preview"
import { highlightCode } from "@/lib/highlight-code"
import {
  createFileTreeForRegistryItemFiles,
  getRegistryItem,
} from "@/lib/registry"
import { cn } from "@/lib/utils"

export async function BlockDisplay({ name }: { name: string }) {
  const item = await getCachedRegistryItem(name)

  if (!item?.files) {
    return null
  }

  const [tree, highlightedFiles] = await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
  ])

  return (
    <BlockViewer highlightedFiles={highlightedFiles} item={item} tree={tree}>
      <ComponentPreview
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

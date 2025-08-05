import * as React from "react"

import type { RegistryItem, registryItemFileSchema } from "shadcn/registry"
import type { z } from "zod"

import { BlockViewer } from "@/components/block-viewer"
import { ComponentPreview } from "@/components/component-preview"
import { highlightCode } from "@/lib/highlight-code"
import { createFileTreeForRegistryItemFiles, getRegistryItem } from "@/lib/rehype-utils"
import { cn } from "@/lib/utils"


export async function BlockDisplay({ item: itemProp, name, ...props }: { id: string, item: RegistryItem; name: string, block?: boolean, }) {
  const item = itemProp ?? await getCachedRegistryItem(name)

  if (!item?.files && !item.meta?.isPro) {
    return null
  }

  const [tree, highlightedFiles] = item.files ? await Promise.all([
    getCachedFileTree(item.files),
    getCachedHighlightedFiles(item.files),
  ]) : [null, null]

  return (
    <BlockViewer highlightedFiles={highlightedFiles} item={item} tree={tree}
    >
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

import * as React from "react"

import fs from "node:fs/promises"
import path from "node:path"

import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper"
import { CopyButton } from "@/components/copy-button"
import { getIconForLanguageExtension } from "@/components/icons"
import { highlightCode } from "@/lib/highlight-code"
import { getRegistryItem } from "@/lib/rehype-utils"
import { cn } from "@/lib/utils"

export async function ComponentSource({
  className,
  collapsible = true,
  language,
  name,
  src,
  title,
}: React.ComponentProps<"div"> & {
  collapsible?: boolean
  language?: string
  name?: string
  src?: string
  title?: string
}) {
  if (!name && !src) {
    return null
  }

  let code: string | undefined

  if (name) {
    const item = await getRegistryItem(name)
    code = item?.files?.[0]?.content
  }

  if (src) {
    const file = await fs.readFile(path.join(process.cwd(), src), "utf8")
    code = file
  }

  if (!code) {
    return null
  }

  const lang = language ?? title?.split(".").pop() ?? "tsx"
  const highlightedCode = await highlightCode(code, lang)

  if (!collapsible) {
    return (
      <div className={cn("relative", className)}>
        <ComponentCode
          title={title}
          code={code}
          highlightedCode={highlightedCode}
          language={lang}
        />
      </div>
    )
  }

  return (
    <CodeCollapsibleWrapper className={className}>
      <ComponentCode
        title={title}
        code={code}
        highlightedCode={highlightedCode}
        language={lang}
      />
    </CodeCollapsibleWrapper>
  )
}

function ComponentCode({
  code,
  highlightedCode,
  language,
  title,
}: {
  code: string
  highlightedCode: string
  language: string
  title: string | undefined
}) {
  return (
    <figure className="[&>pre]:max-h-96" data-rehype-pretty-code-figure="">
      {title && (
        <figcaption
          className="text-code-foreground [&_svg]:text-code-foreground flex items-center gap-2 [&_svg]:size-4 [&_svg]:opacity-70"
          data-language={language}
          data-rehype-pretty-code-title=""
        >
          {getIconForLanguageExtension(language)}
          {title}
        </figcaption>
      )}
      <CopyButton value={code} />
      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </figure>
  )
}

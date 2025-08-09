"use client"

import * as React from "react"

import type { createFileTreeForRegistryItemFiles, FileTree } from "@/lib/rehype-utils"
import type { ImperativePanelHandle } from "react-resizable-panels"
import type { registryItemFileSchema, registryItemSchema } from "shadcn/registry"
import type { z } from "zod"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { Separator } from "@radix-ui/react-separator"
import {
  Check,
  ChevronRight,
  Clipboard,
  File,
  Folder,
  Fullscreen,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  Terminal,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Index } from "@/__registry__"
import { getIconForLanguageExtension } from "@/components/icons"
import { siteConfig } from "@/config/site"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { trackEvent } from "@/lib/events"
import { cn } from "@/lib/utils"

import { Button, buttonVariants } from "./ui/button"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable"
import { Sidebar, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarProvider } from "./ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"

type BlockViewerContext = {
  activeFile: string | null
  highlightedFiles:
  | (z.infer<typeof registryItemFileSchema> & {
    highlightedContent: string
  })[]
  | null
  item: z.infer<typeof registryItemSchema>
  resizablePanelRef: React.RefObject<ImperativePanelHandle | null> | null
  tree: ReturnType<typeof createFileTreeForRegistryItemFiles> | null
  view: "code" | "preview"
  setActiveFile: (file: string) => void
  setView: (view: "code" | "preview") => void
  blocks?: boolean
  iframeKey?: number
  setIframeKey?: React.Dispatch<React.SetStateAction<number>>
}

const BlockViewerContext = React.createContext<BlockViewerContext | null>(null)

function useBlockViewer() {
  const context = React.useContext(BlockViewerContext)
  if (!context) {
    throw new Error("useBlockViewer must be used within a BlockViewerProvider.")
  }
  return context
}

function BlockViewerProvider({
  blocks,
  children,
  highlightedFiles,
  item,
  tree,
}: Pick<BlockViewerContext, "blocks" | "highlightedFiles" | "item" | "tree"> & {
  children: React.ReactNode
}) {
  const [view, setView] = React.useState<BlockViewerContext["view"]>("preview")
  const [activeFile, setActiveFile] = React.useState<
    BlockViewerContext["activeFile"]
  >(highlightedFiles?.[0]?.target ?? null)
  const resizablePanelRef = React.useRef<ImperativePanelHandle>(null)
  const [iframeKey, setIframeKey] = React.useState(0)

  return (
    <BlockViewerContext.Provider
      value={{
        activeFile,
        blocks,
        highlightedFiles,
        iframeKey,
        item,
        resizablePanelRef,
        setActiveFile,
        setIframeKey,
        setView,
        tree,
        view,
      }}
    >
      <div
        id={item.name}
        className="group/block-view-wrapper flex min-w-0 scroll-mt-24 flex-col-reverse items-stretch gap-4 overflow-hidden md:flex-col"
        style={
          {
            "--height": item.meta?.iframeHeight ?? "650px",
          } as React.CSSProperties
        }
        data-view={view}
      >
        {children}
      </div>
    </BlockViewerContext.Provider>
  )
}

function BlockViewerToolbar() {
  const { blocks, item, resizablePanelRef, setIframeKey, setView, view } =
    useBlockViewer()


  const { copyToClipboard, isCopied } = useCopyToClipboard()

  const isPro = item?.meta?.isPro

  return (
    <div className="hidden w-full items-center gap-2 pl-2 py-1 md:pr-6 lg:flex">
      <Tabs
        value={view}
        onValueChange={(value) => setView(value as "code" | "preview")}
      >
        <TabsList className={cn("grid h-8 items-center rounded-md p-1 *:data-[slot=tabs-trigger]:h-6 *:data-[slot=tabs-trigger]:rounded-sm *:data-[slot=tabs-trigger]:px-2 *:data-[slot=tabs-trigger]:text-xs",
          isPro ? "grid-cols-1" : "grid-cols-2"
        )}>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          {!isPro && <TabsTrigger value="code">Code</TabsTrigger>}
        </TabsList>
      </Tabs>
      <Separator orientation="vertical" className="mx-2 !h-4" />

      {
        blocks && (
          <a
            className="flex-1 text-center text-sm font-medium underline-offset-2 hover:underline md:flex-auto md:text-left"
            href={`#${item.name}`}
          >
            {item.description?.replace(/\.$/, "")}
          </a>
        )
      }

      {isPro ? (
        <Link
          className={cn(
            buttonVariants(),
            'group relative flex justify-start gap-2 overflow-hidden rounded-sm whitespace-pre',
            'dark:bg-muted dark:text-foreground',
            'hover:ring-2 hover:ring-primary hover:ring-offset-2',
            'transition-all duration-300 ease-out',
            'h-[26px] px-2 text-xs'
          )}
          href={item.meta?.descriptionSrc ?? siteConfig.links.potionIframe}
          target="_blank"
        >
          <span
            className={cn(
              'absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12',
              'bg-white opacity-10',
              'transition-all duration-1000 ease-out'
            )}
          />
          Get the code
        </Link>
      ) :
        (
          <div className="ml-auto flex items-center gap-2">
            {
              blocks && (
                <React.Fragment>
                  <div className="h-8 items-center gap-1.5 rounded-md border p-1 shadow-none">
                    <ToggleGroup
                      className="gap-1 *:data-[slot=toggle-group-item]:!size-6 *:data-[slot=toggle-group-item]:!rounded-sm"
                      defaultValue="100"
                      onValueChange={(value) => {
                        setView("preview")
                        if (resizablePanelRef?.current) {
                          resizablePanelRef.current.resize(Number.parseInt(value))
                        }
                      }}
                      type="single"
                    >
                      <ToggleGroupItem value="100" title="Desktop">
                        <Monitor />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="60" title="Tablet">
                        <Tablet />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="30" title="Mobile">
                        <Smartphone />
                      </ToggleGroupItem>
                      <Separator orientation="vertical" className="!h-4" />
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="size-6 rounded-sm p-0"
                        title="Open in New Tab"
                      >
                        <Link href={`/blocks/${item.name}`} target="_blank">
                          <span className="sr-only">Open in New Tab</span>
                          <Fullscreen />
                        </Link>
                      </Button>
                      <Separator orientation="vertical" className="!h-4" />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 rounded-sm p-0"
                        onClick={() => {
                          if (setIframeKey) {
                            setIframeKey((k) => k + 1)
                          }
                        }}
                        title="Refresh Preview"
                      >
                        <RotateCw />
                        <span className="sr-only">Refresh Preview</span>
                      </Button>
                    </ToggleGroup>
                  </div>
                  <Separator orientation="vertical" className="mx-1 !h-4" />

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit gap-1 px-2 shadow-none"
                    onClick={() => {
                      copyToClipboard(`npx shadcn@latest add ${item.name}`)
                    }}
                  >
                    {isCopied ? <Check /> : <Terminal />}
                    <span>npx shadcn@latest add {item.name}</span>
                  </Button>
                  <Separator orientation="vertical" className="mx-1 !h-4" />
                </React.Fragment>
              )
            }


          </div>
        )
      }

    </div>
  )
}

function BlockViewerIframe() {
  const { blocks, iframeKey, item } = useBlockViewer()

  const Preview = React.useMemo(() => {

    if (item.meta?.isPro) return null

    const Component = Index[item.name]?.component;

    if (!Component) {
      return (
        <p className="text-sm text-muted-foreground">
          Component{' '}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {item.name}
          </code>{' '}
          not found in registry.
        </p>
      );
    }

    // DIFF
    return <Component id={item.name.replace('-demo', '')} key={iframeKey} />;
  }, [item.name, item.meta?.isPro, iframeKey]);

  return (
    Preview ?? <iframe
      key={iframeKey}
      className={cn('chunk-mode relative z-20 size-full bg-background min-h-(--height)', item.meta?.isPro && blocks && '!h-screen')}
      title={item.name}
      height={item.meta?.iframeHeight ?? '100%'}
      sandbox="allow-scripts allow-same-origin allow-top-navigation allow-forms"
      src={item.meta?.src ?? `/blocks/${item.name}`}
    />
  )
}

function BlockViewerView() {
  const { blocks, resizablePanelRef } = useBlockViewer()

  return (
    <div className={cn("hidden group-data-[view=code]/block-view-wrapper:hidden lg:flex")}>
      <div className="relative grid w-full gap-4">
        <div className="absolute inset-0 right-4 [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:20px_20px] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"></div>
        <ResizablePanelGroup
          className="after:bg-surface/50 relative z-10 after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-xl"
          direction="horizontal"
        >
          <ResizablePanel
            ref={resizablePanelRef}
            className="bg-background relative aspect-[4/2.5] overflow-hidden rounded-lg border md:aspect-auto md:rounded-xl z-10"
            defaultSize={100}
            minSize={30}
          >
            <BlockViewerIframe />
          </ResizablePanel>
          <ResizableHandle className="after:bg-border relative hidden w-3 bg-transparent p-0 after:absolute after:top-1/2 after:right-0 after:h-8 after:w-[6px] after:translate-x-[-1px] after:-translate-y-1/2 after:rounded-full after:transition-all after:hover:h-10 md:block" />
          <ResizablePanel defaultSize={0} minSize={0} />
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

function BlockViewerMobile({ children }: { children: React.ReactNode }) {
  const { item } = useBlockViewer()

  return (
    <div className="flex flex-col gap-2 lg:hidden">
      <div className="flex items-center gap-2 px-2">
        <div className="line-clamp-1 text-sm font-medium">
          {item.description}
        </div>
        <div className="text-muted-foreground ml-auto shrink-0 font-mono text-xs">
          {item.name}
        </div>
      </div>
      {item.meta?.mobile === "component" ? (
        children
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Image
            className="object-cover dark:hidden"
            alt={item.name}
            data-block={item.name}
            height={900}
            src={`/r/styles/new-york-v4/${item.name}-light.png`}
            width={1440}
          />
          <Image
            className="hidden object-cover dark:block"
            alt={item.name}
            data-block={item.name}
            height={900}
            src={`/r/styles/new-york-v4/${item.name}-dark.png`}
            width={1440}
          />
        </div>
      )}
    </div>
  )
}

function BlockViewerCode() {
  const { activeFile, highlightedFiles } = useBlockViewer()

  const file = React.useMemo(() => {
    return highlightedFiles?.find((file) => file.target === activeFile)
  }, [highlightedFiles, activeFile])

  if (!file) {
    return null
  }

  const language = file.path.split(".").pop() ?? "tsx"

  return (
    <div className="bg-code text-code-foreground mr-[14px] flex overflow-hidden rounded-xl border group-data-[view=preview]/block-view-wrapper:hidden md:h-(--height)">
      <div className="w-72">
        <BlockViewerFileTree />
      </div>
      <figure
        className="!mx-0 mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none"
        data-rehype-pretty-code-figure=""
      >
        <figcaption
          className="text-code-foreground [&_svg]:text-code-foreground flex h-12 shrink-0 items-center gap-2 border-b px-4 py-2 [&_svg]:size-4 [&_svg]:opacity-70"
          data-language={language}
        >
          {getIconForLanguageExtension(language)}
          {file.target}
          <div className="ml-auto flex items-center gap-2">
            <BlockCopyCodeButton />
          </div>
        </figcaption>
        <div
          key={file?.path}
          className="no-scrollbar overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: file?.highlightedContent ?? "" }}
        />
      </figure>
    </div>
  )
}

export function BlockViewerFileTree() {
  const { tree } = useBlockViewer()

  if (!tree) {
    return null
  }

  return (
    <SidebarProvider className="flex !min-h-full flex-col border-r">
      <Sidebar className="w-full flex-1" collapsible="none">
        <SidebarGroupLabel className="h-12 rounded-none border-b px-4 text-sm">
          Files
        </SidebarGroupLabel>
        <SidebarGroup className="p-0 overflow-y-auto">
          <SidebarGroupContent>
            <SidebarMenu className="translate-x-0 gap-1.5">
              {tree.map((file, index) => (
                <Tree key={index} index={1} item={file} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </Sidebar>
    </SidebarProvider>
  )
}

function Tree({ index, item }: { index: number; item: FileTree; }) {
  const { activeFile, setActiveFile } = useBlockViewer()

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className="hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15 rounded-none pl-(--index) whitespace-nowrap"
          style={
            {
              "--index": `${index * (index === 2 ? 1.2 : 1.3)}rem`,
            } as React.CSSProperties
          }
          onClick={() => item.path && setActiveFile(item.path)}
          data-index={index}
          isActive={item.path === activeFile}
        >
          <ChevronRight className="invisible" />
          <File className="h-4 w-4" />
          {item.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15 rounded-none pl-(--index) whitespace-nowrap"
            style={
              {
                "--index": `${index * (index === 1 ? 1 : 1.2)}rem`,
              } as React.CSSProperties
            }
          >
            <ChevronRight className="transition-transform" />
            <Folder />
            {item.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="m-0 w-full translate-x-0 border-none p-0">
            {item.children.map((subItem, key) => (
              <Tree key={key} index={index + 1} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function BlockCopyCodeButton() {
  const { activeFile, item } = useBlockViewer()
  const { copyToClipboard, isCopied } = useCopyToClipboard()

  const file = React.useMemo(() => {
    return item.files?.find((file) => file.target === activeFile)
  }, [activeFile, item.files])

  const content = file?.content

  if (!content) {
    return null
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      className="size-7"
      onClick={() => {
        copyToClipboard(content)
        trackEvent({
          name: "copy_block_code",
          properties: {
            file: file.path,
            name: item.name,
          },
        })
      }}
    >
      {isCopied ? <Check /> : <Clipboard />}
    </Button>
  )
}

function BlockViewer({
  blocks = true,
  children,
  highlightedFiles,
  item,
  preview,
  tree,
  ...props
}: Pick<BlockViewerContext, "highlightedFiles" | "item" | "tree"> & {
  children: React.ReactNode
  blocks?: boolean
  preview?: React.ReactNode
}) {
  return (
    <BlockViewerProvider
      blocks={blocks}
      highlightedFiles={highlightedFiles}
      item={item}
      tree={tree}
      {...props}
    >
      <BlockViewerToolbar />
      <BlockViewerView />
      <BlockViewerCode />
      <BlockViewerMobile>{children}</BlockViewerMobile>
    </BlockViewerProvider>
  )
}

export { BlockViewer }

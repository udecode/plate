import type { PackageInfoType } from '@/hooks/use-package-info'
import type { RegistryItem } from "shadcn/registry"

import type { Metadata } from "next"

import {
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react"
import { findNeighbour } from "fumadocs-core/server"
import Link from "next/link"
import { notFound } from "next/navigation"

import { DocContent } from "@/app/(app)/docs/[[...slug]]/doc-content"
import { ComponentInstallation } from "@/components/component-installation"
import { ComponentPreview } from '@/components/component-preview'
import { DocsTableOfContents } from "@/components/docs-toc"
import { LLMCopyButton } from '@/components/llm-copy-button'
import { mdxComponents } from "@/components/mdx-components"
import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ViewOptions } from '@/components/view-options'
import { docsMap } from "@/config/docs"
import { slugToCategory } from "@/config/docs-utils"
import { siteConfig } from "@/config/site"
import { absoluteUrl } from "@/lib/absoluteUrl"
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from "@/lib/registry-cache"
import { getDocTitle, getRegistryTitle } from "@/lib/registry-utils"
import { getAllDependencies, getAllFiles } from "@/lib/rehype-utils"
import { docsSource } from "@/lib/source"
import { cn } from "@/lib/utils"
import { registry } from "@/registry/registry"
import { registryExamples } from "@/registry/registry-examples"
import { proExamples } from "@/registry/registry-pro"
import { registryUI } from "@/registry/registry-ui"

export const revalidate = false
export const dynamic = "force-static"
export const dynamicParams = true

const registryNames = new Set(registry.items.map((item) => item.name))

// Helper function to filter page tree by locale
function filterPageTreeByLocale(pageTree: any, isChinese: boolean): any {
  if (!pageTree) return pageTree
  
  // Filter children array recursively
  const filterChildren = (children: any[]): any[] => {
    if (!children) return []
    
    return children
      .map((node: any) => {
        // Handle separator nodes
        if (node.type === 'separator') {
          return node
        }
        
        // Handle folder nodes
        if (node.type === 'folder') {
          const filteredChildren = filterChildren(node.children)
          // Only include folder if it has children after filtering
          if (filteredChildren.length === 0 && !node.index) {
            return null
          }
          
          // Check if folder index should be filtered
          if (node.index?.url) {
            const isChineseNode = node.index.url.includes('.cn')
            if (isChinese !== isChineseNode) {
              // Filter out the index but keep the folder if it has other valid children
              return {
                ...node,
                children: filteredChildren,
                index: undefined
              }
            }
          }
          
          return {
            ...node,
            children: filteredChildren
          }
        }
        
        // Handle page nodes
        if (node.url) {
          const isChineseNode = node.url.includes('.cn')
          if (isChinese !== isChineseNode) {
            return null
          }
        }
        
        return node
      })
      .filter(Boolean) // Remove null entries
  }
  
  return {
    ...pageTree,
    children: filterChildren(pageTree.children)
  }
}

export function generateStaticParams() {
  return docsSource.generateParams()
}


interface DocPageProps {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ locale?: string }>
}

async function getDocFromParams({ params, searchParams }: DocPageProps) {
  const locale = (await searchParams).locale
  const slugParam = (await params).slug

  // Handle index page
  if (!slugParam || slugParam.length === 0) {
    if (locale === 'cn') {
      // Try to find Chinese index
      const cnPage = docsSource.getPage(['index.cn'])
      if (cnPage) return cnPage
    }
    return docsSource.getPage([])
  }

  // For Chinese docs, look for .cn.mdx files
  if (locale === 'cn') {
    // First try to find the Chinese version with .cn suffix
    const cnSlug = [...slugParam]
    cnSlug[cnSlug.length - 1] = `${cnSlug.at(-1)}.cn`
    const cnPage = docsSource.getPage(cnSlug)
    if (cnPage) return cnPage
  }

  // Default behavior
  return docsSource.getPage(slugParam)
}

export async function generateMetadata({
  params,
  searchParams,
}: DocPageProps): Promise<Metadata> {
  const page = await getDocFromParams({ params, searchParams })
  let title: string
  let description: string | undefined
  let slug: string

  if (page) {
    const doc = page.data
    title = doc.title
    description = doc.description
    slug = page.url

    // Add locale param for Chinese
    const locale = (await searchParams).locale
    if (locale === 'cn') {
      slug += `?locale=cn`
    }
  } else {
    // Handle component and example pages
    const slugParam = (await params).slug
    const category = slugToCategory(slugParam || [])
    let docName = slugParam?.at(-1)
    let file: RegistryItem | undefined

    if (category === 'component') {
      file = registryUI.find((c) => c.name === docName)
    } else if (category === 'example') {
      docName += '-demo'
      file = registryExamples.find((c) => c.name === docName)
    }

    if (!docName || !file) {
      return {}
    }


    const path = slugParam?.join('/') || ''
    slug = '/docs' + (path ? '/' + path : '')
    title = file.title || docName
    description = file.description
  }

  return {
    description,
    openGraph: {
      description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
            description ?? ''
          )}`,
        },
      ],
      title,
      type: 'article',
      url: absoluteUrl(slug),
    },
    title,
    twitter: {
      card: 'summary_large_image',
      creator: '@udecode',
      description,
      images: [
        {
          url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
            description ?? ''
          )}`,
        },
      ],
      title,
    },
  }
}

export default async function Page(props: DocPageProps) {
  const params = await props.params
  const page = await getDocFromParams(props)
  const searchParams = await props.searchParams
  const locale = searchParams.locale
  const category = slugToCategory(params.slug || [])

  const packageInfo: PackageInfoType = {
    gzip: '',
    name: '',
    npm: '',
    source: '',
  }

  if (!page) {
    // Handle component and example pages from registry when no MDX exists
    const slugParam = params.slug
    let docName = slugParam?.at(-1)
    let file: RegistryItem | undefined

    if (category === 'component') {
      file = registryUI.find((c) => c.name === docName)
    } else if (category === 'example') {
      docName += '-demo'
      file = registryExamples.find((c) => c.name === docName)
    }

    if (!docName || !file) {
      notFound()
    }

    const dependencies = getAllDependencies(docName)
    const files = getAllFiles(docName)

    const slug = '/docs/' + (params.slug?.join('/') || '')

    const docs = getRegistryDocs({
      docName,
      file,
      files,
      registryNames,
    })

    const item = await getCachedRegistryItem(docName, true)

    if (!item?.files) {
      notFound()
    }

    const [tree, highlightedFiles, componentExamples] = await Promise.all([
      getCachedFileTree(item.files),
      getCachedHighlightedFiles(item.files as any),
      file.meta?.examples
      ? Promise.all(
        file.meta.examples.map(
          async (ex: string) => await getExampleCode(ex)
        )
      )
      : undefined,
    ])

    return (
      <DocContent
        category={category as any}
        {...file}
        doc={{
          ...file.meta,
          docs,
          slug,
        }}
      >
        {category === 'component' ? (
          <ComponentInstallation
            name={file.name}
            dependencies={dependencies}
            examples={componentExamples?.filter(Boolean) as any}
            highlightedFiles={highlightedFiles}
            item={item}
            tree={tree}
            usage={file.meta?.usage}
          />
        ) : (
          <ComponentPreview
            name={file.name}
            item={item}
          />
        )}
      </DocContent>
    )
  }

  const doc = page.data
  const MDX = doc.body
  
  // Filter neighbors to only include same language pages
  const isChinese = page.url.includes('.cn')
  const filteredPageTree = filterPageTreeByLocale(docsSource.pageTree, isChinese)
  const neighbours = findNeighbour(filteredPageTree, page.url)

  // Add description from docsMap if not present
  if (!doc.description) {
    doc.description = docsMap[page.url]?.description
  }

  const toc = doc.toc || []

  // Helper to add locale to URLs
  const addLocaleToUrl = (url: string) => {
    if (locale === 'cn') {
      return url.includes('?') ? `${url}&locale=cn` : `${url}?locale=cn`
    }
    return url
  }

  return (
    <div
      className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full"
      data-slot="docs"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
                  {doc.title}
                </h1>
                {/* TODO: FIX */}
                {/* <div className="flex items-center gap-2 pt-1.5">
                  {neighbours.previous && (
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                    >
                      <Link href={addLocaleToUrl(neighbours.previous.url)}>
                        <IconArrowLeft />
                        <span className="sr-only">Previous</span>
                      </Link>
                    </Button>
                  )}
                  {neighbours.next && (
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                    >
                      <Link href={addLocaleToUrl(neighbours.next.url)}>
                        <span className="sr-only">Next</span>
                        <IconArrowRight />
                      </Link>
                    </Button>
                  )}
                </div> */}
              </div>
              {doc.description && (
                <p className="text-muted-foreground text-[1.05rem] text-balance sm:text-base">
                  {doc.description}
                </p>
              )}
            </div>

            <div className="flex flex-row items-center gap-2">
              <LLMCopyButton
                title={doc.title}
                content={doc.content}
                docUrl={`https://platejs.org${params.slug}`}
              />
              <ViewOptions
                title={doc.title}
                content={doc.content}
                docUrl={`https://platejs.org${params.slug}`}
              />
            </div>

            {doc?.docs ? (
              <div className="flex flex-wrap items-center gap-1">
                {/* {doc?.links?.doc && (
                  <Link
                    className={cn(
                      badgeVariants({ variant: 'secondary' }),
                      'gap-1'
                    )}
                    href={doc?.links.doc}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Docs
                    <ExternalLinkIcon className="size-3" />
                  </Link>
                )}
                {doc?.links?.api && (
                  <Link
                    className={cn(
                      badgeVariants({ variant: 'secondary' }),
                      'gap-1'
                    )}
                    href={doc?.links.api}
                    rel="noreferrer"
                    target="_blank"
                  >
                    API Reference
                    <ExternalLinkIcon className="size-3" />
                  </Link>
                )} */}
                {doc?.docs?.map((item: any) => (
                  <Link
                    key={item.route}
                    className={cn(
                      badgeVariants({
                        variant: getItemVariant(item),
                      })
                    )}
                    href={item.route as any}
                  // rel={item.route?.includes('https') ? 'noreferrer' : undefined}
                  // target={item.route?.includes('https') ? '_blank' : undefined}
                  >
                    {getDocTitle(item)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            <MDX components={mdxComponents} />
          </div>
        </div>
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center gap-2 px-4 md:px-0">
          {neighbours.previous && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="shadow-none"
            >
              <Link href={addLocaleToUrl(neighbours.previous.url)}>
                <IconArrowLeft /> {neighbours.previous.name}
              </Link>
            </Button>
          )}
          {neighbours.next && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="ml-auto shadow-none"
            >
              <Link href={addLocaleToUrl(neighbours.next.url)}>
                {neighbours.next.name} <IconArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--header-height)-var(--footer-height))] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        {doc.toc?.length ? (
          <div className="no-scrollbar overflow-y-auto px-8">
            <DocsTableOfContents toc={doc.toc} />
            <div className="h-12" />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-12 px-6">
        </div>
      </div>
    </div>
  )
}

function getRegistryDocs({
  docName,
  file,
  files,
  registryNames,
}: {
  docName: string;
  file: RegistryItem;
  files: { name: string }[];
  registryNames: Set<string>;
}) {
  const usedBy = registryUI.filter(
    (item) =>
      item.meta &&
      Array.isArray(item.meta.examples) &&
      item.meta.examples.includes(docName)
  );

  const relatedDocs = [
    ...files
      .map((f) => f.name.split('/').pop()?.replace('.tsx', ''))
      .filter(
        (fileName): fileName is string =>
          !!fileName && registryNames.has(fileName) && fileName !== docName
      )
      .map((fileName) => {
        const uiItem = registryUI.find((item) => item.name === fileName);

        if (!uiItem) return null;

        return {
          route: `/docs/${uiItem.type.includes('example') ? 'examples' : 'components'}/${fileName}`,
          title: getRegistryTitle(uiItem),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    ...usedBy.map((item) => ({
      route: `/docs/${item.type.includes('example') ? 'examples' : 'components'}/${item.name}`,
      title: getRegistryTitle(item),
    })),
  ]
    .filter(Boolean)
    .filter(
      (doc, index, self) =>
        index === self.findIndex((d) => d.route === doc.route)
    );

  const groups = [...(file.meta?.docs || []), ...relatedDocs].reduce(
    (acc, doc) => {
      if (doc.route!.startsWith(siteConfig.links.platePro)) {
        acc.external.push(doc as any);
      } else if (doc.route!.startsWith('/docs/components')) {
        acc.components.push(doc as any);
      } else if (doc.route!.startsWith('/docs/api')) {
        acc.docs.push({
          ...doc,
          title:
            getRegistryTitle({
              name: doc.title ?? doc.route?.split('/').pop(),
            }) + ' API',
        } as any);
      } else if (doc.route!.startsWith('/docs/')) {
        acc.docs.push({
          ...doc,
          title:
            getRegistryTitle({
              name: doc.title ?? doc.route?.split('/').pop(),
            }) + ' Plugin',
        } as any);
      } else {
        acc.docs.push(doc as any);
      }

      return acc;
    },
    { components: [], docs: [], external: [] } as Record<
      string,
      typeof relatedDocs
    >
  );

  return [
    ...groups.docs.sort((a: any, b: any) => a.title.localeCompare(b.title)),
    ...groups.components.sort((a: any, b: any) =>
      a.title.localeCompare(b.title)
    ),
    ...groups.external.sort((a: any, b: any) => a.title.localeCompare(b.title)),
  ];
}

async function getExampleCode(name?: string) {
  if (!name) return null;
  if (name.endsWith('-pro')) {
    return proExamples.find((ex) => ex.name === name);
  }

  const example = registryExamples.find((ex) => ex.name === name);

  if (!example) {
    throw new Error(`Component ${name} not found`);
  }

  // Use the same caching pattern
  const item = await getCachedRegistryItem(name, true);
  let highlightedFiles: any = [];
  let tree: any = null;
  let dependencies: string[] = [];

  if (item?.files) {
    [tree, highlightedFiles, dependencies] = await Promise.all([
      getCachedFileTree(item.files),
      getCachedHighlightedFiles(item.files),
      getCachedDependencies(name),
    ]);
  }

  return {
    dependencies,
    doc: { title: example.title },
    highlightedFiles,
    item,
    name: example.name,
    tree,
  };
}

const getItemVariant = (item: any) => {
  const allowedHosts = ['pro.platejs.org'];

  try {
    const url = new URL(item.route);

    if (allowedHosts.includes(url.hostname)) return 'plus';
  } catch (error) {
    // console.error('Invalid URL:', item.route, error);
  }

  // if (item.route?.includes('components')) return 'default';
  if (item.route?.includes('components')) return 'secondary';

  return 'outline';
};

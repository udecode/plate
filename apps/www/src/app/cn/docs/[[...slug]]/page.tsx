import type { PackageInfoType } from '@/hooks/use-package-info';
import type { RegistryItem } from 'shadcn/schema';

import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { ComponentInstallation } from '@/components/component-installation';
import { ComponentPreview } from '@/components/component-preview';
import { mdxComponents } from '@/components/mdx-components';
import { MdxProvider } from '@/components/mdx-provider';
import { slugToCategory } from '@/config/docs-utils';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getDocsNavMeta, getPagerForDoc } from '@/lib/docs-page-tree';
import { getPlateLLMPageMarkdown, processMdxForLLMs } from '@/lib/llm';
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from '@/lib/registry-cache';
import { getDocTitle, getRegistryTitle } from '@/lib/registry-utils';
import { getAllDependencies, getAllFiles } from '@/lib/rehype-utils';
import { source } from '@/lib/source';
import { getTableOfContents } from '@/lib/toc';
import { registry } from '@/registry/registry';
import { registryExamples } from '@/registry/registry-examples';
import { proExamples } from '@/registry/registry-pro';
import { registryUI } from '@/registry/registry-ui';

type DocPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export const dynamic = 'force-static';

async function getDocFromParams({ params }: DocPageProps) {
  const slugParam = (await params).slug;
  return source.getPage(slugParam ?? [], 'cn') ?? null;
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const doc = await getDocFromParams({ params });
  let title: string;
  let description: string | undefined;
  let slug: string;

  if (doc) {
    title = doc.data.title;
    slug = doc.url;
    description = doc.data.description ?? getDocsNavMeta(slug)?.description;
  } else {
    const slugParam = (await params).slug;
    const category = slugToCategory(slugParam);
    let docName = slugParam?.at(-1);
    let file: RegistryItem | undefined;

    if (category === 'component') {
      file = registryUI.find((c) => c.name === docName);
    } else if (category === 'example') {
      docName += '-demo';
      file = registryExamples.find((c) => c.name === docName);
    }
    if (!docName || !file) {
      return {};
    }

    const path = slugParam?.join('/') || '';
    slug = `/cn/docs${path ? `/${path}` : ''}`;
    title = file.title || docName;
    description = file.description;
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
  };
}

const registryNames = new Set(registry.items.map((item) => item.name));
const DEMO_SUFFIX_REGEX = /-demo$/;

function getRegistryStaticParams() {
  return [
    ...registryUI.map((item) => ({
      slug: ['components', item.name],
    })),
    ...registryExamples.map((item) => ({
      slug: ['examples', item.name.replace(DEMO_SUFFIX_REGEX, '')],
    })),
  ];
}

export function generateStaticParams() {
  return [
    ...source.getPages('cn').map((doc) => ({
      slug: doc.slugs,
    })),
    ...getRegistryStaticParams(),
  ].filter(
    (value, index, array) =>
      index ===
      array.findIndex(
        (candidate) => candidate.slug.join('/') === value.slug.join('/')
      )
  );
}

export default async function CNDocPage(props: DocPageProps) {
  const params = await props.params;
  const category = slugToCategory(params.slug);

  const doc = await getDocFromParams(props);

  const packageInfo: PackageInfoType = {
    gzip: '',
    name: '',
    npm: '',
    source: '',
  };

  if (!doc) {
    let docName = params.slug?.at(-1);
    let file: RegistryItem | undefined;

    if (category === 'component') {
      file = registryUI.find((c) => c.name === docName);
    } else if (category === 'example') {
      docName += '-demo';
      file = registryExamples.find((c) => c.name === docName);
    }
    if (!docName || !file) {
      notFound();
    }

    const dependencies = getAllDependencies(docName);
    const files = getAllFiles(docName);

    const slug = `/cn/docs/${params.slug?.join('/') ?? ''}`;
    const neighbours = getPagerForDoc({ slug }, 'cn');

    const docs = getRegistryDocs({
      docName,
      file,
      files,
      registryNames,
    });

    const item = await getCachedRegistryItem(docName, true);

    if (!item?.files) {
      notFound();
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
    ]);

    return (
      <DocContent
        category={category as any}
        {...file}
        doc={{
          ...file.meta,
          docs: docs as any,
          slug,
        }}
        neighbours={neighbours}
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
            dependencies={dependencies}
            highlightedFiles={highlightedFiles}
            item={item}
            tree={tree}
          />
        )}
      </DocContent>
    );
  }
  const raw = await doc.data.getText('raw');
  const description =
    doc.data.description ?? getDocsNavMeta(doc.url)?.description;
  const MDX = doc.data.body;

  const toc = await getTableOfContents(raw);
  const neighbours = getPagerForDoc({ slug: doc.url }, 'cn');

  return (
    <DocContent
      category={category as any}
      doc={{
        description,
        copyMarkdown: getPlateLLMPageMarkdown({
          content: processMdxForLLMs(raw),
          docUrl: `https://platejs.org${doc.url}`,
          title: doc.data.title,
        }),
        docs: doc.data.docs,
        links: doc.data.links,
        slug: doc.url,
        title: doc.data.title,
        toc: doc.data.toc,
      }}
      neighbours={neighbours}
      toc={toc}
    >
      <MdxProvider packageInfo={packageInfo}>
        <MDX components={mdxComponents as any} />
      </MdxProvider>
    </DocContent>
  );
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
          route: `/cn/docs/${uiItem.type.includes('example') ? 'examples' : 'components'}/${fileName}`,
          title: getRegistryTitle(uiItem),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    ...usedBy.map((item) => ({
      route: `/cn/docs/${item.type.includes('example') ? 'examples' : 'components'}/${item.name}`,
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
      if (!doc.route) return acc;

      const titledDoc = {
        ...doc,
        title: getDocTitle(doc),
      };

      if (doc.route.startsWith(siteConfig.links.platePro)) {
        acc.external.push(titledDoc as any);
      } else if (doc.route.startsWith('/cn/docs/components')) {
        acc.components.push(titledDoc as any);
      } else if (doc.route.startsWith('/cn/docs/api')) {
        acc.docs.push({
          ...titledDoc,
          title: `${titledDoc.title} API`,
        } as any);
      } else if (doc.route.startsWith('/cn/docs/')) {
        acc.docs.push({
          ...titledDoc,
          title: `${titledDoc.title} Plugin`,
        } as any);
      } else {
        acc.docs.push(titledDoc as any);
      }

      return acc;
    },
    { components: [], docs: [], external: [] } as Record<
      string,
      typeof relatedDocs
    >
  );

  const sortDocs = (docs: typeof relatedDocs) =>
    docs.sort((a: any, b: any) => getDocTitle(a).localeCompare(getDocTitle(b)));

  return [
    ...sortDocs(groups.docs),
    ...sortDocs(groups.components),
    ...sortDocs(groups.external),
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

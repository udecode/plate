import type { PackageInfoType } from '@/hooks/use-package-info';
import type { RegistryItem } from 'shadcn/schema';

import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { ComponentInstallation } from '@/components/component-installation';
import { ComponentPreview } from '@/components/component-preview';
import { mdxComponents } from '@/components/mdx-components';
import { MdxProvider } from '@/components/mdx-provider';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getPagerForDoc } from '@/lib/docs-page-tree';
import { getDocsNavMeta, slugToCategory } from '@/lib/docs-nav-metadata';
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
import { hrefWithLocale } from '@/lib/withLocale';
import { registry } from '@/registry/registry';
import { registryExamples } from '@/registry/registry-examples';
import { proExamples } from '@/registry/registry-pro';
import { registryUI } from '@/registry/registry-ui';

export type DocsLocale = 'cn' | 'en';

export type DocPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

const registryNames = new Set(registry.items.map((item) => item.name));
const DEMO_SUFFIX_REGEX = /-demo$/;

async function getDocFromParams({ params }: DocPageProps, locale: DocsLocale) {
  const slugParam = (await params).slug;

  return (
    source.getPage(slugParam ?? [], locale) ??
    (locale === 'cn' ? source.getPage(slugParam ?? [], 'en') : null) ??
    null
  );
}

function getDocsPath(slug: string[] | undefined, locale: DocsLocale) {
  const path = slug?.join('/') || '';
  const base = locale === 'cn' ? '/cn/docs' : '/docs';

  return `${base}${path ? `/${path}` : ''}`;
}

function localizeDocsUrl(url: string, locale: DocsLocale) {
  return locale === 'cn' ? hrefWithLocale(url, locale) : url;
}

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

function getRegistryFile({
  category,
  slug,
}: {
  category: ReturnType<typeof slugToCategory>;
  slug?: string[];
}) {
  const name = slug?.at(-1);

  if (category === 'component') {
    return {
      docName: name,
      file: registryUI.find((item) => item.name === name),
    };
  }

  if (category === 'example' && name) {
    const docName = `${name}-demo`;

    return {
      docName,
      file: registryExamples.find((item) => item.name === docName),
    };
  }

  return {
    docName: name,
    file: undefined,
  };
}

export async function generateDocMetadata(
  props: DocPageProps,
  locale: DocsLocale
): Promise<Metadata> {
  const doc = await getDocFromParams(props, locale);
  let title: string;
  let description: string | undefined;
  let slug: string;

  if (doc) {
    slug = localizeDocsUrl(doc.url, locale);
    title = doc.data.title;
    description = doc.data.description ?? getDocsNavMeta(slug)?.description;
  } else {
    const slugParam = (await props.params).slug;
    const category = slugToCategory(slugParam);
    const { docName, file } = getRegistryFile({ category, slug: slugParam });

    if (!docName || !file) {
      return {};
    }

    slug = getDocsPath(slugParam, locale);
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

export function generateDocStaticParams(locale: DocsLocale) {
  const pages =
    locale === 'cn'
      ? [...source.getPages('cn'), ...source.getPages('en')]
      : source.getPages(locale);

  return [
    ...pages.map((doc) => ({
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

export async function renderDocPage(props: DocPageProps, locale: DocsLocale) {
  const params = await props.params;
  const category = slugToCategory(params.slug);

  const doc = await getDocFromParams(props, locale);

  const packageInfo: PackageInfoType = {
    gzip: '',
    name: '',
    npm: '',
    source: '',
  };

  if (!doc) {
    const { docName, file } = getRegistryFile({
      category,
      slug: params.slug,
    });

    if (!docName || !file) {
      notFound();
    }

    const dependencies = getAllDependencies(docName);
    const files = getAllFiles(docName);
    const slug = getDocsPath(params.slug, locale);
    const neighbours = getPagerForDoc({ slug }, locale);
    const docs = getRegistryDocs({
      docName,
      file,
      files,
      locale,
      registryNames,
    });
    const item = await getCachedRegistryItem(docName);

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
  const localizedDocUrl = localizeDocsUrl(doc.url, locale);
  const description =
    doc.data.description ?? getDocsNavMeta(localizedDocUrl)?.description;
  const MDX = doc.data.body;
  const toc = await getTableOfContents(raw);
  const neighbours = getPagerForDoc({ slug: doc.url }, locale);

  return (
    <DocContent
      category={category as any}
      doc={{
        description,
        copyMarkdown: getPlateLLMPageMarkdown({
          content: processMdxForLLMs(raw),
          docUrl: `https://platejs.org${localizedDocUrl}`,
          title: doc.data.title,
        }),
        docs: doc.data.docs,
        links: doc.data.links,
        slug: localizedDocUrl,
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
  locale,
  registryNames,
}: {
  docName: string;
  file: RegistryItem;
  files: { name: string }[];
  locale: DocsLocale;
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
          route: getDocsPath(
            [
              uiItem.type.includes('example') ? 'examples' : 'components',
              fileName,
            ],
            locale
          ),
          title: getRegistryTitle(uiItem),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    ...usedBy.map((item) => ({
      route: getDocsPath(
        [item.type.includes('example') ? 'examples' : 'components', item.name],
        locale
      ),
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
        route: localizeDocsUrl(doc.route, locale),
        title: getDocTitle(doc),
      };

      if (doc.route.startsWith(siteConfig.links.platePro)) {
        acc.external.push(titledDoc as any);
      } else if (
        titledDoc.route.startsWith(getDocsPath(['components'], locale))
      ) {
        acc.components.push(titledDoc as any);
      } else if (titledDoc.route.startsWith(getDocsPath(['api'], locale))) {
        acc.docs.push({
          ...titledDoc,
          title: `${titledDoc.title} API`,
        } as any);
      } else if (titledDoc.route.startsWith(getDocsPath([], locale))) {
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

  const item = await getCachedRegistryItem(name);
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

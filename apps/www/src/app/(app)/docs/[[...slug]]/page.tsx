import type { PackageInfoType } from '@/hooks/use-package-info';
import type { RegistryItem } from 'shadcx/registry';

import type { Metadata } from 'next';

import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { ComponentInstallation } from '@/components/component-installation';
import { ComponentPreview } from '@/components/component-preview';
import { Mdx } from '@/components/mdx-components';
import { docsMap } from '@/config/docs';
import { slugToCategory } from '@/config/docs-utils';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/absoluteUrl';
import {
  getCachedDependencies,
  getCachedFileTree,
  getCachedHighlightedFiles,
  getCachedRegistryItem,
} from '@/lib/registry-cache';
import { getRegistryTitle } from '@/lib/registry-utils';
import { getAllDependencies, getAllFiles } from '@/lib/rehype-utils';
import { getTableOfContents } from '@/lib/toc';
import { registry } from '@/registry/registry';
import { examples, proExamples } from '@/registry/registry-examples';
import { ui } from '@/registry/registry-ui';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    locale: string;
  }>;
}

async function getDocFromParams({ params, searchParams }: DocPageProps) {
  const locale = (await searchParams).locale;
  const slugParam = (await params).slug;

  let slug = slugParam?.join('/') || '';
  slug = `${locale ?? 'en'}${slug ? '/' + slug : ''}`;

  const doc = allDocs.find((doc) => doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  // TODO
  const path = slugParam?.join('/') || '';
  doc.slug = '/docs' + (path ? '/' + path : '');
  if (locale && locale !== 'en') {
    doc.slug += `?locale=${locale}`;
  }

  return doc;
}

export async function generateMetadata({
  params,
  searchParams,
}: DocPageProps): Promise<Metadata> {
  const doc = await getDocFromParams({ params, searchParams });
  let title: string;
  let description: string | undefined;
  let slug: string;

  if (doc) {
    title = doc.title;
    description = doc.description;
    slug = doc.slug;
  } else {
    const slugParam = (await params).slug;
    const category = slugToCategory(slugParam);
    let docName = slugParam?.at(-1);
    let file: RegistryItem | undefined;

    if (category === 'component') {
      file = ui.find((c) => c.name === docName);
    } else if (category === 'example') {
      docName += '-demo';
      file = examples.find((c) => c.name === docName);
    }
    if (!docName || !file) {
      return {};
    }

    const path = slugParam?.join('/') || '';
    slug = '/docs' + (path ? '/' + path : '');
    title = file.doc?.title || docName;
    description = file.doc?.description;
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

export function generateStaticParams() {
  const docs = allDocs.map((doc) => ({
    slug: doc.slugAsParams.split('/'),
  }));

  return docs;
}

export default async function DocPage(props: DocPageProps) {
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
      file = ui.find((c) => c.name === docName);
    } else if (category === 'example') {
      docName += '-demo';
      file = examples.find((c) => c.name === docName);
    }
    if (!docName || !file) {
      notFound();
    }

    const dependencies = getAllDependencies(docName);
    const files = getAllFiles(docName);

    const slug = '/docs/' + params.slug?.join('/') || '';

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
      file.doc?.examples
        ? Promise.all(
            file.doc.examples.map(async (ex) => await getExampleCode(ex))
          )
        : undefined,
    ]);

    return (
      <DocContent
        category={category as any}
        {...file}
        doc={{
          ...file.doc,
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
            usage={file.doc?.usage}
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
  if (!doc.description) {
    doc.description = docsMap[doc.slug]?.description;
  }

  const toc = await getTableOfContents(doc.body.raw);

  return (
    <DocContent category={category as any} doc={doc} toc={toc}>
      <Mdx code={doc.body.code} packageInfo={packageInfo} />
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
  const usedBy = ui.filter(
    (item) =>
      item.doc &&
      Array.isArray(item.doc.examples) &&
      item.doc.examples.includes(docName)
  );

  const relatedDocs = [
    ...files
      .map((f) => f.name.split('/').pop()?.replace('.tsx', ''))
      .filter(
        (fileName): fileName is string =>
          !!fileName && registryNames.has(fileName) && fileName !== docName
      )
      .map((fileName) => {
        const uiItem = ui.find((item) => item.name === fileName);

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

  const groups = [...(file.doc?.docs || []), ...relatedDocs].reduce(
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
    ...groups.docs.sort((a, b) => a.title.localeCompare(b.title)),
    ...groups.components.sort((a, b) => a.title.localeCompare(b.title)),
    ...groups.external.sort((a, b) => a.title.localeCompare(b.title)),
  ];
}

async function getExampleCode(name?: string) {
  if (!name) return null;
  if (name.endsWith('-pro')) {
    return proExamples.find((ex) => ex.name === name);
  }

  const example = examples.find((ex) => ex.name === name);

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
    doc: { title: example.doc?.title },
    highlightedFiles,
    item,
    name: example.name,
    tree,
  };
}

// const pkg = docToPackage(name);
// if (pkg) {
//   const { gzip: gzipNumber } = await getPackageData(pkg.name);
//   const gzip =
//     typeof gzipNumber === 'number' ? formatBytes(gzipNumber) : null;
//
//   packageInfo.name = pkg.name;
//   if (gzip) {
//     packageInfo.gzip = gzip;
//   }
//   packageInfo.source =
//     'https://github.com/udecode/plate/tree/main/packages/' +
//     pkg.sourcePath +
//     '/src';
//   packageInfo.npm = 'https://www.npmjs.com/package/@udecode/' + pkg.name;
// }

// let toc: TableOfContents;
// if (params.slug?.[0] === 'api') {
//   toc = getAPITableOfContents(doc.body.raw);
// } else {
// }

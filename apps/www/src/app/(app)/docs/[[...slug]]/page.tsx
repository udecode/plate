import type { PackageInfoType } from '@/hooks/use-package-info';
import type { RegistryEntry } from '@/registry/schema';

import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';

import { DocContent } from '@/app/(app)/docs/[[...slug]]/doc-content';
import { ComponentInstallation } from '@/components/component-installation';
import { ComponentPreview } from '@/components/component-preview';
import { Mdx } from '@/components/mdx-components';
import { pluginsNavItems } from '@/config/docs';
import { siteConfig } from '@/config/site';
import { getRegistryTitle } from '@/lib/registry-utils';
import {
  getAllDependencies,
  getAllFiles,
  getExampleCode,
} from '@/lib/rehype-utils';
import { getTableOfContents } from '@/lib/toc';
import { registry } from '@/registry/registry';
import { examples } from '@/registry/registry-examples';
import { ui } from '@/registry/registry-ui';

import '@/styles/mdx.css';

// export async function generateMetadata({
//   params,
// }: DocPageProps): Promise<Metadata> {
//   const doc = getDocFromParams({ params });
//
//   if (!doc) {
//     return {};
//   }
//
//   return {
//     title: doc.title,
//     description: doc.description,
//     openGraph: {
//       title: doc.title,
//       description: doc.description,
//       type: 'article',
//       url: absoluteUrl(doc.slug),
//       images: [
//         {
//           url: siteConfig.ogImage,
//           width: 1200,
//           height: 630,
//           alt: siteConfig.name,
//         },
//       ],
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: doc.title,
//       description: doc.description,
//       images: [siteConfig.ogImage],
//       creator: '@shadcn',
//     },
//   };
// }

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const registryNames = new Set(registry.map((item) => item.name));

function getDocFromParams({ params }: { params: { slug: string[] } }) {
  const slug = params.slug?.join('/') || '';
  const doc = allDocs.find((_doc) => _doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

export function generateStaticParams() {
  const docs = allDocs.map((doc) => ({
    slug: doc.slugAsParams.split('/'),
  }));

  return docs;
}

export default async function DocPage(props: DocPageProps) {
  const params = await props.params;
  const name = params.slug?.[0];
  const currentPath = '/docs/' + (params.slug?.join('/') || '');

  const isUI = name === 'components';
  const isExample = name === 'examples';
  const isPlugin = pluginsNavItems.some((plugin) => plugin.href === currentPath);

  const doc = getDocFromParams({ params });

  const packageInfo: PackageInfoType = {
    gzip: '',
    name: '',
    npm: '',
    source: '',
  };

  if (!doc) {
    let docName = params.slug?.at(-1);
    let file: RegistryEntry | undefined;

    if (isUI) {
      file = ui.find((c) => c.name === docName);
    } else {
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

    const componentExamples = file.doc?.examples
      ?.map((ex) => getExampleCode(ex))
      .filter(Boolean);

    return (
      <DocContent
        isExample={isExample}
        isPlugin={isPlugin}
        isUI={isUI}
        {...file}
        doc={{
          ...file.doc,
          docs,
          slug,
        }}
      >
        {isUI ? (
          <ComponentInstallation
            name={file.name}
            codeTabs={!isUI}
            dependencies={dependencies}
            examples={componentExamples as any}
            files={files}
            usage={file.doc?.usage}
          />
        ) : (
          <ComponentPreview
            name={file.name}
            dependencies={dependencies}
            files={files}
          />
        )}
      </DocContent>
    );
  }

  const toc = await getTableOfContents(doc.body.raw);

  return (
    <DocContent
      doc={doc}
      isExample={isExample}
      isPlugin={isPlugin}
      isUI={isUI}
      toc={toc}
    >
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
  file: RegistryEntry;
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
  ].filter(Boolean);

  const groups = [...(file.doc?.docs || []), ...relatedDocs].reduce(
    (acc, doc) => {
      if (doc.route!.startsWith(siteConfig.links.platePro)) {
        acc.external.push(doc as any);
      } else if (doc.route!.startsWith('/docs/components')) {
        acc.components.push(doc as any);
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

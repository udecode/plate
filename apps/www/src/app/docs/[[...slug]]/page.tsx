import type { PackageInfoType } from '@/hooks/use-package-info';

import { allDocs } from 'contentlayer/generated';
import { notFound } from 'next/navigation';

import { DocPageLayout } from '@/components/doc-page-layout';
import { Mdx } from '@/components/mdx-components';
// import { formatBytes, getPackageData } from '@/lib/bundlephobia';
import { getTableOfContents } from '@/lib/toc';

import '@/styles/mdx.css';

interface DocPageProps {
  params: {
    slug: string[];
  };
}

function getDocFromParams({ params }: DocPageProps) {
  const slug = params.slug?.join('/') || '';
  const doc = allDocs.find((_doc) => _doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

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

export function generateStaticParams(): DocPageProps['params'][] {
  const docs = allDocs.map((doc) => ({
    slug: doc.slugAsParams.split('/'),
  }));

  return docs;
}

export default async function DocPage({ params }: DocPageProps) {
  const name = params.slug?.[0];

  const isUI = name === 'components';

  const doc = getDocFromParams({ params });

  const packageInfo: PackageInfoType = {
    gzip: '',
    name: '',
    npm: '',
    source: '',
  };
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

  if (!doc) {
    notFound();
  }

  // let toc: TableOfContents;
  // if (params.slug?.[0] === 'api') {
  //   toc = getAPITableOfContents(doc.body.raw);
  // } else {
  // }

  const toc = await getTableOfContents(doc.body.raw);

  return (
    <DocPageLayout doc={doc} isUI={isUI} toc={toc}>
      <Mdx code={doc.body.code} packageInfo={packageInfo} />
    </DocPageLayout>
  );
}

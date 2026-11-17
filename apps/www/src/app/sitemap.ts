import type { MetadataRoute } from 'next';

import {
  type DocsLocale,
  generateDocStaticParams,
  getDocsPath,
} from '@/app/(app)/docs/[[...slug]]/doc-page';
import { siteConfig } from '@/config/site';

const locales: DocsLocale[] = ['en', 'cn'];

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    '/',
    '/cn',
    '/editors',
    '/create',
    ...locales.flatMap((locale) =>
      generateDocStaticParams(locale).map(({ slug }) =>
        getDocsPath(slug, locale)
      )
    ),
  ];

  return [...new Set(urls)].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
  }));
}

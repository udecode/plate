import { expect, test } from 'bun:test';

import { registry } from '@/registry/registry';
import { registryExamples } from '@/registry/registry-examples';
import { source } from '@/lib/source';

import { generateDocMetadata, generateDocStaticParams } from './doc-page';

test('every registry-backed component and example resolves through the docs route', async () => {
  const routes = [
    ...registry.items
      .filter((item) => item.type === 'registry:component')
      .map((item) => ['components', item.name]),
    ...registryExamples.map((item) => ['examples', item.name.replace(/-demo$/, '')]),
  ];

  for (const locale of ['en', 'cn'] as const) {
    const params = generateDocStaticParams(locale);
    for (const slug of routes) {
      expect(params).toContainEqual({ slug });
      if (source.getPage(slug, locale) ?? source.getPage(slug, 'en')) continue;
      const metadata = await generateDocMetadata({ params: Promise.resolve({ slug }) }, locale);
      expect(metadata.title, `${locale}/docs/${slug.join('/')}`).toBeTruthy();
      expect(new URL(String(metadata.openGraph?.url)).pathname).toBe(
        `${locale === 'cn' ? '/cn' : ''}/docs/${slug.join('/')}`
      );
    }
  }
});

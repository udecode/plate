import { loader } from 'fumadocs-core/source';

import { blogs, docs } from '../../.source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const blogsSource = loader({
  // it assigns a URL to your pages
  baseUrl: '/blogs',
  source: blogs.toFumadocsSource(),
});

export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
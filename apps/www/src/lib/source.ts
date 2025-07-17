import { loader } from 'fumadocs-core/source';

import { blogs } from '../../.source';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/blogs',
  source: blogs.toFumadocsSource(),
});

import { loader } from 'fumadocs-core/source';

import { blogs } from '../../.source';

export const blogsSource = loader({
  baseUrl: '/blogs',
  source: blogs.toFumadocsSource(),
});

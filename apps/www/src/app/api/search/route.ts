import { createFromSource } from 'fumadocs-core/search/server';

import { source } from '@/lib/source';

export const { GET } = createFromSource(source, {
  localeMap: {
    cn: 'english',
  },
  search: {
    groupBy: {
      maxResult: 4,
      properties: ['page_id'],
    },
    limit: 20,
  },
});

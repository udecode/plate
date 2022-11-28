import { createAtomStore } from '@udecode/plate-core';

export const { commentStore, useCommentStore } = createAtomStore(
  {
    id: (null as unknown) as string,
  },
  { name: 'comment' as const, scope: 'comment' }
);

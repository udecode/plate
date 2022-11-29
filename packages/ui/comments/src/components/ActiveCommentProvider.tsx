import React from 'react';
import { createAtomStore } from '@udecode/plate-core';
import { CommentStoreState } from './CommentProvider';

export const SCOPE_ACTIVE_COMMENT = Symbol('activeComment');

export const { activeCommentStore, useActiveCommentStore } = createAtomStore(
  {
    id: '',
  } as CommentStoreState,
  {
    name: 'activeComment',
    scope: SCOPE_ACTIVE_COMMENT,
  }
);

export const useActiveCommentState = () => useActiveCommentStore().use;
export const useActiveCommentSelectors = () => useActiveCommentStore().get;
export const useActiveCommentActions = () => useActiveCommentStore().set;

// export const ActiveCommentProvider = ({
//   children,
//   ...props
// }: Partial<CommentStoreState> & { children: ReactNode }) => {
//   return (
//     <CommentProvider JotaiProvider
//       initialValues={useJotaiProviderInitialValues(activeCommentStore, props)}
//       scope={SCOPE_COMMENT}
//     >
//       {children}
//     </CommentProviderJotaiProvider>
//   );
// };

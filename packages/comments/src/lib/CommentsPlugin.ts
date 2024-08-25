import { createTSlatePlugin } from '@udecode/plate-common';

import { withComments } from './withComments';

export const CommentsPlugin = createTSlatePlugin({
  extendEditor: withComments,
  key: 'comment',
  node: { isLeaf: true },
});

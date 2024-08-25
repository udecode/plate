import { createTSlatePlugin } from '@udecode/plate-common';

import { withComments } from './withComments';

export const CommentsPlugin = createTSlatePlugin({
  extendEditor: withComments,
  isLeaf: true,
  key: 'comment',
});

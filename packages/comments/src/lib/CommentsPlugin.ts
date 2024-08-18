import { createTSlatePlugin } from '@udecode/plate-common';

import { withComments } from './withComments';

export const CommentsPlugin = createTSlatePlugin({
  isLeaf: true,
  key: 'comment',
  withOverrides: withComments,
});

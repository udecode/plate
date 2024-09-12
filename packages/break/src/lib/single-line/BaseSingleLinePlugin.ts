import { createSlatePlugin } from '@udecode/plate-common';

import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const BaseSingleLinePlugin = createSlatePlugin({
  extendEditor: withSingleLine,
  key: 'singleLine',
});

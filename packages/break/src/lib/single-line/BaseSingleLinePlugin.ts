import { createSlatePlugin } from '@udecode/plate-common';

import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const BaseSingleLinePlugin = createSlatePlugin({
  key: 'singleLine',
  extendEditor: withSingleLine,
});

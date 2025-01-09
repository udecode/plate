import { createSlatePlugin } from '@udecode/plate';

import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const BaseSingleLinePlugin = createSlatePlugin({
  key: 'singleLine',
}).overrideEditor(withSingleLine);

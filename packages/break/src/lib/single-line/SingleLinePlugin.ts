import { createSlatePlugin } from '@udecode/plate-common';

import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createSlatePlugin({
  key: 'singleLine',
  withOverrides: withSingleLine,
});
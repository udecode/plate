import { createSlatePlugin } from '@udecode/plate-common';

import { onKeyDownSingleLine } from './onKeyDownSingleLine';
import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const SingleLinePlugin = createSlatePlugin({
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
  key: 'singleLine',
  withOverrides: withSingleLine,
});

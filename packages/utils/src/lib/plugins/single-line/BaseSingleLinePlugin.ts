import { createSlatePlugin } from '@udecode/plate-core';

import { KEYS } from '../../plate-keys';
import { withSingleLine } from './withSingleLine';

/** Forces editor to only have one line. */
export const BaseSingleLinePlugin = createSlatePlugin({
  key: KEYS.singleLine,
}).overrideEditor(withSingleLine);

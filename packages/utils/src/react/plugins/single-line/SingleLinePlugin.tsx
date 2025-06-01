import { toPlatePlugin } from '@udecode/plate-core/react';

import { BaseSingleLinePlugin } from '../../../lib/plugins/single-line/BaseSingleLinePlugin';
import { onKeyDownSingleLine } from './onKeyDownSingleLine';

export const SingleLinePlugin = toPlatePlugin(BaseSingleLinePlugin, {
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
});

import { toPlatePlugin } from '@udecode/plate-common/react';

import { SingleLinePlugin as BaseSingleLinePlugin } from '../../lib/single-line/SingleLinePlugin';
import { onKeyDownSingleLine } from './onKeyDownSingleLine';

export const SingleLinePlugin = toPlatePlugin(BaseSingleLinePlugin, {
  handlers: {
    onKeyDown: onKeyDownSingleLine,
  },
});

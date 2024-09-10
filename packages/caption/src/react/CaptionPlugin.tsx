import { toPlatePlugin } from '@udecode/plate-common/react';

import { CaptionPlugin as BaseCaptionPlugin } from '../lib/CaptionPlugin';
import { onKeyDownCaption } from './onKeyDownCaption';

export const CaptionPlugin = toPlatePlugin(BaseCaptionPlugin, {
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
});

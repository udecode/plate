import { toPlatePlugin } from '@udecode/plate/react';

import { BaseCaptionPlugin } from '../lib/BaseCaptionPlugin';
import { onKeyDownCaption } from './onKeyDownCaption';

export const CaptionPlugin = toPlatePlugin(BaseCaptionPlugin, {
  handlers: {
    onKeyDown: onKeyDownCaption,
  },
});

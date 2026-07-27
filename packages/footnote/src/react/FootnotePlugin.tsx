import { toPlatePlugin } from '@platejs/core/react';

import { BaseFootnotePlugin } from '../lib';
import { FootnoteInputPlugin } from './FootnoteInputPlugin';

export const FootnotePlugin = toPlatePlugin(BaseFootnotePlugin, {
  dependencies: [FootnoteInputPlugin],
});

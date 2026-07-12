import { toPlatePlugin } from '@platejs/core/react';

import { BaseFootnoteReferencePlugin } from '../lib';

export const FootnoteReferencePlugin = toPlatePlugin(
  BaseFootnoteReferencePlugin
);

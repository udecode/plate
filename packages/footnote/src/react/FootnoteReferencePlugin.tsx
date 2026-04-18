import { toPlatePlugin } from 'platejs/react';

import { BaseFootnoteReferencePlugin } from '../lib';

export const FootnoteReferencePlugin = toPlatePlugin(
  BaseFootnoteReferencePlugin
);

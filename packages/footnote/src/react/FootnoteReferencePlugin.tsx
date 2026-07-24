import { toPlatePlugin } from '@platejs/core/react';

import { BaseFootnoteReferencePlugin } from '../lib';
import { FootnoteInputPlugin } from './FootnoteInputPlugin';

export const FootnoteReferencePlugin = toPlatePlugin(
  BaseFootnoteReferencePlugin,
  {
    dependencies: [FootnoteInputPlugin],
  }
);

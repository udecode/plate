import { SlatePlugin } from 'slate-react';
import { withBlock } from './withBlock';

export const BlockPlugin = (): SlatePlugin => ({
  editor: withBlock,
});

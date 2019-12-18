import { SlatePlugin } from 'slate-react';
import { withToggleMark } from './withToggleMark';

export const MarkPlugin = (): SlatePlugin => ({
  editor: withToggleMark,
});

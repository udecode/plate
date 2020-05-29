import { SlatePlugin } from '../../common';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const SoftBreakPlugin = (): SlatePlugin => ({
  onKeyDown: onKeyDownSoftBreak(),
});

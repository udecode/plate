import { SlatePlugin } from 'common/types';
import { onKeyDownSoftBreak } from './onKeyDownSoftBreak';

export const SoftBreakPlugin = (): SlatePlugin => ({
  onKeyDown: onKeyDownSoftBreak(),
});

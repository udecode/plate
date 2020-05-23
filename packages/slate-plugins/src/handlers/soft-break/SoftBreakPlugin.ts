import { SlatePlugin } from 'common/types';
import { onKeyDownSoftBreak } from 'handlers/soft-break/onKeyDownSoftBreak';

export const SoftBreakPlugin = (): SlatePlugin => ({
  onKeyDown: onKeyDownSoftBreak(),
});

import { MarkOnKeyDownOptions } from '../../common/utils/onKeyDownMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { ItalicKeyOption, ItalicPluginOptionsValues } from './types';

export const MARK_ITALIC = 'italic';

export const DEFAULTS_ITALIC: Record<
  ItalicKeyOption,
  ItalicPluginOptionsValues & MarkOnKeyDownOptions
> = {
  italic: {
    component: StyledLeaf,
    type: MARK_ITALIC,
    hotkey: 'mod+i',
    rootProps: {
      className: `slate-italic`,
      as: 'em',
    },
  },
};

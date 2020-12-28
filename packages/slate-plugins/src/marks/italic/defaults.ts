import {
  GetOnHotkeyToggleMarkOptions,
  MARK_ITALIC,
} from '@udecode/slate-plugins-common';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { ItalicKeyOption, ItalicPluginOptionsValues } from './types';

export const DEFAULTS_ITALIC: Record<
  ItalicKeyOption,
  ItalicPluginOptionsValues & GetOnHotkeyToggleMarkOptions
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

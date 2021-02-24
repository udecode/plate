import { GetOnHotkeyToggleMarkOptions } from '@udecode/slate-plugins-common';
import { UnderlineKeyOption, UnderlinePluginOptionsValues } from './types';

export const MARK_UNDERLINE = 'underline';

export const DEFAULTS_UNDERLINE: Record<
  UnderlineKeyOption,
  UnderlinePluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  underline: {
    // component: StyledLeaf,
    type: MARK_UNDERLINE,
    hotkey: 'mod+u',
    rootProps: {
      className: `slate-underline`,
      as: 'u',
    },
  },
};

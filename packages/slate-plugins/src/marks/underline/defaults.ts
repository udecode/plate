import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { UnderlineKeyOption, UnderlinePluginOptionsValues } from './types';

export const MARK_UNDERLINE = 'underline';

export const DEFAULTS_UNDERLINE: Record<
  UnderlineKeyOption,
  UnderlinePluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  underline: {
    component: StyledLeaf,
    type: MARK_UNDERLINE,
    hotkey: 'mod+u',
    rootProps: {
      className: `slate-underline`,
      as: 'u',
    },
  },
};

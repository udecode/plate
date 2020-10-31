import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { BoldKeyOption, BoldPluginOptionsValues } from './types';

export const MARK_BOLD = 'bold';

export const DEFAULTS_BOLD: Record<
  BoldKeyOption,
  BoldPluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  bold: {
    component: StyledLeaf,
    type: MARK_BOLD,
    hotkey: 'mod+b',
    rootProps: {
      className: `slate-bold`,
      as: 'strong',
    },
  },
};

import {
  GetOnHotkeyToggleMarkOptions,
  MARK_BOLD,
} from '@udecode/slate-plugins-common';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { BoldKeyOption, BoldPluginOptionsValues } from './types';

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

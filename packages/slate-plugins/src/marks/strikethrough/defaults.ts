import { GetOnHotkeyToggleMarkOptions } from '@udecode/slate-plugins-common';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import {
  StrikethroughKeyOption,
  StrikethroughPluginOptionsValues,
} from './types';

export const MARK_STRIKETHROUGH = 'strikethrough';

export const DEFAULTS_STRIKETHROUGH: Record<
  StrikethroughKeyOption,
  StrikethroughPluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  strikethrough: {
    component: StyledLeaf,
    type: MARK_STRIKETHROUGH,
    hotkey: 'mod+shift+s',
    rootProps: {
      className: `slate-strikethrough`,
      as: 's',
    },
  },
};

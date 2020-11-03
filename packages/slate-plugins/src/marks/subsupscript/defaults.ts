import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import {
  SubscriptKeyOption,
  SubscriptPluginOptionsValues,
} from './subscript/types';
import {
  SuperscriptKeyOption,
  SuperscriptPluginOptionsValues,
} from './superscript/types';

export const MARK_SUPERSCRIPT = 'superscript';
export const MARK_SUBSCRIPT = 'subscript';

export const DEFAULTS_SUBSUPSCRIPT: Record<
  SubscriptKeyOption | SuperscriptKeyOption,
  SubscriptPluginOptionsValues &
    SuperscriptPluginOptionsValues &
    GetOnHotkeyToggleMarkOptions
> = {
  subscript: {
    component: StyledLeaf,
    type: MARK_SUBSCRIPT,
    hotkey: 'mod+,',
    clear: MARK_SUPERSCRIPT,
    rootProps: {
      className: `slate-subscript`,
      as: 'sub',
    },
  },
  superscript: {
    component: StyledLeaf,
    type: MARK_SUPERSCRIPT,
    hotkey: 'mod+.',
    clear: MARK_SUBSCRIPT,
    rootProps: {
      className: `slate-superscript`,
      as: 'sup',
    },
  },
};

import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { HighlightKeyOption, HighlightPluginOptionsValues } from './types';

export const MARK_HIGHLIGHT = 'highlight';

export const DEFAULTS_HIGHLIGHT: Record<
  HighlightKeyOption,
  HighlightPluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  highlight: {
    component: StyledLeaf,
    type: MARK_HIGHLIGHT,
    hotkey: 'mod+shift+h',
    rootProps: {
      className: 'slate-highlight',
      as: 'mark',
      styles: {
        root: {
          backgroundColor: '#FEF3B7',
        },
      },
    },
  },
};

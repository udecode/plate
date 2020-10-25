import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { CodeKeyOption, CodePluginOptionsValues } from './types';

export const MARK_CODE = 'code';

export const DEFAULTS_CODE: Record<
  CodeKeyOption,
  CodePluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  code: {
    component: StyledLeaf,
    type: MARK_CODE,
    hotkey: 'mod+e',
    rootProps: {
      className: `slate-code`,
      as: 'code',
      styles: {
        root: {
          whiteSpace: 'pre-wrap',
          fontSize: '85%',
          fontFamily:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
          backgroundColor: 'rgba(135,131,120,0.15)',
          borderRadius: '3px',
          padding: '0.2em 0.4em',
          lineHeight: 'normal',
        },
      },
    },
  },
};

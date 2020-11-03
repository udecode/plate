import { GetOnHotkeyToggleMarkOptions } from '../../common/utils/getOnHotkeyToggleMark';
import { StyledLeaf } from '../../components/StyledComponent/StyledLeaf';
import { KbdKeyOption, KbdPluginOptionsValues } from './types';

export const MARK_KBD = 'kbd';

export const DEFAULTS_KBD: Record<
  KbdKeyOption,
  KbdPluginOptionsValues & GetOnHotkeyToggleMarkOptions
> = {
  kbd: {
    component: StyledLeaf,
    type: MARK_KBD,
    // hotkey: "mod+e", TODO: What hotkey for keyboard shortcut?
    rootProps: {
      className: `slate-kbd`,
      as: 'kbd',
      styles: {
        root: {
          whiteSpace: 'pre-wrap',
          fontSize: '75%',
          fontFamily:
            '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;',
          backgroundColor: 'white',
          border: '1px solid black',
          borderRadius: '3px',
          padding: '0.2em 0.4em',
          marginRight: '0.2em',
          lineHeight: 'normal',
          boxShadow: '2px 2px 3px 0px rgba(0,0,0,0.75)',
        },
      },
    },
  },
};

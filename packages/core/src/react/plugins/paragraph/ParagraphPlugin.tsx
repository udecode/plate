import {
  ParagraphPlugin as BaseParagraphPlugin,
  toggleNodeType,
} from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';
import { onKeyDownToggleElement } from '../../utils/onKeyDownToggleElement';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  // options: {
  //   hotkey: ['mod+opt+0', 'mod+shift+0'],
  // } as HotkeyPluginOptions,
  hotkeys: {
    paragraph: {
      callback: ({ editor, type }) => {
        console.log('hey');
        const defaultType = editor.getType(ParagraphPlugin);
        console.log(defaultType, type);
        toggleNodeType(editor, {
          activeType: type,
          inactiveType: defaultType,
        });
      },
      hotkey: ['meta+option+0', 'meta+shift+0'],
    },
  },
});

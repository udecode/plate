import { ParagraphPlugin as BaseParagraphPlugin } from '../../../lib/plugins/paragraph/ParagraphPlugin';
import { createReactPlugin } from '../../plugin/createReactPlugin';
import { onKeyDownToggleElement } from '../../utils/onKeyDownToggleElement';

// TODO merge types
// .extend<HotkeyPluginOptions>({
export const ParagraphPlugin = createReactPlugin({
  ...BaseParagraphPlugin,
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: ['mod+opt+0', 'mod+shift+0'],
  },
});

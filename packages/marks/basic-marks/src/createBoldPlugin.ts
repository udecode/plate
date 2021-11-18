import {
  createPluginFactory,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-core';
import { deserializeHtmlBold } from './deserializeHtmlBold';

export const MARK_BOLD = 'bold';

/**
 * Enables support for bold formatting
 */
export const createBoldPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_BOLD,
  isLeaf: true,
  deserializeHtml: deserializeHtmlBold,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+b',
  },
});

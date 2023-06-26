import {
  createPluginFactory,
  findHtmlParentElement,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-common';

export const MARK_CODE = 'code';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_CODE,
  isLeaf: true,
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['CODE'],
      },
      {
        validStyle: {
          wordWrap: 'break-word',
        },
      },
      {
        validStyle: {
          fontFamily: 'Consolas',
        },
      },
    ],
    query(el) {
      const blockAbove = findHtmlParentElement(el, 'P');
      if (blockAbove?.style.fontFamily === 'Consolas') return false;

      return !findHtmlParentElement(el, 'PRE');
    },
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+e',
  },
});

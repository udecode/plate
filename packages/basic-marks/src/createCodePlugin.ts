import {
  type ToggleMarkPlugin,
  createPluginFactory,
  findHtmlParentElement,
  onKeyDownToggleMark,
} from '@udecode/plate-common/server';

export const MARK_CODE = 'code';

/** Enables support for code formatting */
export const createCodePlugin = createPluginFactory<ToggleMarkPlugin>({
  deserializeHtml: {
    query(el) {
      const blockAbove = findHtmlParentElement(el, 'P');

      if (blockAbove?.style.fontFamily === 'Consolas') return false;

      return !findHtmlParentElement(el, 'PRE');
    },
    rules: [
      {
        validNodeName: ['CODE'],
      },
      {
        validStyle: {
          fontFamily: 'Consolas',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: MARK_CODE,
  options: {
    hotkey: 'mod+e',
  },
});

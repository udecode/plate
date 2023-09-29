import {
  AnyObject,
  createPluginFactory,
  onKeyDownToggleMark,
} from '@udecode/plate-common';

export const MARK_KBD = 'kbd';

/**
 * Enables support for code formatting
 */
export const createKbdPlugin = createPluginFactory<AnyObject>({
  key: MARK_KBD,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  deserializeHtml: {
    rules: [{ validNodeName: ['KBD'] }],
  },
});

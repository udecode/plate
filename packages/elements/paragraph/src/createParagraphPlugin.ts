import { getToggleElementOnKeyDown, HotkeyPlugin } from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getParagraphDeserialize } from './getParagraphDeserialize';

export const ELEMENT_PARAGRAPH = 'p';

/**
 * Enables support for paragraphs.
 */
export const createParagraphPlugin = createPlugin<HotkeyPlugin>({
  key: ELEMENT_PARAGRAPH,
  isElement: true,
  deserialize: getParagraphDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(),
  hotkey: ['mod+opt+0', 'mod+shift+0'],
});

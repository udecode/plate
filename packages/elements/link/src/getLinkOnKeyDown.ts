import { getPlugin, KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { ELEMENT_LINK } from './defaults';
import { getAndUpsertLink } from './transforms';
import { WithLinkOptions } from './types';

export const getLinkOnKeyDown = (
  options?: WithLinkOptions
): KeyboardHandler => (editor) => (e) => {
  const { hotkey } = getPlugin(editor, ELEMENT_LINK);

  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();
    e.stopPropagation();

    getAndUpsertLink(editor, options?.getLinkUrl);
  }
};

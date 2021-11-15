import { KeyboardHandler } from '@udecode/plate-core';
import isHotkey from 'is-hotkey';
import { getAndUpsertLink } from './transforms';
import { LinkPlugin } from './types';

export const getLinkOnKeyDown = (): KeyboardHandler<{}, LinkPlugin> => (
  editor,
  { options: { getLinkUrl, hotkey } }
) => (e) => {
  if (!hotkey) return;

  if (isHotkey(hotkey, e as any)) {
    e.preventDefault();
    e.stopPropagation();

    getAndUpsertLink(editor, getLinkUrl);
  }
};

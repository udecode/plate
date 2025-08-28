import type { SlateEditor } from '@platejs/core';
import type { TText } from '@platejs/slate';

import { type TLinkElement, KEYS } from '@platejs/utils';

export interface CreateLinkNodeOptions {
  url: string;
  children?: TText[];
  target?: string;
  text?: string;
}

export const createLinkNode = (
  editor: SlateEditor,
  { children, target, text = '', url }: CreateLinkNodeOptions
): TLinkElement => {
  const type = editor.getType(KEYS.link);

  return {
    children: children ?? [{ text }],
    target,
    type,
    url,
  };
};

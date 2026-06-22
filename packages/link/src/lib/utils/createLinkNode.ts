import type { Text } from '@platejs/slate';

import type { SlateEditor, TLinkElement } from 'platejs';

import { KEYS } from 'platejs';

export type CreateLinkNodeOptions = {
  url: string;
  children?: Text[];
  target?: string;
  text?: string;
};

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

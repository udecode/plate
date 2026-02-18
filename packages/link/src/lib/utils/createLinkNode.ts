import type { SlateEditor, TLinkElement, TText } from 'platejs';

import { KEYS } from 'platejs';

export type CreateLinkNodeOptions = {
  url: string;
  children?: TText[];
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

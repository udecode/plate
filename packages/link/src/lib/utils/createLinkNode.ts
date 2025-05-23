import type { SlateEditor, TText } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TLinkElement } from '../types';

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

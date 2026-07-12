import type { BaseEditor } from '@platejs/core';
import type { Text } from '@platejs/plite';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';

export type CreateLinkNodeOptions = {
  url: string;
  children?: Text[];
  target?: string;
  text?: string;
};

export const createLinkNode = (
  editor: BaseEditor,
  { children, target, text = '', url }: CreateLinkNodeOptions
): TLinkElement => ({
  children: children ?? [{ text }],
  target,
  type: editor.getType(KEYS.link),
  url,
});

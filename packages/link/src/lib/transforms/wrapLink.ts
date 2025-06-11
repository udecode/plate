import type { SlateEditor, TLinkElement, WrapNodesOptions } from 'platejs';

import { KEYS } from 'platejs';

export interface WrapLinkOptions extends WrapNodesOptions {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = (
  editor: SlateEditor,
  { target, url, ...options }: WrapLinkOptions
) => {
  editor.tf.wrapNodes<TLinkElement>(
    {
      children: [],
      target,
      type: editor.getType(KEYS.link),
      url,
    },
    { split: true, ...options } as any
  );
};

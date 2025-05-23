import type { SlateEditor, WrapNodesOptions } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TLinkElement } from '../types';

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

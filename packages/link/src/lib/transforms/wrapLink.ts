import type { SlateEditor, WrapNodesOptions } from '@udecode/plate';

import type { TLinkElement } from '../types';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

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
      type: editor.getType(BaseLinkPlugin),
      url,
    },
    { split: true, ...options } as any
  );
};

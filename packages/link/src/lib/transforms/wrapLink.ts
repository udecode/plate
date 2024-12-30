import {
  type SlateEditor,
  type WrapNodesOptions,
  wrapNodes,
} from '@udecode/plate-common';

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
  wrapNodes<TLinkElement>(
    editor,
    {
      children: [],
      target,
      type: editor.getType(BaseLinkPlugin),
      url,
    },
    { split: true, ...options } as any
  );
};

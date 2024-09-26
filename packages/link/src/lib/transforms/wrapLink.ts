import {
  type SlateEditor,
  type TEditor,
  type WrapNodesOptions,
  wrapNodes,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

export interface WrapLinkOptions<E extends TEditor = TEditor>
  extends WrapNodesOptions<E> {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = <E extends SlateEditor>(
  editor: E,
  { target, url, ...options }: WrapLinkOptions<E>
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

import {
  type PlateEditor,
  type TEditor,
  type WrapNodesOptions,
  getPluginType,
  wrapNodes,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../LinkPlugin';

export interface WrapLinkOptions<E extends TEditor = TEditor>
  extends WrapNodesOptions<E> {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = <E extends PlateEditor>(
  editor: E,
  { target, url, ...options }: WrapLinkOptions<E>
) => {
  wrapNodes<TLinkElement>(
    editor,
    {
      children: [],
      target,
      type: getPluginType(editor, ELEMENT_LINK),
      url,
    },
    { split: true, ...options } as any
  );
};

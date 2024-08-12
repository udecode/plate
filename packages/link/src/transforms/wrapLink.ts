import type { ValueOf } from '@udecode/plate-common';

import {
  type PlateEditor,
  type Value,
  type WrapNodesOptions,
  getPluginType,
  wrapNodes,
} from '@udecode/plate-common';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../LinkPlugin';

export interface WrapLinkOptions<V extends Value = Value>
  extends WrapNodesOptions<V> {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = <E extends PlateEditor>(
  editor: E,
  { target, url, ...options }: WrapLinkOptions<ValueOf<E>>
) => {
  wrapNodes<TLinkElement, Value>(
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

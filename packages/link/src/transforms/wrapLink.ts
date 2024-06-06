import {
  type PlateEditor,
  type Value,
  type WrapNodesOptions,
  getPluginType,
  wrapNodes,
} from '@udecode/plate-common/server';

import type { TLinkElement } from '../types';

import { ELEMENT_LINK } from '../createLinkPlugin';

export interface WrapLinkOptions<V extends Value = Value>
  extends WrapNodesOptions<V> {
  url: string;
  target?: string;
}

/** Wrap a link node with split. */
export const wrapLink = <V extends Value>(
  editor: PlateEditor<V>,
  { target, url, ...options }: WrapLinkOptions<V>
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

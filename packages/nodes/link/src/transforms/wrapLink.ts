import {
  getPluginType,
  PlateEditor,
  Value,
  wrapNodes,
  WrapNodesOptions,
} from '@udecode/plate-core';
import { ELEMENT_LINK } from '../createLinkPlugin';
import { TLinkElement } from '../types';

export interface WrapLinkOptions<V extends Value = Value>
  extends WrapNodesOptions<V> {
  url: string;
}

/**
 * Wrap a link node with split.
 */
export const wrapLink = <V extends Value>(
  editor: PlateEditor<V>,
  { url, ...options }: WrapLinkOptions<V>
) => {
  wrapNodes<TLinkElement, Value>(
    editor,
    {
      type: getPluginType(editor, ELEMENT_LINK),
      url,
      children: [],
    },
    { split: true, ...options } as any
  );
};

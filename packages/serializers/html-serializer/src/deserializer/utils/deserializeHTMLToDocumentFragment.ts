import { normalizeDescendantsToDocumentFragment } from '@udecode/slate-plugins-common';
import {
  SlatePlugin,
  SPEditor,
  TDescendant,
} from '@udecode/slate-plugins-core';
import { htmlStringToDOMNode } from '../../serializer/utils/htmlStringToDOMNode';
import { deserializeHTMLElement } from './deserializeHTMLElement';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHTMLToDocumentFragment = <
  T extends SPEditor = SPEditor
>(
  editor: T,
  {
    plugins,
    element,
  }: {
    plugins: SlatePlugin<T>[];
    element: HTMLElement | string;
  }
): TDescendant[] => {
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }

  const fragment = deserializeHTMLElement(editor, {
    plugins,
    element,
  }) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};

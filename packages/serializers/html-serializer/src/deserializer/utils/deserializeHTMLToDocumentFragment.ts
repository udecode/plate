import { normalizeDescendantsToDocumentFragment } from '@udecode/plate-common';
import { PlatePlugin, SPEditor, TDescendant } from '@udecode/plate-core';
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
    stripWhitespace = true,
  }: {
    plugins: PlatePlugin<T>[];
    element: HTMLElement | string;
    stripWhitespace?: boolean;
  }
): TDescendant[] => {
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element, stripWhitespace);
  }

  const fragment = deserializeHTMLElement(editor, {
    plugins,
    element,
  }) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};

import { normalizeDescendantsToDocumentFragment } from '@udecode/plate-common';
import { PlateEditor, PlatePlugin, TDescendant } from '@udecode/plate-core';
import { htmlStringToDOMNode } from '../../serializer/utils/htmlStringToDOMNode';
import { deserializeHTMLElement } from './deserializeHTMLElement';

/**
 * Deserialize HTML element to a valid document fragment.
 */
export const deserializeHTMLToDocumentFragment = <T = {}>(
  editor: PlateEditor<T>,
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

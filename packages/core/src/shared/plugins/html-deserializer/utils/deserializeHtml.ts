import type { EDescendant, Value } from '@udecode/slate';

import type { PlateEditor } from '../../../types';

import { normalizeDescendantsToDocumentFragment } from '../../../utils/normalizeDescendantsToDocumentFragment';
import { collapseWhiteSpace } from './collapse-white-space';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

/** Deserialize HTML element to a valid document fragment. */
export const deserializeHtml = <V extends Value>(
  editor: PlateEditor<V>,
  {
    collapseWhiteSpace: shouldCollapseWhiteSpace = true,
    element,
  }: {
    collapseWhiteSpace?: boolean;
    element: HTMLElement | string;
  }
): EDescendant<V>[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }
  if (shouldCollapseWhiteSpace) {
    element = collapseWhiteSpace(element);
  }

  const fragment = deserializeHtmlElement(editor, element) as EDescendant<V>[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};

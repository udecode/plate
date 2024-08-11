import type { TDescendant } from '@udecode/slate';

import type { PlateEditor } from '../../../editor';

import { normalizeDescendantsToDocumentFragment } from '../../../utils/normalizeDescendantsToDocumentFragment';
import { collapseWhiteSpace } from './collapse-white-space';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

/** Deserialize HTML element to a valid document fragment. */
export const deserializeHtml = (
  editor: PlateEditor,
  {
    collapseWhiteSpace: shouldCollapseWhiteSpace = true,
    element,
  }: {
    collapseWhiteSpace?: boolean;
    element: HTMLElement | string;
  }
): TDescendant[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }
  if (shouldCollapseWhiteSpace) {
    element = collapseWhiteSpace(element);
  }

  const fragment = deserializeHtmlElement(editor, element) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(editor, {
    descendants: fragment,
  });
};

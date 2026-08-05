import { type Descendant, ElementApi, TextApi } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';
import type { WithRequiredKey } from '../../../plugin';

import { BaseParagraphPlugin } from '../../../plugins';
import { normalizeDescendantsToDocumentFragment } from '../../../utils/normalizeDescendantsToDocumentFragment';
import { collapseWhiteSpace } from './collapse-white-space';
import { deserializeHtmlElement } from './deserializeHtmlElement';
import { htmlStringToDOMNode } from './htmlStringToDOMNode';

/** Deserialize HTML element to a valid document fragment. */
export const deserializeHtml = (
  editor: SlateEditor,
  {
    collapseWhiteSpace: shouldCollapseWhiteSpace = true,
    defaultElementPlugin,
    element,
  }: {
    element: HTMLElement | string;
    collapseWhiteSpace?: boolean;
    defaultElementPlugin?: WithRequiredKey;
  }
): Descendant[] => {
  // for serializer
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }

  if (shouldCollapseWhiteSpace) {
    element = collapseWhiteSpace(element);
  }

  const fragment = deserializeHtmlElement(editor, element) as Descendant[];

  const normalized = normalizeDescendantsToDocumentFragment(editor, {
    defaultElementPlugin,
    descendants: fragment,
  });

  const isInline = (node: Descendant) =>
    TextApi.isText(node) ||
    (ElementApi.isElement(node) && editor.api.isInline(node));

  if (normalized.length > 0 && normalized.every(isInline)) {
    const defaultType = editor.getType(
      (defaultElementPlugin || BaseParagraphPlugin).key
    );

    return [{ children: normalized, type: defaultType } as Descendant];
  }

  return normalized;
};

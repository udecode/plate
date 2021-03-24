import {
  normalizeDescendantsToDocumentFragment,
  SlateDocumentFragment,
} from '@udecode/slate-plugins-common';
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
export const deserializeHTMLToDocumentFragment = (
  editor: SPEditor,
  {
    plugins,
    element,
  }: {
    plugins: SlatePlugin[];
    element: HTMLElement | string;
  }
): SlateDocumentFragment => {
  if (typeof element === 'string') {
    element = htmlStringToDOMNode(element);
  }

  const fragment = deserializeHTMLElement(editor, {
    plugins,
    element,
  }) as TDescendant[];

  return normalizeDescendantsToDocumentFragment(fragment);
};

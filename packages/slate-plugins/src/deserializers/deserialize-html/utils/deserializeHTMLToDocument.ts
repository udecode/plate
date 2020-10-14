import { SlatePlugin } from '@udecode/slate-plugins-core';
import { SlateDocument } from '../../../common';
import { deserializeHTMLToDocumentFragment } from './deserializeHTMLToDocumentFragment';

/**
 * Deserialize HTML to a valid Slate value.
 */
export const deserializeHTMLToDocument = ({
  plugins,
  element,
}: {
  plugins: SlatePlugin[];
  element: HTMLElement;
}): SlateDocument => {
  const nodes = deserializeHTMLToDocumentFragment({ plugins, element });

  return [{ children: nodes }];
};

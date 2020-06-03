import { SlateDocument, SlatePlugin } from '../../../common';
import { deserializeHTMLToDocumentFragment } from './deserializeHTMLToDocumentFragment';

/**
 * Deserialize HTML to a valid Slate value.
 */
export const deserializeHTMLToDocument = (plugins: SlatePlugin[]) => (
  body: HTMLElement
): SlateDocument => {
  const nodes = deserializeHTMLToDocumentFragment(plugins)(body);

  return [{ children: nodes }];
};

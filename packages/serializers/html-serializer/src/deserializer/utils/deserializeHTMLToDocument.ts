import { SlateDocument } from '@udecode/slate-plugins-common';
import { SlatePlugin, SPEditor } from '@udecode/slate-plugins-core';
import { deserializeHTMLToDocumentFragment } from './deserializeHTMLToDocumentFragment';

/**
 * Deserialize HTML to a valid Slate value.
 */
export const deserializeHTMLToDocument = (
  editor: SPEditor,
  {
    plugins,
    element,
  }: {
    plugins: SlatePlugin[];
    element: HTMLElement;
  }
): SlateDocument => {
  const nodes = deserializeHTMLToDocumentFragment(editor, { plugins, element });

  return [{ children: nodes }];
};

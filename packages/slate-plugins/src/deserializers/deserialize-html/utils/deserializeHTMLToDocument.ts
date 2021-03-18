import { SlateDocument } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { deserializeHTMLToDocumentFragment } from './deserializeHTMLToDocumentFragment';

/**
 * Deserialize HTML to a valid Slate value.
 */
export const deserializeHTMLToDocument = (
  editor: Editor,
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

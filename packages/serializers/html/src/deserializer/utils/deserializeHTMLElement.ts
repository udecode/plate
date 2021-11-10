import { PlateEditor, PlatePlugin } from '@udecode/plate-core';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element to fragment.
 */
export const deserializeHTMLElement = <T = {}>(
  editor: PlateEditor<T>,
  {
    plugins,
    element,
  }: {
    plugins: PlatePlugin<T>[];
    element: HTMLElement;
  }
): DeserializeHTMLReturn => {
  return deserializeHTMLNode(editor, plugins)(element);
};

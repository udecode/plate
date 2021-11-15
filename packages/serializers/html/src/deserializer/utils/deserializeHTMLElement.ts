import { PlateEditor } from '@udecode/plate-core';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element.
 */
export const deserializeHTMLElement = <T = {}>(
  editor: PlateEditor<T>,
  {
    element,
  }: {
    element: HTMLElement;
  }
): DeserializeHTMLReturn => {
  return deserializeHTMLNode(editor)(element);
};

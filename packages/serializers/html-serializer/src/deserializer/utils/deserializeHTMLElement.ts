import { PlatePlugin, SPEditor } from '@udecode/plate-core';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element.
 */
export const deserializeHTMLElement = <T extends SPEditor = SPEditor>(
  editor: T,
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

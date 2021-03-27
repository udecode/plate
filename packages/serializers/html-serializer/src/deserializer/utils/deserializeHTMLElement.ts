import { SlatePlugin, SPEditor } from '@udecode/slate-plugins-core';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element.
 */
export const deserializeHTMLElement = (
  editor: SPEditor,
  {
    plugins,
    element,
  }: {
    plugins: SlatePlugin[];
    element: HTMLElement;
  }
): DeserializeHTMLReturn => {
  return deserializeHTMLNode(editor, plugins)(element);
};

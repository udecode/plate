import { SlatePlugin, SPEditor } from '@udecode/slate-plugins-core';
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
    plugins: SlatePlugin<T>[];
    element: HTMLElement;
  }
): DeserializeHTMLReturn => {
  return deserializeHTMLNode(editor, plugins)(element);
};

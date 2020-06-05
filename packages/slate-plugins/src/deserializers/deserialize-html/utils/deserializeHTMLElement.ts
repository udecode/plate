import { SlatePlugin } from '../../../common';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element.
 */
export const deserializeHTMLElement = (plugins: SlatePlugin[]) => (
  element: HTMLElement
): DeserializeHTMLReturn => {
  return deserializeHTMLNode(plugins)(element);
};

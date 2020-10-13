import { SlatePlugin } from '@udecode/slate-plugins-core';
import { DeserializeHTMLReturn } from '../types';
import { deserializeHTMLNode } from './deserializeHTMLNode';

/**
 * Deserialize HTML element.
 */
export const deserializeHTMLElement = ({
  plugins,
  element,
}: {
  plugins: SlatePlugin[];
  element: HTMLElement;
}): DeserializeHTMLReturn => {
  return deserializeHTMLNode(plugins)(element);
};

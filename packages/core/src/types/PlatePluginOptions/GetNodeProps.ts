import { TElement } from '../TElement';
import { TText } from '../TText';

/**
 * Map slate node props to `nodeProps`.
 * `nodeProps` is a prop passed to the `component`.
 */
export type GetNodeProps = (options: {
  attributes: any;
  children: any;
  element?: TElement;
  leaf?: TText;
  text?: TText;
}) => NodeProps;

/**
 * Props passed from `getNodeProps` option.
 */
export type NodeProps = { [key: string]: any };

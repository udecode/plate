import { TElement } from '../TElement';
import { TText } from '../TText';

/**
 * Map slate node properties to component props.
 */
export type GetNodeProps = (props: {
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

import { Element, Text } from 'slate';

/**
 * Map slate node props to `nodeProps`.
 * `nodeProps` is passed as a props to the React component.
 */
export type GetNodeProps = (options: {
  attributes: any;
  children: any;
  element?: Element;
  leaf?: Text;
  text?: Text;
}) => NodeProps;

export type NodeProps = { [key: string]: any };

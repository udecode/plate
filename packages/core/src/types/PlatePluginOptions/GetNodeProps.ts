import { SPRenderElementProps } from '../SPRenderElementProps';
import { SPRenderLeafProps } from '../SPRenderLeafProps';

/**
 * Map slate node properties to component props.
 */
export type GetNodeProps = (
  props: SPRenderElementProps | SPRenderLeafProps
) => NodeProps | undefined;

/**
 * Props passed from `getNodeProps` option.
 */
export type NodeProps = { [key: string]: any };

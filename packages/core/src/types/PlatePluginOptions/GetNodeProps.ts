import { PlateRenderElementProps } from '../PlateRenderElementProps';
import { PlateRenderLeafProps } from '../PlateRenderLeafProps';

/**
 * Map slate node properties to component props.
 */
export type GetNodeProps = (
  props: PlateRenderElementProps | PlateRenderLeafProps
) => NodeProps | undefined;

/**
 * Props passed from `getNodeProps` option.
 */
export type NodeProps = { [key: string]: any };

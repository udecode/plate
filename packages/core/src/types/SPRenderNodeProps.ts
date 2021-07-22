import { NodeProps } from './PlatePluginOptions/GetNodeProps';
import { AnyObject } from './utility/AnyObject';

export interface SPRenderNodeProps extends AnyObject {
  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

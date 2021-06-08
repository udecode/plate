import { NodeProps } from './SlatePluginOptions/GetNodeProps';
import { AnyObject } from './utility/AnyObject';

export interface SPRenderNodeProps extends AnyObject {
  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

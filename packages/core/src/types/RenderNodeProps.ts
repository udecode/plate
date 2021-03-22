import { NodeProps } from './SlatePluginOptions/GetNodeProps';

export interface RenderNodeProps {
  children: any;

  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

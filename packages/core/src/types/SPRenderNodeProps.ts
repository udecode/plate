import { NodeProps } from './SlatePluginOptions/GetNodeProps';

export interface SPRenderNodeProps {
  [key: string]: any;

  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

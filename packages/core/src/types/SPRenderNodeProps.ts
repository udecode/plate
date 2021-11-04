import { PlatePlugin } from './PlatePlugin/PlatePlugin';
import { NodeProps } from './PlatePluginOptions/GetNodeProps';
import { AnyObject } from './utility/AnyObject';
import { SPEditor } from './SPEditor';

export interface SPRenderNodeProps extends AnyObject {
  editor: SPEditor;

  plugins: PlatePlugin[];

  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

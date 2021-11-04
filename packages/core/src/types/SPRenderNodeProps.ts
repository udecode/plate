import { PlatePlugin } from './PlatePlugin/PlatePlugin';
import { NodeProps } from './PlatePluginOptions/GetNodeProps';
import { AnyObject } from './utility/AnyObject';
import { PlateEditor } from './SPEditor';

export interface SPRenderNodeProps extends AnyObject {
  editor: PlateEditor;

  plugins: PlatePlugin[];

  className?: string;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: NodeProps;
}

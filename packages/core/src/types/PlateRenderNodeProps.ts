import { AnyObject } from './utility/AnyObject';
import { PlateEditor } from './PlateEditor';

/**
 * Node props passed by Plate
 */
export interface PlateRenderNodeProps extends AnyObject {
  className?: string;

  editor: PlateEditor;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: AnyObject;
}

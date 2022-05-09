import { AnyObject, UnknownObject } from '../common/types/utility/AnyObject';
import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from './PlateEditor';

/**
 * Node props passed by Plate
 */
export interface PlateRenderNodeProps<V extends Value> extends UnknownObject {
  className?: string;

  editor: PlateEditor<V>;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: AnyObject;
}

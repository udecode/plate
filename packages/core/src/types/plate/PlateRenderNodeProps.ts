import { Value } from '../../slate/editor/TEditor';
import { AnyObject } from '../misc/AnyObject';
import { PlateEditor } from './PlateEditor';

/**
 * Node props passed by Plate
 */
export interface PlateRenderNodeProps<
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
  className?: string;

  editor: E;

  /**
   * @see {@link NodeProps}
   */
  nodeProps?: AnyObject;
}

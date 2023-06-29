import { Value } from '@udecode/slate';
import { AnyObject } from '@udecode/utils';

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

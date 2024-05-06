import type { Value } from '@udecode/slate';
import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from './PlateEditor';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> {
  editor: E;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

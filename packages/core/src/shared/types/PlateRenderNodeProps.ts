import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from './PlateEditor';

/** Node props passed by Plate */
export interface PlateRenderNodeProps {
  editor: PlateEditor;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from './PlateEditor';
import type { PlatePlugin } from './plugin';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<O = {}, A = {}, T = {}, S = {}> {
  editor: PlateEditor;

  plugin: PlatePlugin<string, O, A, T, S>;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

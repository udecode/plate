import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from './PlateEditor';
import type { AnyEditorPlugin } from './plugin';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<
  P extends AnyEditorPlugin = AnyEditorPlugin,
> {
  editor: PlateEditor;

  plugin: P;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

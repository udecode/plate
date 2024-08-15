import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from '../../editor';
import type { AnyPluginContext, EditorPlugin } from './PlatePlugin';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<
  C extends AnyPluginContext = AnyPluginContext,
> {
  editor: PlateEditor;

  plugin: EditorPlugin<C>;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

import type { AnyObject } from '@udecode/utils';

import type { PlateEditor } from '../../editor';
import type { AnyPluginConfig, EditorPlugin } from './PlatePlugin';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<
  C extends AnyPluginConfig = AnyPluginConfig,
> {
  editor: PlateEditor;

  plugin: EditorPlugin<C>;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

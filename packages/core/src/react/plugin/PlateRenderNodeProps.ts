import type { AnyObject } from '@udecode/utils';

import type { AnyPluginConfig } from '../../lib/plugin/BasePlugin';
import type { PlateEditor } from '../editor/PlateEditor';
import type { EditorPlatePlugin } from './PlatePlugin';

/** Node props passed by Plate */
export interface PlateRenderNodeProps<
  C extends AnyPluginConfig = AnyPluginConfig,
> {
  editor: PlateEditor;

  plugin: EditorPlatePlugin<C>;

  className?: string;

  /** @see {@link NodeProps} */
  nodeProps?: AnyObject;
}

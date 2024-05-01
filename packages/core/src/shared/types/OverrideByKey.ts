import type { Value } from '@udecode/slate';

import type { PlateEditor } from './PlateEditor';
import type { PlatePlugin } from './plugin/PlatePlugin';
import type { PluginKey } from './plugin/PlatePluginKey';

export type OverrideByKey<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = Record<PluginKey, Partial<PlatePlugin<{}, V, E>>>;

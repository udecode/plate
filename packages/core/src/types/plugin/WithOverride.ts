import { Value } from '@udecode/slate';

import { PlateEditor } from '../PlateEditor';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

/**
 * Plate plugin overriding the `editor` methods.
 * Naming convention is `with*`.
 */
export type WithOverride<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
  EE extends E = E
> = (editor: E, plugin: WithPlatePlugin<P, V, E>) => EE;

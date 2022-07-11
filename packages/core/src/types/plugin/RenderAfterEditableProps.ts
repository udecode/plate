import { Value } from '../../slate/index';
import { PlateEditor } from '../plate/index';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

export type RenderAfterEditableProps<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = {
  editor: E;
  plugin: WithPlatePlugin<P, V, E>;
};

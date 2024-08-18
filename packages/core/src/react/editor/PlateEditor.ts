import type { Value } from '@udecode/slate';

import type {
  AnyPluginConfig,
  CorePlugin,
  SlateEditor,
  TBaseEditor,
} from '../../lib';
import type { AnyEditorPlatePlugin } from '../plugin/PlatePlugin';

export type PlateEditor = {
  currentKeyboardEvent?: React.KeyboardEvent | null;

  pluginList: AnyEditorPlatePlugin[];
  plugins: Record<string, AnyEditorPlatePlugin>;
} & SlateEditor;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = PlateEditor & TBaseEditor<V, P>;

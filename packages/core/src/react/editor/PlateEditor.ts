import type { Value } from '@udecode/slate';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferApi,
  InferTransforms,
  PluginConfig,
  WithRequiredKey,
} from '../../lib';
import type {
  AnyEditorPlatePlugin,
  EditorPlatePlugin,
  PlateHotkeys,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugin } from './withPlate';

export type PlateEditor = {
  api: UnionToIntersection<InferApi<PlateCorePlugin>>;

  currentKeyboardEvent?: React.KeyboardEvent | null;

  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { type: any } ? C : EditorPlatePlugin<C>;

  hotkeys: PlateHotkeys;

  pluginList: AnyEditorPlatePlugin[];

  plugins: Record<string, AnyEditorPlatePlugin>;

  transforms: UnionToIntersection<InferTransforms<PlateCorePlugin>>;
} & BaseEditor;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = {
  api: UnionToIntersection<InferApi<P | PlateCorePlugin>>;
  children: V;
  pluginList: P[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  transforms: UnionToIntersection<InferTransforms<P | PlateCorePlugin>>;
} & PlateEditor;

// let slateEditor = {} as SlateEditor
// let tSlateEditor = {} as TSlateEditor
// let plateEditor = {} as PlateEditor
// let tPlateEditor = createPlateEditor({
//   // plugins: [LinkPlugin]
// })
//
// const a = plateEditor.getPlugin<typeof LengthPlugin>({ key: 'a' })
// const b = plateEditor.getPlugin(LengthPlugin)
// const c = plateEditor.getPlugin<typeof PlateApiPlugin>({ key: 'a' })
//
// slateEditor = plateEditor
// slateEditor = tPlateEditor
// plateEditor = tPlateEditor

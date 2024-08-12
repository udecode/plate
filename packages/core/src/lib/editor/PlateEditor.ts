import type React from 'react';

import type { TEditor, THistoryEditor, TRange, Value } from '@udecode/slate';
import type { TReactEditor } from '@udecode/slate-react';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyEditorPlugin,
  AnyPlatePlugin,
  InferPluginApi,
  PluginKey,
} from '../plugin';
import type { CorePlugin } from '../plugins';

// [K in MyPlugins['key']]: InferPluginApi<Extract<MyPlugins, { key: K }>>;

export type PlateEditor = {
  api: UnionToIntersection<InferPluginApi<CorePlugin>>;

  currentKeyboardEvent: React.KeyboardEvent | null;

  id: any;

  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;

  key: any;

  pluginList: AnyEditorPlugin[];

  plugins: Record<PluginKey, AnyEditorPlugin>;

  prevSelection: TRange | null;
} & TEditor &
  THistoryEditor &
  TReactEditor;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPlatePlugin = CorePlugin,
> = {
  api: UnionToIntersection<InferPluginApi<CorePlugin | P>>;

  children: V;

  pluginList: P[];

  // transforms: UnionToIntersection<
  //   InferPluginTransforms<
  // | P

  // >
  // >;
} & PlateEditor;

export type InferPlugins<T extends AnyPlatePlugin[]> = T[number];

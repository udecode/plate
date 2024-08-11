import type React from 'react';

import type {
  EElement,
  TEditor,
  TElement,
  THistoryEditor,
  TRange,
  Value,
} from '@udecode/slate';
import type { TReactEditor } from '@udecode/slate-react';
import type { UnionToIntersection } from '@udecode/utils';
import type { Path } from 'slate';

import type {
  AnyEditorPlugin,
  AnyPlatePlugin,
  InferPluginApi,
  PluginKey,
} from '../plugin';
import type { CorePlugin } from '../plugins';
import type { EXPOSED_STORE_KEYS, PlateStoreState } from '../types';

// [K in MyPlugins['key']]: InferPluginApi<Extract<MyPlugins, { key: K }>>;

export type PlateEditor = {
  api: UnionToIntersection<InferPluginApi<CorePlugin>>;

  /**
   * Default block factory.
   *
   * @default [{ type: getPluginType(editor, ELEMENT_DEFAULT), children: [{ text: '' }] }]
   */
  blockFactory: (node?: Partial<TElement>, path?: Path) => TElement;

  /**
   * Editor children factory.
   *
   * @default [editor.blockFactory()]
   */
  childrenFactory: () => Value;

  currentKeyboardEvent: React.KeyboardEvent | null;
  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;

  key: any;

  plugins: AnyEditorPlugin[];

  pluginsByKey: Record<PluginKey, AnyEditorPlugin>;

  prevSelection: TRange | null;
} & PlateEditorMethods &
  TEditor &
  THistoryEditor &
  TReactEditor;

export type PlateEditorMethods = {
  // Example: editor.plate.set.readOnly(true)
  plate: {
    set: {
      [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
        value: PlateStoreState[K]
      ) => void;
    };
  };
  redecorate: () => void;

  reset: () => void;
};

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPlatePlugin = CorePlugin,
> = {
  api: UnionToIntersection<InferPluginApi<CorePlugin | P>>;

  /**
   * Default block factory.
   *
   * @default [{ type: getPluginType(editor, ELEMENT_DEFAULT), children: [{ text: '' }] }]
   */
  blockFactory: (node?: Partial<TElement>, path?: Path) => EElement<V>;

  /**
   * Editor children factory.
   *
   * @default [editor.blockFactory()]
   */
  childrenFactory: () => V;

  plugins: P[];
  // plugins: P[];
  // transforms: UnionToIntersection<
  //   InferPluginTransforms<
  // | P

  // >
  // >;
} & PlateEditor;

export type InferPlugins<T extends AnyPlatePlugin[]> = T[number];

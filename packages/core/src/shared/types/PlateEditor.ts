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
import type { Path } from 'slate';

import type { PlateEditorMethods } from './PlateEditorMethods';
import { AnyPlatePlugin, PlatePlugin, PlatePluginList } from "./plugin/PlatePlugin";
import type { PluginKey } from './plugin/PlatePluginKey';

export type PlateEditor<V extends Value = Value> = {
  api: Record<PluginKey, any>;
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
  currentKeyboardEvent: React.KeyboardEvent | null;

  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;

  key: any;

  plugins: PlatePluginList;

  pluginsByKey: Record<PluginKey, AnyPlatePlugin>;

  prevSelection: TRange | null;
} & PlateEditorMethods &
  TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V>;

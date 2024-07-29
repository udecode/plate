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
import type { PlatePlugin } from './plugin/PlatePlugin';
import type { PluginKey } from './plugin/PlatePluginKey';

export type PlateEditor<V extends Value = Value> = {
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

  plugins: PlatePlugin[];

  pluginsByKey: Record<PluginKey, PlatePlugin>;

  prevSelection: TRange | null;
} & PlateEditorMethods &
  TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V>;

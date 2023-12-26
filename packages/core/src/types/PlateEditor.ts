import React from 'react';
import {
  EElement,
  TEditor,
  TElement,
  THistoryEditor,
  TRange,
  Value,
} from '@udecode/slate';
import { TReactEditor } from '@udecode/slate-react';
import { Path } from 'slate';

import { PlateEditorMethods } from './PlateEditorMethods';
import { WithPlatePlugin } from './plugin/PlatePlugin';
import { PluginKey } from './plugin/PlatePluginKey';

export type PlateEditor<V extends Value = Value> = TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V> &
  PlateEditorMethods<V> & {
    key: any;
    plugins: WithPlatePlugin<{}, V>[];
    pluginsByKey: Record<PluginKey, WithPlatePlugin<{}, V>>;
    prevSelection: TRange | null;

    /**
     * Default block factory.
     * @default [{ type: getPluginType(editor, ELEMENT_DEFAULT), children: [{ text: '' }] }]
     */
    blockFactory: (node?: Partial<TElement>, path?: Path) => EElement<V>;

    /**
     * Editor children factory.
     * @default [editor.blockFactory()]
     */
    childrenFactory: () => V;

    currentKeyboardEvent: React.KeyboardEvent | null;
  };

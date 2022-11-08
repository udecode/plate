import { KeyboardEvent } from 'react';
import { Path } from 'slate';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { THistoryEditor } from '../../slate/history-editor/THistoryEditor';
import { EElement, TElement, TRange } from '../../slate/index';
import { TReactEditor } from '../../slate/react-editor/TReactEditor';
import { WithPlatePlugin } from '../plugin/PlatePlugin';
import { PluginKey } from '../plugin/PlatePluginKey';

export type PlateEditor<V extends Value = Value> = TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V> & {
    key: any;
    id: string;
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

    currentKeyboardEvent: KeyboardEvent | null;
  };

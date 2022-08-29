import { KeyboardEvent } from 'react';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { THistoryEditor } from '../../slate/history-editor/THistoryEditor';
import { TRange } from '../../slate/index';
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
    currentKeyboardEvent: KeyboardEvent | null;
  };

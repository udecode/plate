import { TEditor, Value } from '../slate/editor/TEditor';
import { THistoryEditor } from '../slate/history-editor/THistoryEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';
import { WithPlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';

export type PlateEditor<V extends Value = Value> = TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V> & {
    key: any;
    id: string;
    plugins: WithPlatePlugin<{}, V>[];
    pluginsByKey: Record<PluginKey, WithPlatePlugin<{}, V>>;
  };

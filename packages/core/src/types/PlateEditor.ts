import { TEditor, Value } from '../slate/editor/TEditor';
import { THistoryEditor } from '../slate/history-editor/THistoryEditor';
import { TReactEditor } from '../slate/react-editor/TReactEditor';
import { WithPlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';

export type PlateEditor<V extends Value, T = {}> = TEditor<V> &
  THistoryEditor<V> &
  TReactEditor<V> &
  T & {
    key: any;
    id: string;
    plugins: WithPlatePlugin<V, T>[];
    pluginsByKey: Record<PluginKey, WithPlatePlugin<V, T>>;
  };

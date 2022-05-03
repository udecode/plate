import { TEditor, Value } from '../slate/types/TEditor';
import { THistoryEditor } from '../slate/types/THistoryEditor';
import { TReactEditor } from '../slate/types/TReactEditor';
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

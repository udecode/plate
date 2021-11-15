import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { WithPlatePlugin } from './plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from './plugins/PlatePlugin/PlatePluginKey';
import { TEditor } from './slate/TEditor';

export type PlateEditor<T = {}> = PEditor<T> & HistoryEditor & ReactEditor & T;

export interface PEditor<T = {}> extends TEditor {
  key: any;
  id: string;
  plugins: WithPlatePlugin<T>[];
  pluginsByKey: Record<PluginKey, WithPlatePlugin<T>>;
}

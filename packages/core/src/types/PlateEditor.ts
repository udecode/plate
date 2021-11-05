import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import {
  PlatePluginOptions,
  PluginKey,
} from './PlatePluginOptions/PlateOptions';
import { TEditor } from './TEditor';

export type PlateEditor<T = {}> = PEditor & HistoryEditor & ReactEditor & T;

export interface PEditor extends TEditor {
  key: any;
  id: string;
  options: Record<PluginKey, Partial<PlatePluginOptions>>;
}

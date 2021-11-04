import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import {
  PlatePluginOptions,
  PluginKey,
} from './PlatePluginOptions/PlateOptions';
import { TEditor } from './TEditor';

export type TPlateEditor = HistoryEditor & ReactEditor;

export type PlateEditor<T = TPlateEditor> = SPEditor & T;

export interface SPEditor extends TEditor {
  key: any;
  id: string;
  options: Record<PluginKey, Partial<PlatePluginOptions>>;
}

import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';
import { TEditor } from './TEditor';

export interface SPEditor extends TEditor {
  key: any;
  keyChange: number;
  id: string;
  options: SlatePluginsOptions;
}

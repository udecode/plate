import { Editor } from 'slate';
import { SlatePluginsOptions } from './SlatePluginOptions/SlatePluginsOptions';

export interface SPEditor extends Editor {
  key: any;
  id: string;
  options: SlatePluginsOptions;
}

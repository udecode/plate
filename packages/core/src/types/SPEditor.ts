import {
  PlatePluginOptions,
  PluginKey,
} from './PlatePluginOptions/PlateOptions';
import { TEditor } from './TEditor';

export interface SPEditor extends TEditor {
  key: any;
  id: string;
  options: Record<PluginKey, Partial<PlatePluginOptions>>;
}

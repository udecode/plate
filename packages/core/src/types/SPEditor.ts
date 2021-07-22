import { PlateOptions } from './PlatePluginOptions/PlateOptions';
import { TEditor } from './TEditor';

export interface SPEditor extends TEditor {
  key: any;
  id: string;
  options: PlateOptions;
}

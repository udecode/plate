import { AutoformatPlugin } from '@udecode/plate';
import { MyEditor, MyPlatePlugin, MyValue } from '../typescript/plate.types';
import { autoformatRules } from './autoformatRules';

export const autoformatPlugin: Partial<
  MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>
> = {
  options: {
    rules: autoformatRules as any,
  },
};

import { AutoformatPlugin } from '@udecode/plate';
import { autoformatRules } from './autoformatRules';

import { MyEditor, MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';

export const autoformatPlugin: Partial<
  MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>
> = {
  options: {
    rules: autoformatRules as any,
    enableUndoOnDelete: true,
  },
};

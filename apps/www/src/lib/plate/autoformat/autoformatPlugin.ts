import { AutoformatPlugin } from '@udecode/plate';
import { autoformatRules } from './autoformatRules';

import {
  MyEditor,
  MyPlatePlugin,
  MyValue,
} from '@/plate/typescript/plateTypes';

export const autoformatPlugin: Partial<
  MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>
> = {
  options: {
    rules: autoformatRules as any,
    enableUndoOnDelete: true,
  },
};

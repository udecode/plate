import { AutoformatPlugin } from '@udecode/plate';
import { MyEditor, MyPlatePlugin, MyValue } from '../../apps/next/src/lib/plate/typescript/plateTypes';
import { autoformatRules } from './autoformatRules';

export const autoformatPlugin: Partial<
  MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>
> = {
  options: {
    rules: autoformatRules as any,
    enableUndoOnDelete: true,
  },
};

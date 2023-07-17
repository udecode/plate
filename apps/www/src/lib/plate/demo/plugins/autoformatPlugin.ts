import { AutoformatPlugin } from '@udecode/plate-autoformat';

import { MyEditor, MyPlatePlugin, MyValue } from '@/types/plate-types';

import { autoformatLists } from './autoformatLists';
import { autoformatRules } from './autoformatRules';

export const autoformatPlugin: Partial<
  MyPlatePlugin<AutoformatPlugin<MyValue, MyEditor>>
> = {
  options: {
    rules: [...autoformatRules, ...autoformatLists] as any,
    enableUndoOnDelete: true,
  },
};

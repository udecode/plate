import { AutoformatPlugin } from '@udecode/plate-autoformat';
import { PlatePlugin } from '@udecode/plate-common';

import { autoformatLists } from './autoformatLists';
import { autoformatRules } from './autoformatRules';

export const autoformatPlugin: Partial<PlatePlugin<AutoformatPlugin>> = {
  options: {
    rules: [...autoformatRules, ...autoformatLists] as any,
    enableUndoOnDelete: true,
  },
};

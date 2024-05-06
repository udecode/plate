import type { AutoformatPlugin } from '@udecode/plate-autoformat';
import type { PlatePlugin } from '@udecode/plate-common';

import { autoformatLists } from './autoformatLists';
import { autoformatRules } from './autoformatRules';

export const autoformatPlugin: Partial<PlatePlugin<AutoformatPlugin>> = {
  options: {
    enableUndoOnDelete: true,
    rules: [...autoformatRules, ...autoformatLists] as any,
  },
};

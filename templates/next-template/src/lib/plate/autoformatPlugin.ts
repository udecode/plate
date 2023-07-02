import { AutoformatPlugin } from '@udecode/plate-autoformat';
import { PlatePlugin } from '@udecode/plate-core';

import { autoformatRules } from '@/lib/plate/autoformatRules';

export const autoformatPlugin: Partial<PlatePlugin<AutoformatPlugin>> = {
  options: {
    rules: autoformatRules as any,
    enableUndoOnDelete: true,
  },
};

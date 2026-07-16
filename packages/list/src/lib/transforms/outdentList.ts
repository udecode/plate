import { KEYS } from '@platejs/utils';

import type { OutdentListOptions } from '../types';
import type { ListEditorTransaction } from './indentList';

export const outdentListWithTx = (
  tx: ListEditorTransaction,
  options: OutdentListOptions = {}
) => {
  tx.indent.set({
    nodes: { at: options.at },
    offset: -1,
    unsetNodeProps: [KEYS.listType, KEYS.listChecked],
  });
};

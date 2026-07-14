import type { BaseEditor } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import { KEYS } from '@platejs/utils';

import type { ListOptions } from './indentList';

/** Decrease the indentation of the selected blocks. */
export const outdentList = (editor: BaseEditor, options: ListOptions = {}) => {
  editor.plugin(BaseIndentPlugin).update.set({
    nodes: { at: options.at },
    offset: -1,
    unsetNodeProps: [KEYS.listType, KEYS.listChecked],
  });
};

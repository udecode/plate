import { toPlatePlugin } from '@udecode/plate-common/react';

import { type BaseIndentListConfig, BaseIndentListPlugin } from '../lib';
import { onKeyDownIndentList } from './onKeyDownIndentList';

export type IndentListConfig = BaseIndentListConfig;

/** Enables support for indented lists with React-specific features. */
export const IndentListPlugin = toPlatePlugin(BaseIndentListPlugin, {
  handlers: {
    onKeyDown: onKeyDownIndentList,
  },
});

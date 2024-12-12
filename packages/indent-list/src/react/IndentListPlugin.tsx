import type { ExtendConfig } from '@udecode/plate-common';

import { toTPlatePlugin } from '@udecode/plate-common/react';

import { type BaseIndentListConfig, BaseIndentListPlugin } from '../lib';
import { onKeyDownIndentList } from './onKeyDownIndentList';

export type IndentListConfig = ExtendConfig<BaseIndentListConfig>;

/** Enables support for indented lists with React-specific features. */
export const IndentListPlugin = toTPlatePlugin<IndentListConfig>(
  BaseIndentListPlugin,
  {
    handlers: {
      onKeyDown: onKeyDownIndentList,
    },
  }
);

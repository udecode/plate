import { toPlatePlugin } from 'platejs/react';

import { type BaseIndentListConfig, BaseIndentListPlugin } from '../lib';

export type IndentListConfig = BaseIndentListConfig;

/** Enables support for indented lists with React-specific features. */
export const IndentListPlugin = toPlatePlugin(BaseIndentListPlugin);

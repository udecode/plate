import type { HotkeyPluginOptions } from '@udecode/plate-common/server';

export interface ListPluginOptions extends HotkeyPluginOptions {
  enableResetOnShiftTab?: boolean;
  /** Valid children types for list items, in addition to p and ul types. */
  validLiChildrenTypes?: string[];
}

export interface TodoListPluginOptions extends HotkeyPluginOptions {
  inheritCheckStateOnLineEndBreak?: boolean;
  inheritCheckStateOnLineStartBreak?: boolean;
}

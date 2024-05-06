import type { HotkeyPlugin } from '@udecode/plate-common/server';

export interface ListPlugin extends HotkeyPlugin {
  enableResetOnShiftTab?: boolean;
  /** Valid children types for list items, in addition to p and ul types. */
  validLiChildrenTypes?: string[];
}

export interface TodoListPlugin extends HotkeyPlugin {
  inheritCheckStateOnLineEndBreak?: boolean;
  inheritCheckStateOnLineStartBreak?: boolean;
}

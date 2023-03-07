import { HotkeyPlugin } from '@udecode/plate-common';

export interface ListPlugin extends HotkeyPlugin {
  /**
   * Valid children types for list items, in addition to p and ul types.
   */
  validLiChildrenTypes?: string[];
  enableResetOnShiftTab?: boolean;
}

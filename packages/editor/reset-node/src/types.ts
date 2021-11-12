import { HotkeyPlugin } from '@udecode/plate-common';
import { PlateEditor } from '@udecode/plate-core';

export interface ResetNodePluginRule extends HotkeyPlugin {
  defaultType?: string;

  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: PlateEditor) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: PlateEditor) => void;
}

export interface ResetNodePlugin {
  rules?: ResetNodePluginRule[];
}

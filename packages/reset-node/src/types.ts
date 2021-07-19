import { PlatePluginOptions, TEditor } from '@udecode/plate-core';

export interface ResetBlockTypePluginRule
  extends Pick<PlatePluginOptions, 'defaultType' | 'hotkey'> {
  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: TEditor) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: TEditor) => void;
}

export interface ResetBlockTypePluginOptions {
  rules: ResetBlockTypePluginRule[];
}

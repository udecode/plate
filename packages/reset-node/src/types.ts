import { SlatePluginOptions, TEditor } from '@udecode/slate-plugins-core';

export interface ResetBlockTypePluginRule
  extends Pick<SlatePluginOptions, 'defaultType' | 'hotkey'> {
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

import { SlatePluginOptions, SPEditor } from '@udecode/slate-plugins-core';

export interface ResetBlockTypePluginRule
  extends Pick<SlatePluginOptions, 'defaultType' | 'hotkey'> {
  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: SPEditor) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: SPEditor) => void;
}

export interface ResetBlockTypePluginOptions {
  rules: ResetBlockTypePluginRule[];
}

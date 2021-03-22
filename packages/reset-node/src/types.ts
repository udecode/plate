import { SlatePluginOptions } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export interface ResetBlockTypePluginRule
  extends Pick<SlatePluginOptions, 'defaultType' | 'hotkey'> {
  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: Editor) => boolean;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: Editor) => void;
}

export interface ResetBlockTypePluginOptions {
  rules: ResetBlockTypePluginRule[];
}

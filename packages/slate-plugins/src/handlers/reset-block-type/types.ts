import { Editor } from 'slate';

export interface ResetBlockTypePluginRule {
  /**
   * Node types where the rule applies.
   */
  types: string[];

  hotkey?: string | string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: Editor) => boolean;

  /**
   * Set node to this default type when resetting.
   */
  defaultType?: string;

  /**
   * Callback called when resetting.
   */
  onReset?: (editor: Editor) => void;
}

export interface ResetBlockTypePluginOptions {
  rules: ResetBlockTypePluginRule[];
}

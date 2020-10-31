import { Editor } from 'slate';

export interface ResetBlockTypePluginRule {
  /**
   * Node types where the rule applies.
   */
  types: string[];

  /**
   * Additional condition to the rule.
   */
  predicate: (editor: Editor) => boolean;

  hotkey?: string | string[];

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

import { Editor } from 'slate';

export interface AutoformatMarkupRule {
  /**
   * Block type to autoformat.
   */
  type: string;

  /**
   * One or more markup that should be before the triggering character to autoformat.
   */
  markup: string | string[];

  /**
   * Custom formatting function.
   */
  format?: (editor: Editor) => void;

  /**
   * Insert a block instead of updating the selected block.
   */
  insert?: boolean;

  inline?: boolean;
}

export interface AutoformatRule {
  /**
   * Triggering character to autoformat.
   */
  trigger?: string | string[];

  /**
   * Function called before formatting.
   * Generally used to reset the selected block.
   */
  preFormat?: (editor: Editor) => void;

  /**
   * A list of markup rules for each trigger.
   */
  markupRules: AutoformatMarkupRule[];
}

export interface WithAutoformatOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

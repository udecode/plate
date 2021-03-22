import { Editor } from 'slate';

export interface AutoformatRule {
  /**
   * Block type to autoformat.
   */
  type: string;

  /**
   * Triggering character to autoformat. Default is space.
   */
  trigger?: string | string[];

  /**
   * One or more markup that should be before the triggering character to autoformat.
   */
  markup?: string | string[];

  /**
   * Lookup for a range between two strings before a location.
   */
  between?: string[];

  /**
   * Function called before formatting.
   * Generally used to reset the selected block.
   */
  preFormat?: (editor: Editor) => void;

  /**
   * Custom formatting function.
   */
  format?: (editor: Editor) => void;

  /**
   * - block (default) – set/insert block. Should be used with `markup`.
   * - inline – insert mark between markups. Should be used with `between`.
   */
  mode?: 'block' | 'inline';

  /**
   * When using `inline` mode – if false, do not format when the string can be trimmed.
   */
  ignoreTrim?: boolean;

  /**
   * If true, insert the triggering character after autoformatting.
   */
  insertTrigger?: boolean;

  /**
   * If true, allow to autoformat even if there is a block of the same type above the selected block.
   * Should be used with 'block' mode. Default is false.
   */
  allowSameTypeAbove?: boolean;

  /**
   * If true, the trigger should be at block start to allow autoformatting.
   * Should be used with 'block' mode.
   * Default is true.
   */
  triggerAtBlockStart?: boolean;

  /**
   * Query to allow autoformat.
   */
  query?: (editor: Editor, rule: Omit<AutoformatRule, 'query'>) => boolean;
}

export interface WithAutoformatOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

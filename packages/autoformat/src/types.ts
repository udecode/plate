import { TEditor } from '@udecode/plate-core';

export interface AutoformatCommonRule {
  /**
   * Triggering character to autoformat.
   * For `mode: 'text' | 'mark'`: default is the last character of `markup` or `markup[1]`
   * For `mode: 'block'`: default is ' ' (space)
   */
  trigger?: string | string[];

  /**
   * If true, insert the triggering character after autoformatting.
   */
  insertTrigger?: boolean;

  /**
   * Query to allow autoformat.
   */
  query?: (
    editor: TEditor,
    rule: Omit<AutoformatCommonRule, 'query'>
  ) => boolean;
}

export interface AutoformatBlockRule extends AutoformatCommonRule {
  /**
   * - text: insert text.
   * - block: set block type or custom format.
   * - mark: insert mark(s) between markups.
   * @default 'text'
   */
  mode: 'block';

  /**
   * For `mode: 'block'` and undefined `format`: set block type.
   * For `mode: 'mark'`: Mark(s) to add.
   */
  type?: string;

  /**
   * One or more markup that should exist before the triggering character to autoformat.
   * For `mode: 'block' | 'text'`: lookup for the markup before the cursor.
   * For `mode: 'mark'`: lookup for enclosing markups.
   * Shortcut: defining a single string (start markup) will default the end markup to the reverse of the start markup:
   * e.g. `markup: '_*'` is equivalent to `['_*', '*_']`
   */
  markup: string;

  /**
   * If true, the trigger should be at block start to allow autoformatting.
   * @default true.
   */
  triggerAtBlockStart?: boolean;

  /**
   * If true, allow to autoformat even if there is a block of the same type above the selected block.
   * @default false.
   */
  allowSameTypeAbove?: boolean;

  /**
   * Function called before formatting.
   * Generally used to reset the selected block.
   */
  preFormat?: (editor: TEditor) => void;

  /**
   * Custom formatting function.
   * @default setNodes(editor, { type }, { match: (n) => Editor.isBlock(editor, n) })
   */
  format?: (editor: TEditor) => void;
}

export interface AutoformatMarkRule extends AutoformatCommonRule {
  mode: 'mark';

  /**
   * Mark(s) to add.
   */
  type: string | string[];

  /**
   * Lookup for markups before the cursor.
   */
  markup: string | string[];

  /**
   * If false, do not format when the string can be trimmed.
   */
  ignoreTrim?: boolean;
}

export interface AutoformatTextRule extends AutoformatCommonRule {
  mode: 'text';

  /**
   * Lookup for markup before the cursor.
   */
  markup: string;

  /**
   * The matched text is replaced by that string.
   */
  handler: string
}

export type AutoformatRule =
  | AutoformatBlockRule
  | AutoformatMarkRule
  | AutoformatTextRule;

export interface WithAutoformatOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

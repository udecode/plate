import { TEditor } from '@udecode/plate-core';

export interface AutoformatRule {
  /**
   * If `mode: 'block'` and `format` is not defined: set block type.
   * If `mode: 'inline'`: add these types as marks.
   */
  type?: string | string[];

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
  preFormat?: (editor: TEditor) => void;

  /**
   * Custom formatting function.
   * @default setNodes(editor, { type }, { match: (n) => Editor.isBlock(editor, n) })
   */
  format?: (editor: TEditor) => void;

  /**
   * - text (default) - insert text.
   * - block – set/insert block. Should be used with `markup`.
   * - mark – insert mark between markups. Should be used with `between`.
   */
  mode?: 'text' | 'block' | 'inline';

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
  query?: (editor: TEditor, rule: Omit<AutoformatRule, 'query'>) => boolean;
}

export interface WithAutoformatOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

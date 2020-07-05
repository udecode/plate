import { Editor } from 'slate';

export interface AutoformatRule {
  /**
   * Triggering character to autoformat. Default is space.
   */
  trigger?: string | string[];

  /**
   * Block type to autoformat.
   */
  type: string;

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
   * block (default) – update the selected block. Should be used with `markup`.
   *
   * inline-block – insert a block below the cursor. Should be used with `markup`.
   *
   * inline – add a mark between markups. Should be used with `between`.
   */
  mode?: 'block' | 'inline-block' | 'inline';

  /**
   * When using `inline` mode – if false, do not format when the string can be trimmed.
   */
  ignoreTrim?: boolean;

  /**
   * If true, insert the triggering character after autoformatting.
   */
  insertTrigger?: boolean;
}

export interface WithAutoformatOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

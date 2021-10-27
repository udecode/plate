import { TEditor } from '@udecode/plate-core';
import { GetMatchPointsReturnType } from './utils/getMatchPoints';

export interface MatchRange {
  start: string;
  end: string;
}

export interface AutoformatQueryOptions
  extends Omit<AutoformatCommonRule, 'query'> {
  /**
   * `insertText` text.
   */
  text: string;
}

export interface AutoformatCommonRule {
  /**
   * The rule applies when the trigger and the text just before the cursor matches.
   * For `mode: 'block'`: lookup for the end match(es) before the cursor.
   * For `mode: 'text'`: lookup for the end match(es) before the cursor. If `format` is an array, also lookup for the start match(es).
   * For `mode: 'mark'`: lookup for the start and end matches.
   * Note: `'_*'`, `['_*']` and `{ start: '_*', end: '*_' }` are equivalent.
   */
  match: string | string[] | MatchRange | MatchRange[];

  /**
   * Triggering character to autoformat.
   * @default the last character of `match` or `match.end`
   */
  trigger?: string | string[];

  /**
   * If true, insert the triggering character after autoformatting.
   * @default: false
   */
  insertTrigger?: boolean;

  /**
   * Query to allow autoformat.
   */
  query?: (editor: TEditor, options: AutoformatQueryOptions) => boolean;
}

export interface AutoformatBlockRule extends AutoformatCommonRule {
  /**
   * - text: insert text.
   * - block: set block type or custom format.
   * - mark: insert mark(s) between matches.
   * @default 'text'
   */
  mode: 'block';

  match: string | string[];

  /**
   * For `mode: 'block'`: set block type. If `format` is defined, this field is ignored.
   * For `mode: 'mark'`: Mark(s) to add.
   */
  type?: string;

  /**
   * If true, the trigger should be at block start to allow autoformatting.
   * @default true
   */
  triggerAtBlockStart?: boolean;

  /**
   * If true, allow to autoformat even if there is a block of the same type above the selected block.
   * @default false
   */
  allowSameTypeAbove?: boolean;

  /**
   * Function called just before `format`.
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
   * If false, do not format when the string can be trimmed.
   */
  ignoreTrim?: boolean;
}

export interface AutoformatTextRule extends AutoformatCommonRule {
  mode: 'text';

  match: string | string[];

  /**
   * string: the matched text is replaced by that string.
   * string[]: the matched texts are replaced by these strings.
   * function: called when there is a match.
   */
  format:
    | string
    | string[]
    | ((editor: TEditor, options: GetMatchPointsReturnType) => void);
}

export type AutoformatRule =
  | AutoformatBlockRule
  | AutoformatMarkRule
  | AutoformatTextRule;

export interface WithAutoformatOptions extends AutoformatPluginOptions {}

export interface AutoformatPluginOptions {
  /**
   * A list of triggering rules.
   */
  rules: AutoformatRule[];
}

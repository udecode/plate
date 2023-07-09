import { PlateEditor, Value } from '@udecode/plate-common';

import { GetMatchPointsReturnType } from './utils/getMatchPoints';

export interface MatchRange {
  start: string;
  end: string;
}

export interface AutoformatQueryOptions<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends Omit<AutoformatCommonRule<V, E>, 'query'> {
  /**
   * `insertText` text.
   */
  text: string;
}

export interface AutoformatCommonRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
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
  query?: (editor: E, options: AutoformatQueryOptions<V, E>) => boolean;
}

export interface AutoformatBlockRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends AutoformatCommonRule<V, E> {
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
  preFormat?: (editor: E) => void;

  /**
   * Custom formatting function.
   * @default setNodes(editor, { type }, { match: (n) => isBlock(editor, n) })
   */
  format?: (editor: E) => void;
}

export interface AutoformatMarkRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends AutoformatCommonRule<V, E> {
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

export interface AutoformatTextRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> extends AutoformatCommonRule<V, E> {
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
    | ((editor: E, options: GetMatchPointsReturnType) => void);
}

export type AutoformatRule<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> =
  | AutoformatBlockRule<V, E>
  | AutoformatMarkRule<V, E>
  | AutoformatTextRule<V, E>;

export interface AutoformatPlugin<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> {
  /**
   * A list of triggering rules.
   */
  rules?: AutoformatRule<V, E>[];
  enableUndoOnDelete?: boolean;
}

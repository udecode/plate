import type { TElement } from '@udecode/plate-common/server';

export interface TIndentElement extends TElement {
  indent: number;
}

export type IndentPlugin = {
  /** Maximum number of indentation. */
  indentMax?: number;

  /**
   * Indentation offset used in `(offset * element.indent) + unit`.
   *
   * @default 40
   */
  offset?: number;

  /**
   * Indentation unit used in `(offset * element.indent) + unit`.
   *
   * @default 'px'
   */
  unit?: string;
};

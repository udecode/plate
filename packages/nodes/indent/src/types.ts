import { TElement } from '@udecode/plate-core';

export interface TIndentElement extends TElement {
  indent: number;
}

export type IndentPlugin = {
  /**
   * Indentation offset used in `(offset * element.indent) + unit`.
   * @default 40
   */
  offset?: number;

  /**
   * Indentation unit used in `(offset * element.indent) + unit`.
   * @default 'px'
   */
  unit?: string;

  /**
   * Maximum number of indentation.
   */
  indentMax?: number;
};

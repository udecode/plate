import type { PlateEditor, TElement, Value } from '@udecode/plate-common';

export interface TIndentElement extends TElement {
  indent: number;
}

export type IndentPlugin = {
  disableTab?: <V extends Value>(e: PlateEditor<V>) => boolean;

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

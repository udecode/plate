import { PlateEditor, TElement, Value } from '@udecode/plate-common';

export interface TIndentElement extends TElement {
  indent: number;
}

export type IndentPlugin = {
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

  /** Maximum number of indentation. */
  indentMax?: number;

  /** Call after indent */
  afterKeydownIndent?: <V extends Value>(editor: PlateEditor<V>) => void;

  /** Call after outdent */
  afterKeydownOutdent?: <V extends Value>(editor: PlateEditor<V>) => void;
};

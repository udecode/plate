import { OverridePropsPlugin } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';

export type IndentPlugin<T = {}> = PlatePlugin<
  T,
  OverridePropsPlugin<string | number> & {
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
  }
>;

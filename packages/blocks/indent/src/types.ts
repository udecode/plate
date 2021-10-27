export interface IndentPluginOptions {
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
   * List of classNames to pass to each indented block.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Record<number, string>;

  /**
   * List of block types supporting indentation.
   * Default is the paragraph type.
   */
  types?: string[];

  /**
   * Maximum number of indentation.
   */
  indentMax?: number;
}

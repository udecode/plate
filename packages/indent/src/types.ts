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
   * If you want more semantics in your content, use CSS classes instead of fixed indentation units.
   * You can then adjust the levels in the style sheets of your application whenever you want.
   */
  classNames?: string[];

  types?: string[];

  indentMax?: number;
}

export interface IndentOverridePropsOptions
  extends Pick<
    IndentPluginOptions,
    'types' | 'offset' | 'unit' | 'classNames'
  > {}

export interface WithIndentOptions
  extends Pick<IndentPluginOptions, 'types' | 'indentMax'> {}

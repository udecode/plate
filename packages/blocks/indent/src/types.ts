import { CSSProperties } from 'react';

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

  /** The following props will be used by the getOverrideProps */

  /**
   * camelCase name of the css property that the getOverrideProps will use
   * if not provided it will fall back to the plugin key
   * @default 'marginLeft'
   */
  cssPropName?: keyof CSSProperties;
  // the value of the style we be calculated by this

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * @default ({value, options}) => value * options.offset + options.unit
   */
  transformCssValue?: (params: {
    options: IndentPluginOptions;
    value: number;
  }) => string;
}

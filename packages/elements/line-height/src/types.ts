import { CSSProperties } from 'react';

export interface LineHeightPluginOptions {
  /**
   * List of supported line height values.
   * @default [1, 1.2, 1.5, 2]
   */
  lineHeights?: number[];

  /**
   * Object of classNames to pass to each line height value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<number, string>>;

  /**
   * Default line height will not be set to the node.
   * @default 1.2
   */
  defaultLineHeight?: number;

  /**
   * List of block types supporting line heights.
   * Default is the paragraph type.
   */
  types?: string[];

  /** The following props will be used by the getOverrideProps */

  /**
   * camelCase name of the css property that the getOverrideProps will use
   * if not provided it will fall back to the plugin key
   * @default undefined
   */
  cssPropName?: keyof CSSProperties;

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * @default undefined
   */
  transformCssValue?: (params: {
    options: LineHeightPluginOptions;
    value: number;
  }) => number | string;
}

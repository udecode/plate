import { CSSProperties } from 'react';

export type Alignment = 'left' | 'center' | 'right' | 'justify';

export interface AlignPluginOptions {
  /**
   * List of supported text-align values.
   * @default ['left', 'center', 'right', 'justify']
   */
  alignments?: Alignment[];

  /**
   * Object of classNames to pass to each alignment value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<Alignment, string>>;

  /**
   * Default alignment will not be set to the node.
   * @default 'left'
   */
  defaultAlignment?: Alignment;

  /**
   * List of block types supporting alignment.
   * Default is the paragraph type.
   */
  types?: string[];

  /** The following props will be used by the getOverrideProps */

  /**
   * camelCase name of the css property that the getOverrideProps will use
   * if not provided it will fall back to the plugin key
   * @default 'textAlign'
   */
  cssPropName?: keyof CSSProperties;

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * @default undefined
   */
  transformCssValue?: (params: {
    options: AlignPluginOptions;
    value: Alignment;
  }) => number | string;
}

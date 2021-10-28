import { CSSProperties } from 'react';

export type FontWeight =
  | 'normal'
  | 'bold'

  /* Keyword values relative to the parent */
  | 'lighter'
  | 'bolder'

  /* Numeric keyword values */
  | 100
  | 200
  | 300
  | 400 // normal
  | 500
  | 600
  | 700 // bold
  | 800
  | 900

  /* Global values */
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset';

export interface FontColorPluginOptions {
  /**
   * List of supported color values.
   * @default undefined
   */
  colors?: string[];

  /**
   * Object of classNames to pass to each color value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<string, string>>;

  /**
   * Default color will not be set to the node.
   * @default 'black'
   */
  defaultColor?: string;

  /** The following props will be used by the getOverrideProps */

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * @default undefined
   */
  transformCssValue?: (params: {
    options: FontColorPluginOptions;
    value: string;
  }) => string;
}

export interface FontFamilyPluginOptions {
  /**
   * List of supported font family values.
   * @default undefined
   */
  fontFamilies?: string[];

  /**
   * Object of classNames to pass to each font family value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<string, string>>;

  /**
   * Default font family will not be set to the node.
   * @default undefined
   */
  defaultFontFamily?: string;

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
    options: FontFamilyPluginOptions;
    value: string;
  }) => string;
}

export interface FontSizePluginOptions {
  /**
   * List of supported font size values.
   * @default undefined
   */
  fontSizes?: string[];

  /**
   * Object of classNames to pass to each font size value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<string, string>>;

  /**
   * Default font size will not be set to the node.
   * @default undefined
   */
  defaultFontSize?: string;

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
    options: FontSizePluginOptions;
    value: string;
  }) => string;
}

export interface FontWeightPluginOptions {
  /**
   * List of supported font weight values.
   * @default undefined
   */
  fontWeights?: FontWeight[];

  /**
   * Object of classNames to pass to each font weight value.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<FontWeight, string>>;

  /**
   * Default font weight will not be set to the node.
   * @default undefined
   */
  defaultFontWeight?: FontWeight;

  /** The following props will be used by the getOverrideProps */

  /**
   * Transformation function that will be used to transform the value from the text
   * if not provided the value will be used as is
   * @default undefined
   */
  transformCssValue?: (params: {
    options: FontWeightPluginOptions;
    value: FontWeight;
  }) => string;
}

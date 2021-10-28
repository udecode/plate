import { CSSProperties } from 'react';

export type NodeOverridePropsOptions = {
  /**
   * If the value matches the default option, no props is returned.
   */
  defaultOption?: unknown;

  /**
   * Valid values.
   */
  options: unknown[] | undefined;

  /**
   * List of classNames to pass to each indented block.
   * If defined, the plugin will pass a className prop instead of a style prop.
   */
  classNames?: Partial<Record<string | number, unknown>>;

  /**
   * Style or className value.
   */
  value: string | number;

  className: string | undefined;
  style: CSSProperties;

  /**
   * Style or className key.
   */
  type: string;

  /**
   * css property that `getOverrideProps` will use.
   * @default pluginKey
   */
  cssPropName?: keyof CSSProperties;

  /**
   * Transformation function that will be used to transform the value from the text.
   * If not provided, return the value.
   */
  transformCssValue?: (params: { options: any; value: number }) => string;
};

export type ElementOverridePropsOptions = NodeOverridePropsOptions & {
  /**
   * List of element types for overrides apply.
   * @default [ELEMENT_DEFAULT]
   */
  types: string[];
};

export type LeafOverridePropsOptions = NodeOverridePropsOptions;

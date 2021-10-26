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
}

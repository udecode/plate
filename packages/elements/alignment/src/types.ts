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
}

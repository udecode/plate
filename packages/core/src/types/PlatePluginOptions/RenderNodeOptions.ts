import { PlatePluginOptions } from './PlateOptions';

/**
 * Plugin options to get `renderElement` for elements and `renderLeaf` for marks.
 */
export type RenderNodeOptions = Pick<
  PlatePluginOptions,
  'type' | 'component' | 'getNodeProps' | 'overrideProps'
>;

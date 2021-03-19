import { SlatePluginOptions } from './SlatePluginsOptions';

/**
 * Plugin options to get `renderElement` for elements and `renderLeaf` for marks.
 */
export type RenderNodeOptions = Pick<
  SlatePluginOptions,
  'type' | 'component' | 'getNodeProps'
>;

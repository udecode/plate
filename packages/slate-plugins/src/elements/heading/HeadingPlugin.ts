import { SlatePlugin } from '../../common';
import { deserializeHeading } from './deserializeHeading';
import { renderElementHeading } from './renderElementHeading';
import { HeadingPluginOptions } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const HeadingPlugin = (options?: HeadingPluginOptions): SlatePlugin => ({
  renderElement: renderElementHeading(options),
  deserialize: deserializeHeading(options),
});

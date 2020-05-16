import { SlatePlugin } from 'common/types';
import { deserializeHeading } from './deserializeHeading';
import { renderElementHeading } from './renderElementHeading';
import { HeadingPluginOptions } from './types';

export const HeadingPlugin = (options?: HeadingPluginOptions): SlatePlugin => ({
  renderElement: renderElementHeading(options),
  deserialize: deserializeHeading(options),
});

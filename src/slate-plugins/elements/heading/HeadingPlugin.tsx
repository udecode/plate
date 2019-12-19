import { SlatePlugin } from 'slate-react';
import { renderElementHeading } from './renderElementHeading';
import { HeadingPluginOptions } from './types';

export const HeadingPlugin = (
  options: HeadingPluginOptions = {}
): SlatePlugin => ({
  renderElement: renderElementHeading(options),
});

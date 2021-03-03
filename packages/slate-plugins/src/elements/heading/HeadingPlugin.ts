import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getOnHotkeyToggleNodeTypeDefault } from '../../common/utils/getOnHotkeyToggleNodeTypeDefault';
import { DEFAULTS_HEADING } from './defaults';
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
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    defaultOptions: DEFAULTS_HEADING,
    options,
  }),
});

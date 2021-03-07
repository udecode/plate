import { getOnHotkeyToggleNodeTypeDefault } from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import {
  DEFAULTS_HEADING,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from './defaults';
import { deserializeHeading } from './deserializeHeading';
import { renderElementHeading } from './renderElementHeading';
import { HeadingPluginOptions } from './types';

/**
 * Enables support for headings with configurable levels
 * (from 1 to 6).
 */
export const HeadingPlugin = (options?: HeadingPluginOptions): SlatePlugin => ({
  elementKeys: [
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
  ],
  renderElement: renderElementHeading(options),
  deserialize: deserializeHeading(options),
  onKeyDown: getOnHotkeyToggleNodeTypeDefault({
    key: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    defaultOptions: DEFAULTS_HEADING,
    options,
  }),
});

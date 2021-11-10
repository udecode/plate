import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_LI, ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from './defaults';
import {
  getLicDeserialize,
  getLiDeserialize,
  getOlDeserialize,
  getUlDeserialize,
} from './getListDeserialize';
import { getListOnKeyDown } from './getListOnKeyDown';
import { WithListOptions } from './types';
import { withList } from './withList';

/**
 * Enables support for bulleted, numbered and to-do lists.
 */
export const createListPlugins = (options?: WithListOptions): PlatePlugin[] => [
  {
    pluginKeys: ELEMENT_UL,
    renderElement: getRenderElement(ELEMENT_UL),
    deserialize: getUlDeserialize(),
    onKeyDown: getListOnKeyDown(ELEMENT_UL),
    withOverrides: withList(options),
  },
  {
    pluginKeys: ELEMENT_OL,
    renderElement: getRenderElement(ELEMENT_OL),
    onKeyDown: getListOnKeyDown(ELEMENT_OL),
    deserialize: getOlDeserialize(),
  },
  {
    pluginKeys: ELEMENT_LI,
    renderElement: getRenderElement(ELEMENT_LI),
    deserialize: getLiDeserialize(),
  },
  {
    pluginKeys: ELEMENT_LIC,
    renderElement: getRenderElement(ELEMENT_LIC),
    deserialize: getLicDeserialize(),
  },
];

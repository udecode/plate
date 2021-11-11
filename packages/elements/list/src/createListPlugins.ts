import { PlatePlugin } from '@udecode/plate-core';
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
    key: ELEMENT_UL,
    isElement: true,
    deserialize: getUlDeserialize(),
    onKeyDown: getListOnKeyDown(ELEMENT_UL),
    withOverrides: withList(options),
  },
  {
    key: ELEMENT_OL,
    isElement: true,
    onKeyDown: getListOnKeyDown(ELEMENT_OL),
    deserialize: getOlDeserialize(),
  },
  {
    key: ELEMENT_LI,
    isElement: true,
    deserialize: getLiDeserialize(),
  },
  {
    key: ELEMENT_LIC,
    isElement: true,
    deserialize: getLicDeserialize(),
  },
];

import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
} from '@udecode/plate-core';
import { ELEMENT_HR } from './defaults';
import { getHorizontalRuleDeserialize } from './getHorizontalRuleDeserialize';

export const createHorizontalRulePlugin = (): PlatePlugin => ({
  pluginKeys: ELEMENT_HR,
  renderElement: getRenderElement(ELEMENT_HR),
  voidTypes: getPlatePluginTypes(ELEMENT_HR),
  deserialize: getHorizontalRuleDeserialize(),
});

import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_HR } from './defaults';
import { getHorizontalRuleDeserialize } from './getHorizontalRuleDeserialize';

export const createHorizontalRulePlugin = (): PlatePlugin => ({
  key: ELEMENT_HR,
  isElement: true,
  isVoid: true,
  deserialize: getHorizontalRuleDeserialize(),
});

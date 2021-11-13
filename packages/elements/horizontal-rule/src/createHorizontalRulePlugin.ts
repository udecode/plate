import { createPluginFactory } from '@udecode/plate-core';
import { getHorizontalRuleDeserialize } from './getHorizontalRuleDeserialize';

export const ELEMENT_HR = 'hr';

export const createHorizontalRulePlugin = createPluginFactory({
  key: ELEMENT_HR,
  isElement: true,
  isVoid: true,
  deserialize: getHorizontalRuleDeserialize(),
});

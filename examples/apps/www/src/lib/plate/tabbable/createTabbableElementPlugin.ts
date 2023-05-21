import { createPluginFactory } from '@udecode/plate';

export const TABBABLE_ELEMENT = 'tabbable_element';

export const createTabbableElementPlugin = createPluginFactory({
  key: TABBABLE_ELEMENT,
  isElement: true,
  isVoid: true,
});

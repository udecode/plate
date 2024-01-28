import { createPluginFactory, PlateEditor, Value } from '@udecode/plate-common';

import { injectToggleWrapper } from './injectToggleWrapper';
import { ELEMENT_TOGGLE, ToggleEditor, TogglePlugin } from './types';
import { withToggle } from './withToggle';

export const createTogglePlugin = createPluginFactory<
  TogglePlugin,
  Value,
  PlateEditor<Value> & ToggleEditor
>({
  key: ELEMENT_TOGGLE,
  isElement: true,
  inject: {
    aboveComponent: injectToggleWrapper,
  },
  withOverrides: withToggle,
});

import { createPluginFactory } from '@udecode/plate-common';

import { useHooksToggle } from './hooks/useHooksToggle';
import { injectToggle } from './injectToggle';
import { ToggleControllerProvider } from './store';
import { ELEMENT_TOGGLE, TogglePlugin } from './types';
import { withToggle } from './withToggle';

export const createTogglePlugin = createPluginFactory<TogglePlugin>({
  key: ELEMENT_TOGGLE,
  isElement: true,
  inject: { aboveComponent: injectToggle },
  useHooks: useHooksToggle,
  renderAboveEditable: ToggleControllerProvider,
  withOverrides: withToggle,
});

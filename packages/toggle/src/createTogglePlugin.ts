import { createPluginFactory } from '@udecode/plate-common/server';

import { useHooksToggle } from './hooks/useHooksToggle';
import { injectToggle } from './injectToggle';
import { ToggleControllerProvider } from './toggle-controller-store';
import { ELEMENT_TOGGLE, type TogglePlugin } from './types';
import { withToggle } from './withToggle';

export const createTogglePlugin = createPluginFactory<TogglePlugin>({
  inject: { aboveComponent: injectToggle },
  isElement: true,
  key: ELEMENT_TOGGLE,
  renderAboveEditable: ToggleControllerProvider,
  useHooks: useHooksToggle,
  withOverrides: withToggle,
});

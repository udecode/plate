import { createPlugin } from '@udecode/plate-common/server';

import { useHooksToggle } from './hooks/useHooksToggle';
import { injectToggle } from './injectToggle';
import { ToggleControllerProvider } from './toggle-controller-store';
import { ELEMENT_TOGGLE, type TogglePluginOptions } from './types';
import { withToggle } from './withToggle';

export const TogglePlugin = createPlugin<'toggle', TogglePluginOptions>({
  inject: { aboveComponent: injectToggle },
  isElement: true,
  key: ELEMENT_TOGGLE,
  renderAboveEditable: ToggleControllerProvider,
  useHooks: useHooksToggle,
  withOverrides: withToggle,
});

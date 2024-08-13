import { createPlugin } from '@udecode/plate-common';

import { useHooksToggle } from './hooks/useHooksToggle';
import { injectToggle } from './injectToggle';
import { ToggleControllerProvider } from './toggle-controller-store';
import { TogglePluginOptions } from './types';
import { withToggle } from './withToggle';

export const TogglePlugin = createPlugin<'toggle', TogglePluginOptions>({
  inject: { aboveComponent: injectToggle },
  isElement: true,
  key: 'toggle',
  renderAboveEditable: ToggleControllerProvider,
  useHooks: useHooksToggle,
  withOverrides: withToggle,
});

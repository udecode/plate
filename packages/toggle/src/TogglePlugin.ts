import type { SetStateAction } from 'react';

import { type PluginConfig, createTPlugin } from '@udecode/plate-common';

import { useHooksToggle } from './hooks/useHooksToggle';
import { injectToggle } from './injectToggle';
import {
  ToggleControllerProvider,
  type buildToggleIndex,
} from './toggle-controller-store';
import { withToggle } from './withToggle';

export type ToggleConfig = PluginConfig<
  'toggle',
  {
    // Options would go here
    // TODO a JOTAI layer in plate-core instead of relying on plugin options
    openIds?: Set<string>;
    setOpenIds?: (args_0: SetStateAction<Set<string>>) => void;
    toggleIndex?: ReturnType<typeof buildToggleIndex>;
  }
>;

export const TogglePlugin = createTPlugin<ToggleConfig>({
  inject: { aboveComponent: injectToggle },
  isElement: true,
  key: 'toggle',
  renderAboveEditable: ToggleControllerProvider,
  useHooks: useHooksToggle,
  withOverrides: withToggle,
});

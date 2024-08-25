import type { SetStateAction } from 'react';

import type { PluginConfig } from '@udecode/plate-common';

import { toTPlatePlugin } from '@udecode/plate-common/react';

import { TogglePlugin as BaseTogglePlugin } from '../lib/TogglePlugin';
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
    openIds?: Set<string>;
    setOpenIds?: (args_0: SetStateAction<Set<string>>) => void;
    toggleIndex?: ReturnType<typeof buildToggleIndex>;
  }
>;

/** Enables support for toggleable elements in the editor. */
export const TogglePlugin = toTPlatePlugin<ToggleConfig>(BaseTogglePlugin, {
  extendEditor: withToggle,
  inject: { aboveComponent: injectToggle },
  renderAboveEditable: ToggleControllerProvider,
  useHooks: useHooksToggle,
});

import type { ExtendConfig } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

import type { buildToggleIndex } from './toggleIndexAtom';

import {
  type BaseToggleConfig,
  BaseTogglePlugin,
} from '../lib/BaseTogglePlugin';
import { renderToggleAboveNodes } from './renderToggleAboveNodes';
import { useHooksToggle } from './useHooksToggle';
import { withToggle } from './withToggle';

export type ToggleConfig = ExtendConfig<
  BaseToggleConfig,
  {
    toggleIndex: ReturnType<typeof buildToggleIndex>;
  }
>;

/** Enables support for toggleable elements in the editor. */
export const TogglePlugin = toPlatePlugin<ToggleConfig, BaseToggleConfig>(
  BaseTogglePlugin,
  {
    options: {
      toggleIndex: new Map(),
    },
    render: {
      aboveNodes: renderToggleAboveNodes,
    },
    useHooks: ({ setOption }) => useHooksToggle(setOption),
  }
).extendExtension(withToggle);

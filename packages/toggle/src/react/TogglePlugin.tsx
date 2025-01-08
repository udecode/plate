import { type ExtendConfig, NodeApi } from '@udecode/plate';
import { toTPlatePlugin } from '@udecode/plate/react';

import type { buildToggleIndex } from './toggleIndexAtom';

import {
  type BaseToggleConfig,
  BaseTogglePlugin,
} from '../lib/BaseTogglePlugin';
import { isInClosedToggle } from './queries';
import { renderToggleAboveNodes } from './renderToggleAboveNodes';
import { useHooksToggle } from './useHooksToggle';
import { withToggle } from './withToggle';

export type ToggleConfig = ExtendConfig<
  BaseToggleConfig,
  {
    toggleIndex?: ReturnType<typeof buildToggleIndex>;
  }
>;

/** Enables support for toggleable elements in the editor. */
export const TogglePlugin = toTPlatePlugin<ToggleConfig>(BaseTogglePlugin, {
  options: {
    toggleIndex: new Map(),
  },
  render: {
    aboveNodes: renderToggleAboveNodes,
  },
  useHooks: useHooksToggle as any,
})
  .extendEditorTransforms(withToggle)
  .extendEditorApi(({ api: { isSelectable }, editor }) => ({
    isSelectable(element) {
      if (
        NodeApi.isNode(element) &&
        isInClosedToggle(editor, element.id as string)
      )
        return false;

      return isSelectable(element);
    },
  }));

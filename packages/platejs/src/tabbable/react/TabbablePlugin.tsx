import type { DefinitionOf } from '../../core';
import { PLUGINS } from '../../core';
import { definePlatePlugin } from '../../react/core';
import type { TabbablePluginState } from '../lib/TabbablePluginTypes';
import { TabbableEffects } from './TabbableEffects.internal';

export const TabbablePlugin = definePlatePlugin(PLUGINS.tabbable, {
  initialState: ({ editor }): TabbablePluginState => ({
    globalEventListener: false,
    insertTabbableEntries: (_event) => [],
    isTabbable: (entry) => editor.read.schema.isVoid(entry.slateNode),
    query: (_event) => true,
  }),
  slots: { afterEditable: TabbableEffects },
});

export type TabbableDefinition = DefinitionOf<typeof TabbablePlugin>;

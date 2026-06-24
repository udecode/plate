import {
  createEditorPlugin,
  type PluginConfig,
  type QueryNodeOptions,
  type BasePlateEditor,
  type EditorPlugin,
} from '@platejs/core';
import type { Path } from '@platejs/plite';

import { KEYS } from '../../plate-keys';

export type TrailingBlockInsertOptions = {
  at: Path;
  insert: () => void;
  type: string;
};

export type TrailingBlockConfig = PluginConfig<
  'trailingBlock',
  {
    /**
     * Customize how the trailing block is inserted.
     *
     * Useful when another plugin needs to wrap the insertion, such as
     * disabling suggestions during normalization-generated inserts.
     */
    insert?: (
      editor: BasePlateEditor,
      options: TrailingBlockInsertOptions
    ) => void;
    /** Level where the trailing node should be, the first level being 0. */
    level?: number;
    /** Type of the trailing block */
    type?: string;
  } & QueryNodeOptions
>;

const trailingBlockPlugin = createEditorPlugin<TrailingBlockConfig>({
  key: KEYS.trailingBlock,
  options: {
    level: 0,
  },
}).extend(({ editor }) => ({
  options: {
    type: editor.getType(KEYS.p),
  },
})) as EditorPlugin<TrailingBlockConfig>;

export const TrailingBlockPlugin: EditorPlugin<TrailingBlockConfig> =
  Object.assign(trailingBlockPlugin, { runtimeTrailingBlock: true });

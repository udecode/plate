import {
  createTSlatePlugin,
  type PluginConfig,
  type QueryNodeOptions,
  type SlateEditor,
  type SlatePlugin,
} from '@platejs/core';
import type { Path } from '@platejs/slate';

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
    insert?: (editor: SlateEditor, options: TrailingBlockInsertOptions) => void;
    /** Level where the trailing node should be, the first level being 0. */
    level?: number;
    /** Type of the trailing block */
    type?: string;
  } & QueryNodeOptions
>;

const trailingBlockPlugin = createTSlatePlugin<TrailingBlockConfig>({
  key: KEYS.trailingBlock,
  options: {
    level: 0,
  },
}).extend(({ editor }) => ({
  options: {
    type: editor.getType(KEYS.p),
  },
})) as SlatePlugin<TrailingBlockConfig>;

export const TrailingBlockPlugin: SlatePlugin<TrailingBlockConfig> =
  Object.assign(trailingBlockPlugin, { runtimeTrailingBlock: true });

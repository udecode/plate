import {
  createTSlatePlugin,
  type PluginConfig,
  type SlateEditor,
} from '@platejs/core';
import type { Path, QueryNodeOptions } from '@platejs/slate';

import { KEYS } from '../../plate-keys';
import { withTrailingBlock } from './withTrailingBlock';

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

/** @see {@link withTrailingBlock} */
export const TrailingBlockPlugin = createTSlatePlugin<TrailingBlockConfig>({
  key: KEYS.trailingBlock,
  options: {
    level: 0,
  },
})
  .overrideEditor(withTrailingBlock)
  .extend(({ editor }) => ({
    options: {
      type: editor.getType(KEYS.p),
    },
  }));

import { type Ancestor, NodeApi } from '@platejs/slate';

import type { PluginConfig } from '../../plugin/BasePlugin';

import { createTSlatePlugin } from '../../plugin/createSlatePlugin';
import { withChunking } from './withChunking';

export type ChunkingConfig = PluginConfig<
  'chunking',
  {
    /**
     * The number of blocks per chunk.
     *
     * @default 1000
     */
    chunkSize?: number;
    /**
     * Whether to render each chunk as a DOM element with `content-visibility:
     * auto`, which optimizes DOM painting. When set to `false`, no DOM element
     * will be rendered for each chunk.
     *
     * @default true
     */
    contentVisibilityAuto?: boolean;
    /**
     * Determine which ancestors should have chunking applied to their children.
     * Only blocks containing other blocks can have chunking applied.
     *
     * @default NodeApi.isEditor
     */
    query?: (ancestor: Ancestor) => boolean;
  }
>;

export const ChunkingPlugin = createTSlatePlugin<ChunkingConfig>({
  key: 'chunking',
  options: {
    chunkSize: 1000,
    contentVisibilityAuto: true,
    query: NodeApi.isEditor,
  },
}).overrideEditor(withChunking);

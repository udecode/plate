import type { Ancestor } from '@platejs/plite';

import type { PluginConfig } from '../../plugin/BasePlugin';

import { createEditorPlugin } from '../../plugin/createEditorPlugin';
import { withChunking } from './withChunking';

export const isCurrentEditorRoot = (ancestor: Ancestor) =>
  typeof ancestor === 'object' &&
  ancestor !== null &&
  Array.isArray((ancestor as { children?: unknown }).children) &&
  'api' in ancestor &&
  'meta' in ancestor;

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
     * @default current editor root
     */
    query?: (ancestor: Ancestor) => boolean;
  }
>;

export const ChunkingPlugin = createEditorPlugin<ChunkingConfig>({
  key: 'chunking',
  options: {
    chunkSize: 1000,
    contentVisibilityAuto: true,
    query: isCurrentEditorRoot,
  },
}).overrideEditor(withChunking);

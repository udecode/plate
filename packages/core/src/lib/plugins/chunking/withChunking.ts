import type { Ancestor } from '@platejs/slate';

import type { OverrideEditor } from '../../plugin/SlatePlugin';
import type { ChunkingConfig } from './ChunkingPlugin';

export const withChunking: OverrideEditor<ChunkingConfig> = ({
  editor,
  getOptions,
}) => {
  const { chunkSize, query } = getOptions();
  editor.getChunkSize = (ancestor: Ancestor) =>
    query!(ancestor) ? chunkSize! : null;
  return {};
};

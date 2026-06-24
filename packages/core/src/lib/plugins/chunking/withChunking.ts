import type { Ancestor } from '@platejs/plite';

import type { OverrideEditor } from '../../plugin/EditorPlugin';
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

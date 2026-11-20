import type { Element, NodeKey } from '../../facade';
import type { PluginTransaction } from '../../lib/editor/pluginRuntimeTypes';
import { PLUGINS } from '../../utils/plate-keys';

export type UploadDrafts = Readonly<{
  admit: (
    files: readonly File[],
    options?: Readonly<{ kind?: 'audio' | 'file' | 'image' | 'video' }>
  ) =>
    | Readonly<{
        drafts: readonly Element[];
        fill: (keys: readonly NodeKey[]) => void;
      }>
    | Readonly<{
        failure: Readonly<{ code: string; files: readonly File[] }>;
      }>
    | undefined;
}>;

export const UPLOAD_COMMIT_TAG = 'upload';

export const uploadDraftsOf = (
  tx: PluginTransaction
): UploadDrafts | undefined =>
  tx.plugins.has(PLUGINS.upload)
    ? { admit: tx.plugin(PLUGINS.upload).admit }
    : undefined;

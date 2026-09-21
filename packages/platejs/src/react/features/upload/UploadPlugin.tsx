import { BaseUploadPlugin } from '../../../features/upload/lib/BaseUploadPlugin';
import type { DefinitionOf } from '../../core';
import { toReactPlugin } from '../../core';

/** React adapter for upload drafts, with opt-in native file drops. */
export const UploadPlugin = toReactPlugin(BaseUploadPlugin)
  .extend({
    initialState: { nativeDrop: false },
  })
  .extend(({ editor, store, update }) => ({
    on: {
      drop: ({ event }) => {
        if (!store.get('nativeDrop')) return undefined;

        const { files } = event.dataTransfer;
        if (files.length === 0) return false;

        const range = editor.api.dom.resolveEventRange(event);
        if (!range) return false;

        const block = editor.read.nodes.block({ at: range });
        if (!block) return false;

        const handled = update.submit(files, {
          after: editor.key(block[0]),
          replaceEmpty: true,
        });
        if (!handled) return false;

        event.preventDefault();
        event.stopPropagation();
        return true;
      },
    },
  }));

export type UploadDefinition = DefinitionOf<typeof UploadPlugin>;

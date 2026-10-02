import { BaseUploadPlugin } from '../../../features/upload/lib/BaseUploadPlugin';
import type { DefinitionOf } from '../../core';
import { toReactPlugin } from '../../core';

const carriesFiles = (dataTransfer: DataTransfer | null) =>
  !!dataTransfer && Array.from(dataTransfer.types).includes('Files');

/** React adapter for upload drafts, with opt-in native file drops. */
export const UploadPlugin = toReactPlugin(BaseUploadPlugin)
  .extend({
    initialState: { nativeDrop: false },
  })
  .extend(({ schema: { type }, store }) => {
    const fileDropBlock = { children: [{ text: '' }], kind: 'file', type };

    return {
      on: {
        dragOver: ({ editor, event }) => {
          if (!store.get('nativeDrop') || !carriesFiles(event.dataTransfer)) {
            return undefined;
          }

          const target = editor.api.dom.resolveDropTarget(event, {
            files: fileDropBlock,
          });

          editor.api.dom.drag.indicate(target);
          event.preventDefault();
          event.dataTransfer.dropEffect = target ? 'copy' : 'none';

          return true;
        },
        drop: ({ editor, event }) => {
          if (!store.get('nativeDrop') || !carriesFiles(event.dataTransfer)) {
            return undefined;
          }

          const target = editor.api.dom.resolveDropTarget(event, {
            files: fileDropBlock,
          });

          editor.api.dom.drag.indicate(null);
          event.preventDefault();
          event.stopPropagation();
          if (!target || !('key' in target)) return true;

          editor
            .plugin(BaseUploadPlugin)
            .update.submit(
              event.dataTransfer.files,
              target.edge === 'before'
                ? { before: target.key }
                : { after: target.key, replaceEmpty: true }
            );

          return true;
        },
      },
    };
  });

export type UploadDefinition = DefinitionOf<typeof UploadPlugin>;

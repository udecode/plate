import { NodeApi, PathApi, type DefinitionOf } from '../../../../core';
import { BasePlaceholderPlugin } from '../../../../features/media/lib/placeholder/BasePlaceholderPlugin';
import { toPlatePlugin } from '../../../core';

export const PlaceholderPlugin = toPlatePlugin(BasePlaceholderPlugin).extend(
  ({ editor, plugin, store, update }) => ({
    on: {
      drop: ({ event }) => {
        // The DnD plugin owns file drops unless explicitly disabled.
        if (!store.get('disableFileDrop')) return undefined;

        const { files } = event.dataTransfer;

        if (files.length === 0) return false;

        event.preventDefault();
        event.stopPropagation();

        const at = editor.api.dom.resolveEventRange(event);

        if (!at) return false;

        update.insertMedia(files, { at: at.focus.path });

        return true;
      },
      paste: ({ event }) => {
        const { files, types } = event.clipboardData;

        if (files.length === 0 || types.includes('text/html')) return false;

        event.preventDefault();
        event.stopPropagation();

        const ancestor = editor.read.nodes.block();

        if (ancestor && NodeApi.string(ancestor[0]).length === 0) {
          editor.update((tx) => {
            tx.nodes.remove({ at: ancestor[1] });
            tx.plugin(plugin).insertMedia(files, { at: ancestor[1] });
          });

          return true;
        }

        update.insertMedia(files, {
          at: ancestor ? PathApi.next(ancestor[1]) : undefined,
        });

        return true;
      },
    },
  })
);

export type PlaceholderDefinition = DefinitionOf<typeof PlaceholderPlugin>;

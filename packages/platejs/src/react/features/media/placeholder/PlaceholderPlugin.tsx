import type { DefinitionOf } from '../../../../core';
import { BasePlaceholderPlugin } from '../../../../features/media/lib/placeholder/BasePlaceholderPlugin';
import { toReactPlugin } from '../../../core';

export const PlaceholderPlugin = toReactPlugin(BasePlaceholderPlugin).extend(
  ({ editor, store, update }) => ({
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
    },
  })
);

export type PlaceholderDefinition = DefinitionOf<typeof PlaceholderPlugin>;

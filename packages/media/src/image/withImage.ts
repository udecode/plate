import type {
  PlateEditor,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common/server';

import type { ImagePlugin } from './types';

import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

/**
 * @see withImageUpload
 * @see withImageEmbed
 */
export const withImage = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  plugin: WithPlatePlugin<ImagePlugin, V, E>
) => {
  const {
    options: { disableEmbedInsert, disableUploadInsert },
  } = plugin;

  if (!disableUploadInsert) {
    editor = withImageUpload(editor, plugin);
  }
  if (!disableEmbedInsert) {
    editor = withImageEmbed(editor, plugin);
  }

  return editor;
};

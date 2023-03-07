import { PlateEditor, Value, WithPlatePlugin } from '@udecode/plate-common';
import { getWithSelectionCaption } from '../caption/getWithSelectionCaption';
import { ELEMENT_IMAGE } from './createImagePlugin';
import { ImagePlugin } from './types';
import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

/**
 * @see withImageUpload
 * @see withImageEmbed
 */
export const withImage = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  plugin: WithPlatePlugin<ImagePlugin, V, E>
) => {
  const {
    options: { disableUploadInsert, disableEmbedInsert, disableCaption },
  } = plugin;

  if (!disableUploadInsert) {
    editor = withImageUpload(editor, plugin);
  }

  if (!disableEmbedInsert) {
    editor = withImageEmbed(editor, plugin);
  }

  if (!disableCaption) {
    editor = getWithSelectionCaption(ELEMENT_IMAGE)(editor, plugin);
  }

  return editor;
};

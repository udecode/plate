import type { WithOverride } from '@udecode/plate-common';

import type { ImagePluginOptions } from './types';

import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

/**
 * @see withImageUpload
 * @see withImageEmbed
 */
export const withImage: WithOverride<ImagePluginOptions> = ({
  editor,
  plugin,
}) => {
  const {
    options: { disableEmbedInsert, disableUploadInsert },
  } = plugin;

  if (!disableUploadInsert) {
    editor = withImageUpload({ editor, plugin });
  }
  if (!disableEmbedInsert) {
    editor = withImageEmbed({ editor, plugin });
  }

  return editor;
};

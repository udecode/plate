import type { WithOverride } from '@udecode/plate-common';

import type { ImageConfig } from './ImagePlugin';

import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

/**
 * @see withImageUpload
 * @see withImageEmbed
 */
export const withImage: WithOverride<ImageConfig> = ({ editor, ...ctx }) => {
  const {
    options: { disableEmbedInsert, disableUploadInsert },
  } = ctx.plugin;

  if (!disableUploadInsert) {
    editor = withImageUpload({ editor, ...ctx });
  }
  if (!disableEmbedInsert) {
    editor = withImageEmbed({ editor, ...ctx });
  }

  return editor;
};

import type { ExtendEditor } from '@udecode/plate';

import type { ImageConfig } from './BaseImagePlugin';

import { withImageEmbed } from './withImageEmbed';
import { withImageUpload } from './withImageUpload';

/**
 * @see withImageUpload
 * @see withImageEmbed
 */
export const withImage: ExtendEditor<ImageConfig> = ({ editor, ...ctx }) => {
  editor = withImageUpload({ editor, ...ctx });
  editor = withImageEmbed({ editor, ...ctx });

  return editor;
};

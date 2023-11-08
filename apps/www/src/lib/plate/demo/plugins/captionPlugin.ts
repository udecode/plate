import { CaptionPlugin } from '@udecode/plate-caption';
import { PlatePlugin } from '@udecode/plate-common';
import { ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED } from '@udecode/plate-media';

export const captionPlugin: Partial<PlatePlugin<CaptionPlugin>> = {
  options: {
    pluginKeys: [ELEMENT_IMAGE, ELEMENT_MEDIA_EMBED],
  },
};

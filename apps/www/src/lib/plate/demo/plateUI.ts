import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_MEDIA_EMBED,
  ELEMENT_PARAGRAPH,
  withProps,
} from '@udecode/plate';
import { PlateElement } from '@udecode/plate-tailwind';

import { createPlateUI } from '@/lib/createPlateUI';
import { CodeBlockElement } from '@/plate/aui/code-block-element';
import { MediaEmbedElement } from '@/plate/media/MediaEmbedElement';

export const plateUI = createPlateUI({
  [ELEMENT_MEDIA_EMBED]: withProps(MediaEmbedElement, {
    nodeProps: {
      twitterOptions: {
        theme: 'dark',
      },
    },
  }),
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_PARAGRAPH]: withProps(PlateElement, {
    className: 'm-0 py-1 px-0',
  }),
});

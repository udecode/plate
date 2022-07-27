import {
  createPluginFactory,
  getBlockAbove,
  getPluginType,
} from '@udecode/plate-core';
import { captionGlobalStore } from '@udecode/plate-media';
import isHotkey from 'is-hotkey';
import { ImagePlugin } from './types';
import { withImage } from './withImage';

export const ELEMENT_IMAGE = 'img';

/**
 * Enables support for images.
 */
export const createImagePlugin = createPluginFactory<ImagePlugin>({
  key: ELEMENT_IMAGE,
  isElement: true,
  isVoid: true,
  withOverrides: withImage,
  handlers: {
    onKeyDown: (editor) => (e) => {
      // focus caption from image
      if (isHotkey('down', e)) {
        const entry = getBlockAbove(editor, {
          match: { type: getPluginType(editor, ELEMENT_IMAGE) },
        });
        if (!entry) return;

        captionGlobalStore.set.focusEndCaptionPath(entry[1]);
      }

      // TODO: focus caption from line below image
      // if (isHotkey('up', e)) {
      // }
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'IMG',
        },
      ],
      getNode: (el) => ({
        type,
        url: el.getAttribute('src'),
      }),
    },
  }),
});

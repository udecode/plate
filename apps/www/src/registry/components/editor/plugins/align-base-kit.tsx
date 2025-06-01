import { KEYS } from '@udecode/plate';
import { BaseTextAlignPlugin } from '@udecode/plate-basic-styles';

export const BaseAlignKit = [
  BaseTextAlignPlugin.extend({
    inject: {
      targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.img, KEYS.mediaEmbed],
    },
  }),
];

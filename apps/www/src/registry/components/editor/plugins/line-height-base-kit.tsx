import { KEYS } from '@udecode/plate';
import { BaseLineHeightPlugin } from '@udecode/plate-basic-styles';

export const BaseLineHeightKit = [
  BaseLineHeightPlugin.configure({
    inject: {
      nodeProps: {
        defaultNodeValue: 1.5,
        validNodeValues: [1, 1.2, 1.5, 2, 3],
      },
      targetPlugins: [KEYS.p, ...KEYS.heading],
    },
  }),
];

import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
} from '@udecode/plate';
import { withTriggerCombobox } from '@udecode/plate-combobox';

import type { EmojiPluginOptions } from './types';

export type EmojiInputConfig = PluginConfig<'emoji', EmojiPluginOptions>;

export const BaseEmojiInputPlugin = createSlatePlugin({
  key: 'emoji_input',
  node: { isElement: true, isInline: true, isVoid: true },
});

export const BaseEmojiPlugin = createTSlatePlugin<EmojiInputConfig>({
  key: 'emoji',
  options: {
    createComboboxInput: () => ({
      children: [{ text: '' }],
      type: BaseEmojiInputPlugin.key,
    }),
    createEmojiNode: ({ skins }) => ({ text: skins[0].native }),
    data: {
      aliases: {},
      categories: [
        {
          id: 'people',
          emojis: ['+1'],
        },
      ],
      emojis: {
        '+1': {
          id: '+1',
          keywords: [],
          name: 'Thumbs Up',
          skins: [
            {
              native: '👍',
              unified: '1f44d',
            },
            {
              native: '👍🏻',
              unified: '1f44d-1f3fb',
            },
            {
              native: '👍🏼',
              unified: '1f44d-1f3fc',
            },
            {
              native: '👍🏽',
              unified: '1f44d-1f3fd',
            },
            {
              native: '👍🏾',
              unified: '1f44d-1f3fe',
            },
            {
              native: '👍🏿',
              unified: '1f44d-1f3ff',
            },
          ],
          version: 1,
        },
      },
      sheet: {
        cols: 1,
        rows: 1,
      },
    },
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
  },
  plugins: [BaseEmojiInputPlugin],
}).overrideEditor(withTriggerCombobox);

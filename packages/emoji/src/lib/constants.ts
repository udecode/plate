import type { EmojiMartData } from '@emoji-mart/data';

import {
  type EmojiCategoryList,
  type EmojiSettingsType,
  type FrequentEmojis,
  type i18nProps,
  EmojiCategory,
} from './types';

export const EMOJI_MAX_SEARCH_RESULT = 60;

export const DEFAULT_EMOJI_LIBRARY: EmojiMartData = {
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
};

export const defaultCategories: EmojiCategoryList[] = [
  EmojiCategory.People,
  EmojiCategory.Nature,
  EmojiCategory.Foods,
  EmojiCategory.Activity,
  EmojiCategory.Places,
  EmojiCategory.Objects,
  EmojiCategory.Symbols,
  EmojiCategory.Flags,
];

export const EmojiSettings: EmojiSettingsType = {
  buttonSize: {
    value: 36,
  },
  categories: {
    value: undefined,
  },
  perLine: {
    value: 8,
  },
  showFrequent: {
    limit: 16,
    value: true,
  },
};

export const DEFAULT_FREQUENTLY_USED_EMOJI: FrequentEmojis = {
  '+1': 1,
  clap: 1,
  grinning: 1,
  heart: 1,
  heart_eyes: 1,
  hugging_face: 1,
  joy: 1,
  kissing_heart: 1,
  laughing: 1,
  pray: 1,
  rocket: 1,
  scream: 1,
  see_no_evil: 1,
};

export const NUM_OF_CATEGORIES = Object.values(EmojiCategory).length;

export const i18n: i18nProps = {
  categories: {
    activity: 'Activity',
    custom: 'Custom',
    flags: 'Flags',
    foods: 'Food & Drink',
    frequent: 'Frequently used',
    nature: 'Animals & Nature',
    objects: 'Objects',
    people: 'Smileys & People',
    places: 'Travel & Places',
    symbols: 'Symbols',
  },
  clear: 'Clear',
  pick: 'Pick an emoji...',
  search: 'Search all emoji',
  searchNoResultsSubtitle: 'That emoji couldn’t be found',
  searchNoResultsTitle: 'Oh no!',
  searchResult: 'Search Results',
  skins: {
    '1': 'Default',
    '2': 'Light',
    '3': 'Medium-Light',
    '4': 'Medium',
    '5': 'Medium-Dark',
    '6': 'Dark',
    choose: 'Choose default skin tone',
  },
};

import { i18nProps } from './types';

export const KEY_EMOJI = 'emoji';

export const EMOJI_TRIGGER = ':';
export const EMOJI_MAX_RESULT = 90;

export const DEFAULT_FREQUENTLY_USED_EMOJI = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'scream',
  'disappointed',
  'unamused',
  'weary',
  'sob',
  'sunglasses',
  'heart',
];

export const i18n: i18nProps = {
  search: 'Search',
  clear: 'Clear',
  searchNoResultsTitle: 'Oh no!',
  searchNoResultsSubtitle: 'That emoji couldn’t be found',
  pick: 'Pick an emoji...',
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
    search: 'Search Results',
    symbols: 'Symbols',
  },
  skins: {
    choose: 'Choose default skin tone',
    '1': 'Default',
    '2': 'Light',
    '3': 'Medium-Light',
    '4': 'Medium',
    '5': 'Medium-Dark',
    '6': 'Dark',
  },
};

import { SuggestionUser, TSuggestion } from '@udecode/plate';

import { MyValue } from '@/types/plate.types';

export const usersData: Record<string, SuggestionUser> = {
  1: {
    id: '1',
    name: 'Alice',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
    hue: Math.floor(Math.random() * 360),
    isOwner: true,
  },
  2: {
    id: '2',
    name: 'Bob',
    hue: Math.floor(Math.random() * 360),
  },
};

export const suggestionsData: Record<string, TSuggestion> = {
  1: {
    id: '1',
    createdAt: 1663453625129,
  },
  2: {
    id: '2',
    createdAt: 1663453729191,
  },
  3: {
    id: '3',
    createdAt: 1663453740180,
  },
};

export const suggestionValue: MyValue = [
  {
    type: 'p',
    children: [
      { text: 'Hello' },
      {
        text: ' World',
        suggestion: true,
        suggestionId: 1,
        suggestion_1: true,
      },
      { text: '.' },
    ],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Lorem',
        suggestion: true,
        suggestionId: 2,
        suggestion_1: true,
      },
      { text: 'amet' },
      {
        text: 'paragraph',
        suggestion: true,
        suggestionId: 3,
        suggestionDeletion: true,
        suggestion_2: true,
      },
      {
        text: ' consectetur, adipisicing elit. Nobis consequuntur modi odit incidunt unde animi molestias necessitatibus nisi ab optio dolorum, libero placeat aut, facere tempore accusamus veniam voluptatem aspernatur.',
      },
    ],
  },
  { type: 'p', children: [{ text: '' }] },
];

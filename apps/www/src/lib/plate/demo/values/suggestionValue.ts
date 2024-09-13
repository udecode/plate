import type { Value } from '@udecode/plate-common';
import type { SuggestionUser, TSuggestion } from '@udecode/plate-suggestion';

export const usersData: Record<string, SuggestionUser> = {
  1: {
    id: '1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
    hue: Math.floor(Math.random() * 360),
    isOwner: true,
    name: 'Alice',
  },
  2: {
    id: '2',
    hue: Math.floor(Math.random() * 360),
    name: 'Bob',
  },
};

export const suggestionsData: Record<string, TSuggestion> = {
  1: {
    id: '1',
    createdAt: 1_663_453_625_129,
  },
  2: {
    id: '2',
    createdAt: 1_663_453_729_191,
  },
  3: {
    id: '3',
    createdAt: 1_663_453_740_180,
  },
};

export const suggestionValue: Value = [
  {
    children: [
      { text: 'Hello' },
      {
        suggestion: true,
        suggestion_1: true,
        suggestionId: 1,
        text: ' World',
      },
      { text: '.' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        suggestion: true,
        suggestion_1: true,
        suggestionId: 2,
        text: 'Lorem',
      },
      { text: 'amet' },
      {
        suggestion: true,
        suggestion_2: true,
        suggestionDeletion: true,
        suggestionId: 3,
        text: 'paragraph',
      },
      {
        text: ' consectetur, adipisicing elit. Nobis consequuntur modi odit incidunt unde animi molestias necessitatibus nisi ab optio dolorum, libero placeat aut, facere tempore accusamus veniam voluptatem aspernatur.',
      },
    ],
    type: 'p',
  },
  { children: [{ text: '' }], type: 'p' },
];

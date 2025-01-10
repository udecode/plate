import type { Value } from '@udecode/plate';
import type { SuggestionUser, TSuggestion } from '@udecode/plate-suggestion';

export const usersData: Record<string, SuggestionUser> = {
  1: {
    id: '1',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
    hue: Math.floor(Math.random() * 360),
    isOwner: true,
    name: '小丽',
  },
  2: {
    id: '2',
    hue: Math.floor(Math.random() * 360),
    name: '小明',
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
      { text: '你好' },
      {
        suggestion: true,
        suggestion_1: true,
        suggestionId: 1,
        text: '世界',
      },
      { text: '。' },
    ],
    type: 'p',
  },
  {
    children: [
      {
        suggestion: true,
        suggestion_1: true,
        suggestionId: 2,
        text: '这是',
      },
      { text: '一段' },
      {
        suggestion: true,
        suggestion_2: true,
        suggestionDeletion: true,
        suggestionId: 3,
        text: '示例文字',
      },
      {
        text: '，用于展示建议功能。您可以在此处添加、修改或删除内容，体验协作编辑的便捷性。这个功能让多人协作变得更加简单高效。',
      },
    ],
    type: 'p',
  },
  { children: [{ text: '' }], type: 'p' },
];

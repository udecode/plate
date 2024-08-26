import {
  type PluginConfig,
  type WithPartial,
  createTSlatePlugin,
  nanoid,
} from '@udecode/plate-common';

import type { SuggestionUser, TSuggestion } from './types';

import { withSuggestion } from './withSuggestion';

export const SUGGESTION_KEYS = {
  id: 'suggestionId',
} as const;

export type SuggestionConfig = PluginConfig<
  'suggestion',
  {
    activeSuggestionId: null | string;
    currentUserId: null | string;
    isSuggesting: boolean;
    onSuggestionAdd: ((value: Partial<TSuggestion>) => void) | null;
    onSuggestionDelete: ((id: string) => void) | null;
    onSuggestionUpdate:
      | ((
          value: Partial<Omit<TSuggestion, 'id'>> & Pick<TSuggestion, 'id'>
        ) => void)
      | null;
    suggestions: Record<string, TSuggestion>;
    users: Record<string, SuggestionUser>;
  } & SuggestionSelectors,
  {
    suggestion: SuggestionPluginApi;
  }
>;

export type SuggestionSelectors = {
  currentSuggestionUser?: () => SuggestionUser | null;
  suggestionById?: (id: null | string) => TSuggestion | null;
  suggestionUserById?: (id: null | string) => SuggestionUser | null;
};

export type SuggestionPluginApi = {
  addSuggestion: (
    value: WithPartial<TSuggestion, 'createdAt' | 'id' | 'userId'>
  ) => void;
  removeSuggestion: (id: null | string) => void;
  updateSuggestion: (id: null | string, value: Partial<TSuggestion>) => void;
};

export const SuggestionPlugin = createTSlatePlugin<SuggestionConfig>({
  extendEditor: withSuggestion,
  key: 'suggestion',
  node: { isLeaf: true },
  options: {
    activeSuggestionId: null,
    currentUserId: null,
    isSuggesting: false,
    onSuggestionAdd: null,
    onSuggestionDelete: null,
    onSuggestionUpdate: null,
    suggestions: {},
    users: {},
  },
})
  .extendOptions(({ getOptions }) => ({
    currentSuggestionUser: (): SuggestionUser | null => {
      const { currentUserId, users } = getOptions();

      if (!currentUserId) return null;

      return users[currentUserId];
    },
    suggestionById: (id: null | string): TSuggestion | null => {
      if (!id) return null;

      return getOptions().suggestions[id];
    },
    suggestionUserById: (id: null | string): SuggestionUser | null => {
      if (!id) return null;

      return getOptions().users[id];
    },
  }))
  .extendApi<Partial<SuggestionPluginApi>>(({ getOptions, setOptions }) => ({
    addSuggestion: (
      value: WithPartial<TSuggestion, 'createdAt' | 'id' | 'userId'>
    ) => {
      const { currentUserId } = getOptions();

      if (!currentUserId) return;

      const id = value.id ?? nanoid();
      const newSuggestion: TSuggestion = {
        createdAt: Date.now(),
        id,
        userId: currentUserId,
        ...value,
      };

      setOptions((draft) => {
        draft.suggestions[id] = newSuggestion;
      });
    },
    removeSuggestion: (id: null | string) => {
      if (!id) return;

      setOptions((draft) => {
        delete draft.suggestions[id];
      });
    },
    updateSuggestion: (id: null | string, value: Partial<TSuggestion>) => {
      if (!id) return;

      setOptions((draft) => {
        draft.suggestions[id] = { ...draft.suggestions[id], ...value };
      });
    },
  }));

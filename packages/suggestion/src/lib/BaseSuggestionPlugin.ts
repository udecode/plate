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
    activeSuggestionId: string | null;
    currentUserId: string | null;
    isSuggesting: boolean;
    suggestions: Record<string, TSuggestion>;
    users: Record<string, SuggestionUser>;
    onSuggestionAdd: ((value: Partial<TSuggestion>) => void) | null;
    onSuggestionDelete: ((id: string) => void) | null;
    onSuggestionUpdate:
      | ((
          value: Partial<Omit<TSuggestion, 'id'>> & Pick<TSuggestion, 'id'>
        ) => void)
      | null;
  } & SuggestionSelectors,
  {
    suggestion: SuggestionPluginApi;
  }
>;

export type SuggestionSelectors = {
  currentSuggestionUser?: () => SuggestionUser | null;
  suggestionById?: (id: string | null) => TSuggestion | null;
  suggestionUserById?: (id: string | null) => SuggestionUser | null;
};

export type SuggestionPluginApi = {
  addSuggestion: (
    value: WithPartial<TSuggestion, 'createdAt' | 'id' | 'userId'>
  ) => void;
  removeSuggestion: (id: string | null) => void;
  updateSuggestion: (id: string | null, value: Partial<TSuggestion>) => void;
};

export const BaseSuggestionPlugin = createTSlatePlugin<SuggestionConfig>({
  key: 'suggestion',
  extendEditor: withSuggestion,
  node: { isLeaf: true },
  options: {
    activeSuggestionId: null,
    currentUserId: null,
    isSuggesting: false,
    suggestions: {},
    users: {},
    onSuggestionAdd: null,
    onSuggestionDelete: null,
    onSuggestionUpdate: null,
  },
})
  .extendOptions(({ getOptions }) => ({
    currentSuggestionUser: (): SuggestionUser | null => {
      const { currentUserId, users } = getOptions();

      if (!currentUserId) return null;

      return users[currentUserId];
    },
    suggestionById: (id: string | null): TSuggestion | null => {
      if (!id) return null;

      return getOptions().suggestions[id];
    },
    suggestionUserById: (id: string | null): SuggestionUser | null => {
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
        id,
        createdAt: Date.now(),
        userId: currentUserId,
        ...value,
      };

      setOptions((draft) => {
        draft.suggestions[id] = newSuggestion;
      });
    },
    removeSuggestion: (id: string | null) => {
      if (!id) return;

      setOptions((draft) => {
        delete draft.suggestions[id];
      });
    },
    updateSuggestion: (id: string | null, value: Partial<TSuggestion>) => {
      if (!id) return;

      setOptions((draft) => {
        draft.suggestions[id] = { ...draft.suggestions[id], ...value };
      });
    },
  }));

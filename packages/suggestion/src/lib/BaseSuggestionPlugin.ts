import {
  type Path,
  type PluginConfig,
  type WithPartial,
  createTSlatePlugin,
  isSlateString,
  nanoid,
} from '@udecode/plate';

import type { SuggestionUser, TSuggestion } from './types';

import { findSuggestionNode } from './queries';
import { getSuggestionId } from './utils';
import { withSuggestion } from './withSuggestion';

export const SUGGESTION_KEYS = {
  id: 'suggestionId',
  createdAt: 'suggestionCreateAt',
  lineBreak: 'suggestionLineBreak',
} as const;

export type SuggestionConfig = PluginConfig<
  'suggestion',
  {
    activeSuggestionId: string | null;
    currentUserId: string | null;
    hoverSuggestionId: string | null;
    isSuggesting: boolean;
    suggestions: Record<string, TSuggestion>;
    uniquePathMap: Map<string, Path>;
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

export type SuggestionPluginApi = {
  addSuggestion: (value: WithPartial<TSuggestion, 'id' | 'userId'>) => void;
  removeSuggestion: (id: string | null) => void;
  updateSuggestion: (id: string | null, value: Partial<TSuggestion>) => void;
  withoutSuggestions: (fn: () => void) => void;
};

export type SuggestionSelectors = {
  currentSuggestionUser?: () => SuggestionUser | null;
  suggestionById?: (id: string | null) => TSuggestion | null;
  suggestionUserById?: (id: string | null) => SuggestionUser | null;
};

export const BaseSuggestionPlugin = createTSlatePlugin<SuggestionConfig>({
  key: 'suggestion',
  node: { isLeaf: true },
  options: {
    activeSuggestionId: null,
    currentUserId: null,
    hoverSuggestionId: null,
    isSuggesting: false,
    suggestions: {},
    uniquePathMap: new Map(),
    users: {},
    onSuggestionAdd: null,
    onSuggestionDelete: null,
    onSuggestionUpdate: null,
  },
})
  .overrideEditor(withSuggestion)
  .extendSelectors(({ getOptions }) => ({
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
  .extendApi<Partial<SuggestionPluginApi>>(
    ({ getOption, getOptions, setOption, setOptions }) => ({
      addSuggestion: (value) => {
        const { currentUserId } = getOptions();

        if (!currentUserId) return;

        const id = value.id ?? nanoid();
        const newSuggestion: TSuggestion = {
          id,
          userId: currentUserId,
          ...value,
        };

        setOptions((draft) => {
          draft.suggestions![id] = newSuggestion;
        });
      },
      removeSuggestion: (id) => {
        if (!id) return;

        setOptions((draft) => {
          delete draft.suggestions![id];
        });
      },
      updateSuggestion: (id, value) => {
        if (!id) return;

        setOptions((draft) => {
          draft.suggestions![id] = { ...draft.suggestions![id], ...value };
        });
      },
      withoutSuggestions: (fn) => {
        const prev = getOption('isSuggesting');
        setOption('isSuggesting', false);
        fn();
        setOption('isSuggesting', prev);
      },
    })
  );

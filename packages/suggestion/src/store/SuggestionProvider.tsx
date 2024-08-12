import { type WithPartial, nanoid } from '@udecode/plate-common';
import { createAtomStore } from '@udecode/plate-common/react';

import type { SuggestionUser, TSuggestion } from '../types';

export interface SuggestionStoreState {
  /** Id of the active suggestion. If null, no suggestion is active. */
  activeSuggestionId: null | string;

  /** Id of the current user. */
  currentUserId: null | string;

  isSuggesting: boolean;

  onSuggestionAdd: ((value: Partial<TSuggestion>) => void) | null;

  onSuggestionDelete: ((id: string) => void) | null;

  onSuggestionUpdate:
    | ((
        value: Partial<Omit<TSuggestion, 'id'>> & Pick<TSuggestion, 'id'>
      ) => void)
    | null;
  /** Suggestions data. */
  suggestions: Record<string, TSuggestion>;
  /** Users data. */
  users: Record<string, SuggestionUser>;
}

export const { SuggestionProvider, suggestionStore, useSuggestionStore } =
  createAtomStore(
    {
      activeSuggestionId: null,
      currentUserId: null,
      isSuggesting: false,
      onSuggestionAdd: null,
      onSuggestionDelete: null,
      onSuggestionUpdate: null,
      suggestions: {},
      users: {},
    } as SuggestionStoreState,
    {
      name: 'suggestion',
    }
  );

export const useSuggestionStates = () => useSuggestionStore().use;

export const useSuggestionSelectors = () => useSuggestionStore().get;

export const useSuggestionActions = () => useSuggestionStore().set;

export const useSuggestionById = (id?: null | string): TSuggestion | null => {
  const suggestion = useSuggestionSelectors().suggestions();

  if (!id) return null;

  return suggestion[id];
};

export const useSuggestionUserById = (
  id: null | string
): SuggestionUser | null => {
  const users = useSuggestionSelectors().users();

  if (!id) return null;

  return users[id];
};

export const useCurrentSuggestionUser = (): SuggestionUser | null => {
  const users = useSuggestionSelectors().users();
  const currentUserId = useSuggestionSelectors().currentUserId();

  if (!currentUserId) return null;

  return users[currentUserId];
};

export const useUpdateSuggestion = (id?: null | string) => {
  const suggestion = useSuggestionById(id);

  const [suggestions, setSuggestions] = useSuggestionStates().suggestions();

  return (value: Partial<TSuggestion>) => {
    if (!id) return;

    setSuggestions({
      ...suggestions,
      [id]: { ...suggestion, ...value } as any,
    });
  };
};

export const useAddSuggestion = () => {
  const [suggestions, setSuggestions] = useSuggestionStates().suggestions();
  const currentUserId = useSuggestionSelectors().currentUserId();

  return (value: WithPartial<TSuggestion, 'createdAt' | 'id' | 'userId'>) => {
    if (!currentUserId) return;

    const id = value.id ?? nanoid();

    setSuggestions({
      ...suggestions,
      [id]: {
        createdAt: Date.now(),
        id,
        userId: currentUserId,
        ...value,
      },
    });
  };
};

export const useRemoveSuggestion = () => {
  const [suggestions, setSuggestions] = useSuggestionStates().suggestions();

  return (id: null | string) => {
    if (!id) return;

    delete suggestions[id];

    setSuggestions({
      ...suggestions,
    });
  };
};

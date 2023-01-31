import React, { ReactNode } from 'react';
import {
  createAtomStore,
  getJotaiProviderInitialValues,
  JotaiProvider,
  nanoid,
  WithPartial,
} from '@udecode/plate-core';
import { SuggestionUser, TSuggestion } from '../types';

export const SCOPE_SUGGESTION = Symbol('suggestion');

export interface SuggestionStoreState {
  /**
   * Users data.
   */
  users: Record<string, SuggestionUser>;

  myUserId: string | null;

  /**
   * Suggestions data.
   */
  suggestions: Record<string, TSuggestion>;

  isSuggesting: boolean;

  /**
   * Id of the active suggestion. If null, no suggestion is active.
   */
  activeSuggestionId: string | null;

  onSuggestionAdd: ((value: Partial<TSuggestion>) => void) | null;
  onSuggestionUpdate:
    | ((
        value: Pick<TSuggestion, 'id'> & Partial<Omit<TSuggestion, 'id'>>
      ) => void)
    | null;
  onSuggestionDelete: ((id: string) => void) | null;
}

export const { suggestionStore, useSuggestionStore } = createAtomStore(
  {
    /**
     * Id of the current user.
     */
    myUserId: null,

    /**
     * Users data.
     */
    users: {},

    /**
     * Suggestion data.
     */
    suggestions: {},

    // TODO
    isSuggesting: true,

    /**
     * Id of the active suggestion. If null, no suggestion is active.
     */
    activeSuggestionId: null,

    onSuggestionAdd: null,
    onSuggestionUpdate: null,
    onSuggestionDelete: null,
  } as SuggestionStoreState,
  {
    name: 'suggestion',
    scope: SCOPE_SUGGESTION,
  }
);

export const SuggestionProvider = ({
  children,
  ...props
}: Partial<SuggestionStoreState> & { children: ReactNode }) => {
  return (
    <JotaiProvider
      initialValues={getJotaiProviderInitialValues(suggestionStore, props)}
      scope={SCOPE_SUGGESTION}
    >
      {children}
    </JotaiProvider>
  );
};

export const useSuggestionStates = () => useSuggestionStore().use;
export const useSuggestionSelectors = () => useSuggestionStore().get;
export const useSuggestionActions = () => useSuggestionStore().set;

export const useSuggestionById = (id?: string | null): TSuggestion | null => {
  const suggestion = useSuggestionSelectors().suggestions();
  if (!id) return null;

  return suggestion[id];
};

export const useSuggestionUserById = (
  id: string | null
): SuggestionUser | null => {
  const users = useSuggestionSelectors().users();
  if (!id) return null;

  return users[id];
};

export const useMySuggestionUser = (): SuggestionUser | null => {
  const users = useSuggestionSelectors().users();
  const myUserId = useSuggestionSelectors().myUserId();
  if (!myUserId) return null;

  return users[myUserId];
};

export const useUpdateSuggestion = (id?: string | null) => {
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
  const myUserId = useSuggestionSelectors().myUserId();

  return (value: WithPartial<TSuggestion, 'id' | 'userId' | 'createdAt'>) => {
    if (!myUserId) return;

    const id = value.id ?? nanoid();

    setSuggestions({
      ...suggestions,
      [id]: {
        id,
        userId: myUserId,
        createdAt: Date.now(),
        ...value,
      },
    });
  };
};

export const useRemoveSuggestion = () => {
  const [suggestions, setSuggestions] = useSuggestionStates().suggestions();

  return (id: string | null) => {
    if (!id) return;

    delete suggestions[id];

    setSuggestions({
      ...suggestions,
    });
  };
};

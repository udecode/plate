import {
  type EditorNodesOptions,
  type NodeEntry,
  type PluginConfig,
  type TElement,
  type WithPartial,
  createTSlatePlugin,
  ElementApi,
  getAt,
  nanoid,
  TextApi,
} from '@udecode/plate';

import type {
  SuggestionUser,
  TInlineSuggestionData,
  TSuggestion,
  TSuggestionElement,
  TSuggestionText,
} from './types';

import { getSuggestionKey, getSuggestionKeyId } from './utils';
import { withSuggestion } from './withSuggestion';

export const SUGGESTION_KEYS = {
  id: 'suggestionId',
  createdAt: 'suggestionCreateAt',
} as const;

export type BaseSuggestionConfig = PluginConfig<
  'suggestion',
  {
    currentUserId: string | null;
    isSuggesting: boolean;
    suggestions: Record<string, TSuggestion>;
    users: Record<string, SuggestionUser>;
  },
  {
    suggestion: {
      addSuggestion: (value: WithPartial<TSuggestion, 'id' | 'userId'>) => void;
      dataList: (node: TSuggestionText) => TInlineSuggestionData[];
      isBlockSuggestion: (node: TElement) => node is TSuggestionElement;
      node: (
        options?: EditorNodesOptions & { id?: string; isText?: boolean }
      ) => NodeEntry<TSuggestionElement | TSuggestionText> | undefined;
      nodeId: (node: TElement | TSuggestionText) => string | undefined;
      nodes: (
        options?: EditorNodesOptions
      ) => NodeEntry<TElement | TSuggestionText>[];
      removeSuggestion: (id: string | null) => void;
      suggestionData: (
        node: TElement | TSuggestionText
      ) => TInlineSuggestionData | TSuggestionElement['suggestion'] | undefined;
      updateSuggestion: (
        id: string | null,
        value: Partial<TSuggestion>
      ) => void;
      withoutSuggestions: (fn: () => void) => void;
    };
  },
  {},
  {
    currentUser: () => SuggestionUser | null;
    suggestion: (id: string | null) => TSuggestion | null;
    user: (id: string | null) => SuggestionUser | null;
  }
>;

export const BaseSuggestionPlugin = createTSlatePlugin<BaseSuggestionConfig>({
  key: 'suggestion',
  node: { isLeaf: true },
  options: {
    currentUserId: null,
    isSuggesting: false,
    suggestions: {},
    users: {},
  },
})
  .overrideEditor(withSuggestion)
  .extendSelectors<BaseSuggestionConfig['selectors']>(({ getOptions }) => ({
    currentUser: (): SuggestionUser | null => {
      const { currentUserId, users } = getOptions();

      if (!currentUserId) return null;

      return users[currentUserId];
    },
    suggestion: (id: string | null): TSuggestion | null => {
      if (!id) return null;

      return getOptions().suggestions[id];
    },
    user: (id: string | null): SuggestionUser | null => {
      if (!id) return null;

      return getOptions().users[id];
    },
  }))
  .extendApi<BaseSuggestionConfig['api']['suggestion']>(
    ({ api, editor, getOption, getOptions, setOption, setOptions, type }) => ({
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
      dataList: (node: TSuggestionText): TInlineSuggestionData[] => {
        return Object.keys(node)
          .filter((key) => {
            return key.startsWith(`${BaseSuggestionPlugin.key}_`);
          })
          .map((key) => node[key] as TInlineSuggestionData);
      },
      isBlockSuggestion: (node): node is TSuggestionElement =>
        ElementApi.isElement(node) && 'suggestion' in node,
      node: (options = {}) => {
        const { id, isText, ...rest } = options;
        const result = editor.api.node<TSuggestionElement | TSuggestionText>({
          match: (n) => {
            if (!n[type]) return false;
            if (isText && !TextApi.isText(n)) return false;
            if (id) {
              if (TextApi.isText(n)) {
                return !!n[getSuggestionKey(id)];
              }
              if (
                ElementApi.isElement(n) &&
                api.suggestion.isBlockSuggestion(n)
              ) {
                return n.suggestion.id === id;
              }
            }

            return true;
          },
          ...rest,
        });

        return result;
      },
      nodeId: (node) => {
        if (TextApi.isText(node)) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return keyId.replace(`${type}_`, '');
        }

        if (api.suggestion.isBlockSuggestion(node)) {
          return node.suggestion.id;
        }
      },
      nodes: (options = {}) => {
        const at = getAt(editor, options.at) ?? [];

        return [
          ...editor.api.nodes<TElement | TSuggestionText>({
            ...options,
            at,
            mode: 'all',
            match: (n) => n[type],
          }),
        ];
      },
      removeSuggestion: (id) => {
        if (!id) return;

        setOptions((draft) => {
          delete draft.suggestions![id];
        });
      },
      suggestionData: (node) => {
        if (TextApi.isText(node)) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return node[keyId] as TInlineSuggestionData | undefined;
        }

        if (api.suggestion.isBlockSuggestion(node)) {
          return node.suggestion;
        }
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

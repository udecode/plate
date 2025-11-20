import {
  type EditorNodesOptions,
  type NodeEntry,
  type PluginConfig,
  type TElement,
  type TInlineSuggestionData,
  type TNode,
  type TSuggestionElement,
  type TSuggestionText,
  createTSlatePlugin,
  ElementApi,
  getAt,
  KEYS,
  TextApi,
} from 'platejs';

import { getSuggestionKey, getSuggestionKeyId } from './utils';
import { getTransientSuggestionKey } from './utils/getTransientSuggestionKey';
import { withSuggestion } from './withSuggestion';

export type BaseSuggestionConfig = PluginConfig<
  'suggestion',
  {
    currentUserId: string | null;
    isSuggesting: boolean;
    // onAdd?: (value: WithPartial<TSuggestion, 'id' | 'userId'>) => void;
    // onRemove?: (id: string) => void;
    // onUpdate?: (id: string, value: Partial<TSuggestion>) => void;
  },
  {
    suggestion: {
      dataList: (node: TSuggestionText) => TInlineSuggestionData[];
      isBlockSuggestion: (node: TNode) => node is TSuggestionElement;
      node: (
        options?: EditorNodesOptions & { id?: string; isText?: boolean }
      ) => NodeEntry<TSuggestionElement | TSuggestionText> | undefined;
      nodeId: (node: TElement | TSuggestionText) => string | undefined;
      nodes: (
        options?: EditorNodesOptions & { transient?: boolean }
      ) => NodeEntry<TElement | TSuggestionText>[];
      suggestionData: (
        node: TElement | TSuggestionText
      ) => TInlineSuggestionData | TSuggestionElement['suggestion'] | undefined;
      withoutSuggestions: (fn: () => void) => void;
    };
  }
>;

export const BaseSuggestionPlugin = createTSlatePlugin<BaseSuggestionConfig>({
  key: KEYS.suggestion,
  node: { isLeaf: true },
  options: {
    currentUserId: 'alice',
    isSuggesting: false,
  },
  rules: { selection: { affinity: 'outward' } },
})
  .overrideEditor(withSuggestion)
  .extendApi<BaseSuggestionConfig['api']['suggestion']>(
    ({ api, editor, getOption, setOption, type }) => ({
      dataList: (node: TSuggestionText): TInlineSuggestionData[] =>
        Object.keys(node)
          .filter((key) => key.startsWith(`${KEYS.suggestion}_`))
          .map((key) => node[key] as TInlineSuggestionData),
      isBlockSuggestion: (node): node is TSuggestionElement =>
        ElementApi.isElement(node) &&
        !editor.api.isInline(node) &&
        'suggestion' in node,
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
        if (
          TextApi.isText(node) ||
          (ElementApi.isElement(node) && editor.api.isInline(node))
        ) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return keyId.replace(`${type}_`, '');
        }

        if (api.suggestion.isBlockSuggestion(node)) {
          return node.suggestion.id;
        }
      },
      nodes: (options = {}) => {
        const { transient } = options;

        const at = getAt(editor, options.at) ?? [];

        return [
          ...editor.api.nodes<TElement | TSuggestionText>({
            ...options,
            at,
            mode: 'all',
            match: (n) =>
              n[type] && (transient ? n[getTransientSuggestionKey()] : true),
          }),
        ];
      },
      suggestionData: (node) => {
        if (
          TextApi.isText(node) ||
          (ElementApi.isElement(node) && editor.api.isInline(node))
        ) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return node[keyId] as TInlineSuggestionData | undefined;
        }

        if (api.suggestion.isBlockSuggestion(node)) {
          return node.suggestion;
        }
      },
      withoutSuggestions: (fn) => {
        const prev = getOption('isSuggesting');
        setOption('isSuggesting', false);
        fn();
        setOption('isSuggesting', prev);
      },
    })
  );

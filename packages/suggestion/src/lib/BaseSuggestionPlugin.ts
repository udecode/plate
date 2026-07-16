import {
  type BaseEditor,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  type EditorNodesOptions,
  type Element,
  ElementApi,
  type Node,
  type NodeEntry,
  type Text,
  TextApi,
} from '@platejs/plite';
import {
  KEYS,
  type TInlineSuggestionData,
  type TSuggestionElement,
  type TSuggestionText,
} from '@platejs/utils';

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
      dataList: (node: Text) => TInlineSuggestionData[];
      /** Whether suggestion middleware should track the current operation. */
      isTracking: () => boolean;
      isBlockSuggestion: (node: Node) => node is TSuggestionElement;
      node: (
        options?: EditorNodesOptions<Node> & { id?: string; isText?: boolean }
      ) => NodeEntry<TSuggestionElement | TSuggestionText> | undefined;
      nodeId: (node: Node) => string | undefined;
      nodes: (
        options?: EditorNodesOptions<Node> & { transient?: boolean }
      ) => NodeEntry<Element | TSuggestionText>[];
      suggestionData: (
        node: Node
      ) => TInlineSuggestionData | TSuggestionElement['suggestion'] | undefined;
      /** Run synchronous operations without recursively creating suggestions. */
      untracked: <T>(fn: () => T) => T;
    };
  }
>;

const suggestionUntrackedDepth = new WeakMap<BaseEditor, number>();

const isSuggestionTracking = (editor: BaseEditor) =>
  (suggestionUntrackedDepth.get(editor) ?? 0) === 0;

const runSuggestionUntracked = <T>(editor: BaseEditor, fn: () => T): T => {
  const depth = suggestionUntrackedDepth.get(editor) ?? 0;
  suggestionUntrackedDepth.set(editor, depth + 1);

  try {
    return fn();
  } finally {
    if (depth === 0) {
      suggestionUntrackedDepth.delete(editor);
    } else {
      suggestionUntrackedDepth.set(editor, depth);
    }
  }
};

const hasSuggestionFlag = (node: Node, type: string) =>
  !!(node as Record<string, unknown>)[type];

const isInlineSuggestionNode = (
  editor: BaseEditor,
  node: Node
): node is Element | Text =>
  TextApi.isText(node) ||
  (ElementApi.isElement(node) && editor.read.schema.isInline(node));

export const BaseSuggestionPlugin = createBasePlugin<BaseSuggestionConfig>({
  key: KEYS.suggestion,
  node: { isLeaf: true },
  options: {
    currentUserId: 'alice',
    isSuggesting: false,
  },
  rules: { selection: { affinity: 'outward' } },
})
  .extendExtension(withSuggestion)
  .extendApi<Partial<BaseSuggestionConfig['api']['suggestion']>>(
    ({ api, editor, type }) => ({
      dataList: (node: Text): TInlineSuggestionData[] =>
        Object.keys(node)
          .filter((key) => key.startsWith(`${KEYS.suggestion}_`))
          .map((key) => node[key] as TInlineSuggestionData),
      isTracking: () => isSuggestionTracking(editor),
      isBlockSuggestion: (node): node is TSuggestionElement =>
        ElementApi.isElement(node) &&
        !editor.read.schema.isInline(node) &&
        'suggestion' in node,
      node: (options = {}) => {
        const { id, isText, ...rest } = options;
        const result = editor.read.nodes.find<
          TSuggestionElement | TSuggestionText
        >({
          match: (n) => {
            if (!hasSuggestionFlag(n, type)) return false;
            if (isText && !TextApi.isText(n)) return false;
            if (id) {
              if (TextApi.isText(n)) {
                return !!n[getSuggestionKey(id)];
              }
              if (ElementApi.isElement(n) && api.isBlockSuggestion(n)) {
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
        if (isInlineSuggestionNode(editor, node)) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return keyId.replace(`${type}_`, '');
        }

        if (api.isBlockSuggestion(node)) {
          return node.suggestion.id;
        }
      },
      nodes: (options = {}) => {
        const { transient } = options;

        return editor.read.nodes.toArray<Element | TSuggestionText>({
          ...options,
          at: options.at ?? [],
          mode: 'all',
          match: (n) =>
            hasSuggestionFlag(n, type) &&
            (transient
              ? !!(n as Record<string, unknown>)[getTransientSuggestionKey()]
              : true),
        });
      },
      suggestionData: (node) => {
        if (isInlineSuggestionNode(editor, node)) {
          const keyId = getSuggestionKeyId(node);

          if (!keyId) return;

          return node[keyId] as TInlineSuggestionData | undefined;
        }

        if (api.isBlockSuggestion(node)) {
          return node.suggestion;
        }
      },
      untracked: (fn) => runSuggestionUntracked(editor, fn),
    })
  );

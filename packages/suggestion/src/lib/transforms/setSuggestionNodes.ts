import {
  type EditorUpdateTransaction,
  type Node as PliteNode,
  ElementApi,
  NodeApi,
  TextApi,
} from '@platejs/plite';
import {
  type BasePlateEditor,
  type TInlineSuggestionData,
  type TSuggestionText,
  KEYS,
  nanoid,
} from 'platejs';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';

type SuggestionNodesOptions = NonNullable<
  Parameters<BasePlateEditor['api']['nodes']>[0]
>;
type SuggestionSetNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['set']>[1]
>;

type SetSuggestionNodesOptions = SuggestionNodesOptions &
  SuggestionSetNodesOptions & {
    at?: SuggestionSetNodesOptions['at'] | PliteNode | null;
    createdAt?: number;
    includeInlineElements?: boolean;
    suggestionDeletion?: boolean;
    suggestionId?: string;
    tx?: EditorUpdateTransaction;
  };

const resolveSuggestionAt = <TAt>(
  editor: BasePlateEditor,
  at: PliteNode | TAt | null | undefined
): TAt | undefined => {
  if (NodeApi.isNode(at)) {
    const entry = [
      ...editor.api.nodes({
        at: [],
        match: (node) => node === at,
      }),
    ][0];

    return entry?.[1] as TAt | undefined;
  }

  return (at ?? undefined) as TAt | undefined;
};

export const setSuggestionNodes = (
  editor: BasePlateEditor,
  options?: SetSuggestionNodesOptions
) => {
  const {
    createdAt,
    includeInlineElements = true,
    suggestionDeletion: _suggestionDeletion,
    suggestionId = nanoid(),
    tx: activeTx,
    ...nodeOptions
  } = options ?? {};
  const at =
    resolveSuggestionAt<SuggestionSetNodesOptions['at']>(
      editor,
      nodeOptions.at
    ) ?? editor.selection;

  if (!at) return;

  // TODO: get all inline nodes to be set
  const _nodeEntries = includeInlineElements
    ? editor.api.nodes({
        match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
        ...nodeOptions,
      })
    : [];
  const nodeEntries = [..._nodeEntries];

  const applySetSuggestionNodes = (tx: EditorUpdateTransaction) => {
    const data: TInlineSuggestionData = {
      id: suggestionId,
      createdAt: createdAt ?? Date.now(),
      type: 'remove',
      userId: editor.getOptions(BaseSuggestionPlugin).currentUserId!,
    };

    const props = {
      [getSuggestionKey(suggestionId)]: data,
      [KEYS.suggestion]: true,
    };

    tx.nodes.set(props, {
      at,
      match: (node) => TextApi.isText(node),
      split: true,
    } as SuggestionSetNodesOptions);

    nodeEntries.forEach(([, path]) => {
      tx.nodes.set<TSuggestionText>(props, {
        at: path,
        match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
        ...nodeOptions,
      } as SuggestionSetNodesOptions);
    });
  };

  if (activeTx) {
    applySetSuggestionNodes(activeTx);
  } else {
    editor.update(applySetSuggestionNodes);
  }
};

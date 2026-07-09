import { type BaseEditor, nanoid } from '@platejs/core';
import {
  ElementApi,
  type EditorUpdateTransaction,
  type Location,
  type Node,
  type NodeSetNodesOptions,
  RangeApi,
  TextApi,
} from '@platejs/plite';
import {
  type TInlineSuggestionData,
  type TSuggestionText,
  KEYS,
} from '@platejs/utils';

import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { getSuggestionKey } from '../utils';

export const setSuggestionNodes = (
  editor: BaseEditor,
  options?: {
    createdAt?: number;
    includeInlineElements?: boolean;
    suggestionDeletion?: boolean;
    suggestionId?: string;
  } & NodeSetNodesOptions<Node>
) => {
  let resId: string | undefined;

  editor.update((tx) => {
    resId = setSuggestionNodesWithTx(editor, tx, options);
  });

  return resId;
};

export const setSuggestionNodesWithTx = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  options?: {
    createdAt?: number;
    includeInlineElements?: boolean;
    suggestionDeletion?: boolean;
    suggestionId?: string;
  } & NodeSetNodesOptions<Node>
) => {
  const {
    createdAt = Date.now(),
    includeInlineElements = true,
    suggestionId = nanoid(),
    ...nodeOptions
  } = options ?? {};
  const at = (nodeOptions.at ?? editor.read.selection()) as Location | null;

  if (!at) return;

  const queryAt = RangeApi.isRange(at)
    ? { anchor: RangeApi.start(at), focus: RangeApi.end(at) }
    : at;
  const nodeEntries = includeInlineElements
    ? editor.read.nodes.toArray({
        ...nodeOptions,
        at: queryAt,
        match: (node) =>
          ElementApi.isElement(node) && editor.read.schema.isInline(node),
      })
    : [];

  const data: TInlineSuggestionData = {
    id: suggestionId,
    createdAt,
    type: 'remove',
    userId: editor.plugin(BaseSuggestionPlugin).getOptions().currentUserId!,
  };

  const props = {
    [getSuggestionKey(suggestionId)]: data,
    [KEYS.suggestion]: true,
  };
  const matchTextOutsideInline: NodeSetNodesOptions<Node>['match'] = (
    node,
    path
  ) => {
    if (nodeOptions.match && !nodeOptions.match(node, path)) {
      return false;
    }
    if (!includeInlineElements || !TextApi.isText(node)) {
      return true;
    }

    const parent = editor.read.nodes.parent(path);

    return !parent || !editor.read.schema.isInline(parent[0]);
  };

  nodeEntries.forEach(([, path]) => {
    tx.nodes.set<TSuggestionText>(props, {
      ...nodeOptions,
      at: path,
      match: (node) =>
        ElementApi.isElement(node) && editor.read.schema.isInline(node),
    });
  });

  tx.nodes.set(props, {
    ...nodeOptions,
    at: queryAt,
    marks: true,
    match: matchTextOutsideInline,
  });

  return suggestionId;
};

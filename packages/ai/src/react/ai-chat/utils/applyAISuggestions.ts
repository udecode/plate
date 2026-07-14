import { deserializeMd } from '@platejs/markdown';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import {
  diffToSuggestions,
  getTransientSuggestionKey,
  SkipSuggestionDeletes,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type Descendant, ElementApi, TextApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { nanoid } from '@platejs/core';
import type { PlateEditor } from '@platejs/core/react';

import { withAIBatch } from '../../../lib/transforms/withAIBatch';
import { AIChatPlugin } from '../AIChatPlugin';
import {
  getTableCellChildren as withoutTable,
  isSingleCellTable,
} from './nestedContainerUtils';

export const applyAISuggestions = (
  editor: PlateEditor,
  content: string,
  { split }: { split?: boolean } = {}
) => {
  /** Conflict with block selection */
  editor.plugin(CursorOverlayPlugin).api.removeCursor('selection');

  const { chatNodes } = editor.plugin(AIChatPlugin).getOptions();
  const aiChat = editor.plugin(AIChatPlugin);

  // Use chatNodes.length to determine if we're in multi-block edit mode
  // instead of checking current selection state (which may have changed)
  if (chatNodes.length > 1) {
    const setReplaceIds = (ids: string[]) =>
      aiChat.setOption('_replaceIds', ids);

    if (aiChat.getOption('_replaceIds').length === 0) {
      setReplaceIds(chatNodes.map((node) => node.id as string));
    }

    const diffNodes = getDiffNodes(editor, content);
    const replaceIds = aiChat.getOption('_replaceIds');

    const replaceNodes = editor.read.nodes.toArray<
      Extract<Descendant, { children: unknown }>
    >({
      at: [],
      match: (node) =>
        ElementApi.isElement(node) &&
        typeof node.id === 'string' &&
        replaceIds.includes(node.id),
    });
    const suggestionApi = editor.plugin(SuggestionPlugin).api;

    withAIBatch(
      editor,
      (tx) => {
        replaceNodes.toReversed().forEach(([node, path], reverseIndex) => {
          const index = replaceNodes.length - reverseIndex - 1;
          const diffNode = diffNodes[index];

          if (!diffNode) {
            tx.nodes.remove({ at: path });

            return;
          }

          const replacement =
            index === replaceNodes.length - 1 &&
            diffNodes.length > replaceNodes.length
              ? diffNodes.slice(index)
              : [diffNode];
          const isSameString =
            SkipSuggestionDeletes(editor, node) ===
            SkipSuggestionDeletes(editor, diffNode);
          const isSameSuggestion =
            ElementApi.isElement(diffNode) &&
            suggestionApi.suggestionData(node)?.type ===
              suggestionApi.suggestionData(diffNode)?.type;

          if (
            replacement.length === 1 &&
            isSameString &&
            isSameSuggestion &&
            node.id === diffNode.id
          ) {
            return;
          }

          tx.nodes.replace(replacement, { at: path });
        });
      },
      { split }
    );

    const diffIds = diffNodes.flatMap((node) => {
      if (!ElementApi.isElement(node) || typeof node.id !== 'string') return [];

      return node.id;
    });

    editor.plugin(BlockSelectionPlugin).api.set(diffIds);
    setReplaceIds(diffIds);
  } else {
    const diffNodes = getDiffNodes(editor, content);

    withAIBatch(
      editor,
      (tx) => {
        tx.fragment.insert(diffNodes);

        const nodes = tx.nodes.toArray({
          at: [],
          mode: 'lowest',
          match: (node) =>
            TextApi.isText(node) && !!node[getTransientSuggestionKey()],
        });
        const range = tx.ranges.fromEntries(nodes);

        if (range) tx.selection.set(range);
      },
      { split }
    );

    return;
  }
};

const withProps = (
  diffNodes: Descendant[],
  chatNodes: Descendant[]
): Descendant[] =>
  diffNodes.map((node, index) => {
    if (!ElementApi.isElement(node)) return node;

    const originalNode = chatNodes[index];

    return {
      ...node,
      ...(originalNode ?? { id: nanoid() }),
      children: node.children,
    };
  });

export const withTransient = (diffNodes: Descendant[]): Descendant[] =>
  diffNodes.map((node) => {
    if (TextApi.isText(node)) {
      return {
        ...node,
        [getTransientSuggestionKey()]: true,
      };
    }
    return {
      ...node,
      children: withTransient(node.children),
      [getTransientSuggestionKey()]: true,
    };
  });

export const withoutSuggestionAndComments = (
  nodes: Descendant[]
): Descendant[] =>
  nodes.map((node) => {
    if (TextApi.isText(node)) {
      if (node[KEYS.suggestion] || node[KEYS.comment]) {
        return {
          text: node.text,
        };
      }

      return node;
    }
    if (ElementApi.isElement(node)) {
      if (node[KEYS.suggestion]) {
        const nodeWithoutSuggestion = {
          ...node,
          children: withoutSuggestionAndComments(node.children),
        };

        Object.keys(nodeWithoutSuggestion).forEach((key) => {
          if (key === KEYS.suggestion || key.startsWith(KEYS.suggestion)) {
            Reflect.deleteProperty(nodeWithoutSuggestion, key);
          }
        });

        return nodeWithoutSuggestion;
      }

      return {
        ...node,
        children: withoutSuggestionAndComments(node.children),
      };
    }

    return node;
  });

const getDiffNodes = (editor: PlateEditor, aiContent: string) => {
  /** Original document nodes */
  const rawChatNodes = editor.plugin(AIChatPlugin).getOption('chatNodes');

  let chatNodes = withoutSuggestionAndComments(rawChatNodes);

  /**If selecting one single cell table, we just need to compare it's children to get diff nodes */
  if (isSingleCellTable(chatNodes)) {
    chatNodes = withoutTable(chatNodes[0]);
  }

  const aiNodes = withProps(deserializeMd(editor, aiContent), chatNodes);

  const diffNodes = withTransient(
    diffToSuggestions(editor, chatNodes, aiNodes, {
      ignoreProps: ['id', 'listStart'],
    })
  );

  return diffNodes;
};

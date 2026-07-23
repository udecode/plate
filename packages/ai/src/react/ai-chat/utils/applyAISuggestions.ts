import type { MarkdownEditor } from '@platejs/markdown';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import {
  diffToSuggestions,
  SUGGESTION_TRANSIENT_KEY,
} from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { type Descendant, ElementApi, PathApi, TextApi } from '@platejs/plite';
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
  editor: MarkdownEditor<PlateEditor>,
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
    const replacementGroups: {
      at: number[];
      children: Descendant[];
      count: number;
      index: number;
    }[] = [];

    replaceNodes.forEach(([node, path], index) => {
      const diffNode = diffNodes[index];
      let replacement: Descendant[];

      if (!diffNode) {
        replacement = [];
      } else {
        const candidate =
          index === replaceNodes.length - 1 &&
          diffNodes.length > replaceNodes.length
            ? diffNodes.slice(index)
            : [diffNode];
        const isSameString =
          suggestionApi.skipDeletes(node) ===
          suggestionApi.skipDeletes(diffNode);
        const isSameSuggestion =
          ElementApi.isElement(diffNode) &&
          suggestionApi.suggestionData(node)?.type ===
            suggestionApi.suggestionData(diffNode)?.type;

        replacement =
          candidate.length === 1 &&
          isSameString &&
          isSameSuggestion &&
          node.id === diffNode.id
            ? [node]
            : candidate;
      }

      const at = path.slice(0, -1);
      const childIndex = path.at(-1)!;
      const previous = replacementGroups.at(-1);

      if (
        previous &&
        PathApi.equals(previous.at, at) &&
        childIndex === previous.index + previous.count
      ) {
        previous.children.push(...replacement);
        previous.count++;
      } else {
        replacementGroups.push({
          at,
          children: replacement,
          count: 1,
          index: childIndex,
        });
      }
    });

    withAIBatch(
      editor,
      (tx) => {
        replacementGroups.toReversed().forEach((group) => {
          tx.nodes.replaceChildren(group.children, {
            at: group.at,
            count: group.count,
            index: group.index,
          });
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
        tx.fragment.replace(diffNodes);

        const nodes = tx.nodes.toArray({
          at: [],
          mode: 'lowest',
          match: (node) =>
            TextApi.isText(node) && !!node[SUGGESTION_TRANSIENT_KEY],
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
        [SUGGESTION_TRANSIENT_KEY]: true,
      };
    }
    return {
      ...node,
      children: withTransient(node.children),
      [SUGGESTION_TRANSIENT_KEY]: true,
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

const getDiffNodes = (
  editor: MarkdownEditor<PlateEditor>,
  aiContent: string
) => {
  /** Original document nodes */
  const rawChatNodes = editor.plugin(AIChatPlugin).getOption('chatNodes');

  let chatNodes = withoutSuggestionAndComments(
    cloneDeep(rawChatNodes) as unknown as Descendant[]
  );

  /**If selecting one single cell table, we just need to compare it's children to get diff nodes */
  if (isSingleCellTable(chatNodes)) {
    chatNodes = withoutTable(chatNodes[0]);
  }

  const aiNodes = withProps(
    editor.api.markdown.deserialize(aiContent),
    chatNodes
  );

  const diffNodes = withTransient(
    diffToSuggestions(editor, chatNodes, aiNodes, {
      ignoreProps: ['id', 'listStart'],
    })
  );

  return diffNodes;
};

import { deserializeMd } from '@platejs/markdown';
import {
  diffToSuggestions,
  getTransientSuggestionKey,
  SkipSuggestionDeletes,
} from '@platejs/suggestion';
import type { Descendant, Element } from '@platejs/plite';
import {
  type NodeEntry,
  type TIdElement,
  type TSuggestionData,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  nanoid,
  TextApi,
} from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';
import type { AIChatPliteEditor } from '../internal/editorTypes';
import {
  getTableCellChildren as withoutTable,
  isSingleCellTable,
} from './nestedContainerUtils';

type NodesRangeInput = Parameters<AIChatPliteEditor['api']['nodesRange']>[0];

export const applyAISuggestions = (
  editor: AIChatPliteEditor,
  content: string
) => {
  /** Conflict with block selection */
  editor.api.cursorOverlay?.removeCursor('selection');

  const { chatNodes } = editor.getOptions(AIChatPlugin);

  // Use chatNodes.length to determine if we're in multi-block edit mode
  // instead of checking current selection state (which may have changed)
  if (chatNodes.length > 1) {
    const setReplaceIds = (ids: string[]) => {
      editor.setOption(AIChatPlugin, '_replaceIds', ids);
    };

    if (editor.getOption(AIChatPlugin, '_replaceIds').length === 0) {
      setReplaceIds(chatNodes.map((node) => node.id as string));
    }

    const diffNodes = getDiffNodes(editor, content);

    const replaceNodes = Array.from(
      editor.api.nodes<TIdElement>({
        at: [],
        match: (n: TIdElement) =>
          ElementApi.isElement(n) &&
          editor.getOption(AIChatPlugin, '_replaceIds').includes(n.id),
      })
    ) as NodeEntry<TIdElement>[];

    replaceNodes.forEach(([node, path], index) => {
      const replaceNode = node as unknown as TSuggestionElement;
      const diffNode = diffNodes[index] as unknown as TSuggestionElement;

      const isSameString =
        SkipSuggestionDeletes(editor, replaceNode) ===
        SkipSuggestionDeletes(editor, diffNode);

      const isSameSuggestion =
        (replaceNode.suggestion as TSuggestionData | undefined)?.type ===
        (diffNode.suggestion as TSuggestionData | undefined)?.type;

      if (
        index === replaceNodes.length - 1 &&
        diffNodes.length > replaceNodes.length
      ) {
        editor.update((tx) => {
          tx.nodes.remove({ at: path });
          tx.nodes.insert(diffNodes.slice(index), { at: path });
        });
        return;
      }
      // Performance optimization
      if (isSameString && isSameSuggestion && node.id === diffNode.id) {
        return;
      }

      editor.update((tx) => {
        tx.nodes.remove({ at: path });
        tx.nodes.insert(diffNode, { at: path });
      });
    });

    editor.api.blockSelection.set(diffNodes.map((node) => node.id as string));
    setReplaceIds(diffNodes.map((node) => node.id as string));
  } else {
    const diffNodes = getDiffNodes(editor, content);

    editor.update((tx) => {
      tx.fragment.insert(diffNodes);
    });

    const nodes = Array.from(
      editor.api.nodes({
        at: [],
        mode: 'lowest',
        match: (n: unknown) =>
          TextApi.isText(n) && !!n[getTransientSuggestionKey()],
      })
    ) as NodeEntry[];

    const range = editor.api.nodesRange(nodes as NodesRangeInput);

    if (range) {
      editor.update((tx) => {
        tx.selection.set(range);
      });
    }

    return;
  }
};

const withProps = (
  diffNodes: Descendant[],
  chatNodes: Descendant[]
): Descendant[] =>
  diffNodes.map((node, index) => {
    if (!ElementApi.isElement(node)) return node;

    const originalNode = chatNodes?.[index] as Element | undefined;

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
        const nodeWithoutSuggestion: Record<string, unknown> = {};

        Object.keys(node).forEach((key) => {
          if (key !== KEYS.suggestion && !key.startsWith(KEYS.suggestion)) {
            nodeWithoutSuggestion[key] = (node as Record<string, unknown>)[key];
          }
        });

        return {
          ...nodeWithoutSuggestion,
          children: withoutSuggestionAndComments(node.children),
        } as Descendant;
      }

      return {
        ...node,
        children: withoutSuggestionAndComments(node.children),
      };
    }

    return node;
  });

const getDiffNodes = (editor: AIChatPliteEditor, aiContent: string) => {
  /** Original document nodes */
  const rawChatNodes = editor.getOption(AIChatPlugin, 'chatNodes');

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

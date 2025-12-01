import { deserializeMd } from '@platejs/markdown';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  diffToSuggestions,
  getTransientSuggestionKey,
  SkipSuggestionDeletes,
} from '@platejs/suggestion';
import {
  type Descendant,
  type SlateEditor,
  type TElement,
  type TIdElement,
  type TSuggestionData,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  nanoid,
  TextApi,
} from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';

export const applyAISuggestions = (editor: SlateEditor, content: string) => {
  /** Conflict with block selection */
  editor
    .getApi({ key: KEYS.cursorOverlay })
    ?.cursorOverlay?.removeCursor('selection');

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
    );

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
        editor.tf.replaceNodes(diffNodes.slice(index), {
          at: path,
        });
      }
      // Performance optimization
      if (isSameString && isSameSuggestion && node.id === diffNode.id) {
        return;
      }

      editor.tf.replaceNodes(diffNode, {
        at: path,
      });
    });

    editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.set(diffNodes.map((node) => node.id as string));
    setReplaceIds(diffNodes.map((node) => node.id as string));
  } else {
    const diffNodes = getDiffNodes(editor, content);

    editor.tf.insertFragment(diffNodes);

    const nodes = Array.from(
      editor.api.nodes({
        at: [],
        mode: 'lowest',
        match: (n) => TextApi.isText(n) && !!n[getTransientSuggestionKey()],
      })
    );

    const range = editor.api.nodesRange(nodes);

    editor.tf.setSelection(range!);

    return;
  }
};

const withProps = (
  diffNodes: Descendant[],
  chatNodes: Descendant[]
): Descendant[] =>
  diffNodes.map((node, index) => {
    if (!ElementApi.isElement(node)) return node;

    const originalNode = chatNodes?.[index] as TElement | undefined;

    return {
      ...node,
      ...(originalNode ?? { id: nanoid() }),
      children: node.children,
    };
  });

const withTransient = (diffNodes: Descendant[]): Descendant[] =>
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

const withoutSuggestionAndComments = (nodes: Descendant[]): Descendant[] =>
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
        const nodeWithoutSuggestion: any = {};

        Object.keys(node).forEach((key) => {
          if (key !== KEYS.suggestion && !key.startsWith(KEYS.suggestion)) {
            nodeWithoutSuggestion[key] = node[key];
          }
        });

        return {
          ...nodeWithoutSuggestion,
          children: withoutSuggestionAndComments(node.children),
        };
      }

      return {
        ...node,
        children: withoutSuggestionAndComments(node.children),
      };
    }

    return node;
  });
const getDiffNodes = (editor: SlateEditor, aiContent: string) => {
  /** Original document nodes */
  const chatNodes = withoutSuggestionAndComments(
    editor.getOption(AIChatPlugin, 'chatNodes')
  );

  const aiNodes = withProps(deserializeMd(editor, aiContent), chatNodes);

  const diffNodes = withTransient(
    diffToSuggestions(editor, chatNodes, aiNodes, {
      ignoreProps: ['id', 'listStart'],
    })
  );

  return diffNodes;
};

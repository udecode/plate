import { deserializeMd } from '@platejs/markdown';
import {
  diffToSuggestions,
  getSuggestionProps,
  SkipSuggestionDeletes,
} from '@platejs/suggestion';
import { pickBy } from 'lodash';
import {
  type TElement,
  type TIdElement,
  type TSuggestionData,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  nanoid,
  SlateEditor,
} from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';
import { getTransientSuggestionKey } from '@platejs/suggestion';

export const applyAISuggestions = (editor: SlateEditor, content: string) => {
  const { chatBlocks, _replaceIds } = editor.getOptions(AIChatPlugin);

  const setReplaceIds = (ids: string[]) => {
    editor.setOption(AIChatPlugin, '_replaceIds', ids);
  };

  const nodes = deserializeMd(editor, content);

  const documentNodes = chatBlocks.map((node) => node[0]);

  if (_replaceIds.length === 0) {
    setReplaceIds(documentNodes.map((node) => node.id as string));
  }

  const aiNodesWithId = nodes.map((node, index) => {
    const originNode = documentNodes[index] as TElement | undefined;

    let props = {};

    if (
      node.type === editor.getType(KEYS.p) &&
      node[KEYS.listType] &&
      originNode &&
      originNode[KEYS.listType]
    ) {
      props = {
        [KEYS.listRestart]: originNode[KEYS.listRestart],
        [KEYS.listRestartPolite]: originNode[KEYS.listRestartPolite],
        [KEYS.listStart]: originNode[KEYS.listStart],
      };

      props = pickBy(props, (value) => value !== undefined);
    }

    return {
      ...node,
      ...props,
      id: originNode?.id ?? nanoid(),
    };
  });

  const diffNodes = diffToSuggestions(editor, documentNodes, aiNodesWithId, {
    getDeleteProps: (node) => {
      return getSuggestionProps(editor, node, {
        suggestionDeletion: true,
        transient: true,
      });
    },
    getInsertProps: (node) =>
      getSuggestionProps(editor, node, { transient: true }),
    getUpdateProps: (node, _properties, newProperties) =>
      getSuggestionProps(editor, node, {
        suggestionUpdate: newProperties,
        transient: true,
      }),
  });

  const diffNodesWithId = diffNodes.map((node) => {
    return {
      ...node,
      id: node.id ?? nanoid(),
      [getTransientSuggestionKey()]: true,
    };
  });

  const replaceNodes = Array.from(
    editor.api.nodes<TIdElement>({
      at: [],
      match: (n: TIdElement) =>
        ElementApi.isElement(n) && _replaceIds.includes(n.id),
    })
  );

  replaceNodes.forEach(([node, path], index) => {
    const replaceNode = node as unknown as TSuggestionElement;
    const diffNode = diffNodesWithId[index] as unknown as TSuggestionElement;

    const isSameString =
      SkipSuggestionDeletes(editor, replaceNode) ===
      SkipSuggestionDeletes(editor, diffNode);

    const isSameSuggestion =
      (replaceNode.suggestion as TSuggestionData | undefined)?.type ===
      (diffNode.suggestion as TSuggestionData | undefined)?.type;

    if (isSameString && isSameSuggestion && node.id == diffNode.id) {
      return;
    }

    if (
      index === replaceNodes.length - 1 &&
      diffNodesWithId.length > replaceNodes.length
    ) {
      editor.tf.replaceNodes(diffNodesWithId.slice(index), {
        at: path,
      });
    } else {
      editor.tf.replaceNodes(diffNode, {
        at: path,
      });
    }
  });

  setReplaceIds(diffNodesWithId.map((node) => node.id as string));
};

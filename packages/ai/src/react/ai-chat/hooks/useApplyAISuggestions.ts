import { useRef } from 'react';

import { deserializeMd } from '@platejs/markdown';
import { diffToSuggestions, SkipSuggestionDeletes } from '@platejs/suggestion';
import { pickBy } from 'lodash';
import {
  type TElement,
  type TIdElement,
  type TSuggestionData,
  type TSuggestionElement,
  ElementApi,
  KEYS,
  nanoid,
} from 'platejs';
import { useEditorRef } from 'platejs/react';

import { AIChatPlugin } from '../AIChatPlugin';

export const useApplyAISuggestions = () => {
  const editor = useEditorRef();

  const idsRef = useRef<string[]>([]);

  return {
    applyAISuggestions: (content: string) => {
      const nodes = deserializeMd(editor, content);

      const documentNodes = editor
        .getOption(AIChatPlugin, 'chatBlocks')!
        .map((node) => node[0]);

      if (idsRef.current.length === 0) {
        idsRef.current = documentNodes.map((node) => node.id as string);
      }

      const aiNodesWithId = nodes.map((node, index) => {
        const originNode = documentNodes[index] as TElement | undefined;

        let props = {};

        if (
          node.type === 'p' &&
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

      const diffNodes = diffToSuggestions(editor, documentNodes, aiNodesWithId);

      const diffNodesWithId = diffNodes.map((node) => {
        return {
          ...node,
          id: node.id ?? nanoid(),
          transition: true,
        };
      });

      const replaceNodes = Array.from(
        editor.api.nodes<TIdElement>({
          at: [],
          match: (n: TIdElement) =>
            ElementApi.isElement(n) && idsRef.current.includes(n.id),
        })
      );

      replaceNodes.forEach(([node, path], index) => {
        const replaceNode = node as unknown as TSuggestionElement;
        const diffNode = diffNodesWithId[
          index
        ] as unknown as TSuggestionElement;

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

      idsRef.current = diffNodesWithId.map((node) => node.id as string);
    },
    reset: () => {
      editor.getApi(AIChatPlugin).aiChat.hide();
      idsRef.current = [];
      editor.setOption(AIChatPlugin, 'chatBlocks', []);
    },
  };
};

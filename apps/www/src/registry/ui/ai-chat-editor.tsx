'use client';

import * as React from 'react';

import { AIChatPlugin, useAIChatEditor } from '@platejs/ai/react';
import { usePlateEditor, usePluginOption } from 'platejs/react';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

import { EditorStatic } from './editor-static';

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const toolName = usePluginOption(AIChatPlugin, 'toolName');

  const aiEditor = usePlateEditor({
    plugins: BaseEditorKit,
  });

  useAIChatEditor(aiEditor, content);

  if (toolName === 'generate') {
    return <EditorStatic variant="aiChat" editor={aiEditor} />;
  }

  // if (toolName === 'edit') {
  //   editor.getApi(AIChatPlugin).aiChat.hide();

  //   const nodes = deserializeMd(editor, content);

  //   const documentNodes = selectedBlocks.map((node) => node[0]);

  //   const aiNodesWithId = nodes.map((node, index) => {
  //     const originNode = documentNodes[index] as TElement | undefined;

  //     let props = {};

  //     if (
  //       node.type === 'p' &&
  //       node[KEYS.listType] &&
  //       originNode &&
  //       originNode[KEYS.listType]
  //     ) {
  //       props = {
  //         [KEYS.listRestart]: originNode[KEYS.listRestart],
  //         [KEYS.listRestartPolite]: originNode[KEYS.listRestartPolite],
  //         [KEYS.listStart]: originNode[KEYS.listStart],
  //       };

  //       // 过滤掉props中value为undefined的key
  //       props = pickBy(props, (value) => value !== undefined);
  //     }

  //     return {
  //       ...node,
  //       ...props,
  //       id: originNode?.id ?? nanoid(),
  //     };
  //   });

  //   const diffNodes = diffToSuggestions(editor, documentNodes, aiNodesWithId);

  //   const diffNodesWithId = diffNodes.map((node) => {
  //     return {
  //       ...node,
  //       id: node.id ?? nanoid(),
  //     };
  //   });

  //   const replaceNodes = Array.from(
  //     editor.api.nodes<TIdElement>({
  //       at: [],
  //       match: (n: TIdElement) =>
  //         ElementApi.isElement(n) && idsRef.current.includes(n.id),
  //     })
  //   );

  //   replaceNodes.forEach(([node, path], index) => {
  //     const replaceNode = node as unknown as TSuggestionElement;
  //     const diffNode = diffNodesWithId[index] as unknown as TSuggestionElement;

  //     const isSameString =
  //       NodeApi.string(replaceNode) === NodeApi.string(diffNode);

  //     const isSameSuggestion =
  //       (replaceNode.suggestion as TSuggestionData | undefined)?.type ===
  //       (diffNode.suggestion as TSuggestionData | undefined)?.type;

  //     if (isSameString && isSameSuggestion && node.id == diffNode.id) {
  //       return;
  //     }

  //     if (
  //       index === replaceNodes.length - 1 &&
  //       diffNodesWithId.length > replaceNodes.length
  //     ) {
  //       editor.tf.replaceNodes(diffNodesWithId.slice(index), {
  //         at: path,
  //       });
  //     } else {
  //       editor.tf.replaceNodes(diffNode, {
  //         at: path,
  //       });
  //     }
  //   });

  //   idsRef.current = diffNodesWithId.map((node) => node.id as string);
  // }

  return null;
});

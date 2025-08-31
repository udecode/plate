import { type SlateEditor, ElementApi, getPluginType, KEYS } from 'platejs';

import {
  type DeserializeMdOptions,
  markdownToSlateNodes,
} from '../deserializeMd';
import { deserializeInlineMd } from './deserializeInlineMd';
import { splitIncompleteMdx } from './splitIncompleteMdx';

export const markdownToSlateNodesSafely = (
  editor: SlateEditor,
  data: string,
  options?: Omit<DeserializeMdOptions, 'editor'>
) => {
  const result = splitIncompleteMdx(data);

  if (!Array.isArray(result))
    return markdownToSlateNodes(editor, data, {
      ...options,
      withoutMdx: true,
    });

  const [completeString, incompleteString] = result;

  const incompleteNodes = deserializeInlineMd(editor, incompleteString, {
    ...options,
    withoutMdx: true,
  });

  const completeNodes = markdownToSlateNodes(editor, completeString, options);

  if (incompleteNodes.length === 0) {
    return completeNodes;
  }

  const newBlock = {
    children: incompleteNodes,
    type: getPluginType(editor, KEYS.p),
  };

  // Push inlineNodes to the children of the last block in blockNodes
  if (completeNodes.length === 0) {
    return [newBlock];
  }

  const lastBlock = completeNodes.at(-1);

  if (ElementApi.isElement(lastBlock) && editor.api.isVoid(lastBlock)) {
    return [newBlock];
  }

  // FIXME table column will fail, need recursive find the last p
  if (ElementApi.isElement(lastBlock) && lastBlock?.children) {
    lastBlock.children.push(...incompleteNodes);
    return completeNodes;
  }

  return completeNodes;
};

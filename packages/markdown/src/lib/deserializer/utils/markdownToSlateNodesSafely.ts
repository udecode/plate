import {
  type Descendant,
  type SlateEditor,
  ElementApi,
  getPluginType,
  KEYS,
  TextApi,
} from 'platejs';

import {
  type DeserializeMdOptions,
  markdownToSlateNodes,
} from '../deserializeMd';
import { deserializeInlineMd } from './deserializeInlineMd';
import { splitIncompleteMdx } from './splitIncompleteMdx';

const appendInlineNodesToLastTextContainer = (
  editor: SlateEditor,
  node: unknown,
  inlineNodes: Descendant[]
): boolean => {
  if (!ElementApi.isElement(node) || editor.api.isVoid(node)) {
    return false;
  }

  const paragraphType = getPluginType(editor, KEYS.p);

  if (
    node.type === paragraphType ||
    node.children.some((child) => TextApi.isText(child))
  ) {
    const lastChild = node.children.at(-1);

    if (
      TextApi.isText(lastChild) &&
      inlineNodes.every((inlineNode) => TextApi.isText(inlineNode))
    ) {
      lastChild.text += inlineNodes
        .map((inlineNode) => inlineNode.text)
        .join('');

      return true;
    }

    node.children.push(...inlineNodes);
    return true;
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    if (
      appendInlineNodesToLastTextContainer(
        editor,
        node.children[i],
        inlineNodes
      )
    ) {
      return true;
    }
  }

  return false;
};

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
    return [...completeNodes, newBlock];
  }

  const tableType = getPluginType(editor, KEYS.table);

  if (ElementApi.isElement(lastBlock) && lastBlock.type === tableType) {
    const withoutMdxNodes = markdownToSlateNodes(editor, data, {
      ...options,
      withoutMdx: true,
    });
    const fallbackTable = withoutMdxNodes
      .filter((node) => ElementApi.isElement(node) && node.type === tableType)
      .at(-1);

    if (fallbackTable) {
      return [...completeNodes.slice(0, -1), fallbackTable];
    }
  }

  if (
    ElementApi.isElement(lastBlock) &&
    appendInlineNodesToLastTextContainer(editor, lastBlock, incompleteNodes)
  ) {
    return completeNodes;
  }

  return completeNodes;
};

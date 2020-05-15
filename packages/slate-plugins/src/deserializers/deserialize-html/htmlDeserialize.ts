import { SlatePlugin } from 'common/types';
import {
  deserializeBreak,
  deserializeElement,
  deserializeFragment,
  deserializeMarks,
  deserializeTextNode,
} from 'deserializers/deserialize-html/utils';
import { Node as SlateNode } from 'slate';

export const htmlDeserialize = (plugins: SlatePlugin[]) => (
  node: HTMLElement | ChildNode
): any => {
  // text node
  const textNode = deserializeTextNode(node);
  if (textNode) return textNode;

  // if not an element node
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  // break line
  const breakLine = deserializeBreak(node);
  if (breakLine) return breakLine;

  const { nodeName } = node;
  let parent = node;

  // blockquote
  if (nodeName === 'PRE' && node.childNodes[0]?.nodeName === 'CODE') {
    [parent] = node.childNodes;
  }

  const children: (SlateNode | null)[] = Array.from(parent.childNodes)
    .map(htmlDeserialize(plugins))
    .flat();

  const el = node as HTMLElement;

  // body
  const fragment = deserializeFragment({ el, children });
  if (fragment) return fragment;

  // element
  const element = deserializeElement({ plugins, el, children });
  if (element) return element;

  // mark
  const texts = deserializeMarks({
    plugins,
    el,
    children,
  });
  if (texts) return texts;

  return children;
};

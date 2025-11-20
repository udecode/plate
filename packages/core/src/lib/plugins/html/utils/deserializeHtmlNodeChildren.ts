import type { SlateEditor } from '../../../editor';
import type { DeserializeHtmlChildren } from '../types';

import { isSlateNode } from '../../../utils';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = (
  editor: SlateEditor,
  node: ChildNode | HTMLElement,
  isSlateParent = false
): DeserializeHtmlChildren[] =>
  Array.from(node.childNodes).flatMap((child) => {
    if (
      child.nodeType === 1 &&
      !isSlateNode(child as HTMLElement) &&
      isSlateParent
    ) {
      return deserializeHtmlNodeChildren(
        editor,
        child as HTMLElement,
        isSlateParent
      );
    }

    return deserializeHtmlNode(editor)(child);
  }) as DeserializeHtmlChildren[];

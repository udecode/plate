import { isNode } from '@platejs/plite-dom/internal';

import type { BaseEditor } from '../../../editor';
import type { DeserializeHtmlChildren } from '../types';

import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = (
  editor: BaseEditor,
  node: ChildNode | HTMLElement,
  isPliteParent = false
): DeserializeHtmlChildren[] =>
  Array.from(node.childNodes).flatMap((child) => {
    if (
      child.nodeType === 1 &&
      !isNode(child as HTMLElement) &&
      isPliteParent
    ) {
      return deserializeHtmlNodeChildren(
        editor,
        child as HTMLElement,
        isPliteParent
      );
    }

    return deserializeHtmlNode(editor)(child);
  }) as DeserializeHtmlChildren[];

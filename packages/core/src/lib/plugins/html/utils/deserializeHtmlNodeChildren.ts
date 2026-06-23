import type { BasePlateEditor } from '../../../editor';
import type { DeserializeHtmlChildren } from '../types';

import { isPliteNode } from '../../../utils';
import { deserializeHtmlNode } from './deserializeHtmlNode';

export const deserializeHtmlNodeChildren = (
  editor: BasePlateEditor,
  node: ChildNode | HTMLElement,
  isPliteParent = false
): DeserializeHtmlChildren[] =>
  Array.from(node.childNodes).flatMap((child) => {
    if (
      child.nodeType === 1 &&
      !isPliteNode(child as HTMLElement) &&
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

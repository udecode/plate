import {
  type SlateEditor,
  type TElement,
  getNodeEntries,
  getNodeString,
} from '@udecode/plate-common';

import type { Heading } from '../lib/types';

import { BaseTocPlugin } from '../lib';
import { HEADING_KEYS } from '../lib/constants';
import { isHeading } from '../lib/utils/isHeading';

const headingDepth: Record<string, number> = {
  [HEADING_KEYS.h1]: 1,
  [HEADING_KEYS.h2]: 2,
  [HEADING_KEYS.h3]: 3,
  [HEADING_KEYS.h4]: 4,
  [HEADING_KEYS.h5]: 5,
  [HEADING_KEYS.h6]: 6,
};

export const getHeadingList = (editor: SlateEditor) => {
  const options = editor.getOptions(BaseTocPlugin);

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = getNodeEntries(editor, {
    at: [],
    match: (n) => isHeading(n),
  });

  if (!values) return [];

  Array.from(values, ([node, path]) => {
    const { type } = node as TElement;
    const title = getNodeString(node);
    const depth = headingDepth[type];
    const id = node.id;
    title && headingList.push({ depth, id, path, title, type });
  });

  return headingList;
};

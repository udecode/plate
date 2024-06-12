import {
  type PlateEditor,
  type TElement,
  getNodeEntries,
  getNodeString,
} from '@udecode/plate-common';

import type { Heading } from '../toc';

import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '../heading';
import { isHeading } from './isHeading';

const headingDepth: Record<string, number> = {
  [ELEMENT_H1]: 1,
  [ELEMENT_H2]: 2,
  [ELEMENT_H3]: 3,
  [ELEMENT_H4]: 4,
  [ELEMENT_H5]: 5,
  [ELEMENT_H6]: 6,
};

export const getHeadingList = (editor: PlateEditor) => {
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

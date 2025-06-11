import { type SlateEditor, type TElement, NodeApi } from 'platejs';

import type { Heading } from '../lib/types';

import { BaseTocPlugin } from '../lib';
import { isHeading } from '../lib/utils/isHeading';

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

export const getHeadingList = (editor: SlateEditor) => {
  const options = editor.getOptions(BaseTocPlugin);

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = editor.api.nodes<TElement>({
    at: [],
    match: (n) => isHeading(n),
  });

  if (!values) return [];

  Array.from(values, ([node, path]) => {
    const { type } = node;
    const title = NodeApi.string(node);
    const depth = headingDepth[type];
    const id = node.id as string;
    title && headingList.push({ id, depth, path, title, type });
  });

  return headingList;
};

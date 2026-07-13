import type { BaseEditor } from '@platejs/core';
import { type Element, NodeApi } from '@platejs/plite';

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

export const getHeadingList = (editor: BaseEditor) => {
  const options = editor.plugin(BaseTocPlugin).getOptions();

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = editor.read.nodes.entries<Element>({
    at: [],
    match: isHeading,
  });

  for (const [node, path] of values) {
    const { type } = node;
    const title = NodeApi.string(node);
    const depth = headingDepth[type];
    const { id } = node;

    if (title && typeof id === 'string') {
      headingList.push({ id, depth, path, title, type });
    }
  }

  return headingList;
};

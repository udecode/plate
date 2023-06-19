// @ts-nocheck
// TODO: I'll fix this later.

import { toc } from 'mdast-util-toc';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';

const textTypes = ['text', 'emphasis', 'strong', 'inlineCode'];

function flattenNode(node) {
  const p = [];
  visit(node, (_node) => {
    if (!textTypes.includes(_node.type)) return;
    p.push(_node.value);
  });
  return p.join(``);
}

interface Item {
  title: string;
  url: string;
  items?: Item[];
}

interface Items {
  items?: Item[];
}

function getItems(node, current): Items {
  if (!node) {
    return {};
  }

  if (node.type === 'paragraph') {
    visit(node, (item) => {
      if (item.type === 'link') {
        current.url = item.url;
        current.title = flattenNode(node);
      }

      if (item.type === 'text') {
        current.title = flattenNode(node);
      }
    });

    return current;
  }

  if (node.type === 'list') {
    current.items = node.children.map((i) => getItems(i, {}));

    return current;
  }
  if (node.type === 'listItem') {
    const heading = getItems(node.children[0], {});

    if (node.children.length > 1) {
      getItems(node.children[1], heading);
    }

    return heading;
  }

  return {};
}

const getToc = () => (node, file) => {
  const table = toc(node);
  file.data = getItems(table.map, {});
};

export type TableOfContents = {
  items?: Item[];
  isAPI?: boolean;
};

export async function getTableOfContents(
  content: string
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content);

  return result.data;
}

export const getAPITableOfContents = (content: string): TableOfContents => {
  const categories = content.split(/name="([^"]*)"/g).filter((_, i) => i > 0); // we ignore the first element because it's the part of the string before the first category

  const result: TableOfContents = { items: [], isAPI: true };

  for (let i = 0; i < categories.length; i += 2) {
    const category = categories[i];
    const itemsStr = categories[i + 1];

    const names = Array.from(itemsStr.matchAll(/name: '([^']*)'/g), (m) => ({
      name: m[1],
    }));

    result.items.push({
      title: category,
      url: `#${category}`,
      items: names.map((n) => ({ title: n.name, url: `#${n.name}` })),
    });
  }

  return result;
};

import { toc } from 'mdast-util-toc';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';

const textTypes = new Set(['emphasis', 'inlineCode', 'strong', 'text']);

function flattenNode(node: any) {
  const p: string[] = [];
  visit(node, (_node) => {
    if (!textTypes.has(_node.type)) return;

    p.push(_node.value);
  });

  return p.join('');
}

type Item = {
  title: string;
  url: string;
  items?: Item[];
};

type Items = {
  items?: Item[];
};

// New flat structure compatible with docs-toc.tsx
export type FlatTocItem = {
  depth: number;
  title: string;
  url: string;
};

// Helper function to flatten nested items into flat structure with depth
function flattenItems(items: Item[], depth = 2): FlatTocItem[] {
  const flattened: FlatTocItem[] = [];

  for (const item of items) {
    if (item.title && item.url) {
      flattened.push({
        depth,
        title: item.title,
        url: item.url,
      });
    }

    if (item.items) {
      flattened.push(...flattenItems(item.items, depth + 1));
    }
  }

  return flattened;
}

function getItems(node: any, current: any): Items {
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
    current.items = node.children.map((i: any) => getItems(i, {}));

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

const getToc = () => (node: any, file: any) => {
  const table = toc(node);
  const items = getItems(table.map, {});

  file.data = items;
};

export type TocItem = {
  depth: number;
  url: string;
  title?: React.ReactNode;
};

export async function getTableOfContents(content: string): Promise<TocItem[]> {
  const result = await remark().use(getToc).process(content);
  const nestedResult = result.data as Items;

  if (!nestedResult.items) {
    return [];
  }

  return flattenItems(nestedResult.items);
}

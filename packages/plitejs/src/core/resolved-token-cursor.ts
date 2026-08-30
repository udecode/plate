import { getDefined } from '../internal/get-defined';
import type { JsonNode } from './change/tokens';

type NodeKind = 'element' | 'text';

export type TreeIndexNode = {
  children?: TreeIndexChildren;
  kind: NodeKind;
  length: number;
};

export type TreeIndexChildren = {
  children: readonly TreeIndexNode[];
  length: number;
  offsets: readonly number[];
};

export type ResolvedTokenEntry = {
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: NodeKind;
  path: readonly number[];
  to: number;
};

type CursorFrame = {
  children: TreeIndexChildren;
  contentFrom: number;
  index: number;
};

const isTextNode = (node: JsonNode) => typeof node.text === 'string';

export const createTreeIndexChildren = (
  children: readonly TreeIndexNode[]
): TreeIndexChildren => {
  const offsets: number[] = [];
  let length = 0;

  for (const child of children) {
    offsets.push(length);
    length += child.length;
  }

  return {
    // Tree indexes are package-private persistent values. Every caller owns
    // the array it supplies and copies before editing, so freezing and copying
    // the same wide index again only adds O(n) publication work.
    children,
    length,
    offsets,
  };
};

export const createTreeIndexNode = (node: JsonNode): TreeIndexNode => {
  if (isTextNode(node)) {
    return { kind: 'text', length: node.text.length + 2 };
  }

  if (!Array.isArray(node.children)) throw new Error('Invalid JSON node.');

  const children = createTreeIndexChildren(
    node.children.map(createTreeIndexNode)
  );

  return { children, kind: 'element', length: children.length + 2 };
};

export const createTreeIndex = (nodes: readonly JsonNode[]) =>
  createTreeIndexChildren(nodes.map(createTreeIndexNode));

const findChildIndexAtPosition = (
  children: TreeIndexChildren,
  contentFrom: number,
  position: number
) => {
  const target = position - contentFrom;
  let low = 0;
  let high = children.offsets.length - 1;
  let match = -1;

  while (low <= high) {
    const middle = (low + high) >>> 1;
    const offset = children.offsets[middle];

    if (offset <= target) {
      match = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return match;
};

/** Package-private cursor for resolving token positions against a tree index. */
export class ResolvedTokenCursor {
  private readonly frames: CursorFrame[] = [];
  private readonly tree: TreeIndexChildren;

  constructor(tree: TreeIndexChildren) {
    this.tree = tree;
  }

  childBoundaryAt(position: number) {
    if (position < 0 || position > this.tree.length) return null;

    let children = this.tree;
    let contentFrom = 0;
    const parentPath: number[] = [];

    while (true) {
      const index = findChildIndexAtPosition(children, contentFrom, position);

      if (index >= 0) {
        const child = children.children[index];
        const from = contentFrom + children.offsets[index];

        if (position === from) {
          return { index, parentPath: [...parentPath] };
        }

        if (
          child.children &&
          from < position &&
          position < from + child.length
        ) {
          parentPath.push(index);
          ({ children } = child);
          contentFrom = from + 1;
          continue;
        }
      }

      return position === contentFrom + children.length
        ? { index: children.children.length, parentPath: [...parentPath] }
        : null;
    }
  }

  /** Return the outer-to-inner node stack containing one token position. */
  openContextAt(position: number): readonly ResolvedTokenEntry[] {
    if (position < 0 || position > this.tree.length) {
      throw new RangeError(`Invalid document position ${position}.`);
    }

    const entries: ResolvedTokenEntry[] = [];
    const path: number[] = [];
    let children = this.tree;
    let contentFrom = 0;

    while (true) {
      const index = findChildIndexAtPosition(children, contentFrom, position);

      if (index < 0) break;
      const child = children.children[index];
      const from = contentFrom + children.offsets[index];
      const to = from + child.length;

      if (position < from || to < position) break;

      path.push(index);
      entries.push(this.createEntry(child, from, path));

      if (!child.children || position <= from || to <= position) break;

      ({ children } = child);
      contentFrom = from + 1;
    }

    return Object.freeze(entries);
  }

  nodeRangesTouching(from: number, to = from): readonly ResolvedTokenEntry[] {
    if (from < 0 || to < from || to > this.tree.length) {
      throw new RangeError(`Invalid document range ${from}..${to}.`);
    }

    const byDepth: ResolvedTokenEntry[][] = [];
    const path: number[] = [];

    const visit = (children: TreeIndexChildren, contentFrom: number) => {
      let index = Math.max(
        0,
        findChildIndexAtPosition(children, contentFrom, from)
      );

      while (index > 0) {
        const previousIndex = index - 1;
        const previous = children.children[previousIndex];
        const previousFrom = contentFrom + children.offsets[previousIndex];

        if (previousFrom + previous.length < from) break;

        index = previousIndex;
      }

      for (; index < children.children.length; index++) {
        const child = children.children[index];
        const childFrom = contentFrom + children.offsets[index];

        if (childFrom > to) break;

        const childTo = childFrom + child.length;

        if (childTo < from) continue;

        path.push(index);

        const entry = this.createEntry(child, childFrom, path);
        const entriesAtDepth = byDepth[path.length - 1] ?? [];

        byDepth[path.length - 1] = entriesAtDepth;
        entriesAtDepth.push(entry);

        if (child.children) visit(child.children, childFrom + 1);

        path.pop();
      }
    };

    visit(this.tree, 0);

    return byDepth.flat();
  }

  nodeStartingAt(position: number) {
    if (position < 0 || position > this.tree.length) return null;

    this.frames.length = 0;

    let children = this.tree;
    let contentFrom = 0;

    while (true) {
      const index = findChildIndexAtPosition(children, contentFrom, position);

      if (index < 0) return null;

      const child = children.children[index];
      const from = contentFrom + children.offsets[index];

      this.frames.push({ children, contentFrom, index });

      if (position === from) return this.currentEntry();

      if (child.children && from < position && position < from + child.length) {
        ({ children } = child);
        contentFrom = from + 1;
        continue;
      }

      return null;
    }
  }

  pointAt(position: number, assoc: -1 | 1 = -1) {
    this.assertPosition(position);

    this.seek(position);

    const containing = this.currentTextContaining(position);

    if (containing) return this.pointIn(containing, position);

    const preferred =
      assoc < 0 ? this.textBefore(position) : this.textAfter(position);

    if (preferred) {
      return {
        offset:
          preferred.contentTo <= position
            ? preferred.contentTo - preferred.contentFrom
            : 0,
        path: [...preferred.path],
      };
    }

    this.seek(position);

    const fallback =
      assoc < 0 ? this.textAfter(position) : this.textBefore(position);

    if (!fallback) return null;

    return {
      offset:
        fallback.contentTo <= position
          ? fallback.contentTo - fallback.contentFrom
          : 0,
      path: [...fallback.path],
    };
  }

  textAt(position: number) {
    if (position < 0 || position > this.tree.length) return null;

    this.seek(position);

    return this.currentTextContaining(position);
  }

  private assertPosition(position: number) {
    if (position < 0 || position > this.tree.length) {
      throw new RangeError(`Position ${position} is outside the document.`);
    }
  }

  private createEntry(
    node: TreeIndexNode,
    from: number,
    path: readonly number[]
  ): ResolvedTokenEntry {
    return {
      contentFrom: from + 1,
      contentTo: from + node.length - 1,
      from,
      kind: node.kind,
      path: [...path],
      to: from + node.length,
    };
  }

  private currentEntry() {
    const frame = this.frames.at(-1);

    if (!frame) return null;

    const node = frame.children.children[frame.index];
    const from = frame.contentFrom + frame.children.offsets[frame.index];

    return this.createEntry(
      node,
      from,
      this.frames.map(({ index }) => index)
    );
  }

  private currentTextContaining(position: number) {
    const entry = this.currentEntry();

    return entry?.kind === 'text' &&
      entry.contentFrom <= position &&
      position <= entry.contentTo
      ? entry
      : null;
  }

  private next() {
    const current = this.currentEntry();
    const currentNode = this.currentNode();

    if (current && currentNode?.children?.children.length) {
      this.frames.push({
        children: currentNode.children,
        contentFrom: current.from + 1,
        index: 0,
      });

      return true;
    }

    while (this.frames.length > 0) {
      const frame = getDefined(this.frames.at(-1));

      if (frame.index + 1 < frame.children.children.length) {
        frame.index += 1;

        return true;
      }

      this.frames.pop();
    }

    return false;
  }

  private previous() {
    if (this.frames.length === 0) return false;

    const frame = getDefined(this.frames.at(-1));

    if (frame.index === 0) {
      this.frames.pop();

      return this.frames.length > 0;
    }

    frame.index -= 1;

    while (true) {
      const entry = getDefined(this.currentEntry());
      const node = getDefined(this.currentNode());

      if (!node.children?.children.length) return true;

      this.frames.push({
        children: node.children,
        contentFrom: entry.from + 1,
        index: node.children.children.length - 1,
      });
    }
  }

  private currentNode() {
    const frame = this.frames.at(-1);

    return frame?.children.children[frame.index] ?? null;
  }

  private pointIn(entry: ResolvedTokenEntry, position: number) {
    return {
      offset: Math.max(
        0,
        Math.min(
          entry.contentTo - entry.contentFrom,
          position - entry.contentFrom
        )
      ),
      path: [...entry.path],
    };
  }

  private seek(position: number) {
    this.frames.length = 0;

    let children = this.tree;
    let contentFrom = 0;

    while (true) {
      const index = findChildIndexAtPosition(children, contentFrom, position);

      if (index < 0) return false;

      const child = children.children[index];
      const from = contentFrom + children.offsets[index];

      this.frames.push({ children, contentFrom, index });

      if (!child.children || position === from) return true;

      ({ children } = child);
      contentFrom = from + 1;
    }
  }

  private textAfter(position: number) {
    let entry = this.currentEntry();

    if (entry?.kind === 'text' && entry.contentFrom > position) {
      return entry;
    }

    while (this.next()) {
      entry = this.currentEntry();

      if (entry?.kind === 'text' && entry.contentFrom > position) {
        return entry;
      }
    }

    return null;
  }

  private textBefore(position: number) {
    let entry = this.currentEntry();

    if (entry?.kind === 'text' && entry.contentTo < position) {
      return entry;
    }

    while (this.previous()) {
      entry = this.currentEntry();

      if (entry?.kind === 'text' && entry.contentTo < position) {
        return entry;
      }
    }

    return null;
  }
}

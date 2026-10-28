import type {
  Descendant,
  NodeEntry,
  NodeTextRangeView,
} from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { type Text, TextApi } from '../interfaces/text';

type TextRunSchema = NodeTextRangeView['schema'] | undefined;

const collectTextRun = (
  schema: TextRunSchema,
  node: Descendant,
  path: Path,
  entries?: Array<NodeEntry<Text>>,
  isContent?: (text: Text) => boolean
): boolean => {
  if (TextApi.isText(node)) {
    if (entries && isContent?.(node) !== false) entries.push([node, path]);

    return true;
  }
  if (!schema?.isInline(node)) return false;

  return node.children.every((child, index) =>
    collectTextRun(
      schema,
      child,
      entries ? path.concat(index) : path,
      entries,
      isContent
    )
  );
};

/**
 * Whether `findTextRanges` searches a node with these children as one text
 * run. Collects the run's text entries into `entries` when given.
 */
export const isTextRun = (
  schema: TextRunSchema,
  children: readonly Descendant[],
  path: Path = [],
  entries?: Array<NodeEntry<Text>>,
  isContent?: (text: Text) => boolean
) =>
  children.length > 0 &&
  // A block child ends the run, so look for one before walking into the
  // inline elements beside it.
  children.every((child) => TextApi.isText(child) || schema?.isInline(child)) &&
  children.every((child, index) =>
    collectTextRun(
      schema,
      child,
      entries ? path.concat(index) : path,
      entries,
      isContent
    )
  );

/**
 * Find the deepest node that a whole `findTextRanges` search reads on its own
 * and that holds every difference between two different trees of one editor,
 * which never edits a node in place. Returns `null` when only a whole search
 * is exact.
 */
export const getTextSearchScope = (
  schema: TextRunSchema,
  before: readonly Descendant[],
  after: readonly Descendant[]
): Path | null => {
  const path: number[] = [];
  let beforeChildren = before;
  let afterChildren = after;

  // A whole search reads each child of a node on its own only while that node
  // is not one text run, and it must be read the same way in both trees.
  while (
    beforeChildren.length === afterChildren.length &&
    !isTextRun(schema, beforeChildren) &&
    !isTextRun(schema, afterChildren)
  ) {
    let slot = -1;

    for (let index = 0; index < afterChildren.length; index += 1) {
      if (beforeChildren[index] === afterChildren[index]) continue;
      if (slot !== -1) return path.length > 0 ? path : null;
      slot = index;
    }
    if (slot === -1) break;

    const beforeChild = beforeChildren[slot];
    const afterChild = afterChildren[slot];

    path.push(slot);
    if (TextApi.isText(beforeChild) || TextApi.isText(afterChild)) return path;

    beforeChildren = beforeChild.children;
    afterChildren = afterChild.children;
  }

  return path.length > 0 ? path : null;
};

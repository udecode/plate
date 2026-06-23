import { getEditorSchema } from '../core/editor-runtime';
import type { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import {
  type Ancestor,
  type Descendant,
  NodeApi,
  type NodeEntry,
} from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';

type GetFragmentInsertionPartsOptions = {
  firstLeafPath: Path;
  isBlockEmpty: boolean;
  isBlockEnd: boolean;
  isBlockStart: boolean;
  lastLeafPath: Path;
  preserveEmptyTargetBlock: boolean;
};

export const getFragmentInsertionParts = (
  editor: Editor,
  fragment: Descendant[],
  {
    firstLeafPath,
    isBlockEmpty,
    isBlockEnd,
    isBlockStart,
    lastLeafPath,
    preserveEmptyTargetBlock,
  }: GetFragmentInsertionPartsOptions
) => {
  const fragmentRoot = { children: fragment } as Ancestor;
  const schema = getEditorSchema(editor);

  // For each node in the fragment, determine what level of wrapping should be
  // kept. At minimum, all text nodes will be inserted, but if `shouldInsert`
  // returns true for some ancestor of a particular text node, then the entire
  // ancestor will be inserted rather than inserting the text nodes individually.
  const shouldInsert = ([n, p]: NodeEntry) => {
    const isRoot = p.length === 0;

    if (isRoot) {
      return false;
    }

    // If the destination block is empty, insert all top-level blocks of the
    // fragment.
    if (isBlockEmpty) {
      if (preserveEmptyTargetBlock && p.length === 1) {
        return false;
      }

      return true;
    }

    // Unless we're at the start of the destination block, unwrap any non-void
    // blocks that contain the first leaf node in the fragment.
    if (
      !isBlockStart &&
      PathApi.isAncestor(p, firstLeafPath) &&
      NodeApi.isElement(n) &&
      !schema.isVoid(n) &&
      !schema.isInline(n)
    ) {
      return false;
    }

    // Unless we're at the end of the destination block, unwrap any non-void
    // blocks that contain the last leaf node in the fragment.
    if (
      !isBlockEnd &&
      PathApi.isAncestor(p, lastLeafPath) &&
      NodeApi.isElement(n) &&
      !schema.isVoid(n) &&
      !schema.isInline(n)
    ) {
      return false;
    }

    // Always insert void nodes, inline elements and text nodes.
    return true;
  };

  // Whether the current node is in the first block of the fragment.
  let starting = true;

  // Inline nodes in the first block of the fragment, to be merged with the
  // destination block.
  const starts: Descendant[] = [];

  // Blocks in the middle of the fragment.
  const middles: Element[] = [];

  // Inline nodes in the last block of the fragment, to be merged with the
  // destination block. If the fragment contains only one block, this will be
  // empty.
  const ends: Descendant[] = [];

  for (const entry of NodeApi.nodes(fragmentRoot, { pass: shouldInsert })) {
    const [node, path] = entry;

    if (NodeApi.isEditor(node)) {
      continue;
    }

    // If we encounter a block that does not contain the first leaf, we're no
    // longer in the first block of the fragment.
    if (
      starting &&
      NodeApi.isElement(node) &&
      !schema.isInline(node) &&
      !PathApi.isAncestor(path, firstLeafPath)
    ) {
      starting = false;
    }

    if (shouldInsert(entry)) {
      if (NodeApi.isElement(node) && !schema.isInline(node)) {
        starting = false;
        middles.push(node);
      } else if (starting) {
        starts.push(node);
      } else {
        ends.push(node);
      }
    }
  }

  return {
    ends,
    middles,
    starts,
  };
};

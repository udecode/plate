import {
  type EditorUpdateTransaction,
  ElementApi,
  type Node,
  type Path,
  PathApi,
  SelectionApi,
} from '../../facade';

type InsertExitBlockOptions = {
  match?: (node: Node, path: Path) => boolean;
  reverse?: boolean;
};

type ExitBlockTransaction = Pick<
  EditorUpdateTransaction,
  'nodes' | 'schema' | 'selection'
>;

export const insertExitBlock = (
  tx: ExitBlockTransaction,
  { match, reverse }: InsertExitBlockOptions = {}
) => {
  const selection = tx.selection();

  if (!selection || !tx.selection.isCollapsed()) return false;

  const block = tx.nodes.block();

  if (!block) return false;

  const defaultBlock = tx.schema.createDefaultRootChild(
    SelectionApi.root(selection)
  );

  if (!ElementApi.isElement(defaultBlock)) {
    throw new Error('Plate schema must declare a default root element.');
  }

  const target = tx.nodes.above({
    at: block[1],
    match: (node, path) => {
      if (match && !match(node, path)) return false;
      if (path.length === 1) return true;

      const parent = tx.nodes.parent(path);

      return (
        !!parent &&
        ElementApi.isElement(parent[0]) &&
        tx.schema.findWrapping(parent[0], defaultBlock)?.length === 0
      );
    },
  });
  const ancestorPath = target?.[1] ?? block[1];

  tx.nodes.insert(defaultBlock, {
    at: reverse ? ancestorPath : PathApi.next(ancestorPath),
    select: true,
  });

  return true;
};

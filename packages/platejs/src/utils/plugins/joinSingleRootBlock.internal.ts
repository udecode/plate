import {
  type EditorUpdateTransaction,
  ElementApi,
  NodeApi,
} from '../../facade';

type SingleRootBlockTransaction = Pick<
  EditorUpdateTransaction,
  'nodes' | 'schema' | 'text'
>;

export const joinNextRootBlock = (
  tx: SingleRootBlockTransaction,
  separator: string,
  policyName: string
) => {
  const children = tx.nodes.children();

  if (children.length <= 1) return;

  const first = children[0];
  const second = children[1];

  if (
    !ElementApi.isElement(first) ||
    !ElementApi.isElement(second) ||
    tx.schema.isVoid(first) ||
    tx.schema.isVoid(second) ||
    second.children.some(
      (child) => ElementApi.isElement(child) && !tx.schema.isInline(child)
    ) ||
    second.children.some(
      (child) => tx.schema.findWrapping(first, child)?.length !== 0
    )
  ) {
    throw new Error(
      `[Plate] ${policyName} cannot preserve the second root block inside the first block.`
    );
  }

  const [lastNode, relativePath] = NodeApi.last(first, []);

  if (!NodeApi.isText(lastNode)) {
    throw new Error(
      `[Plate] ${policyName} requires the first root block to end in text.`
    );
  }

  const firstBlockEnd = {
    offset: lastNode.text.length,
    path: [0, ...relativePath],
  };

  tx.nodes.merge({
    at: [1],
    match: (_, path) => path.length === 1,
  });

  if (separator) tx.text.insert(separator, { at: firstBlockEnd });
};

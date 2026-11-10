import {
  canPlaceBlocksAtPath,
  type EditorUpdateTransaction,
  ElementApi,
  getEditorUpdateRoot,
  NodeApi,
} from '../../facade';
import type { Editor } from '../../lib/editor/Editor';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';

type SingleRootBlockTransaction = Pick<
  EditorUpdateTransaction,
  'nodes' | 'schema' | 'text'
>;

const rootHoldsLines = (
  editor: Editor,
  tx: SingleRootBlockTransaction,
  end: number
) =>
  canPlaceBlocksAtPath(
    tx.schema,
    [end],
    [tx.schema.create(editor.plugin(BaseParagraphPlugin).schema.type)],
    { root: getEditorUpdateRoot(editor) }
  );

export const joinNextRootBlock = (
  editor: Editor,
  tx: SingleRootBlockTransaction,
  separator: string,
  policyName: string
) => {
  const children = tx.nodes.children();

  if (children.length <= 1 || !rootHoldsLines(editor, tx, children.length)) {
    return;
  }

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

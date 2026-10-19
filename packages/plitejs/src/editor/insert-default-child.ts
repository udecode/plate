import { getEditorSchema } from '../core/editor-runtime';
import { toPublicRoot } from '../core/public-root';
import { getActiveUpdateRoot } from '../core/public-state';
import type { AnyEditor } from '../interfaces/editor';
import { parent as editorParent } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { insertNodes } from '../transforms-node/insert-nodes';

export const lastChildChain = (landing: Element) => {
  const chain: Element[] = [];

  for (
    let current: unknown = landing;
    NodeApi.isElement(current);
    current = current.children.at(-1)
  ) {
    chain.push(current);
  }

  return chain;
};

const endsInText = (block: Element) =>
  NodeApi.isText(lastChildChain(block).at(-1)?.children.at(-1));

export const buildDefaultChild = (editor: AnyEditor, at: Path) => {
  const schema = getEditorSchema(editor);
  const root = getActiveUpdateRoot(editor) ?? 'main';
  const [parent] = editorParent(editor, at);

  if (NodeApi.isElement(parent) && !schema.element(parent.type)?.content) {
    return null;
  }

  const block = schema.tryCreateDefaultChild({
    at,
    root: toPublicRoot(root),
  });

  if (
    !NodeApi.isElement(block) ||
    !schema.canPlaceAtPath(at, [block], { root }) ||
    !endsInText(block)
  ) {
    return null;
  }

  return block;
};

export const insertDefaultChild = (
  editor: AnyEditor,
  at: Path,
  {
    block = buildDefaultChild(editor, at),
    voids = false,
  }: { block?: Element | null; voids?: boolean } = {}
) => {
  if (!block) return false;

  insertNodes(editor, block, { at, select: true, voids });

  return true;
};

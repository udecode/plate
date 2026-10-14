import { getEditorSchema } from '../core/editor-runtime';
import { toPublicRoot } from '../core/public-root';
import { getActiveUpdateRoot } from '../core/public-state';
import type { AnyEditor } from '../interfaces/editor';
import { parent as editorParent } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { insertNodes } from '../transforms-node/insert-nodes';

export const insertDefaultChild = (
  editor: AnyEditor,
  at: Path,
  { voids = false }: { voids?: boolean } = {}
) => {
  const schema = getEditorSchema(editor);
  const root = getActiveUpdateRoot(editor) ?? 'main';
  const [parent] = editorParent(editor, at);
  const admitsNoChild =
    NodeApi.isElement(parent) && !schema.element(parent.type)?.content;

  if (admitsNoChild) return false;

  const block = schema.createDefaultChild({ at, root: toPublicRoot(root) });

  if (
    !NodeApi.isElement(block) ||
    !schema.canPlaceAtPath(at, [block], { root })
  ) {
    return false;
  }

  insertNodes(editor, block, { at, select: true, voids });

  return true;
};

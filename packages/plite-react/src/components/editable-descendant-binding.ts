import type {
  Descendant,
  Path,
  NodeKey,
  Element as PliteElementNode,
  Text as PliteTextNode,
} from '@platejs/plite';

import {
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  isEditor as editorIsEditor,
  isInline as editorIsInline,
  isVoid as editorIsVoid,
} from '../editable/runtime-editor-api';
import type { AnyEditor as EditorType } from '../editable/runtime-editor-api';
import { getDOMTextRenderRevision } from '../hooks/use-plite-node-ref';

const EMPTY_RUNTIME_IDS = Object.freeze([]) as readonly NodeKey[];
const EMPTY_DIRECT_TEXT_CHILD_NODES = Object.freeze(
  []
) as readonly (PliteTextNode | null)[];

export type EditableDescendantBinding = {
  childNodeKeys: readonly NodeKey[];
  directTextChildNodes: readonly (PliteTextNode | null)[];
  isInline: boolean;
  isVoid: boolean;
  node: Descendant | null;
  path: Path | null;
  renderRevision: number;
};

export const isEditableTextNode = (value: Descendant): value is PliteTextNode =>
  typeof (value as PliteTextNode).text === 'string';

export const readEditableDescendantBinding = ({
  editor,
  node,
  path,
  renderLeaf,
  renderSegment,
  renderText,
}: {
  editor: EditorType;
  node: unknown;
  path: Path | null;
  renderLeaf?: unknown;
  renderSegment?: unknown;
  renderText?: unknown;
}): EditableDescendantBinding => {
  if (!path || !node || editorIsEditor(node)) {
    return {
      childNodeKeys: EMPTY_RUNTIME_IDS,
      directTextChildNodes: EMPTY_DIRECT_TEXT_CHILD_NODES,
      isInline: false,
      isVoid: false,
      node: null,
      path: null,
      renderRevision: 0,
    };
  }

  const descendant = node as Descendant;
  const snapshot = editorGetSnapshot(editor);
  const usesDirectTextChildren =
    !isEditableTextNode(descendant) &&
    !renderLeaf &&
    !renderSegment &&
    !renderText;

  const childNodeKeys = isEditableTextNode(descendant)
    ? EMPTY_RUNTIME_IDS
    : ((descendant as PliteElementNode).children
        .map((_, index) => {
          const childPath = [...path, index] as Path;

          return (
            snapshot.index.keyAt(childPath) ??
            editorGetNodeKey(editor, childPath) ??
            ''
          );
        })
        .filter(Boolean) as NodeKey[]);
  const ownNodeKey = editorGetNodeKey(editor, path);
  const isElement = !isEditableTextNode(descendant);

  return {
    childNodeKeys,
    directTextChildNodes: usesDirectTextChildren
      ? (descendant as PliteElementNode).children.map((child) =>
          isEditableTextNode(child) ? child : null
        )
      : EMPTY_DIRECT_TEXT_CHILD_NODES,
    isInline: isElement && editorIsInline(editor, descendant),
    isVoid: isElement && editorIsVoid(editor, descendant),
    node: descendant,
    path,
    renderRevision: getDOMTextRenderRevision(editor, [
      ...(ownNodeKey ? [ownNodeKey] : []),
      ...childNodeKeys,
    ]),
  };
};

import type {
  Descendant,
  Path,
  RuntimeId,
  Editor as EditorType,
  Element as PliteElementNode,
  Text as PliteTextNode,
} from '@platejs/plite';

import {
  getRuntimeId as editorGetRuntimeId,
  getSnapshot as editorGetSnapshot,
  isEditor as editorIsEditor,
} from '../editable/runtime-editor-api';

import { getSnapshotPathKey } from './editable-dom-strategy-helpers';

const EMPTY_RUNTIME_IDS = Object.freeze([]) as readonly RuntimeId[];
const EMPTY_DIRECT_TEXT_CHILD_NODES = Object.freeze(
  []
) as readonly (PliteTextNode | null)[];

export type EditableDescendantBinding = {
  childRuntimeIds: readonly RuntimeId[];
  directTextChildNodes: readonly (PliteTextNode | null)[];
  node: Descendant | null;
  path: Path | null;
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
      childRuntimeIds: EMPTY_RUNTIME_IDS,
      directTextChildNodes: EMPTY_DIRECT_TEXT_CHILD_NODES,
      node: null,
      path: null,
    };
  }

  const descendant = node as Descendant;
  const snapshot = editorGetSnapshot(editor);
  const usesDirectTextChildren =
    !isEditableTextNode(descendant) &&
    !renderLeaf &&
    !renderSegment &&
    !renderText;

  return {
    childRuntimeIds: isEditableTextNode(descendant)
      ? EMPTY_RUNTIME_IDS
      : ((descendant as PliteElementNode).children
          .map((_, index) => {
            const childPath = [...path, index] as Path;

            return (
              snapshot.index.pathToId[getSnapshotPathKey(childPath)] ??
              editorGetRuntimeId(editor, childPath) ??
              ''
            );
          })
          .filter(Boolean) as RuntimeId[]),
    directTextChildNodes: usesDirectTextChildren
      ? (descendant as PliteElementNode).children.map((child) =>
          isEditableTextNode(child) ? child : null
        )
      : EMPTY_DIRECT_TEXT_CHILD_NODES,
    node: descendant,
    path,
  };
};

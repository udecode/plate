import {
  readAuthoredViewFragmentSlots,
  type NativeAuthoredFragmentSlot,
} from '../core/authored-runtime';
import { getEditorProjectionSnapshotIndex } from '../core/public-state';
import { buildSnapshotIndex } from '../core/snapshot-index';
import type {
  AnyEditor as Editor,
  NodeKey,
  SnapshotIndex,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';

export type AuthoredProjectionContext = Readonly<{
  index: (children: readonly Descendant[]) => SnapshotIndex;
  isInline: (node: Descendant) => boolean;
  slots: (
    nodeKey: NodeKey | undefined,
    root: string
  ) => readonly NativeAuthoredFragmentSlot[];
}>;

export const createEditorAuthoredProjectionContext = (
  editor: Editor
): AuthoredProjectionContext => ({
  index: (children) => getEditorProjectionSnapshotIndex(editor, children),
  isInline: (node) => editor.read.schema.isInline(node),
  slots: (nodeKey, root) =>
    readAuthoredViewFragmentSlots(editor, nodeKey, root),
});

export const createDetachedAuthoredProjectionContext = (
  slots: AuthoredProjectionContext['slots']
): AuthoredProjectionContext => {
  const owner = {} as Editor;
  const indexes = new WeakMap<readonly Descendant[], SnapshotIndex>();

  return {
    index(children) {
      let index = indexes.get(children);

      if (!index) {
        index = buildSnapshotIndex(owner, children);
        indexes.set(children, index);
      }

      return index;
    },
    // Detached authored documents have no installed application schema. This
    // matches the former authored-only projection runtime, where custom node
    // families were not available either.
    isInline: () => false,
    slots,
  };
};

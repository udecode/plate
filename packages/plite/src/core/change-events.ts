import type {
  Editor,
  EditorCommit,
  EditorNodeChangeContext,
  EditorNotifiedNodeOperation,
  EditorSnapshot,
  EditorTextChangeContext,
  Value,
  ValueOf,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Operation, TextOperation } from '../interfaces/operation';
import { getExtensionRegistry } from './extension-registry';

const isNotifiedNodeOperation = <V extends Value>(
  operation: Operation<V>
): operation is EditorNotifiedNodeOperation<V> =>
  operation.type === 'insert_node' ||
  operation.type === 'remove_node' ||
  operation.type === 'set_node';

const isTextOperation = (operation: Operation): operation is TextOperation =>
  operation.type === 'insert_text' || operation.type === 'remove_text';

const getNodeAtPath = <TNode extends Descendant>(
  editor: Editor,
  path: readonly number[]
) => editor.read.nodes.get<TNode>(path as number[])?.[0];

const getSnapshotNodeAtPath = <TNode extends Descendant>(
  snapshot: EditorSnapshot,
  path: readonly number[]
) => {
  let node: unknown = snapshot.children[path[0]!];

  for (const index of path.slice(1)) {
    if (
      !node ||
      typeof node !== 'object' ||
      !('children' in node) ||
      !Array.isArray((node as { children?: unknown }).children)
    ) {
      return;
    }

    node = (node as { children: unknown[] }).children[index];
  }

  return node as TNode | undefined;
};

export const forEachEditorNodeChange = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  previousSnapshot: EditorSnapshot<ValueOf<TEditor>>,
  listener: (context: EditorNodeChangeContext<TEditor>) => void
) => {
  for (const operation of commit.operations) {
    if (!isNotifiedNodeOperation(operation)) {
      continue;
    }

    if (operation.type === 'insert_node' || operation.type === 'remove_node') {
      listener({
        commit,
        editor,
        node: operation.node as Descendant,
        operation,
        prevNode: operation.node as Descendant,
      } as EditorNodeChangeContext<TEditor>);
      continue;
    }

    const node = getNodeAtPath<Descendant>(editor, operation.path);
    const prevNode = getSnapshotNodeAtPath<Descendant>(
      previousSnapshot,
      operation.path
    );

    if (!node || !prevNode) {
      continue;
    }

    listener({
      commit,
      editor,
      node,
      operation,
      prevNode,
    } as EditorNodeChangeContext<TEditor>);
  }
};

export const forEachEditorTextChange = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  previousSnapshot: EditorSnapshot<ValueOf<TEditor>>,
  listener: (context: EditorTextChangeContext<TEditor>) => void
) => {
  for (const operation of commit.operations) {
    if (!isTextOperation(operation)) {
      continue;
    }

    const text = getNodeAtPath<{ text: string }>(editor, operation.path)?.text;
    const prevText = getSnapshotNodeAtPath<{ text: string }>(
      previousSnapshot,
      operation.path
    )?.text;
    const node = getNodeAtPath<Descendant>(editor, operation.path.slice(0, -1));

    if (text === undefined || prevText === undefined || !node) {
      continue;
    }

    listener({
      commit,
      editor,
      node,
      operation,
      prevText,
      text,
    } as EditorTextChangeContext<TEditor>);
  }
};

export const notifyEditorChangeListeners = <TEditor extends Editor>(
  editor: TEditor,
  commit: EditorCommit<ValueOf<TEditor>>,
  previousSnapshot: EditorSnapshot<ValueOf<TEditor>>
) => {
  const registry = getExtensionRegistry(editor);

  if (registry.nodeChangeListeners.size > 0) {
    forEachEditorNodeChange(editor, commit, previousSnapshot, (context) => {
      for (const listener of registry.nodeChangeListeners) {
        listener(context);
      }
    });
  }

  if (registry.textChangeListeners.size > 0) {
    forEachEditorTextChange(editor, commit, previousSnapshot, (context) => {
      for (const listener of registry.textChangeListeners) {
        listener(context);
      }
    });
  }
};

import { Editor, type EditorLevelsOptions } from '../interfaces/editor';
import { type Node, NodeApi, type NodeEntry } from '../interfaces/node';

export function* levels<T extends Node>(
  editor: Editor,
  options: EditorLevelsOptions<T> = {}
): Generator<NodeEntry<T>, void, undefined> {
  const {
    at = Editor.getSnapshot(editor).selection,
    reverse = false,
    voids = false,
  } = options;
  let { match } = options;

  if (match == null) {
    match = () => true;
  }

  if (!at) {
    return;
  }

  const levels: NodeEntry<T>[] = [];
  const path = Editor.path(editor, at);

  for (const [n, p] of NodeApi.levels(editor, path)) {
    const isVoid = !voids && NodeApi.isElement(n) && Editor.isVoid(editor, n);

    if (match(n, p)) {
      levels.push([n, p] as NodeEntry<T>);
    }

    if (isVoid) {
      break;
    }
  }

  if (reverse) {
    levels.reverse();
  }

  yield* levels;
}

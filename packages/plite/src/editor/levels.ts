import {
  getSnapshot as editorGetSnapshot,
  isVoid as editorIsVoid,
  path as editorPath,
} from '../interfaces/editor';
import type {
  AnyEditor as Editor,
  EditorLevelsOptions,
} from '../interfaces/editor';
import { type Node, NodeApi, type NodeEntry } from '../interfaces/node';
import { normalizeNodeMatch } from '../utils/node-match';

export function* levels<T extends Node>(
  editor: Editor,
  options: EditorLevelsOptions<T> = {}
): Generator<NodeEntry<T>, void, undefined> {
  const {
    at = editorGetSnapshot(editor).selection,
    reverse = false,
    voids = false,
  } = options;
  const match = normalizeNodeMatch(options.type, options.match) ?? (() => true);

  if (!at) {
    return;
  }

  const innerLevels: Array<NodeEntry<T>> = [];
  const path = editorPath(editor, at);

  for (const [n, p] of NodeApi.levels(editor, path)) {
    const isVoid = !voids && NodeApi.isElement(n) && editorIsVoid(editor, n);

    if (match(n, p)) {
      innerLevels.push([n, p] as unknown as NodeEntry<T>);
    }

    if (isVoid) {
      break;
    }
  }

  if (reverse) {
    innerLevels.reverse();
  }

  yield* innerLevels;
}

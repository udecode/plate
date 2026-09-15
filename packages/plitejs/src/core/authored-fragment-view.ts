import { createEditorViewRuntime } from '../editor-runtime-view';
import type {
  AnyEditor as Editor,
  EditorView,
  PluginsOf,
  ValueOf,
} from '../interfaces/editor';
import { NodeApi, type Descendant, type NodeEntry } from '../interfaces/node';
import {
  bindAuthoredFragmentView,
  type NativeAuthoredFragment,
} from './authored-runtime';
import { getEditorRuntimeOwner } from './editor-runtime';

export const readAuthoredFragmentRoots = (
  fragment: NativeAuthoredFragment,
  content?: readonly Descendant[]
): Array<NodeEntry<Descendant>> => {
  if (
    fragment.kind === 'properties' ||
    fragment.slice.openStart !== fragment.slice.openEnd
  ) {
    return [];
  }
  let nodes = content ?? fragment.slice.content;
  const path: number[] = [];
  for (let open = fragment.slice.openStart; open > 0; open--) {
    if (nodes.length !== 1 || !NodeApi.isElement(nodes[0])) return [];
    nodes = nodes[0].children;
    path.push(0);
  }
  return nodes.map((node, index) => [node, [...path, index]]);
};

/** Bind a readonly native view to retained content in a mounted markup view. */
export const createAuthoredFragmentView = <TEditor extends Editor>(
  parent: TEditor,
  fragment: NativeAuthoredFragment,
  options: Readonly<{
    retainWhile?: 'document' | 'parent-markup';
  }> = {}
) => {
  const view = createEditorViewRuntime(getEditorRuntimeOwner(parent), {
    authored: { intent: 'edit', projection: 'accepted' },
    readOnly: true,
    root: fragment.root === 'main' ? undefined : fragment.root,
  });
  bindAuthoredFragmentView(view, parent, fragment, options);
  return view as unknown as EditorView<ValueOf<TEditor>, PluginsOf<TEditor>>;
};

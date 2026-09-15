import type {
  AnyEditor as Editor,
  ContentSlice as ContentSliceValue,
  EditorSliceReadOptions,
  Value,
} from '../interfaces/editor';
import { ElementApi } from '../interfaces/element';
import type { Descendant, Node, NodeEntry } from '../interfaces/node';
import { getNodeKeyForNode } from '../utils/node-keys';
import { ContentSlice } from './content-slice';
import { editorReads } from './editor-reads';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { executeEditorRead } from './read-registry';

export const resolveShouldMergeNodesRemovePrevNode = (
  editor: Editor,
  previous: NodeEntry,
  current: NodeEntry,
  applyDefault: () => boolean
) =>
  executeEditorRead(
    editor,
    editorReads.nodes.shouldMergeNodesRemovePrevNode,
    { current, previous },
    applyDefault
  );

export const isEditorNodeSelectable = (editor: Editor, element: Node) =>
  executeEditorRead(
    editor,
    editorReads.nodes.isSelectable,
    {
      element,
      nodeKey: getNodeKeyForNode(element, getEditorRuntimeOwner(editor)),
    },
    ({ element: innerElement }) =>
      getEditorSchema(editor).isSelectable(innerElement)
  );

const closeExportSliceRoots = <V extends Value>(
  editor: Editor<V>,
  slice: ContentSliceValue<V>
): ContentSliceValue<V> => {
  const schema = getEditorSchema(editor);

  if (!schema.hasContentRoots()) return slice;

  const roots: Record<string, readonly Descendant[]> = {};
  const visited = new Set<string>();
  const collect = (children: readonly Descendant[]) => {
    for (const node of children) {
      if (!ElementApi.isElement(node)) continue;

      for (const { root } of schema.getElementOwnedRoots(node)) {
        if (visited.has(root)) continue;
        const rootChildren = slice.roots?.[root];

        if (!rootChildren) {
          throw new Error(`Missing content slice source root "${root}".`);
        }
        visited.add(root);
        roots[root] = rootChildren;
        collect(rootChildren);
      }
      collect(node.children);
    }
  };

  collect(slice.content);
  const sourceRootNames = Object.keys(slice.roots ?? {});

  if (
    visited.size === sourceRootNames.length &&
    sourceRootNames.every((name) => visited.has(name))
  ) {
    return slice;
  }

  return ContentSlice.fromJSON<V>({
    content: slice.content,
    openEnd: slice.openEnd,
    openStart: slice.openStart,
    ...(visited.size > 0 ? { roots } : {}),
  });
};

/** Apply export middleware and close a supplied slice's reachable root graph. */
export const exportContentSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSliceValue<V>,
  options: EditorSliceReadOptions = {},
  source: 'assembled' | 'selection' = 'assembled'
): ContentSliceValue<V> => {
  const projected = ContentSlice.fromJSON<V>(
    executeEditorRead(
      editor,
      editorReads.slice.export,
      { options, slice: input, source },
      ({ slice }) => slice
    )
  );

  return closeExportSliceRoots(editor, projected);
};

export const projectEditorExportSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSliceValue<V>,
  options: EditorSliceReadOptions
): ContentSliceValue<V> =>
  exportContentSlice(editor, input, options, 'selection');

export const projectEditorGetSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSliceValue<V>,
  options: EditorSliceReadOptions
): ContentSliceValue<V> =>
  executeEditorRead(
    editor,
    editorReads.slice.get,
    { options, slice: input },
    ({ slice }) => slice
  ) as ContentSliceValue<V>;

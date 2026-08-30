import type {
  AnyEditor as Editor,
  ContentSlice,
  EditorSliceReadOptions,
  Value,
} from '../interfaces/editor';
import type { Node, NodeEntry } from '../interfaces/node';
import { getNodeKeyForNode } from '../utils/node-keys';
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

export const projectEditorExportSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSlice<V>,
  options: EditorSliceReadOptions
): ContentSlice<V> =>
  executeEditorRead(
    editor,
    editorReads.slice.export,
    { options, slice: input },
    ({ slice }) => slice
  ) as ContentSlice<V>;

export const projectEditorGetSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSlice<V>,
  options: EditorSliceReadOptions
): ContentSlice<V> =>
  executeEditorRead(
    editor,
    editorReads.slice.get,
    { options, slice: input },
    ({ slice }) => slice
  ) as ContentSlice<V>;

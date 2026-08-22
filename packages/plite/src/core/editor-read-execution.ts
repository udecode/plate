import type {
  AnyEditor as Editor,
  ContentSlice,
  Value,
} from '../interfaces/editor';
import type { Node, NodeEntry } from '../interfaces/node';
import { editorReads } from './editor-reads';
import { getEditorSchema } from './editor-runtime';
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
    { element },
    ({ element: innerElement }) =>
      getEditorSchema(editor).isSelectable(innerElement)
  );

export const projectEditorExportSlice = <V extends Value>(
  editor: Editor<V>,
  input: ContentSlice<V>
): ContentSlice<V> =>
  executeEditorRead(
    editor,
    editorReads.slice.export,
    { slice: input },
    ({ slice }) => slice
  ) as ContentSlice<V>;

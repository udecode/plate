import {
  type Node,
  type Path,
  type NodeKey,
  NodeApi as PliteNode,
  type Text as PliteText,
  TextApi,
} from '@platejs/plite';
import {
  type Editor,
  getEditorLiveNode,
  getEditorLiveText,
  getSnapshot as editorGetSnapshot,
  getPathByNodeKey as editorGetPathByNodeKey,
} from './runtime-editor-api';

export type RuntimeNodeBinding = {
  node: Node | null;
  path: Path | null;
  nodeKey: NodeKey | null;
};

const readRuntimeNodeFromView = (editor: Editor, path: Path): Node | null =>
  editor.read((state) => state.nodes.get(path)?.[0] ?? null);

export const readRuntimeNode = (editor: Editor, path: Path): Node | null =>
  getEditorLiveNode(editor, path) ?? readRuntimeNodeFromView(editor, path);

export const readRuntimeText = (
  editor: Editor,
  path: Path
): PliteText | null => {
  const text = getEditorLiveText(editor, path);

  if (text) {
    return text;
  }

  const node = readRuntimeNodeFromView(editor, path);

  return TextApi.isText(node) ? node : null;
};

export const readPathByNodeKey = (
  editor: Editor,
  nodeKey: NodeKey | null
): Path | null => {
  if (!nodeKey) {
    return null;
  }

  return (
    editorGetPathByNodeKey(editor, nodeKey) ??
    editorGetSnapshot(editor).index.pathOf(nodeKey) ??
    null
  );
};

export const readNodeByKey = (
  editor: Editor,
  nodeKey: NodeKey | null
): RuntimeNodeBinding => {
  if (!nodeKey) {
    return { node: null, path: null, nodeKey: null };
  }

  const snapshot = editorGetSnapshot(editor);
  const path = readPathByNodeKey(editor, nodeKey);

  if (!path) {
    return { node: null, path: null, nodeKey };
  }

  const editorRoot = editor as unknown as Node;
  const snapshotRoot = { children: snapshot.children } as unknown as Node;
  const node =
    readRuntimeNode(editor, path) ??
    PliteNode.getIf(editorRoot, path) ??
    PliteNode.getIf(snapshotRoot, path) ??
    null;

  return { node, path, nodeKey };
};

export const readTextByKey = (
  editor: Editor,
  nodeKey: NodeKey | null
): RuntimeNodeBinding & { text: PliteText | null } => {
  const binding = readNodeByKey(editor, nodeKey);

  return {
    ...binding,
    text: binding.node && TextApi.isText(binding.node) ? binding.node : null,
  };
};

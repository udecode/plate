import {
  type Node,
  type Path,
  type RuntimeId,
  NodeApi as PliteNode,
  type Text as PliteText,
  TextApi,
} from '@platejs/plite';
import {
  type Editor,
  getEditorLiveNode,
  getEditorLiveText,
  getSnapshot as editorGetSnapshot,
  getPathByRuntimeId as editorGetPathByRuntimeId,
} from './runtime-editor-api';

export type RuntimeNodeBinding = {
  node: Node | null;
  path: Path | null;
  runtimeId: RuntimeId | null;
};

const readRuntimeNodeFromView = (editor: Editor, path: Path): Node | null =>
  editor.read((state) => {
    if (!state.nodes.hasPath(path)) {
      return null;
    }

    const [node] = state.nodes.get(path);

    return node;
  });

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

export const readRuntimeNodeById = (
  editor: Editor,
  runtimeId: RuntimeId | null
): RuntimeNodeBinding => {
  if (!runtimeId) {
    return { node: null, path: null, runtimeId: null };
  }

  const snapshot = editorGetSnapshot(editor);
  const path =
    editorGetPathByRuntimeId(editor, runtimeId) ??
    snapshot.index.idToPath[runtimeId] ??
    null;

  if (!path) {
    return { node: null, path: null, runtimeId };
  }

  const editorRoot = editor as unknown as Node;
  const snapshotRoot = { children: snapshot.children } as unknown as Node;
  const node =
    readRuntimeNode(editor, path) ??
    PliteNode.getIf(editorRoot, path) ??
    PliteNode.getIf(snapshotRoot, path) ??
    null;

  return { node, path, runtimeId };
};

export const readRuntimeTextById = (
  editor: Editor,
  runtimeId: RuntimeId | null
): RuntimeNodeBinding & { text: PliteText | null } => {
  const binding = readRuntimeNodeById(editor, runtimeId);

  return {
    ...binding,
    text: binding.node && TextApi.isText(binding.node) ? binding.node : null,
  };
};

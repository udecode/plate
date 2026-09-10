import {
  type EditorSnapshot,
  type Element,
  type NodeKey,
  NodeApi,
  type Path,
  type Text,
  TextApi,
} from '../..';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { getSnapshot } from './runtime-editor-api';

type ExternalTextBinding = {
  element: Element;
  path: Path;
  readOnly: boolean;
  snapshot: EditorSnapshot;
  text: Text;
  textKey: NodeKey;
  textPath: Path;
};

// Same-root views share canonical facts, never DOM or view-local read-only state.
const BINDINGS = new WeakMap<
  EditorSnapshot,
  Map<NodeKey, ExternalTextBinding>
>();

export const failTextProjectionConflict: () => never = () => {
  throw new Error(
    'Plite permits only one text projection per element: children or externalText.'
  );
};

export const assertExternalTextElement = (
  editor: ReactRuntimeEditor,
  element: Element
) => {
  const facts = editor.read((state) => state.schema.element(element.type));
  const content = facts?.content;

  if (
    !content ||
    !content.allowsText ||
    content.allowsUnknownElements ||
    content.allowedElementTypes.length !== 0 ||
    content.min !== 1 ||
    content.max !== 1 ||
    facts.behavior.void ||
    facts.behavior.inline ||
    facts.behavior.atom ||
    element.children.length !== 1 ||
    !TextApi.isText(element.children[0])
  ) {
    throw new Error(
      'Plite externalText requires a nonvoid block whose schema permits exactly one Text. Render rich or partially marked children natively.'
    );
  }
};

export const readExternalTextBinding = (
  editor: ReactRuntimeEditor,
  elementKey: NodeKey
) => {
  const snapshot = getSnapshot(editor);
  const bindings = BINDINGS.get(snapshot);
  const cached = bindings?.get(elementKey);
  if (cached) return cached;
  const path = snapshot.index.pathOf(elementKey);
  if (!path) return null;
  const element = editor.read.nodes.get(path)?.[0];
  if (!NodeApi.isElement(element)) return null;
  assertExternalTextElement(editor, element);
  const textPath = [...path, 0] as Path;
  const textKey = snapshot.index.keyAt(textPath);
  if (!textKey) return null;
  const text = element.children[0];
  if (!TextApi.isText(text)) return null;
  const binding = {
    element,
    path,
    readOnly: !!editor.read.nodes.elementReadOnly({ at: textPath }),
    snapshot,
    text,
    textKey,
    textPath,
  };
  if (bindings) bindings.set(elementKey, binding);
  else BINDINGS.set(snapshot, new Map([[elementKey, binding]]));
  return binding;
};

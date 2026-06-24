import {
  above as editorAbove,
  elementReadOnly as editorElementReadOnly,
  getExtensionRegistry as editorGetExtensionRegistry,
  getSnapshot as editorGetSnapshot,
  isBlock as editorIsBlock,
  isInline as editorIsInline,
  void as editorVoid,
} from '@platejs/plite/internal';
import {
  type DescendantIn,
  RangeApi,
  NodeApi as PliteNode,
  type Text,
  type Value,
} from '@platejs/plite';
import {
  applyOperation,
  getEditorCurrentMarks,
  getEditorTransformRegistry,
  setEditorMarks,
} from '@platejs/plite/internal';
import {
  getPlainText,
  getPliteFragmentAttribute,
  isDOMElement,
  isDOMText,
} from '../utils/dom';
import { DOMCoverage } from './dom-coverage';
import { type DOMClipboardInsertDataHandler, DOMEditor } from './dom-editor';

const NEWLINE_SPLIT_RE = /\r\n|\r|\n/;
const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-plite-fragment';
const PLITE_FRAGMENT_FORMAT_ATTRIBUTE = 'data-plite-fragment-format';

const EDITOR_TO_CLIPBOARD_FORMAT_KEY = new WeakMap<object, string>();

const stripRenderOnlyLeafWrappers = (root: ParentNode) => {
  const candidates = Array.from(
    root.querySelectorAll(
      '[data-plite-leaf] span:not([data-plite-string]):not([data-plite-zero-width])'
    )
  );

  candidates.forEach((candidate) => {
    if (candidate.closest('[data-plite-leaf]')) {
      candidate.replaceWith(...Array.from(candidate.childNodes));
    }
  });
};

export const setDOMClipboardFormatKey = (
  editor: object,
  clipboardFormatKey: string
) => {
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.set(editor, clipboardFormatKey);
};

export const getDOMClipboardFormatKey = (editor: object) =>
  EDITOR_TO_CLIPBOARD_FORMAT_KEY.get(editor) ?? DEFAULT_CLIPBOARD_FORMAT_KEY;

const escapeHtmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const escapeHtmlAttribute = (text: string) =>
  escapeHtmlText(text).replaceAll('"', '&quot;');

const getFragmentText = <V extends Value>(
  fragment: readonly DescendantIn<V>[]
) => fragment.map((node) => PliteNode.string(node)).join('\n');

const samePoint = (
  left: { offset: number; path: readonly number[] },
  right: { offset: number; path: readonly number[] }
) =>
  left.offset === right.offset &&
  left.path.length === right.path.length &&
  left.path.every((segment, index) => segment === right.path[index]);

const createPlainTextFallbackText = (
  textNode: Text,
  text: string,
  activeMarks: ReturnType<typeof getEditorCurrentMarks>
) => {
  const next = { ...textNode, text };

  return activeMarks ? { ...next, ...activeMarks } : next;
};

const replaceSingleEmptyBlockWithPlainTextLines = (
  editor: DOMEditor<any>,
  lines: string[],
  activeMarks: ReturnType<typeof getEditorCurrentMarks>
) => {
  const snapshot = editorGetSnapshot(editor);
  const { selection } = snapshot;

  if (
    !selection ||
    !RangeApi.isCollapsed(selection) ||
    snapshot.children.length !== 1 ||
    !samePoint(selection.anchor, { path: [0, 0], offset: 0 })
  ) {
    return false;
  }

  if (
    editorVoid(editor, { at: selection.anchor }) ||
    editorElementReadOnly(editor, { at: selection.anchor })
  ) {
    return false;
  }

  const [block] = snapshot.children;

  if (
    !PliteNode.isElement(block) ||
    block.children.length !== 1 ||
    !PliteNode.isText(block.children[0]) ||
    block.children[0].text !== ''
  ) {
    return false;
  }

  const [textNode] = block.children;
  const lastLine = lines.at(-1) ?? '';
  const newChildren = lines.map((line) => ({
    ...block,
    children: [createPlainTextFallbackText(textNode, line, activeMarks)],
  }));
  const newSelection = {
    anchor: { path: [lines.length - 1, 0], offset: lastLine.length },
    focus: { path: [lines.length - 1, 0], offset: lastLine.length },
  };

  applyOperation(editor, {
    children: snapshot.children,
    index: 0,
    newChildren,
    newSelection,
    path: [],
    selection: snapshot.selection,
    type: 'replace_children',
  });

  return true;
};

const insertPlainTextLinesAsFragment = (
  editor: DOMEditor<any>,
  lines: string[],
  activeMarks: ReturnType<typeof getEditorCurrentMarks>
) => {
  const snapshot = editorGetSnapshot(editor);
  const { selection } = snapshot;

  if (!selection) {
    return false;
  }

  const [start] = RangeApi.edges(selection);

  if (
    editorVoid(editor, { at: start }) ||
    editorElementReadOnly(editor, { at: start })
  ) {
    return false;
  }

  const blockMatch = editorAbove(editor, {
    at: start,
    match: (node) => PliteNode.isElement(node) && editorIsBlock(editor, node),
  });

  if (!blockMatch) {
    return false;
  }

  const [block] = blockMatch;
  const text = PliteNode.get(editor, start.path);

  if (!PliteNode.isElement(block) || !PliteNode.isText(text)) {
    return false;
  }

  const fragment = lines.map((line) => ({
    ...block,
    children: [createPlainTextFallbackText(text, line, activeMarks)],
  }));

  getEditorTransformRegistry(editor).insertFragment(fragment);
  return true;
};

const isSelectedInlineTextRange = (editor: DOMEditor<any>) => {
  const selection = editorGetSnapshot(editor).selection;

  if (!selection || RangeApi.isCollapsed(selection)) {
    return false;
  }

  const [start, end] = RangeApi.edges(selection);

  if (
    start.path.length === 0 ||
    end.path.length === 0 ||
    start.path.length !== end.path.length ||
    !start.path.every((segment, index) => segment === end.path[index])
  ) {
    return false;
  }

  const inlineMatch = editorAbove(editor, {
    at: start,
    match: (node) => PliteNode.isElement(node) && editorIsInline(editor, node),
  });

  if (!inlineMatch) {
    return false;
  }

  const [, inlinePath] = inlineMatch;

  return (
    start.path.length > inlinePath.length &&
    inlinePath.every(
      (segment, index) =>
        start.path[index] === segment && end.path[index] === segment
    )
  );
};

const decodeClipboardFragment = <V extends Value>(
  editor: DOMEditor<V>,
  fragment: string
): DescendantIn<V>[] | null => {
  try {
    const decoded = decodeURIComponent(
      DOMEditor.getWindow(editor).atob(fragment)
    );
    const parsed = JSON.parse(decoded);

    if (Array.isArray(parsed)) {
      return parsed as DescendantIn<V>[];
    }
  } catch {
    return null;
  }

  return null;
};

const writeModelBackedSelectionData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'setData'>,
  clipboardFormatKey: string
) => {
  const fragment = editor.read((state) => state.fragment.get());
  const string = JSON.stringify(fragment);
  const encoded = DOMEditor.getWindow(editor).btoa(encodeURIComponent(string));
  const text = getFragmentText(fragment);

  data.setData(`application/${clipboardFormatKey}`, encoded);
  data.setData('text/plain', text);
  data.setData(
    'text/html',
    `<span data-plite-fragment="${encoded}" ${PLITE_FRAGMENT_FORMAT_ATTRIBUTE}="${escapeHtmlAttribute(clipboardFormatKey)}">${escapeHtmlText(text)}</span>`
  );
};

const getDefaultFragmentAttach = (contents: DocumentFragment) => {
  let attach: ChildNode | null = contents.childNodes[0] ?? null;

  contents.childNodes.forEach((node) => {
    if (node.textContent && node.textContent.trim() !== '') {
      attach = node;
    }
  });

  return attach;
};

export const writeDOMSelectionData = <V extends Value>(
  editor: DOMEditor<V>,
  data: Pick<DataTransfer, 'getData' | 'setData'>
) => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);
  const selection = editor.read((state) => state.selection.get());

  if (!selection) {
    return;
  }

  const [start, end] = RangeApi.edges(selection);
  const startVoid = editorVoid(editor, { at: start.path });
  const endVoid = editorVoid(editor, { at: end.path });

  if (RangeApi.isCollapsed(selection) && !startVoid) {
    return;
  }

  let coveredBoundaries = DOMCoverage.getBoundariesForRange(editor, selection);
  const materializedBoundaryIds = new Set<string>();

  for (const boundary of coveredBoundaries) {
    if (boundary.copyPolicy === 'materialize') {
      const result = DOMCoverage.materializeBoundary(
        editor,
        boundary.boundaryId,
        'copy',
        {
          range: selection,
        }
      );

      if (result.status === 'handled') {
        materializedBoundaryIds.add(boundary.boundaryId);
      }
    }
  }

  if (materializedBoundaryIds.size > 0) {
    coveredBoundaries = DOMCoverage.getBoundariesForRange(editor, selection);
  }

  const hasPolicyBoundaries = coveredBoundaries.length > 0;
  const shouldWriteModelBackedSelection = coveredBoundaries.some(
    (boundary) =>
      boundary.copyPolicy === 'model' ||
      (boundary.copyPolicy === 'materialize' &&
        materializedBoundaryIds.has(boundary.boundaryId))
  );

  if (shouldWriteModelBackedSelection) {
    writeModelBackedSelectionData(editor, data, clipboardFormatKey);
    return;
  }

  // Create a fake selection so that we can add a Base64-encoded copy of the
  // fragment to the HTML, to decode on future pastes.
  const domRange = DOMEditor.resolveDOMRange(editor, selection);

  if (!domRange) {
    if (hasPolicyBoundaries) {
      return;
    }

    writeModelBackedSelectionData(editor, data, clipboardFormatKey);
    return;
  }
  let contents = domRange.cloneContents();
  let attach = getDefaultFragmentAttach(contents);

  // COMPAT: Void selections can be anchored in their hidden spacer DOM. Clone
  // the full void element so external HTML payloads include visible content.
  if (startVoid || endVoid) {
    const r = domRange.cloneRange();

    if (startVoid) {
      const [voidNode] = startVoid;
      const domNode = DOMEditor.assertDOMNode(editor, voidNode);
      r.setStartBefore(domNode);
    }

    if (endVoid) {
      const [voidNode] = endVoid;
      const domNode = DOMEditor.assertDOMNode(editor, voidNode);
      r.setEndAfter(domNode);
    }

    contents = r.cloneContents();
    attach = getDefaultFragmentAttach(contents);
  }

  // COMPAT: If the start node is a void node, we need to attach the encoded
  // fragment to the void node's content node instead of the spacer, because
  // attaching it to empty `<div>/<span>` nodes will end up having it erased by
  // most browsers. (2018/04/27)
  if (startVoid) {
    attach =
      contents.querySelector('[data-plite-spacer]') ??
      contents.querySelector(
        '[data-plite-node="element"], [data-plite-node="text"], [data-plite-string], [data-plite-zero-width]'
      ) ??
      attach;
  }

  // Remove any zero-width space spans from the cloned DOM so that they don't
  // show up elsewhere when pasted.
  Array.from(contents.querySelectorAll('[data-plite-zero-width]')).forEach(
    (zw) => {
      const isNewline = zw.getAttribute('data-plite-zero-width') === 'n';
      zw.textContent = isNewline ? '\n' : '';
    }
  );

  stripRenderOnlyLeafWrappers(contents);

  // Set a `data-plite-fragment` attribute on a non-empty node, so it shows up
  // in the HTML, and can be used for intra-Plite pasting. If it's a text
  // node, wrap it in a `<span>` so we have something to set an attribute on.
  if (isDOMText(attach)) {
    const span = attach.ownerDocument.createElement('span');
    // COMPAT: In Chrome and Safari, if we don't add the `white-space` style
    // then leading and trailing spaces will be ignored. (2017/09/21)
    span.style.whiteSpace = 'pre';
    span.appendChild(attach);
    contents.appendChild(span);
    attach = span;
  }

  let attachElement: Element;

  if (isDOMElement(attach)) {
    attachElement = attach;
  } else {
    const span = contents.ownerDocument.createElement('span');

    if (attach) {
      span.appendChild(attach);
    }

    contents.appendChild(span);
    attachElement = span;
  }

  if (!hasPolicyBoundaries) {
    const fragment = editor.read((state) => state.fragment.get());
    const string = JSON.stringify(fragment);
    const encoded = DOMEditor.getWindow(editor).btoa(
      encodeURIComponent(string)
    );
    attachElement.setAttribute('data-plite-fragment', encoded);
    attachElement.setAttribute(
      PLITE_FRAGMENT_FORMAT_ATTRIBUTE,
      clipboardFormatKey
    );
    data.setData(`application/${clipboardFormatKey}`, encoded);
  }

  // Add the content to a <div> so that we can get its inner HTML.
  const div = contents.ownerDocument.createElement('div');
  div.appendChild(contents);
  div.setAttribute('hidden', 'true');
  contents.ownerDocument.body.appendChild(div);
  data.setData('text/html', div.innerHTML);
  data.setData('text/plain', getPlainText(div));
  contents.ownerDocument.body.removeChild(div);
  return data;
};

export const insertDOMData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean => {
  const handlers = editorGetExtensionRegistry(editor).capabilities.get(
    'clipboard.insertData'
  ) as DOMClipboardInsertDataHandler<V>[] | undefined;

  for (const handler of handlers ?? []) {
    if (handler(editor, data)) {
      return true;
    }
  }

  return insertDOMFragmentData(editor, data) || insertDOMTextData(editor, data);
};

export const readDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): DescendantIn<V>[] | null => {
  const clipboardFormatKey = getDOMClipboardFormatKey(editor);
  const fragment =
    data.getData(`application/${clipboardFormatKey}`) ||
    getPliteFragmentAttribute(data, clipboardFormatKey);

  if (fragment) {
    return decodeClipboardFragment(editor, fragment);
  }

  return null;
};

export const insertDOMFragmentData = <V extends Value>(
  editor: DOMEditor<V>,
  data: DataTransfer
): boolean => {
  const parsed = readDOMFragmentData(editor, data);

  if (parsed) {
    getEditorTransformRegistry(editor).insertFragment(parsed);
    return true;
  }

  return false;
};

export const insertDOMTextData = (
  editor: DOMEditor<any>,
  data: DataTransfer
): boolean => {
  const text = data.getData('text/plain');

  if (text) {
    const lines = text.split(NEWLINE_SPLIT_RE);
    const activeMarks = getEditorCurrentMarks(editor);

    if (
      lines.length === 1 &&
      isSelectedInlineTextRange(editor) &&
      insertPlainTextLinesAsFragment(editor, lines, activeMarks)
    ) {
      if (activeMarks) {
        setEditorMarks(editor, null);
      }
      return true;
    }

    if (
      lines.length > 1 &&
      (replaceSingleEmptyBlockWithPlainTextLines(editor, lines, activeMarks) ||
        insertPlainTextLinesAsFragment(editor, lines, activeMarks))
    ) {
      if (activeMarks) {
        setEditorMarks(editor, null);
      }
      return true;
    }

    const transforms = getEditorTransformRegistry(editor);
    let split = false;

    for (const line of lines) {
      if (split) {
        transforms.splitNodes({ always: true });
      }

      if (activeMarks && line.length > 0) {
        transforms.insertNodes(
          { text: line, ...activeMarks },
          { select: true }
        );
      } else {
        transforms.insertText(line);
      }
      split = true;
    }
    if (activeMarks) {
      setEditorMarks(editor, null);
    }
    return true;
  }
  return false;
};

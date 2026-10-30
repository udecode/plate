import {
  NodeApi,
  type Path,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
} from '../..';
import { containsShadowAware, type DOMPoint, getSelection } from '../../dom';
import { isSoftLineEndBetween } from '../../dom/dom-soft-line-end';
import {
  type DOMSelectionPoints,
  readDOMSelectionPoints,
} from '../../dom/utils/selection-writes';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  above as editorAbove,
  isInline as editorIsInline,
  isVoid as editorIsVoid,
  string as editorString,
} from './runtime-editor-api';

const CHARACTER_DELETES = new Set([
  'deleteContent',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteWordBackward',
  'deleteWordForward',
]);

export type SoftLineEndDelete =
  | Readonly<{ at: Point; kind: 'caret' }>
  | Readonly<{ collapse: Point | null; kind: 'nothing' }>;

const NOTHING: SoftLineEndDelete = { collapse: null, kind: 'nothing' };

const NON_TEXT_CONTENT =
  '[contenteditable="false"], [data-editor="true"], [data-editor-zero-width]';

/**
 * The root's DOM selection when a character or word delete arrives, read
 * before any app callback or flush can move it.
 */
export const captureSoftLineEndDeleteSelection = (
  inputType: string,
  root: HTMLElement | null
): DOMSelectionPoints | null => {
  if (!root || !CHARACTER_DELETES.has(inputType)) return null;
  const selection = getSelection(root.getRootNode() as Document | ShadowRoot);

  return selection ? readDOMSelectionPoints(selection) : null;
};

const samePoint = ([node, offset]: DOMPoint, [other, otherOffset]: DOMPoint) =>
  node === other && offset === otherOffset;

const lowestBlockPath = (editor: ReactRuntimeEditor, path: Path) =>
  editorAbove(editor, {
    at: path,
    match: (node) => NodeApi.isElement(node) && !editorIsInline(editor, node),
  })?.[1];

const insideVoid = (editor: ReactRuntimeEditor, path: Path) =>
  !!editorAbove(editor, {
    at: path,
    match: (node) => NodeApi.isElement(node) && editorIsVoid(editor, node),
  });

const holdsNoCharacter = (editor: ReactRuntimeEditor, range: Range) => {
  if (RangeApi.isCollapsed(range)) return true;
  const [start, end] = RangeApi.edges(range);

  if (
    start.offset !== editorString(editor, start.path).length ||
    end.offset !== 0
  ) {
    return false;
  }
  const block = lowestBlockPath(editor, start.path);
  const endBlock = lowestBlockPath(editor, end.path);

  if (!block || !endBlock || !PathApi.equals(block, endBlock)) return false;
  for (const [text, path] of NodeApi.texts(editor, {
    from: start.path,
    to: end.path,
  })) {
    if (insideVoid(editor, path)) return false;
    if (
      text.text !== '' &&
      !PathApi.equals(path, start.path) &&
      !PathApi.equals(path, end.path)
    ) {
      return false;
    }
  }
  return true;
};

const holdsEditableDOMText = (target: StaticRange) => {
  const range = target.startContainer.ownerDocument?.createRange();

  if (!range) return true;
  try {
    range.setStart(target.startContainer, target.startOffset);
    range.setEnd(target.endContainer, target.endOffset);
  } catch {
    return true;
  }
  const contents = range.cloneContents();

  for (const hidden of contents.querySelectorAll(NON_TEXT_CONTENT)) {
    hidden.remove();
  }
  return (contents.textContent ?? '') !== '';
};

/**
 * Decides a `beforeinput` character or word delete whose target crosses a
 * soft line end and holds no character. Null keeps the target import.
 *
 * The live selection, read as the selection import reads it, must be the
 * target itself or a caret at one of its edges, where the delete then runs.
 */
export const decideSoftLineEndDelete = ({
  editor,
  editorElement,
  inputType,
  liveSelection,
  resolveTarget,
  target,
}: {
  editor: ReactRuntimeEditor;
  editorElement: HTMLElement;
  inputType: string;
  liveSelection: DOMSelectionPoints | null;
  resolveTarget: () => Range | null;
  target: StaticRange;
}): SoftLineEndDelete | null => {
  if (!CHARACTER_DELETES.has(inputType)) return null;
  const start: DOMPoint = [target.startContainer, target.startOffset];
  const end: DOMPoint = [target.endContainer, target.endOffset];

  if (samePoint(start, end) || !isSoftLineEndBetween(start, end)) return null;
  const caretLive =
    !!liveSelection && samePoint(liveSelection.anchor, liveSelection.focus);
  const resolved = resolveTarget();

  if (!resolved) {
    return caretLive || holdsEditableDOMText(target) ? null : NOTHING;
  }
  if (!holdsNoCharacter(editor, resolved)) return null;
  const [from, to] = RangeApi.edges(resolved);

  if (
    !editor.api.dom.resolveDOMRange(resolved) ||
    !liveSelection ||
    !containsShadowAware(editorElement, liveSelection.anchor[0]) ||
    !containsShadowAware(editorElement, liveSelection.focus[0])
  ) {
    return NOTHING;
  }
  const options = { exactMatch: false };
  const anchor = ReactEditor.resolvePoint(
    editor,
    liveSelection.anchor,
    options
  );
  const focus = caretLive
    ? anchor
    : ReactEditor.resolvePoint(editor, liveSelection.focus, options);

  if (!anchor || !focus) return NOTHING;
  if (caretLive) {
    return PointApi.equals(anchor, from) || PointApi.equals(anchor, to)
      ? { at: anchor, kind: 'caret' }
      : NOTHING;
  }
  const [liveFrom, liveTo] = RangeApi.edges({ anchor, focus });

  return PointApi.equals(liveFrom, from) && PointApi.equals(liveTo, to)
    ? { collapse: from, kind: 'nothing' }
    : NOTHING;
};

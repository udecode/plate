import {
  type EditorCommit,
  ElementApi,
  NodeApi,
  type NodeKey,
  type Point,
  type Range,
  PointApi,
  RangeApi,
  TextApi,
} from '../..';
import { EDITOR_TO_PLACEHOLDER_ELEMENT } from '../../dom/internal';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  beginEditableCompositionSession,
  type EditableInputController,
} from './input-state';
import { applyModelOwnedTextInput } from './mutation-controller';
import {
  above,
  getEditorCurrentMarks,
  getNodeKey,
  getPathByNodeKey,
  isBlock,
} from './runtime-editor-api';
import {
  writeRuntimeMarks,
  writeRuntimeSelection,
} from './runtime-mutation-state';
import { readRuntimeSelectionRange } from './runtime-selection-state';

const ZERO_WIDTH_SPACE_RE = /﻿/g;

/** How long a run waits after `compositionend` for the keyboard to start again. */
export const ANDROID_COMPOSITION_END_DELAY = 25;

type Segment = Readonly<{ end: number; key: NodeKey; start: number }>;

/** What the model held when the run opened; the model holds still until it ends. */
type AndroidCompositionBase = Readonly<{
  from: number;
  lineKey: NodeKey;
  marks: ReturnType<typeof getEditorCurrentMarks>;
  nodes: ReadonlySet<Text>;
  segments: readonly Segment[];
  text: string;
  to: number;
}>;

type AndroidCompositionRun = {
  base: AndroidCompositionBase;
  cancelEnd: (() => void) | null;
  release: () => void;
  setComposing: (composing: boolean) => void;
};

type KeyedPoint = Readonly<{ key: NodeKey; offset: number }>;

/** The keyboard's draft, read from the line before anything renders over it. */
type AndroidCompositionDraft = Readonly<{
  lineKey: NodeKey;
  marks: AndroidCompositionBase['marks'];
  rebuild: boolean;
  replacement: Readonly<{
    anchor: KeyedPoint;
    focus: KeyedPoint;
    text: string;
  }> | null;
}>;

export type AndroidCompositionEndReason =
  | 'blur'
  | 'compositionend'
  | 'input'
  | 'keydown'
  | 'pointer'
  | 'selection'
  | 'settle'
  | 'teardown'
  | 'visibility';

const RUNS = new WeakMap<EditableInputController, AndroidCompositionRun>();
const LINE_REBUILDS = new WeakMap<
  EditableInputController,
  (lineKey: NodeKey) => void
>();

// What an edit to the composing line changes; a path change only moves it.
const LINE_CHANGE_KINDS = ['node', 'presence', 'text'] as const;

const COMPOSITION_INPUT_TYPES = new Set([
  'deleteCompositionText',
  'insertCompositionText',
  'insertFromComposition',
]);

export const isAndroidCompositionInputType = (inputType: string) =>
  COMPOSITION_INPUT_TYPES.has(inputType);

/** Lets a run give its line back to React when Chrome changed its nodes. */
export const setAndroidCompositionLineRebuild = (
  inputController: EditableInputController,
  rebuildLine: ((lineKey: NodeKey) => void) | null
) => {
  if (rebuildLine) LINE_REBUILDS.set(inputController, rebuildLine);
  else LINE_REBUILDS.delete(inputController);
};

const readLineTextNodes = (line: Element) => {
  const nodes: Text[] = [];
  const walker = line.ownerDocument.createTreeWalker(
    line,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        node.parentElement?.closest(
          '[contenteditable="false"], [data-editor-placeholder]'
        )
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    }
  );

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node as Text);
  }

  return nodes;
};

// Chrome edits, splits and replaces text nodes while it composes, so the
// line's text is read from every text node in DOM order, not from the nodes
// React rendered.
const readLineText = (line: Element) =>
  readLineTextNodes(line)
    .map((node) => node.data.replace(ZERO_WIDTH_SPACE_RE, ''))
    .join('');

const readLineOffset = (line: Element, node: Node, offset: number) => {
  let total = 0;

  for (const text of readLineTextNodes(line)) {
    if (text === node) {
      return total + text.data.slice(0, offset).replace(ZERO_WIDTH_SPACE_RE, '').length;
    }
    total += text.data.replace(ZERO_WIDTH_SPACE_RE, '').length;
  }

  return line.contains(node) ? total : null;
};

const readLineSegments = (editor: ReactRuntimeEditor, lineKey: NodeKey) => {
  const linePath = getPathByNodeKey(editor, lineKey);
  const lineNode = linePath && editor.read((state) => state.nodes.get(linePath))?.[0];

  if (!linePath || !lineNode || !ElementApi.isElement(lineNode)) return null;

  const segments: Segment[] = [];
  let text = '';

  for (const [node, path] of NodeApi.texts(lineNode)) {
    const key = getNodeKey(editor, [...linePath, ...path]);

    if (!key) return null;
    segments.push({ end: text.length + node.text.length, key, start: text.length });
    text += node.text;
  }

  return { segments, text };
};

const findLine = (editor: ReactRuntimeEditor, selection: Range) =>
  above(editor, {
    at: RangeApi.start(selection),
    match: (node) => ElementApi.isElement(node) && isBlock(editor, node),
  });

const captureBase = (
  editor: ReactRuntimeEditor,
  selection: Range
): AndroidCompositionBase | null => {
  const entry = findLine(editor, selection);

  if (!entry) return null;

  const [, linePath] = entry;
  const lineKey = getNodeKey(editor, linePath);
  const line = lineKey && ReactEditor.resolveDOMNode(editor, lineKey);

  if (!lineKey || !(line instanceof Element)) return null;

  const read = readLineSegments(editor, lineKey);

  if (!read) return null;

  const { segments, text } = read;
  const [start, end] = RangeApi.edges(selection);
  const offsetOf = (point: Point) => {
    const key = getNodeKey(editor, point.path);
    const segment = segments.find((candidate) => candidate.key === key);

    return segment ? segment.start + point.offset : null;
  };
  const from = offsetOf(start);
  const to = offsetOf(end);

  if (from === null || to === null) return null;

  return {
    from,
    lineKey,
    marks: getEditorCurrentMarks(editor),
    nodes: new Set(readLineTextNodes(line)),
    segments,
    text,
    to,
  };
};

const toKeyedPoint = (
  segments: readonly Segment[],
  offset: number
): KeyedPoint | null => {
  const segment =
    segments.find(
      (candidate) => candidate.start <= offset && offset <= candidate.end
    ) ?? segments.at(-1);

  return segment
    ? { key: segment.key, offset: Math.min(offset, segment.end) - segment.start }
    : null;
};

// An edit to the line can land between the read and the write, so the offset
// is clamped to the text as it is now.
const toModelPoint = (
  editor: ReactRuntimeEditor,
  point: KeyedPoint | null
): Point | null => {
  const path = point && getPathByNodeKey(editor, point.key);
  const node = path && editor.read((state) => state.nodes.get(path))?.[0];

  return path && TextApi.isText(node)
    ? { offset: Math.min(point.offset, node.text.length), path }
    : null;
};

/**
 * The one replacement that turns `before` into `after`. A repeated letter
 * lands where the caret was, so the shared prefix stops at the caret and the
 * shared suffix stops at the text after it.
 */
const diffAtCaret = (before: string, after: string, caret: number) => {
  let start = 0;
  const prefixLimit = Math.min(caret, before.length, after.length);

  while (start < prefixLimit && before[start] === after[start]) start += 1;

  let suffix = 0;
  const suffixLimit = Math.min(
    before.length - Math.max(start, caret),
    after.length - start
  );

  while (
    suffix < suffixLimit &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const end = before.length - suffix;
  const text = after.slice(start, after.length - suffix);

  return start === end && text === '' ? null : { end, start, text };
};

// The user left the draft: the caret moved off the line, focus or the page
// went away, or a press landed outside the editor. Selection listens in the
// capture phase so the run ends before the selection import reads the caret.
const listenForLeave = (
  editor: ReactRuntimeEditor,
  lineKey: NodeKey,
  end: (reason: AndroidCompositionEndReason) => void
) => {
  const root = ReactEditor.assertDOMNode(editor, editor);
  const document = root.ownerDocument;
  const onSelectionChange = () => {
    const line = ReactEditor.resolveDOMNode(editor, lineKey);
    const selection = document.getSelection();

    if (
      line &&
      !(
        selection?.anchorNode &&
        !(line.contains(selection.anchorNode) && line.contains(selection.focusNode))
      )
    ) {
      return;
    }

    // The word's commit puts the caret after it, so the caret the user moved
    // to is read first and put back.
    const moved =
      selection?.rangeCount &&
      ReactEditor.resolveRange(editor, selection, { exactMatch: false });

    end('selection');
    if (moved) editor.update((tx) => tx.selection.set(moved));
  };
  const onFocusOut = () => end('blur');
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') end('visibility');
  };
  const onPointerDown = (event: PointerEvent) => {
    if (!(event.target instanceof Node && root.contains(event.target))) {
      end('pointer');
    }
  };

  document.addEventListener('selectionchange', onSelectionChange, true);
  document.addEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('pointerdown', onPointerDown, true);
  root.addEventListener('focusout', onFocusOut);

  return () => {
    document.removeEventListener('selectionchange', onSelectionChange, true);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('pointerdown', onPointerDown, true);
    root.removeEventListener('focusout', onFocusOut);
  };
};

// The model stays empty while the keyboard drafts into an empty editor, so
// the placeholder would show over the draft.
const hidePlaceholder = (editor: ReactRuntimeEditor) => {
  const placeholder = EDITOR_TO_PLACEHOLDER_ELEMENT.get(editor);

  if (!placeholder) return () => {};

  const { display } = placeholder.style;

  placeholder.style.display = 'none';

  return () => {
    placeholder.style.display = display;
  };
};

export const hasAndroidComposition = (inputController: EditableInputController) =>
  RUNS.has(inputController);

/**
 * Opens an Android composition run, or continues the open one. The model
 * holds still until the run ends, so nothing redraws the keyboard's draft.
 */
export const openAndroidComposition = ({
  editor,
  inputController,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  setComposing: (composing: boolean) => void;
}) => {
  const open = RUNS.get(inputController);

  if (open) {
    open.cancelEnd?.();
    open.cancelEnd = null;
    return;
  }

  const selection = readRuntimeSelectionRange(editor);

  const base = selection && captureBase(editor, selection);

  // A base holds one line, so a selection across lines is deleted first, as
  // desktop composition does at its start. The run opens at the next
  // composition event, once the joined line has rendered.
  if (!base) {
    if (selection && RangeApi.isExpanded(selection)) {
      editor.update((tx) => tx.text.delete({ at: selection }));
    }
    return;
  }

  const end = (reason: AndroidCompositionEndReason) =>
    finishAndroidComposition({ editor, inputController, reason, setComposing });
  const releaseCommits = editor.subscribeCommit((commit) => {
    if (RUNS.get(inputController) === run && touchesLine(commit, base)) {
      endOnLineEdit(editor, inputController, run);
    }
  });
  const releaseLeave = listenForLeave(editor, base.lineKey, end);
  const showPlaceholder = hidePlaceholder(editor);
  const run: AndroidCompositionRun = {
    base,
    cancelEnd: null,
    release: () => {
      releaseCommits();
      releaseLeave();
      showPlaceholder();
    },
    setComposing,
  };

  RUNS.set(inputController, run);
  beginEditableCompositionSession(inputController, {
    nativeAnchor: ReactEditor.resolveDOMNode(editor, base.lineKey),
  });
  inputController.state.activeIntent = 'composition';
  setComposing(true);
};

/** Ends the run after the keyboard's quiet period, unless it starts again. */
export const scheduleAndroidCompositionEnd = ({
  delay,
  editor,
  inputController,
  scheduleTask,
  setComposing,
}: {
  delay: number;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  scheduleTask: EditableInputController['scheduleTask'];
  setComposing: (composing: boolean) => void;
}) => {
  const run = RUNS.get(inputController);

  if (!run || !scheduleTask) return;

  run.cancelEnd?.();
  run.cancelEnd = scheduleTask(
    'model',
    'android-composition-end',
    () => {
      run.cancelEnd = null;
      finishAndroidComposition({
        editor,
        inputController,
        reason: 'compositionend',
        setComposing,
      });
    },
    { delay, key: 'android-composition-end', timing: 'timeout' }
  );
};

const touchesLine = (commit: EditorCommit, base: AndroidCompositionBase) =>
  commit.changed.hasAny('replace') ||
  [base.lineKey, ...base.segments.map((segment) => segment.key)].some((key) =>
    LINE_CHANGE_KINDS.some((kind) => commit.changed.hasNodeKey(key, kind))
  );

const closeRun = (
  inputController: EditableInputController,
  run: AndroidCompositionRun
) => {
  RUNS.delete(inputController);
  run.cancelEnd?.();
  run.release();
};

const readDraft = (
  editor: ReactRuntimeEditor,
  base: AndroidCompositionBase
): AndroidCompositionDraft => {
  const line = ReactEditor.resolveDOMNode(editor, base.lineKey);

  if (!(line instanceof Element)) {
    return { lineKey: base.lineKey, marks: base.marks, rebuild: true, replacement: null };
  }

  const diff = diffAtCaret(base.text, readLineText(line), base.to);
  const anchor = diff && toKeyedPoint(base.segments, diff.start);
  const focus = diff && toKeyedPoint(base.segments, diff.end);
  const nodes = readLineTextNodes(line);

  return {
    lineKey: base.lineKey,
    marks: base.marks,
    // Chrome added, split or removed text nodes or text hosts that React
    // still owns, so the line renders again from the model.
    rebuild:
      nodes.some((node) => !base.nodes.has(node)) ||
      [...base.nodes].some((node) => !node.isConnected) ||
      base.segments.some((segment) => {
        const host = ReactEditor.resolveDOMNode(editor, segment.key);

        return !host || !line.contains(host);
      }),
    replacement: diff && anchor && focus ? { anchor, focus, text: diff.text } : null,
  };
};

const writeDraft = (
  editor: ReactRuntimeEditor,
  inputController: EditableInputController,
  { marks, replacement }: AndroidCompositionDraft
) => {
  const anchor = replacement && toModelPoint(editor, replacement.anchor);
  const focus = replacement && toModelPoint(editor, replacement.focus);

  // An editor root that unmounts makes its view read-only before the
  // editable's cleanup runs, so that draft goes with the view.
  if (!replacement || !anchor || !focus || editor.read.view.isReadOnly()) {
    return;
  }
  // An insert at an explicit point drops the pending marks, so a collapsed
  // replacement moves the caret there and inserts at the selection.
  const collapsed = PointApi.equals(anchor, focus);
  const selection = readRuntimeSelectionRange(editor);

  if (
    collapsed &&
    !(selection && RangeApi.equals(selection, { anchor, focus }))
  ) {
    writeRuntimeSelection(editor, { anchor, focus });
  }
  if (marks) writeRuntimeMarks(editor, marks);

  // The DOM caret sits after the draft, so the insert resolves its target
  // from the model selection, as a replayed Android command does.
  const replaying = inputController.state.isReplayingAndroidCommand;

  inputController.state.isReplayingAndroidCommand = true;
  try {
    applyModelOwnedTextInput({
      data: replacement.text,
      editor,
      inputController,
      inputType: 'insertFromComposition',
      selection: collapsed ? undefined : { anchor, focus },
    });
  } finally {
    inputController.state.isReplayingAndroidCommand = replaying;
  }
};

// A handler that rewrote or rejected the word leaves the line's DOM showing
// what the keyboard typed, so it renders again from the model.
const rebuildDraftLine = (
  editor: ReactRuntimeEditor,
  inputController: EditableInputController,
  draft: AndroidCompositionDraft
) => {
  const line = ReactEditor.resolveDOMNode(editor, draft.lineKey);
  const model = readLineSegments(editor, draft.lineKey)?.text;

  if (draft.rebuild || !line || readLineText(line) !== model) {
    LINE_REBUILDS.get(inputController)?.(draft.lineKey);
  }
};

// An app or remote edit reached the composing line. The draft is read before
// that commit renders, and written once the update that made it, such as a Yjs
// import, has returned, so the word goes out as an ordinary local commit.
const endOnLineEdit = (
  editor: ReactRuntimeEditor,
  inputController: EditableInputController,
  run: AndroidCompositionRun
) => {
  closeRun(inputController, run);

  const draft = readDraft(editor, run.base);

  run.setComposing(false);
  inputController.scheduleTask?.(
    'model',
    'android-composition-line-edit',
    () => {
      writeDraft(editor, inputController, draft);
      rebuildDraftLine(editor, inputController, draft);
    },
    { timing: 'microtask' }
  );
};

/**
 * Ends the open run: reads the composed text from the line, commits it to the
 * model in one command and gives the line back to React. Idempotent.
 */
export const finishAndroidComposition = ({
  editor,
  inputController,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  reason: AndroidCompositionEndReason;
  setComposing: (composing: boolean) => void;
}) => {
  const run = RUNS.get(inputController);

  if (!run) return;

  closeRun(inputController, run);

  const draft = readDraft(editor, run.base);

  writeDraft(editor, inputController, draft);
  setComposing(false);
  rebuildDraftLine(editor, inputController, draft);
};

/**
 * A non-composition input ends the open run before anything resolves its
 * target. Its native target is mapped through the line's own text, because
 * the text-flow index still describes the line from before the run.
 */
export const settleAndroidCompositionBeforeInput = ({
  editor,
  event,
  inputController,
  setComposing,
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  inputController: EditableInputController;
  setComposing: (composing: boolean) => void;
}) => {
  if (isAndroidCompositionInputType(event.inputType)) {
    openAndroidComposition({ editor, inputController, setComposing });
    return;
  }

  const run = RUNS.get(inputController);

  if (!run) return;

  const line = ReactEditor.resolveDOMNode(editor, run.base.lineKey);
  const [range] =
    typeof event.getTargetRanges === 'function' ? event.getTargetRanges() : [];
  const offsets =
    line instanceof Element && range
      ? [
          readLineOffset(line, range.startContainer, range.startOffset),
          readLineOffset(line, range.endContainer, range.endOffset),
        ]
      : null;

  finishAndroidComposition({
    editor,
    inputController,
    reason: 'input',
    setComposing,
  });

  const read = readLineSegments(editor, run.base.lineKey);

  if (!read || !offsets || offsets[0] === null || offsets[1] === null) return;

  const anchor = toModelPoint(editor, toKeyedPoint(read.segments, offsets[0]));
  const focus = toModelPoint(editor, toKeyedPoint(read.segments, offsets[1]));

  inputController.state.androidCompositionTarget =
    anchor && focus ? { anchor, focus } : null;
};

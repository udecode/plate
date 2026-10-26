import {
  type Anchor,
  type EditorCommit,
  ElementApi,
  NodeApi,
  type NodeKey,
  type Point,
  type Range,
  RangeApi,
  SelectionApi,
  TextApi,
} from '../..';
import {
  getEditorCommitSnapshot,
  getEditorCommitValue,
} from '../../core/commit';
import { mapSelectionThroughChange } from '../../core/selection-protocol';
import { getSelection } from '../../dom';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import {
  beginEditableCompositionSession,
  type EditableInputController,
} from './input-state';
import { applyModelOwnedTextInput } from './mutation-controller';
import {
  getEditorCurrentMarks,
  getNodeKey,
  getPathByNodeKey,
} from './runtime-editor-api';
import { readRuntimeSelectionRange } from './runtime-selection-state';

const ZERO_WIDTH_SPACE_RE = /﻿/g;

/** How long a run waits after `compositionend` for the keyboard to start again. */
export const ANDROID_COMPOSITION_END_DELAY = 25;

type Segment = Readonly<{ end: number; key: NodeKey; start: number }>;

type AndroidCompositionDOMPlacement = Readonly<{
  element: Element;
  parent: ParentNode;
  next: ChildNode | null;
}>;

type AndroidCompositionLine = Readonly<{
  key: NodeKey;
  element: Element;
  placements: readonly AndroidCompositionDOMPlacement[];
}>;

/** What the model held when the run opened; the model holds still until it ends. */
type AndroidCompositionBase = Readonly<{
  backward: boolean;
  end: KeyedPoint;
  from: number;
  lineKey: NodeKey;
  lines: readonly AndroidCompositionLine[];
  target: Anchor<Range>;
  marks: ReturnType<typeof getEditorCurrentMarks>;
  nodes: ReadonlySet<Text>;
  segments: readonly Segment[];
  start: KeyedPoint;
  text: string;
  to: number;
}>;

type AndroidCompositionRun = {
  base: AndroidCompositionBase;
  cancelEnd: (() => void) | null;
  text: string | null | undefined;
  release: () => void;
  setComposing: (composing: boolean) => void;
};

type KeyedPoint = Readonly<{ key: NodeKey; offset: number }>;

/** The keyboard's draft, read from the line before anything renders over it. */
type AndroidCompositionDraft = Readonly<{
  lineKey: NodeKey;
  lineKeys: readonly NodeKey[];
  textKeys: readonly NodeKey[];
  marks: AndroidCompositionBase['marks'];
  rebuild: boolean;
  replacement: Readonly<{
    target: Anchor<Range>;
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
  {
    rebuildLine: (lineKey: NodeKey) => void;
    runOwnedDOMMutation: (callback: () => void) => void;
    pending: Set<() => void>;
  }
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
  rebuildLine: ((lineKey: NodeKey) => void) | null,
  runOwnedDOMMutation: (callback: () => void) => void = (callback) => callback()
) => {
  for (const complete of LINE_REBUILDS.get(inputController)?.pending ?? []) {
    complete();
  }
  if (rebuildLine) {
    LINE_REBUILDS.set(inputController, {
      rebuildLine,
      runOwnedDOMMutation,
      pending: new Set(),
    });
  } else LINE_REBUILDS.delete(inputController);
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
const readLineTextParts = (line: Element) => {
  const parts = readLineTextNodes(line).map((node) => ({
    node,
    text: node.data.replace(ZERO_WIDTH_SPACE_RE, ''),
  }));

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];

    if (part.text === '') continue;
    if (
      part.text.endsWith('\n') &&
      part.node.parentElement?.closest(
        '[data-editor-string][data-editor-length]'
      )
    ) {
      part.text = part.text.slice(0, -1);
    }
    break;
  }

  return parts;
};

const readLineText = (line: Element) =>
  readLineTextParts(line)
    .map(({ text }) => text)
    .join('');

const readLineOffset = (line: Element, node: Node, offset: number) => {
  let total = 0;

  for (const part of readLineTextParts(line)) {
    if (part.node === node) {
      return (
        total +
        Math.min(
          part.node.data.slice(0, offset).replace(ZERO_WIDTH_SPACE_RE, '')
            .length,
          part.text.length
        )
      );
    }
    total += part.text.length;
  }

  return line.contains(node) ? total : null;
};

const readLineSegments = (editor: ReactRuntimeEditor, lineKey: NodeKey) => {
  const linePath = getPathByNodeKey(editor, lineKey);
  const lineNode =
    linePath && editor.read((state) => state.nodes.get(linePath))?.[0];

  if (!linePath || !lineNode || !ElementApi.isElement(lineNode)) return null;

  const segments: Segment[] = [];
  let text = '';

  for (const [node, path] of NodeApi.texts(lineNode)) {
    const key = getNodeKey(editor, [...linePath, ...path]);

    if (!key) return null;
    segments.push({
      end: text.length + node.text.length,
      key,
      start: text.length,
    });
    text += node.text;
  }

  return { segments, text };
};

const captureBase = (
  editor: ReactRuntimeEditor,
  selection: Range
): AndroidCompositionBase | null => {
  const entries = editor.read((state) =>
    state.nodes.blocks({ at: selection, mode: 'lowest' })
  );
  const lines: AndroidCompositionLine[] = [];
  const segments: Segment[] = [];
  const nodes = new Set<Text>();
  const root = ReactEditor.editable(editor);

  if (!root) return null;
  let text = '';

  for (const [, path] of entries) {
    const key = getNodeKey(editor, path);
    const element = key && ReactEditor.resolveDOMNode(editor, key);
    const read = key && readLineSegments(editor, key);

    if (
      !key ||
      !(element instanceof Element) ||
      !root.contains(element) ||
      !read
    ) {
      return null;
    }
    const placements: AndroidCompositionDOMPlacement[] = [];

    for (
      let ancestor: Element | null = element;
      ancestor && ancestor !== root;
      ancestor = ancestor.parentElement
    ) {
      if (!ancestor.parentNode) return null;
      placements.push({
        element: ancestor,
        parent: ancestor.parentNode,
        next: ancestor.nextSibling,
      });
    }
    lines.push({
      key,
      element,
      placements,
    });
    for (const segment of read.segments) {
      segments.push({
        ...segment,
        start: segment.start + text.length,
        end: segment.end + text.length,
      });
    }
    text += read.text;
    for (const node of readLineTextNodes(element)) nodes.add(node);
  }

  const lineKey = lines[0]?.key;
  if (!lineKey) return null;
  const [start, end] = RangeApi.edges(selection);
  const readPoint = (point: Point) => {
    const key = getNodeKey(editor, point.path);
    const segment = segments.find((candidate) => candidate.key === key);

    return segment
      ? {
          offset: segment.start + point.offset,
          point: { key: segment.key, offset: point.offset },
        }
      : null;
  };
  const from = readPoint(start);
  const to = readPoint(end);

  if (from === null || to === null) return null;

  return {
    backward: RangeApi.isBackward(selection),
    end: to.point,
    from: from.offset,
    lineKey,
    lines,
    target: editor.anchor(selection, {
      association: 'inward',
      deletion: 'nearest',
    }),
    marks: getEditorCurrentMarks(editor),
    nodes,
    segments,
    start: from.point,
    text,
    to: to.offset,
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
    ? {
        key: segment.key,
        offset: Math.min(offset, segment.end) - segment.start,
      }
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
const diffAtCaret = (
  before: string,
  after: string,
  from: number,
  to: number,
  replaceUnchanged: boolean
) => {
  if (before === after && !replaceUnchanged) return null;
  let start = 0;
  const prefixLimit = Math.min(from, before.length, after.length);

  while (start < prefixLimit && before[start] === after[start]) start += 1;

  let suffix = 0;
  const suffixLimit = Math.min(
    before.length - Math.max(start, to),
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
  lines: AndroidCompositionBase['lines'],
  end: (reason: AndroidCompositionEndReason) => void
) => {
  const root = ReactEditor.editable(editor);

  if (!root) return () => {};
  const document = root.ownerDocument;
  const onSelectionChange = () => {
    const selection = getSelection(root.getRootNode() as Document | ShadowRoot);

    if (
      selection?.anchorNode &&
      lines.some(({ element }) => element.contains(selection.anchorNode)) &&
      lines.some(({ element }) => element.contains(selection.focusNode))
    ) {
      return;
    }

    // The word's commit puts the caret after it, so the caret the user moved
    // to is read first and put back.
    const moved = selection?.rangeCount
      ? ReactEditor.resolveRange(editor, selection, { exactMatch: false })
      : null;
    const target = moved ? editor.anchor(moved, { deletion: 'nearest' }) : null;

    try {
      end('selection');
      const range = target?.resolve();

      if (range) editor.update((tx) => tx.selection.set(range));
    } finally {
      target?.release();
    }
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

export const hasAndroidComposition = (
  inputController: EditableInputController
) => RUNS.has(inputController);

/**
 * Opens an Android composition run, or continues the open one. The model
 * holds still until the run ends, so nothing redraws the keyboard's draft.
 */
export const openAndroidComposition = ({
  editor,
  inputController,
  setComposing,
  text,
}: {
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  setComposing: (composing: boolean) => void;
  text?: string | null;
}) => {
  const open = RUNS.get(inputController);

  if (open) {
    if (text !== undefined) open.text = text;
    open.cancelEnd?.();
    open.cancelEnd = null;
    return;
  }

  const selection = readRuntimeSelectionRange(editor);

  const base = selection && captureBase(editor, selection);

  if (!base) return;

  const end = (reason: AndroidCompositionEndReason) =>
    finishAndroidComposition({ editor, inputController, reason, setComposing });
  const releaseCommits = editor.subscribeCommit((commit) => {
    if (RUNS.get(inputController) === run && touchesLine(commit, base)) {
      endOnLineEdit(editor, inputController, run, commit);
    }
  });
  const releaseLeave = listenForLeave(editor, base.lines, end);
  const run: AndroidCompositionRun = {
    base,
    cancelEnd: null,
    text,
    release: () => {
      releaseCommits();
      releaseLeave();
      base.target.release();
    },
    setComposing,
  };

  RUNS.set(inputController, run);
  beginEditableCompositionSession(inputController, {
    nativeAnchor: base.lines.map(({ element }) => element),
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
  text,
}: {
  delay: number;
  editor: ReactRuntimeEditor;
  inputController: EditableInputController;
  scheduleTask: EditableInputController['scheduleTask'];
  setComposing: (composing: boolean) => void;
  text: string | undefined;
}) => {
  const run = RUNS.get(inputController);

  if (!run || !scheduleTask) return;

  run.text = text;
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
  [
    ...base.lines.map(({ key }) => key),
    ...base.segments.map((segment) => segment.key),
  ].some((key) =>
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
  run: AndroidCompositionRun,
  commit?: EditorCommit
): AndroidCompositionDraft => {
  const { base } = run;
  const root = editor.read.view.root() ?? 'main';
  const before = commit && getEditorCommitSnapshot(commit, root, 'before');
  const readPoint = (point: KeyedPoint | null): Point | null => {
    if (!before) return toModelPoint(editor, point);

    const path = point && before.index.pathOf(point.key);

    return point && path ? { offset: point.offset, path } : null;
  };
  const liveLines = base.lines.filter(({ element }) => element.isConnected);
  const removedLine = liveLines.length < base.lines.length;
  const diff =
    diffAtCaret(
      base.text,
      liveLines.map(({ element }) => readLineText(element)).join(''),
      base.from,
      base.to,
      !!run.text || removedLine
    ) ?? (removedLine ? { end: base.to, start: base.from, text: '' } : null);
  const target = commit ? null : base.target.resolve();
  const edges = before
    ? [readPoint(base.start), readPoint(base.end)]
    : target && RangeApi.edges(target);
  const start =
    diff &&
    (diff.start === base.from && edges
      ? edges[0]
      : readPoint(toKeyedPoint(base.segments, diff.start)));
  const end =
    diff &&
    (diff.end === base.to && edges
      ? edges[1]
      : readPoint(toKeyedPoint(base.segments, diff.end)));
  const nodes = liveLines.flatMap(({ element }) => readLineTextNodes(element));
  const range =
    start && end
      ? {
          anchor: base.backward ? end : start,
          focus: base.backward ? start : end,
        }
      : null;
  const mapped = commit
    ? mapSelectionThroughChange(
        editor,
        range && SelectionApi.text(range),
        commit.changes,
        getEditorCommitValue(commit, 'before'),
        getEditorCommitValue(commit, 'after'),
        root,
        {
          association: 'inward',
          deletion: 'nearest',
          runtimeIndexes: {
            before: getEditorCommitSnapshot(commit, root, 'before').index,
            after: getEditorCommitSnapshot(commit, root, 'after').index,
          },
        }
      )
    : range;

  return {
    lineKey: base.lineKey,
    lineKeys: base.lines.map(({ key }) => key),
    textKeys: base.segments.map(({ key }) => key),
    marks: base.marks,
    // Chrome added, split or removed text nodes or text hosts that React
    // still owns, so the line renders again from the model.
    rebuild:
      base.lines.length > 1 ||
      nodes.some((node) => !base.nodes.has(node)) ||
      [...base.nodes].some((node) => !node.isConnected) ||
      base.segments.some((segment) => {
        const host = ReactEditor.resolveDOMNode(editor, segment.key);

        return (
          !host || !liveLines.some(({ element }) => element.contains(host))
        );
      }),
    replacement:
      diff && RangeApi.isRange(mapped)
        ? {
            target: editor.anchor(
              { anchor: mapped.anchor, focus: mapped.focus },
              { association: 'inward', deletion: 'nearest' }
            ),
            text: diff.text,
          }
        : null,
  };
};

const restoreLineElements = (
  editor: ReactRuntimeEditor,
  base: AndroidCompositionBase
) => {
  for (const { key, placements } of [...base.lines].reverse()) {
    if (!getPathByNodeKey(editor, key)) continue;

    for (const { element, next, parent } of [...placements].reverse()) {
      if (!element.isConnected && parent.isConnected) {
        if (next?.parentNode === parent) next.before(element);
        else parent.append(element);
      }
    }
  }
};

const writeDraft = (
  editor: ReactRuntimeEditor,
  inputController: EditableInputController,
  { lineKey, marks, replacement }: AndroidCompositionDraft
) => {
  const target = replacement?.target.release();

  // A root that unmounts makes its view read-only before editable cleanup.
  if (
    !replacement ||
    !target ||
    editor.read.view.isReadOnly() ||
    !getPathByNodeKey(editor, lineKey)
  ) {
    return;
  }

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
      marks,
      selection: target,
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
  const lines = draft.lineKeys.map((key) => ({
    key,
    model: readLineSegments(editor, key),
  }));
  const textKeys = lines.flatMap(
    ({ model }) => model?.segments.map(({ key }) => key) ?? []
  );
  const changedTextKeys =
    textKeys.length !== draft.textKeys.length ||
    textKeys.some((key, index) => key !== draft.textKeys[index]);
  for (const { key, model } of lines) {
    if (!model) continue;
    const line = ReactEditor.resolveDOMNode(editor, key);

    if (
      draft.rebuild ||
      changedTextKeys ||
      !line ||
      readLineText(line) !== model.text
    ) {
      LINE_REBUILDS.get(inputController)?.rebuildLine(key);
    }
  }
};

// An app or remote edit reached the composing line. The draft is read before
// that commit renders, and written once the update that made it, such as a Yjs
// import, has returned, so the word goes out as an ordinary local commit.
const endOnLineEdit = (
  editor: ReactRuntimeEditor,
  inputController: EditableInputController,
  run: AndroidCompositionRun,
  commit: EditorCommit
) => {
  const draft = readDraft(editor, run, commit);

  closeRun(inputController, run);
  LINE_REBUILDS.get(inputController)?.runOwnedDOMMutation(() =>
    restoreLineElements(editor, run.base)
  );

  run.setComposing(false);
  const registration = LINE_REBUILDS.get(inputController);
  if (!inputController.scheduleTask || !registration) {
    draft.replacement?.target.release();
    return;
  }
  const complete = () => {
    if (!registration.pending.delete(complete)) return;

    cancel();
    try {
      writeDraft(editor, inputController, draft);
    } finally {
      rebuildDraftLine(editor, inputController, draft);
    }
  };
  const cancel = inputController.scheduleTask(
    'model',
    'android-composition-line-edit',
    complete,
    { timing: 'microtask' }
  );
  registration.pending.add(complete);
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
  for (const complete of LINE_REBUILDS.get(inputController)?.pending ?? []) {
    complete();
  }

  const run = RUNS.get(inputController);

  if (!run) return;

  const draft = readDraft(editor, run);

  closeRun(inputController, run);
  LINE_REBUILDS.get(inputController)?.runOwnedDOMMutation(() =>
    restoreLineElements(editor, run.base)
  );

  try {
    writeDraft(editor, inputController, draft);
  } finally {
    setComposing(false);
    rebuildDraftLine(editor, inputController, draft);
  }
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
}): Range | null => {
  if (isAndroidCompositionInputType(event.inputType)) {
    openAndroidComposition({
      editor,
      inputController,
      setComposing,
      text: event.data,
    });
    return null;
  }

  const run = RUNS.get(inputController);

  if (!run) return null;

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

  if (!read || !offsets || offsets[0] === null || offsets[1] === null) {
    return null;
  }

  const anchor = toModelPoint(editor, toKeyedPoint(read.segments, offsets[0]));
  const focus = toModelPoint(editor, toKeyedPoint(read.segments, offsets[1]));

  return anchor && focus ? { anchor, focus } : null;
};

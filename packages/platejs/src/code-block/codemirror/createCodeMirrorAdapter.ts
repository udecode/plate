'use client';

import { forceParsing } from '@codemirror/language';
import {
  Annotation,
  ChangeSet,
  Compartment,
  EditorSelection,
  EditorState,
  findClusterBreak,
  StateEffect,
  StateField,
  type Extension,
  type SelectionRange,
  type Transaction,
  type TransactionSpec,
} from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  keymap,
} from '@codemirror/view';

import type {
  ExternalTextActions,
  ExternalTextAdapter,
  ExternalTextChange,
  ExternalTextDecoration,
  ExternalTextSelection,
  ExternalTextSelectionState,
  ExternalTextState,
} from '../../react/core';

type CodeBlockCodeMirrorConfig = Readonly<{
  language?: string;
}>;

type CodeMirrorExternalTextUpdate = Readonly<{
  changes: readonly ExternalTextChange[] | null;
  state: ExternalTextState<CodeBlockCodeMirrorConfig>;
}>;

const INITIAL_PARSE_BUDGET_MS = 100;

const appliedByAdapter = Annotation.define<boolean>();
const replaceDecorations = StateEffect.define<DecorationSet>();
const decorationField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  provide: (field) => EditorView.decorations.from(field),
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(replaceDecorations)) return effect.value;
    }

    return value.map(transaction.changes);
  },
});
const replaceModelSelection = StateEffect.define<DecorationSet>();
const modelSelectionField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  provide: (field) => EditorView.decorations.from(field),
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(replaceModelSelection)) return effect.value;
    }

    return value.map(transaction.changes);
  },
});
const modelSelectionDecoration = (
  selection: ExternalTextSelectionState | null
) => {
  if (selection?.mode !== 'model' || selection.anchor === selection.focus) {
    return Decoration.none;
  }

  return Decoration.set([
    Decoration.mark({
      attributes: { 'data-code-block-model-selection': '' },
    }).range(
      Math.min(selection.anchor, selection.focus),
      Math.max(selection.anchor, selection.focus)
    ),
  ]);
};
const getIntent = (
  transactions: readonly Transaction[],
  composing: boolean
): Parameters<ExternalTextActions['dispatch']>[0]['intent'] => {
  const has = (event: string) =>
    transactions.some((transaction) => transaction.isUserEvent(event));

  if (composing || has('input.type.compose')) return 'composition';
  if (has('input.paste')) return 'paste';
  if (has('delete.cut')) return 'cut';
  if (has('input.drop') || has('move.drop')) return 'drop';

  return 'input';
};

const writeSelection = (
  view: EditorView,
  selection: ExternalTextSelection,
  goalX?: number
) => {
  const current = view.state.selection.main;

  if (
    goalX === undefined &&
    current.anchor === selection.anchor &&
    current.head === selection.focus
  ) {
    return false;
  }
  view.dispatch({
    annotations: appliedByAdapter.of(true),
    filter: false,
    scrollIntoView: goalX !== undefined,
    selection: EditorSelection.create([
      EditorSelection.range(
        selection.anchor,
        selection.focus,
        // CodeMirror keeps the goal column relative to the content's left edge.
        goalX === undefined
          ? undefined
          : goalX - view.contentDOM.getBoundingClientRect().left
      ),
    ]),
  });

  return true;
};

const RIGHT_TO_LEFT =
  /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC\u200F\u202B\u202E\u2067\u{10800}-\u{10FFF}\u{1E800}-\u{1EFFF}]/u;

const textCaretOnSide = (view: EditorView, offset: number, side: -1 | 1) => {
  let { node, offset: domOffset } = view.domAtPos(offset, side);

  while (node.nodeType === 1) {
    const after = node.childNodes[domOffset];
    if (after) {
      node = after;
      domOffset = 0;
      continue;
    }
    const before = node.childNodes[domOffset - 1];
    if (!before) return null;
    node = before;
    domOffset =
      before.nodeType === 3
        ? (before as Text).length
        : before.childNodes.length;
  }
  const widget = node.parentElement?.closest('[contenteditable="false"]');
  const walkedPastWidget = view.posAtDOM(node, domOffset) !== offset;
  if (
    node.nodeType !== 3 ||
    (widget &&
      widget !== view.contentDOM &&
      view.contentDOM.contains(widget)) ||
    walkedPastWidget
  ) {
    return null;
  }
  const range = view.dom.ownerDocument.createRange();
  range.setStart(node, domOffset);
  range.setEnd(node, domOffset);
  const rect = range.getClientRects()[0];

  return rect ? rect.left : null;
};

const drawnCaret = (view: EditorView, offset: number) =>
  textCaretOnSide(view, offset, 1) ?? textCaretOnSide(view, offset, -1);

const textInsetLeft = (view: EditorView, lineFrom: number) => {
  const drawnLeft = drawnCaret(view, lineFrom);
  if (drawnLeft !== null) return drawnLeft;
  const { node, offset } = view.domAtPos(lineFrom);
  const at = node === view.contentDOM ? node.childNodes[offset] : node;
  const line = (
    at?.nodeType === 1 ? (at as Element) : at?.parentElement
  )?.closest('.cm-line');
  const box = line ?? view.contentDOM;
  const style = getComputedStyle(box);

  return (
    box.getBoundingClientRect().left +
    (Number.parseFloat(style.borderLeftWidth) || 0) +
    (Number.parseFloat(style.paddingLeft) || 0)
  );
};

const estimateOffset = (
  view: EditorView,
  lineFrom: number,
  text: string,
  x: number
) => {
  const { tabSize } = view.state;
  const charWidth = view.defaultCharacterWidth;
  const textLeft = textInsetLeft(view, view.viewport.from);
  let column = 0;

  for (let index = 0; index < text.length;) {
    const next = findClusterBreak(text, index);
    const width =
      text.charCodeAt(index) === 9 ? tabSize - (column % tabSize) : 1;
    const left = textLeft + column * charWidth;
    const right = left + width * charWidth;

    if (x < right) return lineFrom + (x - left <= right - x ? index : next);
    column += width;
    index = next;
  }

  return lineFrom + text.length;
};

/** Avoids posAtCoords and coordsAtPos, which flush CodeMirror's pending measure. */
const readEdgeLineOffset = (
  view: EditorView,
  edge: 'end' | 'start',
  x: number
) => {
  const { doc } = view.state;
  const line = edge === 'start' ? doc.line(1) : doc.line(doc.lines);
  const edgeOffset = edge === 'start' ? line.from : line.to;
  if (view.lineWrapping) return edgeOffset;
  if (line.length === 0) return edgeOffset;
  const boundaries: number[] = [];

  for (const range of view.visibleRanges) {
    const from = Math.max(range.from, line.from);
    const to = Math.min(range.to, line.to);
    for (let index = from - line.from; index <= to - line.from;) {
      boundaries.push(line.from + index);
      if (index >= line.length) break;
      index = findClusterBreak(line.text, index);
    }
  }
  type Candidate = { index: number; left: number; offset: number };
  const candidates = new Map<number, Candidate | null>();
  const read = (index: number) => {
    let candidate = candidates.get(index);
    if (candidate === undefined) {
      const left = drawnCaret(view, boundaries[index]);
      candidate =
        left === null ? null : { index, left, offset: boundaries[index] };
      candidates.set(index, candidate);
    }
    return candidate;
  };
  const nearestDrawnCandidate = (index: number, low: number, high: number) => {
    for (let step = 0; index - step > low || index + step < high; step++) {
      const below = index - step > low ? read(index - step) : null;
      if (below) return below;
      const above = index + step < high ? read(index + step) : null;
      if (above) return above;
    }
    return null;
  };
  const lastBoundary = boundaries.at(-1);

  if (lastBoundary === undefined) {
    return estimateOffset(view, line.from, line.text, x);
  }
  const first = nearestDrawnCandidate(0, -1, boundaries.length);

  if (!first) return estimateOffset(view, line.from, line.text, x);
  const last =
    nearestDrawnCandidate(boundaries.length - 1, -1, boundaries.length) ??
    first;
  let found: Array<Candidate | null>;

  if (RIGHT_TO_LEFT.test(line.text)) {
    found = boundaries.map((_, index) => read(index));
  } else {
    let low = first;
    let high = last;
    if (low.left >= x) high = low;
    else if (high.left < x) low = high;
    while (high.index - low.index > 1) {
      const middle = nearestDrawnCandidate(
        (low.index + high.index) >> 1,
        low.index,
        high.index
      );
      if (!middle) break;
      if (middle.left < x) low = middle;
      else high = middle;
    }
    found = [low, high];
  }
  const nearest = found
    .filter((candidate): candidate is Candidate => !!candidate)
    .reduce((a, b) => (Math.abs(b.left - x) < Math.abs(a.left - x) ? b : a));
  const beyond =
    (x < first.left && boundaries[0] > line.from) ||
    (x > last.left && lastBoundary < line.to);

  return beyond
    ? estimateOffset(view, line.from, line.text, x)
    : nearest.offset;
};

const decorationAttributes = (
  ownerDocument: Document,
  decoration: ExternalTextDecoration
) => {
  const attributes: Record<string, string> = {};
  const { className, style, ...rest } = decoration.attributes;

  for (const [name, value] of Object.entries(rest)) {
    if (value !== undefined) attributes[name] = String(value);
  }
  if (style) {
    const element = ownerDocument.createElement('span');

    Object.assign(element.style, style);
    if (element.style.cssText) attributes.style = element.style.cssText;
  }

  return {
    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
    ...(className ? { class: className } : {}),
  };
};

const toCodeMirrorDecorations = (
  ownerDocument: Document,
  decorations: readonly ExternalTextDecoration[],
  textLength: number
) =>
  Decoration.set(
    decorations.flatMap((decoration) => {
      if ('data-code-block-syntax' in decoration.attributes) return [];
      const from = Math.max(0, Math.min(textLength, decoration.start));
      const to = Math.max(from, Math.min(textLength, decoration.end));

      return from === to
        ? []
        : [
            Decoration.mark(
              decorationAttributes(ownerDocument, decoration)
            ).range(from, to),
          ];
    }),
    true
  );

const readOnlyExtensions = (readOnly: boolean) => [
  EditorState.readOnly.of(readOnly),
  EditorView.editable.of(!readOnly),
];

const contentAttributes = (host: HTMLElement) =>
  EditorView.contentAttributes.of({
    'aria-label': host.getAttribute('aria-label') ?? 'Code block',
    'data-code-block-codemirror-input': '',
    spellcheck: 'false',
  });

/** Project a code block through CodeMirror while the editor owns text and history.
 * Keep this adapter stable across renders. Supply theme, search and editing
 * commands as extensions; do not install CodeMirror history. Update listeners
 * observe local transactions before synchronous canonical feedback and must not
 * synchronously dispatch CodeMirror or canonical editor edits.
 */
export function createCodeMirrorAdapter({
  extensions = [],
  loadLanguage: resolveLanguage,
}: {
  /** Presentation, filters, observers and native commands. History stays with the editor. */
  extensions?: Extension;
  /** Resolve one language; stale loads and disposed views are ignored. */
  loadLanguage?: (language: string) => Extension | Promise<Extension>;
} = {}): ExternalTextAdapter<CodeBlockCodeMirrorConfig> {
  return {
    mount({ actions, host, state }) {
      const readOnly = new Compartment();
      const attributes = new Compartment();
      const language = new Compartment();
      let current = state;
      let predictedEntry: { offset: number; x: number } | null = null;
      const keepPredictedEntry = (
        changes: readonly ExternalTextChange[] | null,
        next: CodeMirrorExternalTextUpdate['state']
      ) => {
        if (
          predictedEntry &&
          (changes === null ||
            changes.length > 0 ||
            next.selection?.anchor !== predictedEntry.offset ||
            next.selection.focus !== predictedEntry.offset)
        ) {
          predictedEntry = null;
        }
      };
      let destroyed = false;
      let composing = false;
      let applyingCodeMirror = false;
      let languageGeneration = 0;
      let compositionGeneration = 0;
      let pendingCompositionEnd = false;
      let view: EditorView;

      const assertIdle = () => {
        if (!applyingCodeMirror) return;

        throw new Error(
          'CodeMirror update listeners must not synchronously mutate CodeMirror or the editor; use a transaction filter or an editing command.'
        );
      };

      const canAcceptInFlightFocusRefresh = ({
        changes,
        state: next,
      }: CodeMirrorExternalTextUpdate) => {
        if (changes === null || changes.length > 0) return false;
        if (
          next.version !== current.version + 1 ||
          next.text !== view.state.doc.toString() ||
          next.config !== current.config ||
          next.decorations !== current.decorations ||
          next.readOnly !== current.readOnly ||
          host.getAttribute('aria-label') !==
            view.contentDOM.getAttribute('aria-label')
        ) {
          return false;
        }
        const currentPaint =
          current.selection?.mode === 'model' &&
          current.selection.anchor !== current.selection.focus
            ? current.selection
            : null;
        const nextPaint =
          next.selection?.mode === 'model' &&
          next.selection.anchor !== next.selection.focus
            ? next.selection
            : null;
        if (
          currentPaint?.anchor !== nextPaint?.anchor ||
          currentPaint?.focus !== nextPaint?.focus
        ) {
          return false;
        }
        if (!next.selection) return true;
        const selection = view.state.selection.main;

        return (
          next.selection.anchor === selection.anchor &&
          next.selection.focus === selection.head
        );
      };

      const loadLanguage = (name?: string) => {
        languageGeneration += 1;
        const generation = languageGeneration;
        delete host.dataset.codeBlockLanguageError;
        if (!name || !resolveLanguage) return;
        const active = () => !destroyed && generation === languageGeneration;
        const apply = (extension: Extension) => {
          if (!active()) return;
          view.dispatch({
            annotations: appliedByAdapter.of(true),
            effects: language.reconfigure(extension),
            filter: false,
          });
          // Bound initial parse work for deep first edits.
          forceParsing(view, view.state.doc.length, INITIAL_PARSE_BUDGET_MS);
        };
        const failed = () => {
          if (active()) host.dataset.codeBlockLanguageError = 'unavailable';
        };
        try {
          const result = resolveLanguage(name);
          if (result instanceof Promise) void result.then(apply, failed);
          else apply(result);
        } catch {
          failed();
        }
      };

      const resetFromPlite = () => {
        if (destroyed) return;
        const specification: TransactionSpec = {
          annotations: appliedByAdapter.of(true),
          changes: {
            from: 0,
            insert: current.text,
            to: view.state.doc.length,
          },
          effects: [
            replaceDecorations.of(
              toCodeMirrorDecorations(
                host.ownerDocument,
                current.decorations,
                current.text.length
              )
            ),
            replaceModelSelection.of(
              modelSelectionDecoration(current.selection)
            ),
          ],
          filter: false,
        };

        if (current.selection?.mode === 'native') {
          specification.selection = EditorSelection.single(
            current.selection.anchor,
            current.selection.focus
          );
        }
        view.dispatch(specification);
      };
      const syncSelection = () => {
        const selection = view.state.selection.main;
        const result = actions.select({
          baseVersion: current.version,
          selection: { anchor: selection.anchor, focus: selection.head },
        });

        if (result.status === 'stale') resetFromPlite();
      };
      const exitX = (selection: SelectionRange) =>
        selection.goalColumn === undefined
          ? view.coordsAtPos(selection.head)?.left
          : view.contentDOM.getBoundingClientRect().left + selection.goalColumn;
      const handleBoundaryKey = (event: KeyboardEvent) => {
        if (
          composing ||
          event.isComposing ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        ) {
          return false;
        }
        const selection = view.state.selection.main;
        const backward =
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp' ||
          event.key === 'Backspace';
        const forward =
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown' ||
          event.key === 'Delete';

        if (!backward && !forward) return false;
        const line = view.state.doc.lineAt(selection.head);
        const atBoundary =
          event.key === 'ArrowUp'
            ? line.number === 1
            : event.key === 'ArrowDown'
              ? line.number === view.state.doc.lines
              : backward
                ? selection.head === 0
                : selection.head === view.state.doc.length;

        if (!atBoundary) return false;
        const direction = backward ? 'backward' : 'forward';

        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (!selection.empty || current.readOnly) return false;
          event.preventDefault();
          syncSelection();
          const result = actions.deleteOut({
            baseVersion: current.version,
            direction,
          });

          if (result.status === 'stale') resetFromPlite();

          return true;
        }
        if (!selection.empty && !event.shiftKey) return false;
        const vertical = event.key === 'ArrowUp' || event.key === 'ArrowDown';
        event.preventDefault();
        syncSelection();
        const result = actions.navigateOut({
          baseVersion: current.version,
          direction,
          extend: event.shiftKey,
          x: vertical ? exitX(selection) : undefined,
        });

        if (result.status === 'stale') resetFromPlite();

        return true;
      };

      view = new EditorView({
        dispatchTransactions(transactions, target) {
          assertIdle();
          let changes = ChangeSet.empty(target.state.doc.length);

          for (const transaction of transactions) {
            changes = changes.compose(transaction.changes);
          }
          const finalState = transactions.at(-1)?.state ?? target.state;

          applyingCodeMirror = true;
          try {
            target.update(transactions);
          } finally {
            applyingCodeMirror = false;
          }
          if (
            transactions.some((transaction) =>
              transaction.annotation(appliedByAdapter)
            )
          ) {
            return;
          }
          if (changes.empty) {
            if (transactions.some((transaction) => transaction.selection)) {
              syncSelection();
            }

            return;
          }
          const patches: Array<{
            from: number;
            insert: string;
            to: number;
          }> = [];

          changes.iterChanges((from, to, _fromAfter, _toAfter, inserted) => {
            patches.push({ from, insert: inserted.toString(), to });
          });
          const selection = finalState.selection.main;
          const result = actions.dispatch({
            baseVersion: current.version,
            changes: patches,
            intent: getIntent(transactions, composing || target.composing),
            selection: { anchor: selection.anchor, focus: selection.head },
          });

          if (result.status !== 'applied') resetFromPlite();
        },
        doc: state.text,
        extensions: [
          language.of([]),
          modelSelectionField.init(() =>
            modelSelectionDecoration(state.selection)
          ),
          decorationField.init(() =>
            toCodeMirrorDecorations(
              host.ownerDocument,
              state.decorations,
              state.text.length
            )
          ),
          readOnly.of(readOnlyExtensions(state.readOnly)),
          attributes.of(contentAttributes(host)),

          EditorView.domEventHandlers({
            beforeinput(event) {
              if (
                event.inputType !== 'historyUndo' &&
                event.inputType !== 'historyRedo'
              ) {
                return false;
              }
              event.preventDefault();
              actions.history(
                event.inputType === 'historyUndo' ? 'undo' : 'redo'
              );

              return true;
            },
            compositionend() {
              composing = false;
              pendingCompositionEnd = true;
              compositionGeneration += 1;
              const generation = compositionGeneration;
              queueMicrotask(() => {
                if (destroyed || generation !== compositionGeneration) return;
                pendingCompositionEnd = false;
                actions.composition('end');
              });

              return false;
            },
            compositionstart() {
              compositionGeneration += 1;
              if (pendingCompositionEnd) actions.composition('end');
              pendingCompositionEnd = false;
              composing = true;
              actions.composition('start');

              return false;
            },
            keydown(event) {
              if (composing || view.composing || event.isComposing) {
                return false;
              }

              return handleBoundaryKey(event);
            },
          }),
          keymap.of([
            {
              key: 'Mod-z',
              preventDefault: true,
              run: () => {
                actions.history('undo');

                return true;
              },
            },
            {
              linux: 'Ctrl-Shift-z',
              mac: 'Mod-Shift-z',
              preventDefault: true,
              run: () => {
                actions.history('redo');

                return true;
              },
            },
            {
              key: 'Mod-y',
              preventDefault: true,
              run: () => {
                actions.history('redo');

                return true;
              },
            },
          ]),
          extensions,
        ],
        parent: host,
        selection:
          state.selection?.mode === 'native'
            ? EditorSelection.single(
                state.selection.anchor,
                state.selection.focus
              )
            : undefined,
      });
      const applyUpdate = ({
        changes,
        state: next,
      }: CodeMirrorExternalTextUpdate) => {
        if (destroyed) return;
        const previous = current;
        current = next;
        keepPredictedEntry(changes, next);
        const effects: Array<StateEffect<unknown>> = [];
        if (next.config.language !== previous.config.language) {
          effects.push(language.reconfigure([]));
        }

        const previousPaint =
          previous.selection?.mode === 'model' &&
          previous.selection.anchor !== previous.selection.focus
            ? previous.selection
            : null;
        const nextPaint =
          next.selection?.mode === 'model' &&
          next.selection.anchor !== next.selection.focus
            ? next.selection
            : null;
        if (
          changes === null ||
          nextPaint?.anchor !== previousPaint?.anchor ||
          nextPaint?.focus !== previousPaint?.focus
        ) {
          effects.push(
            replaceModelSelection.of(modelSelectionDecoration(next.selection))
          );
        }
        if (next.decorations !== previous.decorations) {
          effects.push(
            replaceDecorations.of(
              toCodeMirrorDecorations(
                host.ownerDocument,
                next.decorations,
                next.text.length
              )
            )
          );
        }
        if (next.readOnly !== previous.readOnly) {
          effects.push(readOnly.reconfigure(readOnlyExtensions(next.readOnly)));
        }
        if (
          next.config.language !== previous.config.language ||
          host.getAttribute('aria-label') !==
            view.contentDOM.getAttribute('aria-label')
        ) {
          effects.push(attributes.reconfigure(contentAttributes(host)));
          host.dataset.language = next.config.language ?? '';
        }
        const specification: TransactionSpec = {
          annotations: appliedByAdapter.of(true),
          ...(effects.length > 0 ? { effects } : {}),
          filter: false,
        };

        if (changes === null) {
          specification.changes = {
            from: 0,
            insert: next.text,
            to: view.state.doc.length,
          };
        } else if (changes.length > 0) {
          specification.changes = changes.map(({ from, insert, to }) => ({
            from,
            insert,
            to,
          }));
        }
        if (next.selection?.mode === 'native') {
          const selection = view.state.selection.main;

          if (
            selection.anchor !== next.selection.anchor ||
            selection.head !== next.selection.focus
          ) {
            specification.selection = EditorSelection.single(
              next.selection.anchor,
              next.selection.focus
            );
          }
        }
        if (
          !specification.changes &&
          !specification.selection &&
          effects.length === 0
        ) {
          return;
        }
        view.dispatch(specification);
        if (next.config.language !== previous.config.language) {
          loadLanguage(next.config.language);
        }
      };
      host.dataset.codeBlockCodemirror = '';
      host.dataset.language = state.config.language ?? '';
      loadLanguage(state.config.language);

      return {
        destroy() {
          destroyed = true;
          if (composing || pendingCompositionEnd) actions.composition('end');
          view.destroy();
          delete host.dataset.codeBlockCodemirror;
          delete host.dataset.language;
          delete host.dataset.codeBlockLanguageError;
        },
        focus() {
          const entered = predictedEntry;
          predictedEntry = null;
          if (current.selection) {
            writeSelection(
              view,
              current.selection,
              entered?.offset === current.selection.focus
                ? entered.x
                : undefined
            );
          }
          view.focus();
        },
        offsetAt({ edge, x }) {
          const offset = readEdgeLineOffset(view, edge, x);
          predictedEntry = { offset, x };

          return offset;
        },
        update(input) {
          if (applyingCodeMirror) {
            if (!canAcceptInFlightFocusRefresh(input)) assertIdle();
            current = input.state;
            keepPredictedEntry(input.changes, input.state);

            return;
          }
          applyUpdate(input);
        },
      };
    },
  };
}

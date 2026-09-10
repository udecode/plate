'use client';

import { forceParsing } from '@codemirror/language';
import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  StateEffect,
  StateField,
  type Extension,
  type Transaction,
  type TransactionSpec,
} from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  keymap,
  type ViewUpdate,
} from '@codemirror/view';

import type {
  ExternalTextActions,
  ExternalTextAdapter,
  ExternalTextDecoration,
  ExternalTextSelection,
  ExternalTextSelectionState,
} from '../../react/core';

type CodeBlockCodeMirrorConfig = Readonly<{
  language?: string;
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

const writeSelection = (view: EditorView, selection: ExternalTextSelection) => {
  const current = view.state.selection.main;

  if (current.anchor === selection.anchor && current.head === selection.focus) {
    return false;
  }
  view.dispatch({
    annotations: appliedByAdapter.of(true),
    selection: EditorSelection.single(selection.anchor, selection.focus),
  });

  return true;
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

/** Project a code block through CodeMirror while Plite owns text and history.
 * Keep this adapter stable across renders. Supply theme, search and editing
 * commands as extensions; do not install CodeMirror history.
 */
export function createCodeMirrorAdapter({
  extensions = [],
  loadLanguage: resolveLanguage,
}: {
  /** View presentation and native commands. History stays with Plite. */
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
      let destroyed = false;
      let composing = false;
      let dispatchingToPlite = false;
      let pendingReset = false;
      let languageGeneration = 0;
      let compositionGeneration = 0;
      let pendingCompositionEnd = false;
      let view: EditorView;

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
        pendingReset = false;
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
        };

        if (current.selection?.mode === 'native') {
          specification.selection = EditorSelection.single(
            current.selection.anchor,
            current.selection.focus
          );
        }
        view.dispatch(specification);
      };
      const scheduleReset = () => {
        if (pendingReset) return;
        pendingReset = true;
        queueMicrotask(resetFromPlite);
      };
      const syncSelection = () => {
        const selection = view.state.selection.main;
        const result = actions.select({
          baseVersion: current.version,
          selection: { anchor: selection.anchor, focus: selection.head },
        });

        if (result.status === 'stale') scheduleReset();
      };
      const dispatchUpdate = (update: ViewUpdate) => {
        if (
          update.transactions.some((transaction) =>
            transaction.annotation(appliedByAdapter)
          )
        ) {
          return;
        }
        const selection = update.state.selection.main;

        if (!update.docChanged) {
          if (update.selectionSet) syncSelection();

          return;
        }
        const changes: Array<{ from: number; insert: string; to: number }> = [];

        update.changes.iterChanges((fromA, toA, _fromB, _toB, inserted) => {
          changes.push({ from: fromA, insert: inserted.toString(), to: toA });
        });
        dispatchingToPlite = true;
        try {
          const result = actions.dispatch({
            baseVersion: current.version,
            changes,
            intent: getIntent(
              update.transactions,
              composing || update.view.composing
            ),
            selection: { anchor: selection.anchor, focus: selection.head },
          });

          if (result.status !== 'applied') scheduleReset();
        } finally {
          dispatchingToPlite = false;
        }
      };
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

          if (result.status === 'stale') scheduleReset();

          return true;
        }
        if (!selection.empty && !event.shiftKey) return false;
        event.preventDefault();
        syncSelection();
        const result = actions.navigateOut({
          baseVersion: current.version,
          direction,
          extend: event.shiftKey,
          x: view.coordsAtPos(selection.head)?.left,
        });

        if (result.status === 'stale') scheduleReset();

        return true;
      };

      view = new EditorView({
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
              key: 'Mod-Shift-z',
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
          EditorView.updateListener.of(dispatchUpdate),
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
      host.dataset.codeBlockCodemirror = '';
      host.dataset.language = state.config.language ?? '';
      loadLanguage(state.config.language);

      return {
        destroy() {
          destroyed = true;
          pendingReset = false;
          if (composing || pendingCompositionEnd) actions.composition('end');
          view.destroy();
          delete host.dataset.codeBlockCodemirror;
          delete host.dataset.language;
          delete host.dataset.codeBlockLanguageError;
        },
        focus({ edge, x } = {}) {
          if (current.selection) {
            writeSelection(view, current.selection);
          } else if (edge) {
            let offset = edge === 'end' ? view.state.doc.length : 0;

            if (x !== undefined) {
              const rect = view.scrollDOM.getBoundingClientRect();
              const y = edge === 'end' ? rect.bottom - 1 : rect.top + 1;

              offset = view.posAtCoords({ x, y }) ?? offset;
            }
            writeSelection(view, { anchor: offset, focus: offset });
          }
          view.focus();
        },
        update({ changes, state: next }) {
          const previous = current;
          current = next;
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
            effects.push(
              readOnly.reconfigure(readOnlyExtensions(next.readOnly))
            );
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
          const apply = () => {
            if (destroyed) return;
            view.dispatch(specification);
            if (next.config.language !== previous.config.language) {
              loadLanguage(next.config.language);
            }
          };

          if (dispatchingToPlite) queueMicrotask(apply);
          else apply();
        },
      };
    },
  };
}

'use client';

import { Loader2, RotateCcw, SparklesIcon, X } from 'lucide-react';
import { getEditorRuntimeOwner } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import { InkPlugin } from 'platejs/ink/react';
import {
  useEditableRef,
  useEditor,
  useEditorSelector,
  useEditorViewState,
  useViewStore,
} from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type {
  InkDigitizeEdit,
  InkDigitizeMeaning,
  InkDigitizeReading,
} from '@/registry/app/api/ai/ink-digitize/ink-digitize-route';
import { AI_SETTINGS_OPEN_EVENT } from '@/registry/components/editor/settings-dialog';
import { ToolbarButton } from '@/registry/components/editor/toolbar';
import { AIChatTransportPlugin } from '@/registry/components/editor/use-chat';
import {
  canDigitizeInk,
  confirmInkDigitizeWithComments,
  type ConfirmSkipReason,
  correctionPrimaryKind,
  INK_DIGITIZE_KIND_LABELS,
  latestInkDigitizeRequestId,
  liveShownInkMarkIds,
  marksTurningIntoSigns,
  planInkDigitizeAllBatches,
  type PreparedInkDigitize,
  prepareInkDigitizeRequest,
  type ValidatedCorrection,
  type ValidatedDigitizeReading,
  validateInkDigitizeReading,
} from '@/registry/lib/ink-digitize';

const DEFAULT_MODEL = 'google/gemini-3.8-flash';
const DIGITIZE_ENDPOINT = '/api/ai/ink-digitize';
const digitizeAllByView = new WeakMap<object, () => void>();
const digitizeAllByOwner = new WeakMap<object, Set<() => void>>();

type DigitizeKindFilter = InkDigitizeEdit['kind'] | 'all';

type BatchContext = Readonly<{
  index: number;
  remaining: ReadonlyArray<readonly string[]>;
  total: number;
}>;

type DigitizeNotice =
  | Readonly<{ kind: 'error'; message: string; needsKey?: boolean }>
  | Readonly<{ kind: 'needs-key' }>
  | Readonly<{ kind: 'passage-too-large'; markIds: readonly string[] }>
  | Readonly<{
      canRetryLassoOnly: boolean;
      kind: 'too-many-words';
      signMarkIds: readonly string[];
      wordCount: number;
    }>;

type ConfirmState = Readonly<{
  activeKind: DigitizeKindFilter;
  batch: BatchContext | null;
  keptIndices: ReadonlySet<number>;
  manualKeptBeforeFilter: ReadonlySet<number> | null;
  meaningIndices: ReadonlyMap<number, number>;
  prepared: PreparedInkDigitize;
  reaskingIndex: number | null;
  saveError: string | null;
  saving: boolean;
  staleMessage: string | null;
  typedByIndex: Readonly<Record<number, string>>;
  validated: Extract<ValidatedDigitizeReading, { ok: true }>;
}>;

type SessionState =
  | Readonly<{ kind: 'confirm'; state: ConfirmState }>
  | Readonly<{ kind: 'idle' }>
  | Readonly<{ kind: 'loading'; pickedIds: readonly string[] }>
  | Readonly<{ kind: 'notice'; notice: DigitizeNotice }>;

const describeEdit = (edit: InkDigitizeEdit): string => {
  if (edit.kind === 'delete') return `Delete "${edit.quote}"`;
  if (edit.kind === 'highlight') return `Highlight "${edit.quote}"`;
  if (edit.kind === 'replace') {
    return `Replace "${edit.quote}" with "${edit.text}"`;
  }
  if (edit.kind === 'comment') {
    return `Comment on "${edit.quote}": "${edit.text}"`;
  }
  if (edit.kind === 'answer') {
    return `Answer "${edit.question}" on "${edit.quote}": "${edit.text}"`;
  }

  const [before, after] = edit.between;

  if (before && after) {
    return `Insert "${edit.text}" between "${before}" and "${after}"`;
  }
  if (before) return `Insert "${edit.text}" after "${before}"`;
  if (after) return `Insert "${edit.text}" before "${after}"`;

  return `Insert "${edit.text}"`;
};

const describeMeaning = (meaning: InkDigitizeMeaning): string =>
  meaning.edits.map(describeEdit).join('; ');

const skipReasonLabel = (reason: ConfirmSkipReason) => {
  if (reason === 'pending-suggestion') return 'overlaps a pending suggestion';
  if (reason === 'refused') return 'refused in Suggesting mode';
  if (reason === 'save-rejected') return 'comment save was rejected';
  if (reason === 'save-failed') return 'comment save failed';
  if (reason === 'no-comments-plugin') return 'comments are not enabled';

  return 'would not change the document';
};

const openAiSettings = () => {
  window.dispatchEvent(new CustomEvent(AI_SETTINGS_OPEN_EVENT));
};

export function DigitizeAllToolbarButton() {
  const editor = useEditor();
  const readOnly = useEditorViewState(editor, (state) => state.isReadOnly());
  const authoredPreview = useEditorViewState(editor, () => {
    const authored = editor.plugin(AuthoredPlugin);

    return authored.installed && 'preview' in authored.read.view();
  });
  const hasLiveMarks = useEditorSelector(
    (current) => liveShownInkMarkIds(current).length > 0
  );

  return (
    <ToolbarButton
      aria-label="Digitize all ink"
      disabled={readOnly || authoredPreview || !hasLiveMarks}
      onClick={() => {
        const direct = digitizeAllByView.get(editor);

        if (direct) {
          direct();

          return;
        }
        const owner = getEditorRuntimeOwner(editor);
        const triggers = digitizeAllByOwner.get(owner);
        const first = triggers?.values().next().value;

        first?.();
      }}
      tooltip="Digitize all ink"
    >
      <SparklesIcon />
    </ToolbarButton>
  );
}

export function InkDigitizeBar() {
  const editor = useEditor();
  const editableRef = useEditableRef();
  const picked = useViewStore(InkPlugin, (state) => state.picked);
  const readOnly = useEditorViewState(editor, (state) => state.isReadOnly());
  const authoredPreview = useEditorViewState(editor, () => {
    const authored = editor.plugin(AuthoredPlugin);

    if (!authored.installed) return false;

    return 'preview' in authored.read.view();
  });
  const canDigitize = !readOnly && !authoredPreview;

  const { pickedDigitized, pickedShown } = useEditorSelector((current) => {
    const ink = current.plugin(InkPlugin);
    const shown = new Set(ink.read.shownMarks().map((mark) => mark.id));
    const shownIds: string[] = [];
    const digitizedIds: string[] = [];

    for (const id of picked) {
      if (shown.has(id)) shownIds.push(id);
      else if (ink.read.mark(id)) digitizedIds.push(id);
    }

    return { pickedDigitized: digitizedIds, pickedShown: shownIds };
  });

  const [session, setSession] = React.useState<SessionState>({ kind: 'idle' });
  const [prevCanDigitize, setPrevCanDigitize] = React.useState(canDigitize);
  const abortRef = React.useRef<AbortController | null>(null);

  if (prevCanDigitize !== canDigitize) {
    setPrevCanDigitize(canDigitize);
    if (!canDigitize && session.kind !== 'idle') {
      setSession({ kind: 'idle' });
    }
  }

  const closeSession = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSession({ kind: 'idle' });
  }, []);

  React.useEffect(() => {
    if (!canDigitize) {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [canDigitize]);

  React.useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const locked = session.kind === 'loading' || session.kind === 'confirm';
  const savingConfirm = session.kind === 'confirm' && session.state.saving;

  React.useEffect(() => {
    if (!locked) return undefined;

    const editable = editableRef.current;
    const container = editable?.closest('[data-slot="editor-container"]');
    const blockLayerPointer = (event: Event) => {
      const { target } = event;

      if (!(target instanceof Element)) return;
      if (target.closest('[data-ink-digitize-ui]')) return;
      if (container && container.contains(target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        if (!savingConfirm) closeSession();

        return;
      }

      const { target } = event;

      if (
        target instanceof Element &&
        target.closest('[data-ink-digitize-ui]')
      ) {
        return;
      }
      if (event.key === 'Tab') return;
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        (event.key.length === 1 ||
          event.key === 'Backspace' ||
          event.key === 'Delete' ||
          event.key === 'Enter')
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const pointerEvents = [
      'pointerdown',
      'pointermove',
      'pointerup',
      'mousedown',
    ] as const;

    for (const name of pointerEvents) {
      window.addEventListener(name, blockLayerPointer, true);
    }
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      for (const name of pointerEvents) {
        window.removeEventListener(name, blockLayerPointer, true);
      }
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [closeSession, editableRef, locked, savingConfirm]);

  const readAiConfig = React.useCallback(() => {
    const chatPlugin = editor.plugin(AIChatTransportPlugin);
    const body = chatPlugin.installed
      ? (chatPlugin.store.get().chatOptions?.body ?? {})
      : {};
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    const model =
      typeof body.model === 'string' && body.model.trim().length > 0
        ? body.model.trim()
        : DEFAULT_MODEL;

    return { apiKey, model };
  }, [editor]);

  const runDigitize = React.useCallback(
    async (
      ids: readonly string[],
      options?: { batch?: BatchContext | null; lassoOnly?: boolean }
    ) => {
      if (!canDigitizeInk(editor)) {
        closeSession();

        return;
      }

      const { apiKey, model } = readAiConfig();

      abortRef.current?.abort();
      const controller = new AbortController();

      abortRef.current = controller;
      setSession({ kind: 'loading', pickedIds: [...ids] });

      const prep = await prepareInkDigitizeRequest(editor, ids, {
        lassoOnly: options?.lassoOnly,
      });

      if (controller.signal.aborted || !canDigitizeInk(editor)) return;

      if (prep.kind === 'blocked') {
        closeSession();

        return;
      }
      if (prep.kind === 'too-many-words') {
        setSession({
          kind: 'notice',
          notice: {
            canRetryLassoOnly: prep.canRetryLassoOnly,
            kind: 'too-many-words',
            signMarkIds: prep.signMarkIds,
            wordCount: prep.wordCount,
          },
        });

        return;
      }
      if (prep.kind === 'passage-too-large') {
        setSession({
          kind: 'notice',
          notice: { kind: 'passage-too-large', markIds: prep.markIds },
        });

        return;
      }

      try {
        const response = await fetch(DIGITIZE_ENDPOINT, {
          body: JSON.stringify({
            ...prep.prepared.request,
            ...(apiKey ? { apiKey } : {}),
            model,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: controller.signal,
        });

        if (controller.signal.aborted || !canDigitizeInk(editor)) return;

        if (response.status === 401) {
          setSession(
            apiKey
              ? {
                  kind: 'notice',
                  notice: {
                    kind: 'error',
                    message:
                      'Add a valid AI Gateway API key in Settings to digitize ink.',
                    needsKey: true,
                  },
                }
              : { kind: 'notice', notice: { kind: 'needs-key' } }
          );

          return;
        }
        if (!response.ok) {
          const text = await response.text();

          setSession({
            kind: 'notice',
            notice: {
              kind: 'error',
              message: text || `Digitize request failed (${response.status}).`,
            },
          });

          return;
        }

        const reading = (await response.json()) as InkDigitizeReading;

        if (controller.signal.aborted || !canDigitizeInk(editor)) return;

        const validated = validateInkDigitizeReading(
          prep.prepared,
          reading,
          latestInkDigitizeRequestId(editor)
        );

        if (!validated.ok) {
          setSession({
            kind: 'notice',
            notice: {
              kind: 'error',
              message: `Could not use the reading (${validated.reason}). Try Digitize again.`,
            },
          });

          return;
        }

        const keptIndices = new Set<number>();
        const meaningIndices = new Map<number, number>();

        for (const [index, correction] of validated.corrections.entries()) {
          if (correction.defaultKept) keptIndices.add(index);
          meaningIndices.set(index, 0);
        }

        setSession({
          kind: 'confirm',
          state: {
            activeKind: 'all',
            batch: options?.batch ?? null,
            keptIndices,
            manualKeptBeforeFilter: null,
            meaningIndices,
            prepared: prep.prepared,
            reaskingIndex: null,
            saveError: null,
            saving: false,
            staleMessage: null,
            typedByIndex: {},
            validated,
          },
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setSession({
          kind: 'notice',
          notice: {
            kind: 'error',
            message:
              error instanceof Error
                ? error.message
                : 'Digitize request failed.',
          },
        });
      }
    },
    [closeSession, editor, readAiConfig]
  );

  const runDigitizeAll = React.useCallback(() => {
    const batches = planInkDigitizeAllBatches(editor);

    if (batches.length === 0) return;

    const [first, ...remaining] = batches;

    void runDigitize(first, {
      batch:
        batches.length > 1
          ? { index: 0, remaining, total: batches.length }
          : null,
    });
  }, [editor, runDigitize]);

  React.useEffect(() => {
    const owner = getEditorRuntimeOwner(editor);
    let triggers = digitizeAllByOwner.get(owner);

    if (!triggers) {
      triggers = new Set();
      digitizeAllByOwner.set(owner, triggers);
    }
    digitizeAllByView.set(editor, runDigitizeAll);
    triggers.add(runDigitizeAll);

    return () => {
      if (digitizeAllByView.get(editor) === runDigitizeAll) {
        digitizeAllByView.delete(editor);
      }
      triggers.delete(runDigitizeAll);
    };
  }, [editor, runDigitizeAll]);

  const handleReask = React.useCallback(
    async (correctionIndex: number) => {
      if (session.kind !== 'confirm') return;
      const { state } = session;
      const instruction = (state.typedByIndex[correctionIndex] ?? '').trim();
      const target = state.validated.corrections[correctionIndex];

      if (!instruction || !target) return;

      const { apiKey, model } = readAiConfig();

      setSession({
        kind: 'confirm',
        state: { ...state, reaskingIndex: correctionIndex, staleMessage: null },
      });

      const controller = new AbortController();

      abortRef.current = controller;

      try {
        const response = await fetch(DIGITIZE_ENDPOINT, {
          body: JSON.stringify({
            ...state.prepared.request,
            ...(apiKey ? { apiKey } : {}),
            correction: { marks: [...target.markKeys] },
            instruction,
            model,
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: controller.signal,
        });

        if (controller.signal.aborted || !canDigitizeInk(editor)) return;

        if (response.status === 401) {
          setSession(
            apiKey
              ? {
                  kind: 'notice',
                  notice: {
                    kind: 'error',
                    message:
                      'Add a valid AI Gateway API key in Settings to digitize ink.',
                    needsKey: true,
                  },
                }
              : { kind: 'notice', notice: { kind: 'needs-key' } }
          );

          return;
        }

        if (!response.ok) {
          setSession((prev) =>
            prev.kind === 'confirm'
              ? {
                  kind: 'confirm',
                  state: {
                    ...prev.state,
                    reaskingIndex: null,
                    staleMessage: `Could not re-read meaning (${response.status}).`,
                  },
                }
              : prev
          );

          return;
        }

        const reading = (await response.json()) as InkDigitizeReading;

        if (controller.signal.aborted || !canDigitizeInk(editor)) return;

        const mergedReading: InkDigitizeReading = {
          corrections: state.validated.corrections.map((c, idx) =>
            idx === correctionIndex
              ? {
                  marks: [...c.markKeys],
                  meanings: reading.corrections[0]?.meanings ?? c.meanings,
                }
              : { marks: [...c.markKeys], meanings: [...c.meanings] }
          ),
          request: reading.request,
        };
        const revalidated = validateInkDigitizeReading(
          state.prepared,
          mergedReading,
          latestInkDigitizeRequestId(editor)
        );

        if (!revalidated.ok) {
          setSession((prev) =>
            prev.kind === 'confirm'
              ? {
                  kind: 'confirm',
                  state: {
                    ...prev.state,
                    reaskingIndex: null,
                    staleMessage: `That meaning did not match the marked words (${revalidated.reason}).`,
                  },
                }
              : prev
          );

          return;
        }

        setSession((prev) => {
          if (prev.kind !== 'confirm') return prev;
          const nextKept = new Set(prev.state.keptIndices);
          const nextMeanings = new Map(prev.state.meaningIndices);

          nextKept.add(correctionIndex);
          nextMeanings.set(correctionIndex, 0);

          return {
            kind: 'confirm',
            state: {
              ...prev.state,
              keptIndices: nextKept,
              meaningIndices: nextMeanings,
              reaskingIndex: null,
              staleMessage: null,
              typedByIndex: {
                ...prev.state.typedByIndex,
                [correctionIndex]: '',
              },
              validated: revalidated,
            },
          };
        });
      } catch {
        if (controller.signal.aborted) return;
        setSession((prev) =>
          prev.kind === 'confirm'
            ? {
                kind: 'confirm',
                state: {
                  ...prev.state,
                  reaskingIndex: null,
                  staleMessage: 'Could not re-read that meaning.',
                },
              }
            : prev
        );
      }
    },
    [editor, readAiConfig, session]
  );

  const handleConfirm = React.useCallback(async () => {
    if (session.kind !== 'confirm' || session.state.saving) return;
    const { state } = session;
    const choices = [...state.keptIndices]
      .sort((a, b) => a - b)
      .map((correctionIndex) => ({
        correctionIndex,
        meaningIndex: state.meaningIndices.get(correctionIndex) ?? 0,
      }));

    setSession({
      kind: 'confirm',
      state: { ...state, saveError: null, saving: true, staleMessage: null },
    });

    const result = await confirmInkDigitizeWithComments(
      editor,
      state.prepared,
      state.validated,
      choices,
      latestInkDigitizeRequestId(editor)
    );

    if (result.status === 'stale') {
      setSession((prev) =>
        prev.kind === 'confirm'
          ? {
              kind: 'confirm',
              state: {
                ...prev.state,
                saving: false,
                staleMessage:
                  'The text or ink changed since you picked it. Digitize again.',
              },
            }
          : prev
      );

      return;
    }
    if (result.status === 'blocked') {
      closeSession();

      return;
    }

    const retryable = result.skipped.filter(
      (entry) =>
        entry.reason === 'save-rejected' || entry.reason === 'save-failed'
    );
    const otherSkipped = result.skipped.filter(
      (entry) =>
        entry.reason !== 'save-rejected' && entry.reason !== 'save-failed'
    );

    if (otherSkipped.length > 0) {
      const reasons = [
        ...new Set(otherSkipped.map((s) => skipReasonLabel(s.reason))),
      ].join('; ');

      toast.info(
        `Kept ${otherSkipped.length} correction(s) as ink (${reasons}).`
      );
    }

    if (retryable.length > 0) {
      const appliedMarkIds = new Set(
        result.applied.flatMap((entry) => entry.markIds)
      );
      const retryIndices = new Set(
        retryable.map((entry) => entry.correctionIndex)
      );
      const nextShownByBlock = new Map<string, readonly string[]>();

      for (const [blockId, ids] of state.prepared.shownByBlock) {
        nextShownByBlock.set(
          blockId,
          ids.filter((id) => !appliedMarkIds.has(id))
        );
      }

      const reasons = [
        ...new Set(retryable.map((s) => skipReasonLabel(s.reason))),
      ].join('; ');

      setSession((prev) =>
        prev.kind === 'confirm'
          ? {
              kind: 'confirm',
              state: {
                ...prev.state,
                keptIndices: retryIndices,
                prepared: {
                  ...prev.state.prepared,
                  shownByBlock: nextShownByBlock,
                },
                saveError: `Could not save ${retryable.length} comment(s) (${reasons}). Click Confirm to retry.`,
                saving: false,
              },
            }
          : prev
      );

      return;
    }

    if (state.batch && state.batch.remaining.length > 0) {
      const [nextIds, ...rest] = state.batch.remaining;

      void runDigitize(nextIds, {
        batch: {
          index: state.batch.index + 1,
          remaining: rest,
          total: state.batch.total,
        },
      });

      return;
    }

    closeSession();
  }, [closeSession, editor, runDigitize, session]);

  const handleBringBack = React.useCallback(() => {
    if (pickedDigitized.length === 0 || !canDigitize) return;
    editor.update((tx) => {
      tx.plugin(InkPlugin).setDigitized(pickedDigitized, false);
    });
    editor.plugin(InkPlugin).api.setPicked([]);
  }, [canDigitize, editor, pickedDigitized]);

  const showFloatingBar =
    session.kind === 'idle' &&
    (pickedShown.length > 0 || pickedDigitized.length > 0);

  if (!showFloatingBar && session.kind === 'idle') return null;

  return (
    <div
      className="pointer-events-none sticky bottom-16 z-60 flex justify-center px-4"
      data-ink-digitize-locked={locked ? 'true' : undefined}
      data-ink-digitize-ui=""
    >
      {showFloatingBar && (
        <div className="pointer-events-auto flex items-center gap-2 rounded-lg border bg-background/95 px-2.5 py-1.5 shadow-md backdrop-blur">
          {pickedShown.length === 0 && pickedDigitized.length > 0 ? (
            <Button
              disabled={!canDigitize}
              onClick={handleBringBack}
              size="sm"
              variant="outline"
            >
              <RotateCcw className="me-1.5 size-3.5" />
              Bring back
            </Button>
          ) : (
            <>
              <Button
                disabled={!canDigitize}
                onClick={() => {
                  void runDigitize(pickedShown);
                }}
                size="sm"
              >
                <SparklesIcon className="me-1.5 size-3.5" />
                Digitize
              </Button>
              {pickedDigitized.length > 0 && (
                <Button
                  disabled={!canDigitize}
                  onClick={handleBringBack}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="me-1.5 size-3.5" />
                  Bring back
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {session.kind === 'loading' && (
        <div
          aria-live="polite"
          className="pointer-events-auto flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-lg"
          role="status"
        >
          <Loader2 className="size-4 animate-spin" />
          <span>Reading ink...</span>
          <Button onClick={closeSession} size="xs" variant="ghost">
            Cancel
          </Button>
        </div>
      )}

      {session.kind === 'notice' && (
        <dialog
          aria-label="Digitize notice"
          className="pointer-events-auto static m-0 w-full max-w-md rounded-lg border bg-background p-4 text-sm text-foreground shadow-lg"
          open
        >
          {session.notice.kind === 'needs-key' && (
            <div className="space-y-3">
              <p>Add an AI Gateway API key in Settings to digitize ink.</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    closeSession();
                    openAiSettings();
                  }}
                  size="sm"
                >
                  Open AI Settings
                </Button>
                <Button onClick={closeSession} size="sm" variant="ghost">
                  Close
                </Button>
              </div>
            </div>
          )}

          {session.notice.kind === 'too-many-words' && (
            <div className="space-y-3">
              <p>
                This pick covers {session.notice.wordCount} words (limit 1,000).
                {session.notice.signMarkIds.length > 0 &&
                  ` Reading only the lassoed marks will turn ${session.notice.signMarkIds.length} other mark(s) on those paragraphs into signs.`}
              </p>
              <div className="flex gap-2">
                {session.notice.canRetryLassoOnly && (
                  <Button
                    onClick={() => {
                      void runDigitize(pickedShown, { lassoOnly: true });
                    }}
                    size="sm"
                  >
                    Read lassoed marks only
                  </Button>
                )}
                <Button onClick={closeSession} size="sm" variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}

          {session.notice.kind === 'passage-too-large' && (
            <div className="space-y-3">
              <p>
                A passage is too large to render. Erase its mark and try again.
              </p>
              <Button onClick={closeSession} size="sm" variant="outline">
                Close
              </Button>
            </div>
          )}

          {session.notice.kind === 'error' && (
            <div className="space-y-3">
              <p>{session.notice.message}</p>
              <div className="flex gap-2">
                {session.notice.needsKey && (
                  <Button
                    onClick={() => {
                      closeSession();
                      openAiSettings();
                    }}
                    size="sm"
                  >
                    Open AI Settings
                  </Button>
                )}
                <Button onClick={closeSession} size="sm" variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </dialog>
      )}

      {session.kind === 'confirm' && (
        <ConfirmDialog
          onClose={closeSession}
          onConfirm={() => {
            void handleConfirm();
          }}
          onDigitizeAgain={() => {
            if (session.state.batch) {
              runDigitizeAll();
            } else if (pickedShown.length > 0) {
              void runDigitize(pickedShown);
            } else {
              runDigitizeAll();
            }
          }}
          onReask={(index) => {
            void handleReask(index);
          }}
          onSelectKind={(kind) => {
            setSession((prev) => {
              if (prev.kind !== 'confirm') return prev;
              if (kind === prev.state.activeKind) return prev;
              if (kind === 'all') {
                const restored =
                  prev.state.manualKeptBeforeFilter ?? prev.state.keptIndices;

                return {
                  kind: 'confirm',
                  state: {
                    ...prev.state,
                    activeKind: 'all',
                    keptIndices: new Set(restored),
                    manualKeptBeforeFilter: null,
                  },
                };
              }

              const savedAll =
                prev.state.activeKind === 'all'
                  ? new Set(prev.state.keptIndices)
                  : prev.state.manualKeptBeforeFilter;
              const nextKept = new Set<number>();

              for (const [
                index,
                correction,
              ] of prev.state.validated.corrections.entries()) {
                const primaryKind = correctionPrimaryKind(
                  correction,
                  prev.state.meaningIndices.get(index) ?? 0
                );

                if (primaryKind === kind) nextKept.add(index);
              }

              return {
                kind: 'confirm',
                state: {
                  ...prev.state,
                  activeKind: kind,
                  keptIndices: nextKept,
                  manualKeptBeforeFilter: savedAll,
                },
              };
            });
          }}
          onSelectMeaning={(correctionIndex, meaningIndex) => {
            setSession((prev) => {
              if (prev.kind !== 'confirm') return prev;
              const nextMeanings = new Map(prev.state.meaningIndices);

              nextMeanings.set(correctionIndex, meaningIndex);

              return {
                kind: 'confirm',
                state: { ...prev.state, meaningIndices: nextMeanings },
              };
            });
          }}
          onToggleKeep={(correctionIndex, checked) => {
            setSession((prev) => {
              if (prev.kind !== 'confirm') return prev;
              const nextKept = new Set(prev.state.keptIndices);

              if (checked) nextKept.add(correctionIndex);
              else nextKept.delete(correctionIndex);

              return {
                kind: 'confirm',
                state: { ...prev.state, keptIndices: nextKept },
              };
            });
          }}
          onTypedChange={(correctionIndex, value) => {
            setSession((prev) =>
              prev.kind === 'confirm'
                ? {
                    kind: 'confirm',
                    state: {
                      ...prev.state,
                      typedByIndex: {
                        ...prev.state.typedByIndex,
                        [correctionIndex]: value,
                      },
                    },
                  }
                : prev
            );
          }}
          state={session.state}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  onClose,
  onConfirm,
  onDigitizeAgain,
  onReask,
  onSelectKind,
  onSelectMeaning,
  onToggleKeep,
  onTypedChange,
  state,
}: {
  onClose: () => void;
  onConfirm: () => void;
  onDigitizeAgain: () => void;
  onReask: (index: number) => void;
  onSelectKind: (kind: DigitizeKindFilter) => void;
  onSelectMeaning: (correctionIndex: number, meaningIndex: number) => void;
  onToggleKeep: (correctionIndex: number, checked: boolean) => void;
  onTypedChange: (correctionIndex: number, value: string) => void;
  state: ConfirmState;
}) {
  const signMarks = marksTurningIntoSigns(
    state.prepared,
    state.validated.corrections,
    state.keptIndices,
    state.meaningIndices
  );
  const kindCounts = new Map<InkDigitizeEdit['kind'], number>();

  for (const [index, correction] of state.validated.corrections.entries()) {
    const kind = correctionPrimaryKind(
      correction,
      state.meaningIndices.get(index) ?? 0
    );

    if (kind) kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1);
  }
  const kindEntries = [...kindCounts.entries()];

  return (
    <dialog
      aria-label="Confirm digitized edits"
      className="pointer-events-auto static m-0 flex max-h-[min(70dvh,32rem)] w-full max-w-lg flex-col rounded-lg border bg-background p-4 text-sm text-foreground shadow-xl"
      data-ink-digitize-confirm=""
      open
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span>Confirm digitized edits</span>
          {state.batch && state.batch.total > 1 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
              Batch {state.batch.index + 1} of {state.batch.total}
            </span>
          )}
        </div>
        <Button
          aria-label="Close confirm"
          disabled={state.saving}
          onClick={onClose}
          size="icon-xs"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      {kindEntries.length > 1 && (
        <div
          aria-label="Filter by kind"
          className="mb-2 flex flex-wrap gap-1.5"
          data-ink-digitize-kinds=""
          role="group"
        >
          <Button
            aria-pressed={state.activeKind === 'all'}
            disabled={state.saving}
            onClick={() => onSelectKind('all')}
            size="xs"
            variant={state.activeKind === 'all' ? 'secondary' : 'outline'}
          >
            All ({state.validated.corrections.length})
          </Button>
          {kindEntries.map(([kind, count]) => (
            <Button
              aria-pressed={state.activeKind === kind}
              disabled={state.saving}
              key={kind}
              onClick={() => onSelectKind(kind)}
              size="xs"
              variant={state.activeKind === kind ? 'secondary' : 'outline'}
            >
              {INK_DIGITIZE_KIND_LABELS[kind]} ({count})
            </Button>
          ))}
        </div>
      )}

      {signMarks.length > 0 && (
        <p
          className="mb-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs"
          data-ink-sign-warning={String(signMarks.length)}
        >
          {signMarks.length} left-out mark(s) on changed paragraphs will turn
          into signs.
        </p>
      )}

      {state.saveError && (
        <div
          className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive"
          data-ink-digitize-save-error=""
          role="alert"
        >
          {state.saveError}
        </div>
      )}

      {state.staleMessage && (
        <div
          className="mb-2 flex items-center justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive"
          data-ink-digitize-stale=""
        >
          <span>{state.staleMessage}</span>
          <Button
            disabled={state.saving}
            onClick={onDigitizeAgain}
            size="xs"
            variant="outline"
          >
            Digitize again
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pe-1">
        {state.validated.corrections.length === 0 ? (
          <p className="text-muted-foreground">
            No matching edits were found for the marked words.
          </p>
        ) : (
          state.validated.corrections.map((correction, index) => {
            if (state.activeKind !== 'all') {
              const primaryKind = correctionPrimaryKind(
                correction,
                state.meaningIndices.get(index) ?? 0
              );

              if (primaryKind !== state.activeKind) return null;
            }

            return (
              <CorrectionRow
                correction={correction}
                disabled={state.saving}
                index={index}
                kept={state.keptIndices.has(index)}
                key={correction.markIds.join(',')}
                meaningIndex={state.meaningIndices.get(index) ?? 0}
                onReask={() => onReask(index)}
                onSelectMeaning={(mIndex) => onSelectMeaning(index, mIndex)}
                onToggleKeep={(checked) => onToggleKeep(index, checked)}
                onTypedChange={(value) => onTypedChange(index, value)}
                reasking={state.reaskingIndex === index}
                typed={state.typedByIndex[index] ?? ''}
              />
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
        <Button
          disabled={state.saving}
          onClick={onClose}
          size="sm"
          variant="outline"
        >
          Reject
        </Button>
        <Button
          disabled={
            state.saving ||
            state.keptIndices.size === 0 ||
            state.reaskingIndex !== null
          }
          onClick={onConfirm}
          size="sm"
        >
          {state.saving ? (
            <>
              <Loader2 className="me-1.5 size-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            'Confirm'
          )}
        </Button>
      </div>
    </dialog>
  );
}

function CorrectionRow({
  correction,
  disabled,
  index,
  kept,
  meaningIndex,
  onReask,
  onSelectMeaning,
  onToggleKeep,
  onTypedChange,
  reasking,
  typed,
}: {
  correction: ValidatedCorrection;
  disabled: boolean;
  index: number;
  kept: boolean;
  meaningIndex: number;
  onReask: () => void;
  onSelectMeaning: (meaningIndex: number) => void;
  onToggleKeep: (checked: boolean) => void;
  onTypedChange: (value: string) => void;
  reasking: boolean;
  typed: string;
}) {
  const selected = correction.meanings[meaningIndex] ?? correction.meanings[0];

  return (
    <div
      className="space-y-2 rounded-md border p-2.5"
      data-ink-correction={String(index)}
    >
      <label className="flex cursor-pointer items-start gap-2">
        <Checkbox
          aria-label={`Keep correction ${index + 1}`}
          checked={kept}
          disabled={disabled}
          onCheckedChange={(checked) => onToggleKeep(checked === true)}
        />
        <span className="flex-1 leading-snug">
          <span className="font-medium">{describeMeaning(selected)}</span>
          {!correction.defaultKept && (
            <span className="ms-1.5 text-xs text-muted-foreground">
              (on same paragraph)
            </span>
          )}
        </span>
      </label>

      {correction.meanings.length > 1 && (
        <div className="flex flex-wrap gap-1.5 ps-6">
          {correction.meanings.map((meaning, mIndex) => (
            <Button
              disabled={disabled}
              key={describeMeaning(meaning)}
              onClick={() => onSelectMeaning(mIndex)}
              size="xs"
              variant={mIndex === meaningIndex ? 'secondary' : 'outline'}
            >
              {describeMeaning(meaning)}
            </Button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 ps-6">
        <Input
          aria-label={`Typed meaning for correction ${index + 1}`}
          className="h-7 text-xs"
          disabled={disabled || reasking}
          onChange={(e) => onTypedChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onReask();
            }
          }}
          placeholder="Type another meaning..."
          value={typed}
        />
        <Button
          disabled={disabled || reasking || typed.trim().length === 0}
          onClick={onReask}
          size="xs"
          variant="outline"
        >
          {reasking ? 'Asking...' : 'Ask again'}
        </Button>
      </div>
    </div>
  );
}

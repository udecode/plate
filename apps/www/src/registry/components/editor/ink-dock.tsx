'use client';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  RotateCcw,
  SparklesIcon,
  Trash2Icon,
  X,
} from 'lucide-react';
import { getEditorRuntimeOwner } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import type { InkBrush } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import {
  useEditableRef,
  useEditor,
  useEditorSelector,
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
import {
  classifyInkToolKind,
  getInkBrushPrefs,
  INK_ERASER_SIZES,
  INK_HIGHLIGHT_COLORS,
  INK_HIGHLIGHT_SIZES,
  INK_PEN_COLORS,
  INK_PEN_SIZES,
  type InkToolKind,
  toolForInkKind,
  useInkBrushPrefs,
} from '@/registry/components/editor/draw-toolbar-button';
import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from '@/registry/components/editor/floating-popover';
import { AI_SETTINGS_OPEN_EVENT } from '@/registry/components/editor/settings-dialog';
import { Toolbar, ToolbarButton } from '@/registry/components/editor/toolbar';
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
const SIZE_NAMES = [
  ['Small', 'S'],
  ['Medium', 'M'],
  ['Large', 'L'],
] as const;

const digitizeAllByEditable = new WeakMap<HTMLElement, () => void>();
const digitizeAllByView = new WeakMap<object, () => void>();
const digitizeAllByOwner = new WeakMap<object, Set<() => void>>();

// One Digitize run at a time per editor: every view of it hides its dock and
// lasso actions while one view reads, confirms or saves.
type DigitizeLock = { holder: object | null; listeners: Set<() => void> };

const digitizeLocks = new WeakMap<object, DigitizeLock>();

const digitizeLock = (owner: object) => {
  let lock = digitizeLocks.get(owner);

  if (!lock) {
    lock = { holder: null, listeners: new Set() };
    digitizeLocks.set(owner, lock);
  }

  return lock;
};

const claimDigitizeLock = (owner: object, holder: object) => {
  const lock = digitizeLock(owner);

  if (lock.holder && lock.holder !== holder) return false;
  if (lock.holder !== holder) {
    lock.holder = holder;
    for (const listener of lock.listeners) listener();
  }

  return true;
};

const releaseDigitizeLock = (owner: object, holder: object) => {
  const lock = digitizeLock(owner);

  if (lock.holder !== holder) return;
  lock.holder = null;
  for (const listener of lock.listeners) listener();
};

function useDigitizeLocked(owner: object) {
  const subscribe = React.useCallback(
    (listener: () => void) => {
      const lock = digitizeLock(owner);

      lock.listeners.add(listener);

      return () => {
        lock.listeners.delete(listener);
      };
    },
    [owner]
  );
  const getSnapshot = React.useCallback(
    () => digitizeLock(owner).holder !== null,
    [owner]
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

type DigitizeKindFilter = InkDigitizeEdit['kind'] | 'all';

type FlyoutClose = 'escape' | 'layer' | 'outside' | 'pick';

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

const keepFocus = (event: React.MouseEvent) => event.preventDefault();

const editorContainerOf = (editable: HTMLElement | null) =>
  editable?.closest('[data-slot="editor-container"]') ?? null;

/**
 * Digitize every live shown mark of the view that has focus, in batches. A
 * shared toolbar routes the press to the focused split pane's dock.
 */
export function DigitizeAllToolbarButton() {
  const editor = useEditor();
  const disabled = useEditorSelector(
    (current) => {
      if (current.read.view.isReadOnly()) return true;

      const authored = current.plugin(AuthoredPlugin);

      return authored.installed && 'preview' in authored.read.view();
    },
    { dependsOn: ['readOnly', 'authored'] }
  );
  const hasLiveMarks = useEditorSelector(
    (current) => liveShownInkMarkIds(current).length > 0
  );
  const locked = useDigitizeLocked(getEditorRuntimeOwner(editor));

  return (
    <ToolbarButton
      aria-label="Digitize all ink"
      disabled={disabled || locked || !hasLiveMarks}
      onClick={() => {
        const editable = editor.api.dom.editable();
        const trigger =
          (editable && digitizeAllByEditable.get(editable)) ??
          digitizeAllByView.get(editor) ??
          digitizeAllByOwner.get(getEditorRuntimeOwner(editor))?.values().next()
            .value;

        trigger?.();
      }}
      tooltip="Digitize all ink"
    >
      <SparklesIcon />
    </ToolbarButton>
  );
}

function PenNib({ color }: { color: string }) {
  return (
    <svg aria-hidden fill="none" viewBox="0 0 24 24">
      <path
        d="M8 23V12l4-9 4 9v11"
        fill="var(--background)"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path d="M10.2 7 12 3l1.8 4Z" fill={color} />
      <path d="M8 12h8" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

function HighlighterNib({ color }: { color: string }) {
  return (
    <svg aria-hidden fill="none" viewBox="0 0 24 24">
      <path
        d="M7 23v-9h10v9"
        fill="var(--background)"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.5 14v-3.5l7-3.5v7"
        fill={color}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}

function EraserNib() {
  return (
    <svg aria-hidden fill="none" viewBox="0 0 24 24">
      <path
        d="M7.5 23V11a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v12"
        fill="var(--background)"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <rect
        fill="currentColor"
        fillOpacity={0.2}
        height={5.25}
        rx={1.25}
        width={7.5}
        x={8.25}
        y={9.75}
      />
      <path d="M7.5 15h9" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

function LassoNib() {
  return (
    <svg
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <ellipse cx={12} cy={9} rx={7.5} ry={5} strokeDasharray="3 2.5" />
      <path d="M8 13.5c-1.3 1-1.8 2.3-1.3 3.6.5 1.4 2 1.9 3.3 1.4" />
      <circle cx={11} cy={18.4} fill="currentColor" r={1.2} stroke="none" />
    </svg>
  );
}

function BrushOptionsIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      viewBox="0 0 24 24"
    >
      <path d="M5 6.5h14" strokeWidth={1} />
      <path d="M5 12h14" strokeWidth={2} />
      <path d="M5 17.5h14" strokeWidth={3.5} />
    </svg>
  );
}

function SizePreview({
  color,
  kind,
  size,
}: {
  color: string;
  kind: InkToolKind;
  size: number;
}) {
  if (kind === 'eraser') {
    return (
      <svg aria-hidden viewBox="0 0 16 16">
        <circle
          cx={8}
          cy={8}
          fill="none"
          r={size / 4}
          stroke="currentColor"
          strokeWidth={1.25}
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 16 16">
      <line
        stroke={color}
        strokeLinecap="round"
        strokeOpacity={kind === 'highlighter' ? 0.55 : 1}
        strokeWidth={kind === 'highlighter' ? size / 3 : size}
        x1={3}
        x2={13}
        y1={8}
        y2={8}
      />
    </svg>
  );
}

function SwatchRow({
  brush,
  colors,
  onPick,
}: {
  brush: InkBrush;
  colors: typeof INK_HIGHLIGHT_COLORS | typeof INK_PEN_COLORS;
  onPick: (color: string) => void;
}) {
  return colors.map((swatch) => (
    <button
      aria-label={swatch.label}
      aria-pressed={brush.color === swatch.value}
      className="size-5 shrink-0 rounded-full border border-black/10 transition-transform outline-none hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:ring-2 aria-pressed:ring-ring aria-pressed:ring-offset-2 aria-pressed:ring-offset-background dark:border-white/15"
      key={swatch.value}
      onClick={() => onPick(swatch.value)}
      onMouseDown={keepFocus}
      style={{ backgroundColor: swatch.value }}
      title={swatch.label}
      type="button"
    />
  ));
}

/**
 * The floating ink dock at the bottom of a view: Pen, Highlighter, Eraser and
 * Lasso with remembered brushes, color swatches, a width flyout, the lasso's
 * actions, and the Digitize reading and confirmation for this view.
 */
export function InkDock() {
  const editor = useEditor();
  const editableRef = useEditableRef();
  const owner = getEditorRuntimeOwner(editor);
  const prefs = useInkBrushPrefs();
  const tool = useViewStore(InkPlugin, (state) => state.tool);
  const hidden = useViewStore(InkPlugin, (state) => state.hidden);
  const picked = useViewStore(InkPlugin, (state) => state.picked);
  const readOnly = useEditorSelector(
    (current) => current.read.view.isReadOnly(),
    { dependsOn: 'readOnly' }
  );
  const authoredPreview = useEditorSelector(
    (current) => {
      const authored = current.plugin(AuthoredPlugin);

      if (!authored.installed) return false;

      return 'preview' in authored.read.view();
    },
    { dependsOn: 'authored' }
  );
  const canDigitize = !readOnly && !authoredPreview;
  const ownerLocked = useDigitizeLocked(owner);

  const { pickedDigitized, pickedLive, pickedShown } = useEditorSelector(
    (current) => {
      const ink = current.plugin(InkPlugin);
      const shown = new Set(ink.read.shownMarks().map((mark) => mark.id));
      const live = new Set(ink.read.liveMarks().map((mark) => mark.id));
      const shownIds: string[] = [];
      const liveIds: string[] = [];
      const digitizedIds: string[] = [];

      for (const id of picked) {
        if (shown.has(id)) {
          shownIds.push(id);
          if (live.has(id)) liveIds.push(id);
        } else if (ink.read.mark(id)) digitizedIds.push(id);
      }

      return {
        pickedDigitized: digitizedIds,
        pickedLive: liveIds,
        pickedShown: shownIds,
      };
    }
  );

  const [lockToken] = React.useState(() => ({}));
  const [session, setSession] = React.useState<SessionState>({ kind: 'idle' });
  const [prevCanDigitize, setPrevCanDigitize] = React.useState(canDigitize);
  const [collapsed, setCollapsed] = React.useState(false);
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const [pill, setPill] = React.useState<HTMLDivElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const savingRef = React.useRef(false);
  const dockRef = React.useRef<HTMLDivElement | null>(null);
  const sessionRef = React.useRef<HTMLDivElement | null>(null);
  const flyoutRef = React.useRef<HTMLDivElement | null>(null);
  const flyoutCloseRef = React.useRef<FlyoutClose | null>(null);
  const flyoutByKeyboardRef = React.useRef(false);

  if (prevCanDigitize !== canDigitize) {
    setPrevCanDigitize(canDigitize);
    if (!canDigitize && session.kind !== 'idle') {
      setSession({ kind: 'idle' });
    }
  }

  const activeTool = tool && canDigitize && !hidden ? tool : null;
  const activeKind = activeTool ? classifyInkToolKind(activeTool) : null;
  const activeBrush = activeTool?.type === 'draw' ? activeTool.brush : null;
  const showTools = activeKind !== null && !ownerLocked;
  const flyoutAllowed = showTools && !collapsed && activeKind !== 'lasso';

  if (flyoutOpen && !flyoutAllowed) setFlyoutOpen(false);

  const closeSession = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    savingRef.current = false;
    releaseDigitizeLock(owner, lockToken);

    const active = document.activeElement;

    if (active && dockRef.current?.contains(active)) editor.api.dom.focus();
    setSession({ kind: 'idle' });
  }, [editor, lockToken, owner]);

  React.useEffect(() => {
    if (!canDigitize) {
      abortRef.current?.abort();
      abortRef.current = null;
    }
  }, [canDigitize]);

  React.useEffect(
    () => () => {
      abortRef.current?.abort();
      releaseDigitizeLock(owner, lockToken);
    },
    [lockToken, owner]
  );

  const locked = session.kind === 'loading' || session.kind === 'confirm';
  const savingConfirm = session.kind === 'confirm' && session.state.saving;

  React.useEffect(() => {
    if (locked) {
      sessionRef.current?.focus({ preventScroll: true });

      return;
    }
    releaseDigitizeLock(owner, lockToken);
  }, [locked, lockToken, owner]);

  const escapeSession = React.useEffectEvent(() => {
    if (!savingConfirm) closeSession();
  });

  React.useEffect(() => {
    if (!locked) return undefined;

    const dock = dockRef.current;
    const container = editorContainerOf(editableRef.current);
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
      const { target } = event;
      const ours =
        target === document.body ||
        (target instanceof Node &&
          (!!dock?.contains(target) || !!container?.contains(target)));

      if (event.key === 'Escape') {
        // Escape in another split pane belongs to that pane.
        if (!ours) return;
        event.preventDefault();
        event.stopPropagation();
        escapeSession();

        return;
      }

      if (target instanceof Element) {
        if (target.closest('[data-ink-digitize-ui]')) return;
        if (!ours) return;
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
  }, [editableRef, locked]);

  const closeFlyout = React.useCallback((reason: FlyoutClose) => {
    flyoutCloseRef.current = reason;
    setFlyoutOpen(false);
  }, []);

  const openFlyout = (byKeyboard: boolean) => {
    flyoutCloseRef.current = null;
    flyoutByKeyboardRef.current = byKeyboard;
    setFlyoutOpen(true);
  };

  React.useEffect(() => {
    if (!flyoutOpen) return undefined;

    const inFlyout = (target: Node) =>
      !!flyoutRef.current?.contains(target) || !!pill?.contains(target);
    // Closing on press without preventing it lets the press that leaves the
    // flyout start a stroke on the layer right away.
    const onPointerDown = (event: PointerEvent) => {
      const { target } = event;

      if (!(target instanceof Node) || inFlyout(target)) return;

      const layer =
        target instanceof Element ? target.closest('[data-ink-layer]') : null;
      const ownLayer =
        !!layer && !!editorContainerOf(editableRef.current)?.contains(layer);

      closeFlyout(ownLayer ? 'layer' : 'outside');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      const { target } = event;
      const ours =
        target === document.body ||
        (target instanceof Node &&
          (inFlyout(target) ||
            !!editorContainerOf(editableRef.current)?.contains(target)));

      if (!ours) return;
      event.preventDefault();
      event.stopPropagation();
      closeFlyout('escape');
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [closeFlyout, editableRef, flyoutOpen, pill]);

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
      if (!claimDigitizeLock(owner, lockToken)) return;
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
    [closeSession, editor, lockToken, owner, readAiConfig]
  );

  const runDigitizeAll = React.useCallback(() => {
    const batches = planInkDigitizeAllBatches(editor);

    if (batches.length === 0) return;
    if (!claimDigitizeLock(owner, lockToken)) return;

    const [first, ...remaining] = batches;

    void runDigitize(first, {
      batch:
        batches.length > 1
          ? { index: 0, remaining, total: batches.length }
          : null,
    });
  }, [editor, lockToken, owner, runDigitize]);

  React.useEffect(() => {
    const triggers = digitizeAllByOwner.get(owner) ?? new Set();
    // A press from a toolbar starts a run only while no view of the editor
    // has one.
    const trigger = () => {
      if (digitizeLock(owner).holder) return;
      runDigitizeAll();
    };
    const editable = editableRef.current;

    digitizeAllByOwner.set(owner, triggers);
    digitizeAllByView.set(editor, trigger);
    if (editable) digitizeAllByEditable.set(editable, trigger);
    triggers.add(trigger);

    return () => {
      if (digitizeAllByView.get(editor) === trigger) {
        digitizeAllByView.delete(editor);
      }
      if (editable && digitizeAllByEditable.get(editable) === trigger) {
        digitizeAllByEditable.delete(editable);
      }
      triggers.delete(trigger);
    };
  }, [editableRef, editor, owner, runDigitizeAll]);

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
    if (savingRef.current || !claimDigitizeLock(owner, lockToken)) return;
    savingRef.current = true;

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

    savingRef.current = false;

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
  }, [closeSession, editor, lockToken, owner, runDigitize, session]);

  const handleBringBack = React.useCallback(() => {
    if (pickedDigitized.length === 0 || !canDigitize) return;
    editor.update((tx) => {
      tx.plugin(InkPlugin).setDigitized(pickedDigitized, false);
    });
    editor.plugin(InkPlugin).api.setPicked([]);
  }, [canDigitize, editor, pickedDigitized]);

  const handleDelete = () => {
    if (!canDigitize) return;

    const ink = editor.plugin(InkPlugin);
    const live = new Set(ink.read.liveMarks().map((mark) => mark.id));
    const ids = ink.viewStore.get('picked').filter((id) => live.has(id));

    if (ids.length === 0) return;
    editor.update((tx) => {
      tx.plugin(InkPlugin).remove(ids);
      ink.api.setPicked([]);
    });
  };

  const setKind = (kind: InkToolKind, byKeyboard: boolean) => {
    if (kind === activeKind && kind !== 'lasso') {
      if (flyoutOpen) closeFlyout('pick');
      else openFlyout(byKeyboard);

      return;
    }
    editor
      .plugin(InkPlugin)
      .api.setTool(toolForInkKind(getInkBrushPrefs(editor), kind));
    if (kind === 'lasso' && flyoutOpen) closeFlyout('pick');
  };

  const setBrush = (patch: Partial<InkBrush>) => {
    const ink = editor.plugin(InkPlugin);
    const current = ink.viewStore.get('tool');

    if (current?.type !== 'draw') return;
    ink.api.setTool({ brush: { ...current.brush, ...patch }, type: 'draw' });
  };

  const setSize = (size: number) => {
    const ink = editor.plugin(InkPlugin);
    const current = ink.viewStore.get('tool');

    if (current?.type === 'erase') ink.api.setTool({ size, type: 'erase' });
    else setBrush({ size });
  };

  const showLasso =
    session.kind === 'idle' &&
    !ownerLocked &&
    (pickedShown.length > 0 || pickedDigitized.length > 0);

  if (!showTools && !showLasso && session.kind === 'idle') return null;

  const colors =
    activeKind === 'highlighter' ? INK_HIGHLIGHT_COLORS : INK_PEN_COLORS;
  const sizes =
    activeKind === 'eraser'
      ? INK_ERASER_SIZES
      : activeKind === 'highlighter'
        ? INK_HIGHLIGHT_SIZES
        : INK_PEN_SIZES;
  const currentSize =
    activeTool?.type === 'erase' ? activeTool.size : activeBrush?.size;
  const tools = [
    {
      icon: <PenNib color={prefs.pen.color} />,
      kind: 'pen',
      label: 'Pen',
    },
    {
      icon: <HighlighterNib color={prefs.highlighter.color} />,
      kind: 'highlighter',
      label: 'Highlighter',
    },
    { icon: <EraserNib />, kind: 'eraser', label: 'Eraser' },
    { icon: <LassoNib />, kind: 'lasso', label: 'Lasso' },
  ] as const;
  const activeIcon = tools.find((item) => item.kind === activeKind)?.icon;

  return (
    <div
      className="pointer-events-none sticky top-[calc(100%-1rem)] bottom-4 z-50 flex h-0 items-end justify-center overflow-visible px-4"
      data-ink-digitize-locked={locked ? 'true' : undefined}
      data-ink-digitize-ui=""
      ref={dockRef}
    >
      {(showTools || showLasso) && (
        <div className="relative flex max-w-full flex-col items-center gap-2">
          {showLasso && (
            <div
              className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-xl border bg-background/95 px-2 py-1 shadow-md backdrop-blur-md"
              data-ink-lasso-actions=""
            >
              <span
                aria-live="polite"
                className="px-1 text-xs font-medium text-muted-foreground tabular-nums"
              >
                {pickedLive.length + pickedDigitized.length} selected
              </span>
              {pickedShown.length > 0 && (
                <>
                  <Button
                    disabled={!canDigitize}
                    onClick={() => {
                      if (digitizeLock(owner).holder) return;
                      void runDigitize(pickedShown);
                    }}
                    onMouseDown={keepFocus}
                    size="sm"
                  >
                    <SparklesIcon className="me-1.5 size-3.5" />
                    Digitize
                  </Button>
                  <Button
                    disabled={!canDigitize || pickedLive.length === 0}
                    onClick={handleDelete}
                    onMouseDown={keepFocus}
                    size="sm"
                    variant="outline"
                  >
                    <Trash2Icon className="me-1.5 size-3.5" />
                    Delete
                  </Button>
                </>
              )}
              {pickedDigitized.length > 0 && (
                <Button
                  disabled={!canDigitize}
                  onClick={handleBringBack}
                  onMouseDown={keepFocus}
                  size="sm"
                  variant="outline"
                >
                  <RotateCcw className="me-1.5 size-3.5" />
                  Bring back
                </Button>
              )}
              <Button
                onClick={() => editor.plugin(InkPlugin).api.setPicked([])}
                onMouseDown={keepFocus}
                size="sm"
                variant="ghost"
              >
                Clear pick
              </Button>
            </div>
          )}

          {showTools && (
            <Toolbar
              aria-label="Ink tools"
              className="pointer-events-auto max-w-full gap-1 rounded-2xl border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-md"
              data-ink-dock=""
              data-state={collapsed ? 'collapsed' : 'expanded'}
              ref={setPill}
            >
              {collapsed ? (
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center [&_svg]:size-6"
                >
                  {activeIcon}
                </span>
              ) : (
                <>
                  {tools.map((item) => (
                    <ToolbarButton
                      className="size-8 p-0 [&_svg]:size-6! [&_svg]:transition-transform aria-pressed:[&_svg]:-translate-y-0.5"
                      key={item.kind}
                      onClick={(event) =>
                        setKind(item.kind, event.detail === 0)
                      }
                      pressed={activeKind === item.kind}
                      tooltip={item.label}
                    >
                      {item.icon}
                    </ToolbarButton>
                  ))}

                  {activeBrush && (
                    <>
                      <div aria-hidden className="mx-0.5 h-5 w-px bg-border" />
                      <div
                        aria-label="Colors"
                        className="hidden items-center gap-1.5 px-1 sm:flex"
                        role="group"
                      >
                        <SwatchRow
                          brush={activeBrush}
                          colors={colors}
                          onPick={(color) => setBrush({ color })}
                        />
                      </div>
                      <input
                        aria-label="Custom color"
                        className="size-5 shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-black/10 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-black/10 [&::-webkit-color-swatch-wrapper]:p-0"
                        onInput={(event) =>
                          setBrush({ color: event.currentTarget.value })
                        }
                        title="Custom color"
                        type="color"
                        value={activeBrush.color}
                      />
                    </>
                  )}

                  {activeKind !== 'lasso' && (
                    <ToolbarButton
                      aria-expanded={flyoutOpen}
                      className="size-8 p-0"
                      onClick={(event) => {
                        if (flyoutOpen) closeFlyout('pick');
                        else openFlyout(event.detail === 0);
                      }}
                      pressed={flyoutOpen}
                      tooltip="Brush options"
                    >
                      <BrushOptionsIcon />
                    </ToolbarButton>
                  )}
                </>
              )}

              <div aria-hidden className="mx-0.5 h-5 w-px bg-border" />
              <ToolbarButton
                className="size-8 p-0"
                onClick={() => setCollapsed(!collapsed)}
                tooltip={collapsed ? 'Expand ink tools' : 'Collapse ink tools'}
              >
                {collapsed ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </ToolbarButton>
              <ToolbarButton
                className="h-8 gap-1 px-2"
                onClick={() => editor.plugin(InkPlugin).api.setTool(null)}
                tooltip="Done"
              >
                <CheckIcon />
                <span className="text-xs font-medium max-sm:sr-only">Done</span>
              </ToolbarButton>
            </Toolbar>
          )}

          <FloatingPopover
            insideElement={pill}
            onOpenChange={(open) => {
              if (!open) setFlyoutOpen(false);
            }}
            open={flyoutOpen}
          >
            <FloatingPopoverAnchor element={pill} />
            <FloatingPopoverContent
              className="w-auto p-2"
              data-ink-brush-flyout=""
              onFinalFocus={(event) => {
                event.preventDefault();

                const reason = flyoutCloseRef.current;

                flyoutCloseRef.current = null;
                if (
                  reason === 'escape' ||
                  reason === 'layer' ||
                  reason === 'pick'
                ) {
                  editor.api.dom.focus();
                }
              }}
              onInitialFocus={(event) => {
                if (!flyoutByKeyboardRef.current) event.preventDefault();
              }}
              ref={flyoutRef}
              side="top"
              sideOffset={8}
            >
              {activeKind && activeKind !== 'lasso' && (
                <div className="flex flex-col gap-2">
                  <div
                    aria-label={
                      activeKind === 'eraser' ? 'Eraser size' : 'Width'
                    }
                    className="flex items-center gap-1"
                    role="group"
                  >
                    {sizes.map((size, index) => (
                      <button
                        aria-label={SIZE_NAMES[index][0]}
                        aria-pressed={currentSize === size}
                        className="flex h-8 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-muted-foreground outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-pressed:bg-accent aria-pressed:text-accent-foreground [&_svg]:size-4"
                        key={size}
                        onClick={() => {
                          setSize(size);
                          closeFlyout('pick');
                        }}
                        onMouseDown={keepFocus}
                        title={`${SIZE_NAMES[index][0]} (${size}px)`}
                        type="button"
                      >
                        <SizePreview
                          color={activeBrush?.color ?? 'currentColor'}
                          kind={activeKind}
                          size={size}
                        />
                        {SIZE_NAMES[index][1]}
                      </button>
                    ))}
                  </div>
                  {activeBrush && (
                    <div
                      aria-label="Colors"
                      className="flex items-center gap-1.5 px-1 pb-0.5 sm:hidden"
                      role="group"
                    >
                      <SwatchRow
                        brush={activeBrush}
                        colors={colors}
                        onPick={(color) => setBrush({ color })}
                      />
                    </div>
                  )}
                </div>
              )}
            </FloatingPopoverContent>
          </FloatingPopover>
        </div>
      )}

      {session.kind !== 'idle' && (
        <div
          className="pointer-events-none absolute inset-x-4 bottom-0 flex justify-center outline-none"
          ref={sessionRef}
          tabIndex={-1}
        >
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
              className="pointer-events-auto static m-0 max-h-[min(65dvh,32rem)] w-full max-w-md overflow-y-auto rounded-lg border bg-background p-4 text-sm text-foreground shadow-lg"
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
                    This pick covers {session.notice.wordCount} words (limit
                    1,000).
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
                    A passage is too large to render. Erase its mark and try
                    again.
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
                      prev.state.manualKeptBeforeFilter ??
                      prev.state.keptIndices;

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
      className="pointer-events-auto static m-0 flex max-h-[min(65dvh,32rem)] w-full max-w-lg flex-col rounded-lg border bg-background p-4 text-sm text-foreground shadow-xl"
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

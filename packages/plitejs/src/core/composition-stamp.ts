import type {
  AnyEditor as Editor,
  EditorCommandPlace,
} from '../interfaces/editor';
import type { Point } from '../interfaces/point';
import { getEditorRuntimeOwner } from './editor-runtime';
import {
  countingPlacements,
  getPlacementCount,
  getTransactionSnapshot,
} from './public-state';

/**
 * The stored place a composition commit writes at: the caret, or the start of
 * the selection it replaces.
 *
 * @internal
 */
export type CompositionStamp = Readonly<{ place: Point }>;

type StampedFrame = {
  readonly explicit: boolean;
  /**
   * Where the stamped invocation's input located to, by identity, once its
   * entry has located it.
   */
  located: Readonly<{ at: unknown }> | null;
  readonly resolvePlace?: (at: unknown) => CompositionStamp | null;
  stamp: CompositionStamp | null;
  used: boolean;
};

const PENDING = new WeakMap<Editor, CompositionStamp>();
const FRAMES = new WeakMap<Editor, StampedFrame>();
const PLACES = new WeakMap<EditorCommandPlace, StampedFrame>();

/**
 * Runs `run` with `stamp` on the first command frame it opens, which runs the
 * composition's insert-text invocation. The stamp never enters command input.
 *
 * @internal
 */
export const withCompositionStamp = <T>(
  editor: Editor,
  stamp: CompositionStamp,
  run: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = PENDING.get(owner);

  PENDING.set(owner, stamp);
  try {
    return run();
  } finally {
    if (previous) PENDING.set(owner, previous);
    else PENDING.delete(owner);
  }
};

/**
 * Takes the pending stamp for the command frame that opens, so no later
 * frame in the update carries it.
 *
 * @internal
 */
export const takeCompositionStamp = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  const stamp = PENDING.get(owner) ?? null;

  PENDING.delete(owner);

  return stamp;
};

/** @internal */
export const stampFrame = (
  stamp: CompositionStamp | null,
  place: EditorCommandPlace,
  options?: Readonly<{
    explicit?: boolean;
    resolvePlace?: (at: unknown) => CompositionStamp | null;
  }>
) => {
  const frame: StampedFrame = {
    explicit: options?.explicit ?? stamp !== null,
    located: null,
    resolvePlace: options?.resolvePlace,
    stamp,
    used: false,
  };

  PLACES.set(place, frame);

  return frame;
};

/** @internal */
export const setFrameStamp = (
  frame: StampedFrame | null,
  stamp: CompositionStamp | null
) => {
  if (frame && !frame.explicit) frame.stamp = stamp;
};

/** @internal */
export const runStampedFrame = <T>(
  editor: Editor,
  frame: StampedFrame | null,
  run: () => T
): T => {
  if (!frame) return run();
  const owner = getEditorRuntimeOwner(editor);

  FRAMES.set(owner, frame);
  try {
    return countingPlacements(owner, run);
  } finally {
    FRAMES.delete(owner);
  }
};

/** @internal */
export const recordLocatedDestination = (
  place: EditorCommandPlace,
  at: unknown,
  storedAt?: unknown
) => {
  const frame = PLACES.get(place);

  if (!frame || frame.located) return;
  frame.located = { at };
  if (!frame.explicit && storedAt !== undefined && frame.resolvePlace) {
    frame.stamp = frame.resolvePlace(storedAt);
  }
};

/** @internal */
export const writeComposedText = (
  editor: Editor,
  at: unknown,
  text: string,
  write: () => void,
  movedCaret = false
) => {
  const owner = getEditorRuntimeOwner(editor);
  const frame = FRAMES.get(owner);
  const claims =
    !!frame?.stamp &&
    !!frame.located &&
    text.length > 0 &&
    frame.located.at === at &&
    getPlacementCount(owner) === (movedCaret ? 1 : 0);
  const builder = claims ? getTransactionSnapshot(owner)?.builder : undefined;

  if (frame?.stamp && builder) {
    frame.used = true;
    builder.withComposition(frame.stamp, write);
  } else {
    write();
  }
};

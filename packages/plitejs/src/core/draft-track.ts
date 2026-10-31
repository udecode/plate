import { MAIN_ROOT_KEY } from '../internal/root-location';
import type { ChangeDraft } from './change/builder';
import { valueRootIndex } from './change/document-change';
import type { DraftGuardFrame, PositionMap } from './document-recorder';

export type DraftSpan = Readonly<{ from: number; to: number }>;

export type DraftTrack = {
  builder: ChangeDraft | null;
  readonly root: string;
  spans: readonly DraftSpan[];
  steps: number;
};

const TRACKS = new WeakMap<object, Set<DraftTrack>>();

const mapSpans = (
  root: string,
  spans: readonly DraftSpan[],
  map: PositionMap
): DraftSpan[] | null => {
  const mapped: DraftSpan[] = [];

  for (const span of spans) {
    const from = map(root, span.from, 1);
    const to = map(root, span.to, -1);

    if (from === null || to === null) return null;
    mapped.push({ from, to });
  }

  return mapped;
};

const advance = (track: DraftTrack) => {
  const steps = track.builder?.draftSteps ?? [];

  for (const step of steps.slice(track.steps)) {
    const spans = mapSpans(track.root, track.spans, (root, position, assoc) =>
      step.change.mapPosition(position, {
        association: assoc === 1 ? 'forward' : 'backward',
        ...(root === MAIN_ROOT_KEY ? {} : { root }),
      })
    );

    if (!spans) {
      track.builder = null;

      return;
    }
    track.spans = spans;
  }
  track.steps = steps.length;
};

export const trackDraftSpans = (
  owner: object,
  builder: ChangeDraft,
  root: string,
  spans: readonly DraftSpan[]
): DraftTrack => {
  const track: DraftTrack = {
    builder,
    root,
    spans,
    steps: builder.draftSteps.length,
  };
  const tracks = TRACKS.get(owner) ?? new Set<DraftTrack>();

  tracks.add(track);
  TRACKS.set(owner, tracks);

  return track;
};

export const settleDraftTrack = (track: DraftTrack) => {
  advance(track);

  return track.builder ? track.spans : null;
};

export const readDraftTrack = (
  track: DraftTrack,
  written: object,
  frame?: DraftGuardFrame
): readonly DraftSpan[] | null => {
  advance(track);

  if (track.builder?.value !== (frame ? frame.stored : written)) return null;

  return frame
    ? mapSpans(track.root, track.spans, frame.mapPosition)
    : track.spans;
};

/**
 * The track in the projection a command frame started from, or `null` when
 * that projection cannot place it.
 */
export const readDraftTrackAt = (track: DraftTrack, frame: DraftGuardFrame) => {
  advance(track);

  const { builder, root } = track;

  if (builder?.value !== frame.stored) return null;

  const { indexes, map, value } = frame.start;
  const spans = mapSpans(root, track.spans, (at, position, assoc) =>
    map.toProjected(at, position, assoc === 1 ? 'forward' : 'backward')
  );

  return (
    spans && {
      index:
        indexes.get(root) ??
        (map.roots.includes(root)
          ? valueRootIndex(value, root)
          : builder.getIndex(root)),
      spans,
    }
  );
};

export const moveDraftTracks = (
  owner: object,
  from: ChangeDraft,
  to: ChangeDraft,
  map: PositionMap | null
) => {
  const tracks = TRACKS.get(owner);

  if (!tracks) return;
  for (const track of tracks) {
    if (track.builder === from) advance(track);
    if (track.builder !== from) {
      if (!track.builder) tracks.delete(track);
      continue;
    }

    const spans = map && mapSpans(track.root, track.spans, map);

    if (spans) {
      track.builder = to;
      track.spans = spans;
      track.steps = to.draftSteps.length;
    } else {
      track.builder = null;
      tracks.delete(track);
    }
  }
};

import type { BoardWorkload } from './stub-board';

/**
 * The browser lanes' cohorts, query and plants. The dev page and the
 * Playwright spec both read this file, so it imports no editor code.
 */

/** Where the board's camera looks: at the typed note, at the board's origin, or at every shape. */
export type BoardView = 'typed' | 'origin' | 'dense';

/** What a cohort's name claims: the workload and where the camera looks. */
export type BrowserClaim = Readonly<{
  view: BoardView;
  workload: BoardWorkload;
}>;

const plain: BoardWorkload = {
  arrowsToTyped: 0,
  boards: 1,
  dense: false,
  frameMembers: 0,
  intent: 'plain',
  pending: 0,
  placement: 'spread',
  position: 'middle',
  shapes: 4000,
};

export const BROWSER_COHORTS: Readonly<Record<string, BrowserClaim>> = {
  F1000: { view: 'origin', workload: { ...plain, frameMembers: 1000 } },
  J4000: {
    view: 'typed',
    workload: {
      ...plain,
      arrowsToTyped: 64,
      frameMembers: 1000,
      pending: 1000,
    },
  },
  N1000: { view: 'typed', workload: { ...plain, shapes: 1000 } },
  N4000: { view: 'typed', workload: plain },
  'N4000-dense': { view: 'dense', workload: { ...plain, dense: true } },
  N50: { view: 'typed', workload: { ...plain, shapes: 50 } },
  'N50-framed': {
    view: 'typed',
    workload: { ...plain, pending: 12, shapes: 50 },
  },
};

/**
 * The 50-shape control a cohort reads against. A key with any pending change
 * frames, so a cohort with pending shapes reads against a framed control, as
 * the model lane's does.
 */
export const controlCohortOf = (cohort: string) =>
  (BROWSER_COHORTS[cohort]?.workload.pending ?? 0) > 0 ? 'N50-framed' : 'N50';

/**
 * The renderer arms. W is the gate's arm: the board mounts its root through
 * `slots.contentRoot('shapes', { viewport })`, whose viewport keeps only the
 * shapes the view's camera meets, found through a view-local rbush index,
 * plus the shapes that hold the selection. A mounts every shape, an uncosted
 * full-DOM control.
 */
const RENDER_ARMS = ['A', 'W'] as const;

export type RenderArm = (typeof RENDER_ARMS)[number];

/** The arm a known-bad `arm` cohort mounts instead of the one it names. */
export const NEXT_RENDER_ARM: Readonly<Record<RenderArm, RenderArm>> = {
  A: 'W',
  W: 'A',
};

/**
 * A known-bad cohort keeps its name and breaks one parameter. N, A, S, F and
 * position break the stub board as the model lane does; `view` puts a dense
 * claim behind the typed-note camera, and `arm` mounts the next renderer arm.
 */
const BROWSER_FAULTS = ['N', 'A', 'S', 'F', 'position', 'view', 'arm'] as const;

export type BrowserFault = (typeof BROWSER_FAULTS)[number];

/**
 * The layout plant's shapes per key. More than the 50-shape control, so N2's
 * layout count catches it, and capped, because one forced layout of a
 * 4,000-shape board costs milliseconds and every shape per key took 14 s.
 */
export const LAYOUT_THRASH_SHAPES = 100;

/**
 * The busy plant's milliseconds of work per key. WebKit's clock steps by 1 ms
 * and its 1,000-shape arm B key took 16 to 21 ms, where 8 ms read 1.16 on
 * a 30-key p95.
 */
export const BUSY_PLANT_MS = 12;

/**
 * The defer plant's delay before the mutation lands: three frames, past the
 * frame quantization of a WebKit key that already takes three frames.
 */
export const DEFER_PLANT_MS = 50;

/**
 * Each planted arm, by the line that must reject it:
 * - render: N1, every shape re-renders on every key; on arm W the board
 *   re-renders too, and W1's board-render count rejects it.
 * - shape-render: W1, every mounted shape re-renders on every key while the
 *   board does not, which W1's shape-render count rejects.
 * - shape-selector: W1, every mounted shape adds an editor selector that runs
 *   on every commit and renders nothing, which W1's selector and subscriber
 *   visit count rejects once N mounts more shapes than the 50-shape board.
 * - busy: N1, a BUSY_PLANT_MS busy wait in the key handler.
 * - slow: M0 and J1, busy wait of (factor - 1) times the running median of
 *   the key's own N1 time, or of its own N2 time inside the next frame.
 * - defer: N2, the mutation lands DEFER_PLANT_MS late.
 * - layout: N2, a layout read per shape per key, up to LAYOUT_THRASH_SHAPES
 *   shapes, each after a write that dirties it.
 * - camera-write, pan-render, drop, skip, ignore: P1.
 * - drag-render, drag-ignore, drag-members-still, drag-busy,
 *   drag-members-unmount: G1. The members-still plant moves the frame and
 *   leaves its members; the busy one holds the thread on each move until two
 *   frame intervals past the last frame, so the move loses one frame wherever
 *   in a frame it arrives. On arm W the members-unmount plant drops the
 *   frame's members from the drag's search, so they unmount once the view
 *   stops after the first move.
 * - double-mount, keep-alive: L1. On arm W the first mount of double-mount
 *   skips culling and mounts every shape.
 * - cull-endpoints: the correctness guard; arm W keeps an arrow only when one
 *   of its ends is in view, so an arrow that crosses the view unmounts.
 * - late-motion: the correctness guard; arm W learns that the view moves only
 *   in the view's first frame after a camera change, so a reindex before that
 *   frame unmounts the shapes it showed.
 */
const BOARD_PLANTS = [
  'render',
  'shape-render',
  'shape-selector',
  'busy',
  'slow',
  'defer',
  'layout',
  'camera-write',
  'pan-render',
  'drop',
  'skip',
  'ignore',
  'drag-render',
  'drag-ignore',
  'drag-members-still',
  'drag-busy',
  'drag-members-unmount',
  'double-mount',
  'keep-alive',
  'cull-endpoints',
  'late-motion',
] as const;

export type BoardPlant = (typeof BOARD_PLANTS)[number];

/** `flat` builds a flat document with the cohort's block count, the M0 and L1 control. */
export type BoardBuild = 'board' | 'flat';

export type BoardQuery = Readonly<{
  arm: RenderArm;
  build: BoardBuild;
  cohort: string;
  /** For the slow plant: the ratio it plants and the time it scales. */
  factor: number;
  knownBad: BrowserFault | null;
  plant: BoardPlant | null;
  slowBasis: 'n1' | 'n2';
}>;

const oneOf = <T extends string>(
  name: string,
  value: string | null,
  allowed: readonly T[]
): T => {
  if (!(allowed as ReadonlyArray<string | null>).includes(value)) {
    throw new Error(
      `board-scale page: ${name}=${value} is not one of ${allowed.join(', ')}`
    );
  }

  return value as T;
};

export const parseBoardQuery = (search: string): BoardQuery => {
  const query = new URLSearchParams(search);
  const cohort = query.get('cohort') ?? '';

  if (!Object.hasOwn(BROWSER_COHORTS, cohort)) {
    throw new Error(
      `board-scale page: cohort=${cohort} is not one of ${Object.keys(BROWSER_COHORTS).join(', ')}`
    );
  }

  const factor = Number(query.get('factor') ?? 1.3);

  if (!(factor > 1)) {
    throw new Error(`board-scale page: factor=${factor} must exceed 1`);
  }

  return {
    arm: oneOf('arm', query.get('arm') ?? 'A', RENDER_ARMS),
    build: oneOf('build', query.get('build') ?? 'board', ['board', 'flat']),
    cohort,
    factor,
    knownBad: query.has('knownBad')
      ? oneOf('knownBad', query.get('knownBad'), BROWSER_FAULTS)
      : null,
    plant: query.has('plant')
      ? oneOf('plant', query.get('plant'), BOARD_PLANTS)
      : null,
    slowBasis: oneOf('slowBasis', query.get('slowBasis') ?? 'n1', ['n1', 'n2']),
  };
};

export const boardQueryString = (query: Partial<BoardQuery>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }

  return params.toString();
};

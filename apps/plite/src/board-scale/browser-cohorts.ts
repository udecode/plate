import type { BoardWorkload } from './stub-board';

export type BoardView = 'typed' | 'origin' | 'dense';

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

export const controlCohortOf = (cohort: string) =>
  (BROWSER_COHORTS[cohort]?.workload.pending ?? 0) > 0 ? 'N50-framed' : 'N50';

const RENDER_ARMS = ['A', 'W'] as const;

export type RenderArm = (typeof RENDER_ARMS)[number];

export const NEXT_RENDER_ARM: Readonly<Record<RenderArm, RenderArm>> = {
  A: 'W',
  W: 'A',
};

const BROWSER_FAULTS = ['N', 'A', 'S', 'F', 'position', 'view', 'arm'] as const;

export type BrowserFault = (typeof BROWSER_FAULTS)[number];

export const LAYOUT_THRASH_SHAPES = 100;

/**
 * The busy plant's milliseconds of work per key. WebKit's clock steps by 1 ms
 * and its 1,000-shape arm B key took 16 to 21 ms, where 8 ms read 1.16 on
 * a 30-key p95.
 */
export const BUSY_PLANT_MS = 12;

export const DEFER_PLANT_MS = 50;

type GateLine =
  | 'G1'
  | 'J1'
  | 'L1'
  | 'M0'
  | 'N1'
  | 'N2'
  | 'P1'
  | 'W1'
  | 'correctness guard';

export const PLANT_REJECTING_LINES = {
  render: ['N1', 'W1'],
  'shape-render': ['W1'],
  'shape-selector': ['W1'],
  'view-scan': ['W1'],
  busy: ['N1'],
  slow: ['M0', 'J1'],
  defer: ['N2'],
  layout: ['N2'],
  'camera-write': ['P1'],
  'pan-render': ['P1'],
  drop: ['P1'],
  skip: ['P1'],
  ignore: ['P1'],
  'drag-render': ['G1'],
  'drag-ignore': ['G1'],
  'drag-members-still': ['G1'],
  'drag-busy': ['G1'],
  'drag-members-unmount': ['G1'],
  'double-mount': ['L1'],
  'keep-alive': ['L1'],
  'cull-endpoints': ['correctness guard'],
  'late-motion': ['correctness guard'],
} as const satisfies Readonly<Record<string, readonly GateLine[]>>;

export type BoardPlant = keyof typeof PLANT_REJECTING_LINES;

const BOARD_PLANTS = Object.keys(PLANT_REJECTING_LINES) as BoardPlant[];

export type BoardBuild = 'board' | 'flat';

export type BoardRenderer = 'production' | 'stub';

export type BoardQuery = Readonly<{
  arm: RenderArm;
  build: BoardBuild;
  renderer: BoardRenderer;
  cohort: string;
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
    renderer: oneOf('renderer', query.get('renderer') ?? 'production', [
      'production',
      'stub',
    ]),
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

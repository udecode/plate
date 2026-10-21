import type { Value } from 'platejs';

export const FIND_DENSE_QUERY = 'needle';
export const FIND_DENSE_ALT_QUERY = 'carries';
export const FIND_SPARSE_QUERY = 'lodestar';
export const FIND_CREATE_TAIL = FIND_DENSE_QUERY.slice(0, -1);
export const FIND_CREATE_CHAR = FIND_DENSE_QUERY.slice(-1);
export const FIND_NO_CHANGE_CHAR = 'x';
export const FIND_LEAF_MARK = 'benchFindLeaf';

export type FindDocKind = 'dense' | 'idle' | 'sparse';
export type FindAction =
  | 'create-destroy'
  | 'no-change'
  | 'query-change'
  | 'shift'
  | 'split-above';
export type FindInput = 'proxy' | 'trusted';
export type FindRendering = 'complete' | 'virtualized';
export type FindRefreshMode = 'drop' | 'oracle' | 'pass' | 'wrong-node';

export type FindDocSpec = Readonly<{
  blocks: number;
  id: string;
  kind: FindDocKind;
  query: string;
  rendering: FindRendering;
  wrongActiveIndex?: number;
}>;

export type FindStep =
  | Readonly<{ at: 'end' | 'start'; kind: 'delete-backward' }>
  | Readonly<{ at: 'end' | 'start'; kind: 'insert-text'; text: string }>
  | Readonly<{ kind: 'insert-block' }>
  | Readonly<{ kind: 'remove-block' }>
  | Readonly<{ kind: 'search'; query: string }>;

export type FindStepKind = FindStep['kind'];

const FIND_STEPS: Readonly<
  Record<FindAction, readonly [apply: FindStep, undo: FindStep]>
> = {
  'create-destroy': [
    { at: 'end', kind: 'insert-text', text: FIND_CREATE_CHAR },
    { at: 'end', kind: 'delete-backward' },
  ],
  'no-change': [
    { at: 'end', kind: 'insert-text', text: FIND_NO_CHANGE_CHAR },
    { at: 'end', kind: 'delete-backward' },
  ],
  'query-change': [
    { kind: 'search', query: FIND_DENSE_ALT_QUERY },
    { kind: 'search', query: FIND_DENSE_QUERY },
  ],
  shift: [
    { at: 'start', kind: 'insert-text', text: FIND_NO_CHANGE_CHAR },
    { at: 'start', kind: 'delete-backward' },
  ],
  'split-above': [{ kind: 'insert-block' }, { kind: 'remove-block' }],
};

export const findStep = (action: FindAction, index: number): FindStep =>
  FIND_STEPS[action][index % 2];

export const findStepKey = (step: FindStep) => {
  if (step.kind === 'insert-text') return step.text;
  if (step.kind === 'delete-backward') return 'Backspace';

  return null;
};

export type FindReadBack = Readonly<{
  blocks: number;
  freshMatches: number;
  matchedBlocks: number;
  matches: number;
  paintedMatches: number;
  paintMismatch: string | null;
  query: string;
  renderedBlocks: number;
}>;

export type FindBurst = Readonly<{
  action: FindAction;
  drainMs: number;
  firstIndex: number;
  inspect: boolean;
  plantMs: number;
  refresh: FindRefreshMode;
  steps: number;
}>;

export type FindArm = Pick<FindBurst, 'inspect' | 'plantMs' | 'refresh'>;

export type FindSample = Readonly<{
  changedSteps: number;
  droppedRefreshes: number;
  firstFrameMismatch: string | null;
  firstIndex: number;
  inputEvents: number;
  leafRenders: number;
  presentationMs: number | null;
  refreshAllCalls: number;
  refreshCalls: number;
  refreshExtra: readonly string[];
  refreshExtraCount: number;
  refreshKeys: number;
  refreshReads: number;
  runtimeReads: number;
  steps: number;
  storeWrites: number;
  trustedInput: boolean;
}>;

export function buildFindValue(blocks: number): Value {
  return Array.from({ length: blocks }, (_, index) => ({
    children: [
      {
        [FIND_LEAF_MARK]: true,
        text: `Paragraph ${index + 1} ${FIND_DENSE_ALT_QUERY} the ${FIND_DENSE_QUERY}.${
          index === 0 ? ` ${FIND_CREATE_TAIL}` : ''
        }${index === blocks - 1 ? ' Lodestar marks the end.' : ''}`,
      },
    ],
    type: 'paragraph',
  }));
}

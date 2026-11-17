import { getEditorSchema } from '../../core/editor-runtime';
import { toInternalRoot } from '../../core/public-root';
import {
  type EditorHistoryHeadRoots,
  getEditorDocumentValue,
  readEditorHistoryHeadRoots,
} from '../../core/public-state';
import {
  readLatestShownWritableView,
  readRootViewPresentationRevision,
  readShownWritableRootViews,
  type ShownWritableViews,
} from '../../core/root-target';
import type { ViewPresentation } from '../../core/view-presentation';
import { countCoreWork } from '../../core/work';
import type {
  Editor,
  EditorDocumentValue,
  RootKey,
} from '../../interfaces/editor';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { MAIN_ROOT_KEY } from '../root-key';
import {
  type EditableDOMRuntime,
  type EditorHistoryFocusPolicy,
  getMountedEditableDOMRuntime,
  getMountedEditableDOMRuntimes,
  type HistoryRootCheck,
} from './editable-dom-runtime';

export type HistoryGateScope = Readonly<{
  owner: Editor;
  presentation: ViewPresentation;
}>;

export type HistoryGateAnswer =
  | Readonly<{ status: 'empty' }>
  | Readonly<{
      reason: 'hidden' | 'read-only';
      root: RootKey;
      status: 'refused';
    }>
  | Readonly<{ status: 'open'; view: Editor }>;

type Reach = 'hidden' | 'reached' | 'read-only';

type GateMemo = Readonly<{
  answer: HistoryGateAnswer;
  head: EditorHistoryHeadRoots;
  owners: OwnerRoots | null;
  revision: number;
}>;

type OwnerRoots = ReadonlyMap<RootKey, readonly RootKey[]>;

const EMPTY_GATE: HistoryGateAnswer = Object.freeze({ status: 'empty' });

const OWNER_READS = new WeakMap<
  Editor,
  { readonly owners: OwnerRoots; value: EditorDocumentValue }
>();

const GATES = new WeakMap<object, Partial<Record<'redo' | 'undo', GateMemo>>>();

const sameRoots = (a: EditorDocumentValue, b: EditorDocumentValue) => {
  if (a === b) return true;
  if (a.children !== b.children) return false;

  const left = Object.entries(a.roots ?? {});

  countCoreWork('historyGateRootComparisons', left.length);

  return (
    left.length === Object.keys(b.roots ?? {}).length &&
    left.every(([root, children]) => b.roots?.[root] === children)
  );
};

const sameHead = (a: EditorHistoryHeadRoots, b: EditorHistoryHeadRoots) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a !== 'broken' &&
    b !== 'broken' &&
    a.length === b.length &&
    a.every((root, index) => root === b[index]));

const readOwnerRoots = (owner: Editor) => {
  const value = getEditorDocumentValue(owner);
  const known = OWNER_READS.get(owner);

  if (known && sameRoots(known.value, value)) {
    known.value = value;

    return known.owners;
  }

  const owners = getEditorSchema(owner).readContentRootOwnerRoots(value);

  OWNER_READS.set(owner, { owners, value });

  return owners;
};

const viewRoot = (view: Editor) => toInternalRoot(view.read.view.root());

const judgeHistoryHead = (
  { owner, presentation }: HistoryGateScope,
  head: EditorHistoryHeadRoots,
  from: Editor | undefined
): Pick<GateMemo, 'answer' | 'owners'> => {
  if (head === null) return { answer: EMPTY_GATE, owners: null };

  const openThroughUsedView = (root: RootKey): HistoryGateAnswer => {
    if (from) return { status: 'open', view: from };

    const { shown, view } = readLatestShownWritableView(owner, presentation);

    return view
      ? { status: 'open', view }
      : { reason: shown ? 'read-only' : 'hidden', root, status: 'refused' };
  };

  if (head === 'broken' || head.length === 0) {
    return { answer: openThroughUsedView(MAIN_ROOT_KEY), owners: null };
  }

  const fromRoot = from && viewRoot(from);
  const viewsOf = (root: RootKey): ShownWritableViews => {
    const found = readShownWritableRootViews(owner, presentation, root);

    if (!from || root !== fromRoot) return found;

    countCoreWork('shownWritableViewChecks');
    const others = found.views.filter((view) => view !== from);

    return {
      shown: true,
      views: from.read.view.isReadOnly() ? others : [from, ...others],
    };
  };
  let owners: OwnerRoots | null = null;
  const reachThroughOwners = (root: RootKey): Reach => {
    owners ??= readOwnerRoots(owner);
    const visited = new Set([root]);
    const pending = [root];
    let lockedOwner = false;

    for (const at of pending) {
      for (const ownerRoot of owners.get(at) ?? []) {
        if (visited.has(ownerRoot)) continue;
        visited.add(ownerRoot);

        const { shown, views } = viewsOf(ownerRoot);

        if (!shown) pending.push(ownerRoot);
        else if (views.length > 0) return 'reached';
        else lockedOwner = true;
      }
    }

    return lockedOwner ? 'read-only' : 'hidden';
  };

  for (const root of head) {
    const { shown, views } = viewsOf(root);
    const reach = shown
      ? views.length > 0
        ? 'reached'
        : 'read-only'
      : reachThroughOwners(root);

    if (reach !== 'reached') {
      return { answer: { reason: reach, root, status: 'refused' }, owners };
    }
  }

  return { answer: openThroughUsedView(head[0]), owners };
};

export const readHistoryGate = (
  scope: HistoryGateScope,
  direction: 'redo' | 'undo',
  from?: Editor
): HistoryGateAnswer => {
  const head = readEditorHistoryHeadRoots(scope.owner, direction);
  const revision = readRootViewPresentationRevision(scope.presentation);
  const key = from ?? scope.presentation;
  const gates = GATES.get(key) ?? {};
  const known = gates[direction];

  if (
    known?.revision === revision &&
    sameHead(known.head, head) &&
    (!known.owners || readOwnerRoots(scope.owner) === known.owners)
  ) {
    return known.answer;
  }

  const { answer, owners } = judgeHistoryHead(scope, head, from);

  gates[direction] = { answer, head, owners, revision };
  GATES.set(key, gates);

  return answer;
};

export const getHistoryRuntime = (editor: ReactRuntimeEditor) => {
  const picked = getMountedEditableDOMRuntime(editor);

  if (picked && !picked.readOnly) return picked;

  const mounted = getMountedEditableDOMRuntimes(editor).filter((runtime) =>
    Object.is(runtime.editor, editor)
  );

  return mounted.find((runtime) => !runtime.readOnly) ?? picked ?? mounted[0];
};

export const applyModelOwnedHistoryIntent = ({
  direction,
  editor,
  focusPolicy = 'restore-root',
  rootCheck = 'check',
  runtime,
}: {
  direction: 'redo' | 'undo';
  editor: ReactRuntimeEditor;
  focusPolicy?: EditorHistoryFocusPolicy;
  rootCheck?: HistoryRootCheck;
  runtime?: EditableDOMRuntime | null;
}) => {
  const historyRuntime = runtime ?? getHistoryRuntime(editor);

  if (!historyRuntime || editor.read.view.isReadOnly()) return false;

  historyRuntime.dispatchHistory(direction, focusPolicy, undefined, rootCheck);
  return true;
};

export const shouldForceRenderAfterModelOwnedHistory = (
  editor: ReactRuntimeEditor
) => {
  const commit = editor.read((state) => state.lastCommit());

  return (
    !commit ||
    commit.changed.hasAny('structure') ||
    commit.changed.hasAny('properties') ||
    commit.changed.hasAny('root-order') ||
    commit.changed.hasAny('replace')
  );
};

export const applyModelOwnedNativeHistoryEvent = ({
  editor,
  event,
  readOnly = false,
  runtime,
}: {
  editor: ReactRuntimeEditor;
  event: InputEvent;
  readOnly?: boolean;
  runtime?: EditableDOMRuntime | null;
}) => {
  if (readOnly) return false;

  const direction =
    event.inputType === 'historyUndo'
      ? 'undo'
      : event.inputType === 'historyRedo'
        ? 'redo'
        : null;

  return direction
    ? applyModelOwnedHistoryIntent({ direction, editor, runtime })
    : false;
};

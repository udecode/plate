import {
  type Range,
  type RootKey,
  type Selection,
  SelectionApi,
  type TextSelection,
} from '../..';
import { toInternalRoot } from '../../core/public-root';
import {
  afterOpenDrafts,
  getActiveEditorTransaction,
} from '../../core/public-state';
import {
  getPlacementGeneration,
  holdsCaret,
  nextMintedGeneration,
  placedSince,
  resolveLiveCaret,
  resolveParkedCaret,
  setSelectionAsView,
  withoutPlacement,
} from '../../core/view-carets';
import { countCoreWork } from '../../core/work';
import type { DOMCoverageBoundary } from '../../dom/internal';
import { isCollapsedDOMCoverageBoundary } from '../../dom/plugin/dom-coverage';
import { liftCaretOutOfCollapsedSection } from '../../dom/plugin/dom-view-caret';
import type { AnyEditor } from '../../interfaces/editor';
import { focusPliteEditableAfterEventFrame } from '../hooks/focus-plite-editable';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { getPliteViewBoundaryPointRoot } from '../view-boundary-graph';
import {
  type PliteViewSelection,
  readPliteViewSelection,
  writePliteViewSelection,
} from '../view-selection';
import { findContentRootOwners } from './content-root-owners';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';

type CaretView = ReactRuntimeEditor & AnyEditor;

const inViewRoot = (view: CaretView, selection: Range | Selection) =>
  toInternalRoot(SelectionApi.root(selection)) ===
  toInternalRoot(view.read.view.root());

/**
 * Whether `selection` reaches `view`'s root: the root holds part of it, or
 * nests the copy of a root that does. A root shown in more than one place
 * names its host only through the selection's own owners.
 */
const coversRoot = (view: CaretView, selection: PliteViewSelection) => {
  const root = toInternalRoot(view.read.view.root());
  const owners = findContentRootOwners(view);
  const onlyHost = (child: RootKey) => {
    const hosts = owners.filter((owner) => owner.childRoot === child);

    return hosts.length === 1 ? hosts[0].ownerRoot : undefined;
  };
  const starts: Array<{ host?: RootKey; root: RootKey }> = [
    {
      host: selection.anchor.owner?.ownerRoot,
      root: getPliteViewBoundaryPointRoot(selection.anchor),
    },
    {
      host: selection.focus.owner?.ownerRoot,
      root: getPliteViewBoundaryPointRoot(selection.focus),
    },
    ...selection.segments.parts.map((part) => ({
      host: part.owner?.ownerRoot,
      root: part.root,
    })),
  ];
  const reached = new Set<RootKey>();

  for (const start of starts) {
    if (start.root === root) return true;

    let at = start.host ?? onlyHost(start.root);

    while (at && !reached.has(at)) {
      if (at === root) return true;
      reached.add(at);
      at = onlyHost(at);
    }
  }

  return false;
};

const visibleTarget = <T extends Range | Selection>(
  view: CaretView,
  selection: T
): T | TextSelection => {
  const runtime = getMountedEditableDOMRuntime(view);

  return runtime
    ? liftCaretOutOfCollapsedSection(
        view,
        runtime.domCoverage,
        runtime.state.isComposing,
        selection
      )
    : selection;
};

const clampHeldCaret = (view: CaretView) => {
  if (!holdsCaret(view)) return false;

  const selection = view.read((state) => state.selection());
  const target = visibleTarget(view, selection);

  if (target === selection) return false;

  countCoreWork('clampWrites');
  view.update((tx) => {
    withoutPlacement(view, () => tx.selection.set(target));
  });

  return true;
};

/**
 * A section collapses when its boundary registers, so the holder's caret
 * leaves it in the same render, after any update the render runs inside.
 */
export const clampCaretAtRegistration = (
  view: CaretView,
  boundary: DOMCoverageBoundary
) => {
  if (!isCollapsedDOMCoverageBoundary(boundary)) return;

  afterOpenDrafts(view, () => {
    clampHeldCaret(view);
  });
};

export type ViewCaretActivation = Readonly<{
  /**
   * With no bookmark and no live caret in the view's root, place the caret at
   * the end of the view's root.
   * Without it the view's next write takes the caret where the user puts it.
   */
  fallback?: 'end';
  focus?: boolean;
  /**
   * A press on the root's chrome: the root takes its own caret and ends a
   * selection across content roots, even one that covers it. Without it, a
   * current selection that covers the root stays.
   */
  press?: boolean;
  /** The placement generation the request saw; a newer placement cancels it. */
  receipt?: number;
  /** Place the caret at the end of the view's root instead of its own caret. */
  target?: 'end';
}>;

const rootEnd = (view: CaretView): Selection => {
  const end = view.read((state) => state.points.end([]));

  return end ? SelectionApi.text({ anchor: end, focus: end }) : null;
};

const activationTarget = (
  view: CaretView,
  fallback: 'end' | undefined
): Range | Selection => {
  const parked = resolveParkedCaret(view);

  if (parked) return parked;

  const live = resolveLiveCaret(view);

  if (live && inViewRoot(view, live)) return live;

  return fallback === 'end' ? rootEnd(view) : null;
};

export const activateViewCaret = (
  view: CaretView,
  activation: ViewCaretActivation = {}
): boolean => {
  const { fallback, focus = false, press = false, target: at } = activation;

  if (getActiveEditorTransaction(view)) {
    const receipt = activation.receipt ?? getPlacementGeneration(view);

    afterOpenDrafts(view, () => {
      activateViewCaret(view, { ...activation, receipt });
    });

    return false;
  }
  if (
    activation.receipt !== undefined &&
    placedSince(view, activation.receipt)
  ) {
    return false;
  }

  const generation = getPlacementGeneration(view);
  const shown = readPliteViewSelection(view);
  const keeps = !!shown && !press && at !== 'end' && coversRoot(view, shown);
  let receipt = generation;
  let wrote: boolean;

  if (shown && !keeps) {
    writePliteViewSelection(view, null);
    if (placedSince(view, generation)) return false;
  }
  if (at !== 'end' && holdsCaret(view)) {
    wrote = clampHeldCaret(view);
  } else if (keeps) {
    wrote = false;
  } else {
    const target =
      at === 'end' ? rootEnd(view) : activationTarget(view, fallback);

    wrote = !!target;
    if (target) {
      // A commit listener may place again inside this write; focus only for
      // this placement.
      receipt = nextMintedGeneration(view);
      setSelectionAsView(view, visibleTarget(view, target));
    }
  }
  if (focus) focusPliteEditableAfterEventFrame(view, { receipt });

  return wrote;
};

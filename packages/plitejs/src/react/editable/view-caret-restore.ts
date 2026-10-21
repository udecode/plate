import {
  type Range,
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
import { writePliteViewSelection } from '../view-selection';
import { getMountedEditableDOMRuntime } from './editable-dom-runtime';

type CaretView = ReactRuntimeEditor & AnyEditor;

const inViewRoot = (view: CaretView, selection: Range | Selection) =>
  toInternalRoot(SelectionApi.root(selection)) ===
  toInternalRoot(view.read.view.root());

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
   * With no bookmark and no live caret, place the caret at the document end.
   * Without it the view's next write takes the caret where the user puts it.
   */
  fallback?: 'end';
  focus?: boolean;
  /** The placement generation the request saw; a newer placement cancels it. */
  receipt?: number;
  /** Place the caret at the document end instead of the view's own caret. */
  target?: 'end';
}>;

const documentEnd = (view: CaretView): Selection => {
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

  if (!live) return fallback === 'end' ? documentEnd(view) : null;

  return inViewRoot(view, live) ? live : null;
};

export const activateViewCaret = (
  view: CaretView,
  activation: ViewCaretActivation = {}
): boolean => {
  const { fallback, focus = false, target: at } = activation;

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
  let receipt = generation;
  let wrote: boolean;

  if (at !== 'end' && holdsCaret(view)) {
    wrote = clampHeldCaret(view);
  } else {
    const target =
      at === 'end' ? documentEnd(view) : activationTarget(view, fallback);

    wrote = !!target;
    if (target) {
      // A commit listener may place again inside this write; focus only for
      // this placement.
      receipt = nextMintedGeneration(view);
      writePliteViewSelection(view, null);
      setSelectionAsView(view, visibleTarget(view, target));
    }
  }
  if (focus) focusPliteEditableAfterEventFrame(view, { receipt });

  return wrote;
};

import { type NodeKey, type Path, PathApi, type Point } from '../..';
import { reportEditorLifecycleError } from '../../core/lifecycle-error';
import { findDOMPointElementInRoot } from '../../dom/plugin/dom-editor';
import { getNodeKeyForNode } from '../../utils/node-keys';
import {
  ELEMENT_TO_RENDER_BIND,
  type ElementRenderBind,
  getPliteNodeElementByKey,
} from '../hooks/use-plite-node-ref';
import { MAIN_ROOT_KEY } from '../root-key';
import { readPliteViewSelection } from '../view-selection';
import type { EditableDOMRuntime } from './editable-dom-runtime';
import {
  type Editor,
  getEditorRuntimeOwner,
  getNodeKey,
} from './runtime-editor-api';
import { readRuntimeSelectionRange } from './runtime-selection-state';

type RenderContractPhase = 'commit' | 'selection-export';

type Nomination = Readonly<{ phase: RenderContractPhase; probe: Point }>;

type Candidate = Readonly<{
  childKey: NodeKey;
  childPath: Path;
  parentPath: Path;
  bind: ElementRenderBind;
}>;

type PendingCandidate = Candidate &
  Nomination & {
    bindChanged: boolean;
  };

export const hasProbeDOM = (
  editor: Editor,
  probe: Point,
  root: HTMLElement | null
) => {
  const nodeKey = root ? getNodeKey(editor, probe.path) : null;

  if (!root || !nodeKey) return false;

  return (
    !!getPliteNodeElementByKey(editor, nodeKey, root) ||
    !!findDOMPointElementInRoot(editor, probe, root)
  );
};

export class RenderContractMonitor {
  private cancelFirstLook: (() => void) | null = null;

  private nominations: Nomination[] = [];

  private readonly pending = new Map<NodeKey, PendingCandidate>();

  private readonly reported = new Set<NodeKey>();

  private readonly runtime: EditableDOMRuntime;

  constructor(runtime: EditableDOMRuntime) {
    this.runtime = runtime;
  }

  nominateSelection() {
    const { editor, rootElement } = this.runtime;

    if (!rootElement) return;

    const coverage = this.runtime.domCoverage;
    const viewRoot =
      rootElement.getAttribute('data-editor-root') ?? MAIN_ROOT_KEY;
    const viewSelection = readPliteViewSelection(editor);
    const selection = viewSelection ? null : readRuntimeSelectionRange(editor);
    const endpoints = viewSelection
      ? [viewSelection.anchor.point, viewSelection.focus.point]
      : selection
        ? [selection.anchor, selection.focus]
        : [];
    let previous: Path | null = null;

    for (const endpoint of endpoints) {
      if ((endpoint.root ?? MAIN_ROOT_KEY) !== viewRoot) continue;
      if (previous && PathApi.equals(previous, endpoint.path)) continue;
      previous = endpoint.path;

      const probe = { offset: 0, path: endpoint.path };

      if (
        !coverage.getBoundaryForPoint(probe) &&
        !hasProbeDOM(editor, probe, rootElement)
      ) {
        this.nominate(probe, 'selection-export');
      }
    }
  }

  nominate(probe: Point, phase: RenderContractPhase) {
    this.nominations.push({ phase, probe });
    this.cancelFirstLook ??= this.scheduleFirstLook();
  }

  readonly noteBind = (nodeKey: NodeKey) => {
    const entry = this.pending.get(nodeKey);

    if (!entry || entry.bindChanged) return;

    entry.bindChanged = true;
    this.nominate(entry.probe, entry.phase);
  };

  beforeRootTeardown() {
    this.cancelFirstLook?.();
    this.cancelFirstLook = null;
    this.pending.clear();
  }

  afterRootMount() {
    this.cancelFirstLook?.();
    this.cancelFirstLook =
      this.nominations.length > 0 ? this.scheduleFirstLook() : null;
  }

  private scheduleFirstLook() {
    return this.afterFrameAndMacrotask(() => {
      this.cancelFirstLook = null;
      const { nominations } = this;

      this.nominations = [];
      this.firstLook(nominations);
    });
  }

  private afterFrameAndMacrotask(callback: () => void) {
    const scheduler = this.runtime.domPhaseScheduler;
    let cancelMacrotask: (() => void) | null = null;
    const cancelFrame = scheduler.schedule(
      'post-selection',
      'render-contract-frame',
      () => {
        cancelMacrotask = scheduler.schedule(
          'post-selection',
          'render-contract-macrotask',
          callback,
          { timing: 'timeout' }
        );
      },
      { timing: 'animation-frame' }
    );

    return () => {
      cancelFrame();
      cancelMacrotask?.();
    };
  }

  private firstLook(nominations: readonly Nomination[]) {
    const remembered: PendingCandidate[] = [];

    for (const nomination of nominations) {
      const candidate = this.findCandidate(nomination.probe);

      if (!candidate || this.reported.has(candidate.childKey)) continue;
      const existing = this.pending.get(candidate.childKey);

      if (
        existing &&
        !existing.bindChanged &&
        existing.bind === candidate.bind
      ) {
        continue;
      }

      const entry = { ...candidate, ...nomination, bindChanged: false };

      this.pending.set(candidate.childKey, entry);
      remembered.push(entry);
    }

    if (remembered.length > 0) {
      this.afterFrameAndMacrotask(() => {
        this.secondLook(remembered);
      });
    }
  }

  private secondLook(entries: readonly PendingCandidate[]) {
    for (const entry of entries) {
      if (this.pending.get(entry.childKey) !== entry) continue;

      this.pending.delete(entry.childKey);

      if (
        entry.bindChanged ||
        this.reported.has(entry.childKey) ||
        this.runtime.hasPendingInputWork()
      ) {
        continue;
      }

      const candidate = this.findCandidate(entry.probe);

      if (
        candidate?.childKey !== entry.childKey ||
        candidate.bind !== entry.bind
      ) {
        continue;
      }

      this.reported.add(entry.childKey);
      reportEditorLifecycleError({
        cause: new Error(
          `renderElement for "${String(entry.bind.node.type)}" at ${entry.parentPath.join(
            '.'
          )} omitted editable child ${entry.childPath.join(
            '.'
          )} without a DOM coverage boundary. Render children or register a DOMCoverage boundary.`
        ),
        childPath: entry.childPath,
        editor: this.runtime.editor,
        element: entry.bind.node,
        path: entry.parentPath,
        phase: entry.phase,
        source: 'render-element',
      });
    }
  }

  private findCandidate(probe: Point): Candidate | null {
    const { editor, rootElement } = this.runtime;

    if (
      !rootElement ||
      this.runtime.domCoverage.getBoundaryForPoint(probe) ||
      hasProbeDOM(editor, probe, rootElement)
    ) {
      return null;
    }

    const { path } = probe;
    const topKey = getNodeKey(editor, path.slice(0, 1));
    let parentElement = topKey
      ? getPliteNodeElementByKey(editor, topKey, rootElement)
      : null;

    for (let depth = 2; parentElement && depth <= path.length; depth++) {
      const childPath = path.slice(0, depth);
      const childKey = getNodeKey(editor, childPath);

      if (!childKey) return null;

      const childElement = getPliteNodeElementByKey(
        editor,
        childKey,
        rootElement
      );

      if (!childElement) {
        const bind = ELEMENT_TO_RENDER_BIND.get(parentElement);
        const owner = getEditorRuntimeOwner(editor);

        return bind?.node.children.some(
          (child) => getNodeKeyForNode(child, owner) === childKey
        )
          ? {
              childKey,
              childPath,
              parentPath: path.slice(0, depth - 1),
              bind,
            }
          : null;
      }

      parentElement = childElement;
    }

    return null;
  }
}

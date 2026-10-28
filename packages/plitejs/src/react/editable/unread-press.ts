import { getPlacementGeneration } from '../../core/view-carets';
import type { DOMPhaseScheduler } from '../../dom/internal';
import { getSelection } from '../../dom/utils/dom';
import {
  type DOMSelectionPoints,
  readDOMSelectionPoints,
  sameDOMSelectionPoints,
} from '../../dom/utils/selection-writes';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

type ModelStamp = Readonly<{ document: unknown; placement: number }>;

type Seen = ModelStamp &
  Readonly<{ page: DOMSelectionPoints | null; turn: boolean }>;

const unreadPresses = new Set<UnreadPress>();

export const claimPageSelection = () =>
  [...unreadPresses].every((press) => press.claimPage());

/**
 * Firefox places a click's caret during mousedown, before focus, and reports it
 * only in a later selectionchange, so a render between the two would write the
 * older model selection over it.
 */
export class UnreadPress {
  private held = false;

  private seen: Seen | null = null;

  private readonly editor: ReactRuntimeEditor;

  private readonly root: () => HTMLElement | null;

  private readonly schedule: DOMPhaseScheduler['schedule'];

  constructor(
    editor: ReactRuntimeEditor,
    root: () => HTMLElement | null,
    schedule: DOMPhaseScheduler['schedule']
  ) {
    this.editor = editor;
    this.root = root;
    this.schedule = schedule;
  }

  claimPage() {
    const { seen } = this;

    if (!seen || seen.turn) return true;

    const now = this.stamp();

    if (now.document !== seen.document || now.placement !== seen.placement) {
      return true;
    }

    const page = this.readPage();

    if (page && !sameDOMSelectionPoints(page, seen.page)) return false;

    this.seen = { ...seen, turn: true };
    this.schedule('post-selection', 'unread-press-turn', this.endEditorTurn, {
      timing: 'microtask',
    });

    return true;
  }

  private readonly endEditorTurn = () => {
    if (this.seen?.turn) {
      this.seen = { ...this.seen, page: this.readPage(), turn: false };
    }
  };

  pointerDown(opens: boolean) {
    this.held = opens;
    this.track(opens ? this.record() : null);
  }

  /**
   * The browser can still move a press's selection after Plite reads its
   * mouseup, such as collapsing a range the press landed inside.
   */
  released() {
    if (!this.held) return;
    this.held = false;
    if (!this.seen) this.track(this.record());
  }

  markRead() {
    this.track(null);
  }

  private track(seen: Seen | null) {
    this.seen = seen;
    if (seen) unreadPresses.add(this);
    else unreadPresses.delete(this);
  }

  private record(): Seen {
    return { ...this.stamp(), page: this.readPage(), turn: false };
  }

  private readPage() {
    const root = this.root();
    const selection =
      root && getSelection(root.getRootNode() as Document | ShadowRoot);
    const points = selection && readDOMSelectionPoints(selection);

    return points &&
      root.contains(points.anchor[0]) &&
      root.contains(points.focus[0])
      ? points
      : null;
  }

  private stamp(): ModelStamp {
    return {
      document: this.editor.read.runtime.snapshot().children,
      placement: getPlacementGeneration(this.editor),
    };
  }
}

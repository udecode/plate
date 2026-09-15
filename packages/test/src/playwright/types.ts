import type { Locator, Page } from '@playwright/test';
import type { Range, Selection } from 'platejs';

import type { PlaceholderShape } from '../browser/zero-width';
import type {
  ReactRenderKind,
  ReactRenderProfilerSnapshot,
} from './render-profiler';

type AtLeastOne<T extends object> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/** Exact or bounded numeric assertion used by browser proof steps. */
export type BrowserNumberBudget =
  | number
  | { exact: number; max?: never; min?: never }
  | (AtLeastOne<{ max: number; min: number }> & { exact?: never });

/** Model selection snapshot captured from the editor runtime. */
export type SelectionSnapshot = {
  anchor: { path: number[]; offset: number };
  focus: { path: number[]; offset: number };
};

/** Owner metadata for a raw view-selection snapshot. */
export type BrowserRawViewSelectionOwner = {
  childRoot: string;
  ownerPath: number[];
  ownerRoot: string;
};

/** Point in a raw view-selection snapshot. */
export type BrowserRawViewSelectionPoint = {
  owner?: BrowserRawViewSelectionOwner;
  point: { path: number[]; offset: number; root?: string };
};

/** Raw view-selection snapshot captured from editor view state. */
export type BrowserRawViewSelectionSnapshot = {
  anchor: BrowserRawViewSelectionPoint;
  focus: BrowserRawViewSelectionPoint;
  segments: { backward: boolean; [key: string]: unknown };
};

/** Browser-native DOM selection snapshot. */
export type DOMSelectionSnapshot = {
  anchorNodeText: string | null;
  anchorOffset: number;
  focusNodeText: string | null;
  focusOffset: number;
};

/** DOM selection endpoints with resolved node-location metadata. */
export type DOMSelectionLocationSnapshot = {
  anchorOffset: number | null;
  anchorPath: number[] | null;
  anchorText: string | null;
  isCollapsed: boolean | null;
};

type DOMSelectionLocationExpectation = AtLeastOne<DOMSelectionLocationSnapshot>;

/** Combined model and native-selection summary for one root. */
/** Combined model and native selection summary for proof assertions. */
export type BrowserNativeSelectionSummary = {
  collapsed: boolean | null;
  rangeCount: number;
  selection: SelectionSnapshot | null;
  textLength: number;
};

/** Editor view-selection snapshot used by browser proof helpers. */
export type BrowserViewSelectionSnapshot = {
  active: boolean;
  anchor: SelectionPoint | null;
  focus: SelectionPoint | null;
  markerCount: number;
  markerPaths: Array<string | null>;
  markerRects: SelectionRectSnapshot[];
  selection: SelectionSnapshot | null;
  textLength: number;
};

/** Visible selection overlay snapshot for one root. */
/** Displayed selection snapshot for one root in the rendered document. */
export type BrowserDisplayedSelectionSnapshot = {
  displayed: SelectionSnapshot | null;
  doubleHighlighted: boolean;
  hasVisibleEditorSelection: boolean;
  hasVisibleSelection: boolean;
  model: SelectionSnapshot | null;
  native: BrowserNativeSelectionSummary;
  source: 'native' | 'none' | 'view';
  view: BrowserViewSelectionSnapshot;
};

/** Clipboard payload captured during a browser proof step. */
/** Clipboard payload snapshot captured during paste/copy proof. */
export type ClipboardPayloadSnapshot = {
  html: string | null;
  markdown?: string | null;
  fragment?: string | null;
  text: string;
  types: string[];
};

/** Geometry snapshot for a rendered selection or caret rect. */
/** Client-rect bounds for a visible selection segment. */
export type SelectionRectSnapshot = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Native event categories recorded by the browser trace helper. */
export type BrowserNativeEventTraceType =
  | 'beforeinput'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'input'
  | 'selectionchange';

/** DOM node summary captured in a native event trace. */
export type BrowserNativeEventTraceNodeSnapshot = {
  nodeName: string | null;
  parentNodeName: string | null;
  parentPath: string | null;
  parentSignature: string | null;
  path: string | null;
  text: string | null;
};

/** Selection summary captured during a native event trace. */
export type BrowserNativeEventTraceSelectionSnapshot = {
  anchor: BrowserNativeEventTraceNodeSnapshot | null;
  anchorOffset: number | null;
  collapsed: boolean | null;
  focus: BrowserNativeEventTraceNodeSnapshot | null;
  focusOffset: number | null;
  rangeCount: number;
  selectedText: string;
};

/** Rectangle captured from native event target ranges. */
export type BrowserNativeEventTraceRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

/** Target-range snapshot captured from a native input event. */
export type BrowserNativeEventTraceTargetRangeSnapshot = {
  collapsed: boolean;
  end: BrowserNativeEventTraceNodeSnapshot;
  endOffset: number;
  rects: BrowserNativeEventTraceRect[];
  start: BrowserNativeEventTraceNodeSnapshot;
  startOffset: number;
};

/** Text-node snapshot captured before or after a native event. */
export type BrowserNativeEventTraceTextNodeSnapshot = {
  id: string;
  parentPath: string | null;
  parentSignature: string;
  text: string;
};

/** Text-node before/after delta captured by native event tracing. */
export type BrowserNativeEventTraceTextNodeDelta = {
  after: BrowserNativeEventTraceTextNodeSnapshot | null;
  before: BrowserNativeEventTraceTextNodeSnapshot | null;
  type: 'added' | 'deleted' | 'modified' | 'moved';
};

/** DOM delta captured around one native event. */
export type BrowserNativeEventTraceDOMDelta = {
  textNodes: BrowserNativeEventTraceTextNodeDelta[];
};

/** Suspicious native-event trace finding. */
export type BrowserNativeEventTraceAnomaly = {
  detail: string;
  type:
    | 'composition-mismatch'
    | 'data-content-mismatch'
    | 'inputtype-mismatch'
    | 'missing-beforeinput'
    | 'node-type-change'
    | 'parent-mismatch'
    | 'selection-jump'
    | 'sibling-created';
};

/** One recorded native browser event with selection and DOM evidence. */
export type BrowserNativeEventTraceEntry = {
  data: string | null;
  domDelta: BrowserNativeEventTraceDOMDelta | null;
  inputType: string | null;
  isComposing: boolean | null;
  selection: BrowserNativeEventTraceSelectionSnapshot;
  targetRanges: BrowserNativeEventTraceTargetRangeSnapshot[];
  timestamp: number;
  type: BrowserNativeEventTraceType;
};

/** Complete native event trace collected from a editor browser root. */
/** Complete native event trace snapshot. */
export type BrowserNativeEventTraceSnapshot = {
  anomalies: BrowserNativeEventTraceAnomaly[];
  entries: BrowserNativeEventTraceEntry[];
};

/** Options controlling which native events are traced. */
/** Options for installing a native event trace recorder in the page. */
export type BrowserNativeEventTraceOptions = {
  events?: readonly BrowserNativeEventTraceType[];
  maxEntries?: number;
};

/** Snapshot of the element that owns browser focus. */
/** Focus ownership snapshot for editor and native controls. */
export type FocusOwnerSnapshot = {
  isContentEditable: boolean;
  kind: 'contenteditable' | 'editor' | 'internal-control' | 'none' | 'outside';
  role: string | null;
  tagName: string | null;
  testId: string | null;
};

/** Rendered zero-width node shape captured from the DOM. */
export type BrowserZeroWidthNodeShape = {
  hasBr: boolean;
  hasFEFF: boolean;
  html: string;
  index: number;
  kind: string | null;
  length: string | null;
  textContent: string;
};

/** Rendered block DOM shape used by structure assertions. */
export type RenderedBlockDOMShapeSnapshot = {
  index: number;
  innerText: string;
  lineBoxCount: number;
  textContent: string;
  unexpectedZeroWidthBreaks: BrowserZeroWidthNodeShape[];
  zeroWidthNodes: BrowserZeroWidthNodeShape[];
};

/** Expected rendered DOM shape for browser proof assertions. */
/** Expected rendered DOM shape for proof assertions. */
export type RenderedDOMShapeExpectation = {
  blockIndex?: number;
} & AtLeastOne<{
  domSelectionTarget?: DOMSelectionLocationExpectation;
  innerText?: string;
  lineBoxCount?: number | AtLeastOne<{ max: number; min: number }>;
  noUnexpectedZeroWidthBreaks?: true;
  textContent?: string;
  zeroWidthBreakCount?: number;
  zeroWidthCount?: number;
}>;

/** High-level kernel trace event family. */
export type BrowserKernelEventFamily =
  | 'beforeinput'
  | 'blur'
  | 'click'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'copy'
  | 'cut'
  | 'dragend'
  | 'dragover'
  | 'dragstart'
  | 'drop'
  | 'focus'
  | 'input'
  | 'keydown'
  | 'mousedown'
  | 'paste'
  | 'repair'
  | 'selectionchange';

/** Kernel state label captured in trace entries. */
export type BrowserKernelState =
  | 'app-owned'
  | 'clipboard'
  | 'composition'
  | 'dom-selection'
  | 'dragging'
  | 'idle'
  | 'internal-control'
  | 'model-owned'
  | 'viewport-backed'
  | 'repairing';

/** Owner classification for the current browser editing target. */
export type BrowserKernelTargetOwner =
  | 'app-owned'
  | 'editor'
  | 'internal-control'
  | 'outside-editor'
  | 'viewport'
  | 'unknown';

/** Model/native ownership classification for a kernel event. */
export type BrowserKernelOwnership =
  | 'app-owned'
  | 'deferred'
  | 'model-owned'
  | 'native-allowed'
  | 'native-denied'
  | 'no-op';

/** Source that produced the selection observed by the kernel trace. */
export type BrowserKernelSelectionSource =
  | 'app-owned'
  | 'composition-owned'
  | 'dom-current'
  | 'internal-control'
  | 'model-owned'
  | 'viewport-backed'
  | 'unknown';

/** Input intent classified by the editable browser kernel. */
export type BrowserKernelInputIntent =
  | 'clipboard'
  | 'composition'
  | 'delete'
  | 'history'
  | 'insert-break'
  | 'internal-control'
  | 'model-selection-move'
  | 'native-selection-move'
  | 'viewport-selection'
  | 'text-insert';

/** Origin of a selection change captured by the kernel trace. */
export type BrowserKernelSelectionChangeOrigin =
  | 'browser-handle'
  | 'native-user'
  | 'programmatic-export'
  | 'repair-induced'
  | 'unknown';

/** Editing command observed by the browser kernel trace. */
export type BrowserKernelCommand =
  | {
      direction: 'backward' | 'forward';
      kind: 'delete';
      unit?: 'block' | 'line' | 'word';
    }
  | { kind: 'delete-both'; unit: 'line' }
  | {
      direction?: 'backward' | 'forward';
      kind: 'delete-fragment';
      selection?: Range | Selection;
    }
  | { direction: 'redo' | 'undo'; kind: 'history' }
  | { kind: 'insert-break'; variant: 'open-line' | 'paragraph' | 'soft' }
  | { data?: unknown; kind: 'insert-data' }
  | { inputType?: string; kind: 'insert-text'; text: string }
  | { kind: 'transpose-character' }
  | {
      axis: 'document' | 'horizontal' | 'line' | 'word';
      extend?: boolean;
      kind: 'move-selection';
      reverse?: boolean;
    }
  | { kind: 'select'; selection: Range }
  | { kind: 'select-all' };

/** Static command metadata captured beside a kernel trace command. */
export type BrowserKernelCommandDefinition = Readonly<{
  inputFamilies: readonly BrowserKernelEventFamily[];
  kind: BrowserKernelCommand['kind'];
  modelOwned: boolean;
}>;

/** Ownership trace for keyboard or pointer movement through the editor. */
export type BrowserKernelMovementOwnershipTrace = {
  axis: 'document' | 'horizontal' | 'line' | 'unknown' | 'vertical' | 'word';
  extend: boolean;
  key: string;
  ownership: Extract<BrowserKernelOwnership, 'model-owned' | 'native-allowed'>;
  reason:
    | 'model-document-boundary'
    | 'model-horizontal-inline-void'
    | 'model-line-browser'
    | 'model-word-boundary'
    | 'native-selection-key'
    | 'native-vertical-layout';
  reverse: boolean | null;
};

/** Selection policy attached to a kernel transition. */
export type BrowserKernelSelectionPolicy = {
  kind:
    | 'clear'
    | 'export-model'
    | 'import-dom'
    | 'none'
    | 'viewport'
    | 'preserve-model';
  reason:
    | 'internal-control'
    | 'model-owned'
    | 'native-selection'
    | 'not-requested'
    | 'viewport-backed'
    | 'selection-clear'
    | 'unknown-selection';
};

/** Repair policy attached to a kernel transition. */
export type BrowserKernelRepairPolicy = {
  kind:
    | 'force-render'
    | 'none'
    | 'repair-caret'
    | 'repair-text'
    | 'sync-selection';
  reason:
    | 'force-render'
    | 'not-requested'
    | 'repair-caret'
    | 'repair-caret-after-text-insert'
    | 'repair-text'
    | 'sync-selection';
};

/** State transition recorded by the browser kernel trace. */
export type BrowserKernelTransition = {
  allowed: boolean;
  reason: string | null;
};

/** Repair request emitted while handling a kernel event frame. */
export type BrowserKernelRepairRequest =
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'force-render';
      selectionSourceTransition?: BrowserKernelSelectionSourceTransition;
    }
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'sync-selection';
      selectionSourceTransition?: BrowserKernelSelectionSourceTransition;
      syncDOMSelection?: boolean;
    }
  | {
      focus?: boolean;
      forceRender?: boolean;
      kind: 'repair-caret' | 'repair-caret-after-text-insert';
      selectionSourceTransition?: BrowserKernelSelectionSourceTransition;
    }
  | { kind: 'none' | 'skip-dom-sync' };

/** Selection-source transition attached to a kernel repair request. */
export type BrowserKernelSelectionSourceTransition = {
  preferModelSelection: boolean;
  reason:
    | 'internal-control'
    | 'model-command'
    | 'native-selection-move'
    | 'projection-refresh'
    | 'repair-induced'
    | 'unknown-selection';
  selectionSource: BrowserKernelSelectionSource;
};

/** Native event frame and derived editor evidence. */
export type BrowserKernelEventFrame = {
  active: boolean;
  commitEpoch: number | null;
  eventFamily: BrowserKernelEventFamily;
  focusOwner: BrowserKernelTargetOwner;
  id: number;
  inputIntent: BrowserKernelInputIntent | null;
  lifecyclePhase: 'commit' | 'event' | 'external' | 'layout-effect';
  modelSelectionBefore: Selection;
  root: string;
  selectionSource: BrowserKernelSelectionSource;
  startedAt: number;
  targetOwner: BrowserKernelTargetOwner;
  viewEpoch: number | null;
};

/** Kernel trace entry used by browser behavior assertions. */
export type BrowserKernelTraceEntry = {
  command: BrowserKernelCommand | null;
  commandDefinition: BrowserKernelCommandDefinition | null;
  epochId: number | null;
  eventFamily: BrowserKernelEventFamily;
  frame: BrowserKernelEventFrame | null;
  frameId: number | null;
  intent: BrowserKernelInputIntent | null;
  movement: BrowserKernelMovementOwnershipTrace | null;
  nativeAllowed: boolean;
  ownership: BrowserKernelOwnership;
  repair: BrowserKernelRepairRequest | null;
  repairPolicy: BrowserKernelRepairPolicy;
  selectionChangeOrigin: BrowserKernelSelectionChangeOrigin;
  selectionAfter: Selection;
  selectionBefore: Selection;
  selectionPolicy: BrowserKernelSelectionPolicy;
  selectionSource: BrowserKernelSelectionSource;
  stateAfter: BrowserKernelState;
  stateBefore: BrowserKernelState;
  targetOwner: BrowserKernelTargetOwner;
  transition: BrowserKernelTransition;
};

/** Expected kernel trace properties for one assertion. */
export type BrowserKernelTraceExpectation = AtLeastOne<{
  commandKind?: BrowserKernelCommand['kind'] | null;
  eventFamily?: BrowserKernelEventFamily;
  movement?: Partial<BrowserKernelMovementOwnershipTrace> | null;
  ownership?: BrowserKernelOwnership;
  repairPolicy?: AtLeastOne<BrowserKernelRepairPolicy>;
  selectionChangeOrigin?: BrowserKernelSelectionChangeOrigin;
  selectionPolicy?: AtLeastOne<BrowserKernelSelectionPolicy>;
  selectionSource?: BrowserKernelSelectionSource;
  stateAfter?: BrowserKernelState;
  stateBefore?: BrowserKernelState;
  targetOwner?: BrowserKernelTargetOwner;
  transition?: AtLeastOne<BrowserKernelTransition>;
}>;

/** Point shape reused from a model selection snapshot. */
export type SelectionPoint = SelectionSnapshot['anchor'];
/** Association used when capturing or restoring selection anchors. */
export type RangeAnchorAssociation =
  | 'forward'
  | 'backward'
  | 'outward'
  | 'inward';

/** Serializable selection anchor used by replay helpers. */
export type SelectionAnchorHandle = {
  id: string;
};

/** Options for capturing editor and DOM selection snapshots. */
/** Options for capturing model and DOM selection snapshots. */
export type SelectionCaptureOptions = {
  association?: RangeAnchorAssociation;
};

/** Options for resolving DOM paths in browser helpers. */
/** Options for resolving a DOM node from a editor path. */
export type BrowserDOMPathOptions = {
  align?: 'center' | 'end' | 'nearest' | 'start';
  timeoutMs?: number;
};

/** Options for clicking a text range by editor path. */
/** Options for clicking a text range resolved by editor path. */
export type BrowserTextPathRangeClickOptions = BrowserDOMPathOptions & {
  endOffset: number;
  xAffinity?: 'center' | 'end' | 'start';
  path: number[];
  startOffset: number;
};

/** Options for clicking text by visible offset. */
/** Options for clicking a text node at a character offset. */
export type BrowserTextOffsetClickOptions = {
  clickCount?: number;
  offset: number;
  path: number[];
  waitForSelectionSync?: boolean;
};

/** Options for dragging across a resolved text range. */
export type BrowserDragTextRangeOptions = {
  direction?: 'backward' | 'forward';
  endAffinity?: 'after' | 'inside';
  endOffset: number;
  endText?: string;
  endTextNodeIndex?: number;
  settleMs?: number;
  startOffset: number;
  steps?: number;
  text: string;
  textNodeIndex?: number;
};

/** Options for double-click drag selection across text. */
export type BrowserDoubleClickDragTextRangeOptions = {
  doubleClickOffset: number;
  endOffset: number;
  gestureDelayMs?: number;
  steps?: number;
  text: string;
  textNodeIndex?: number;
};

/** Exact or inclusive offset expectation for selection assertions. */
export type OffsetExpectation = number | readonly [number, number];

/** Expected model selection snapshot shape. */
export type SelectionSnapshotExpectation = {
  anchor: { path: number[]; offset: OffsetExpectation };
  focus: { path: number[]; offset: OffsetExpectation };
};

/** Expected browser-native DOM selection snapshot shape. */
export type DOMSelectionSnapshotExpectation = {
  anchorNodeText: string | null;
  anchorOffset: OffsetExpectation;
  focusNodeText: string | null;
  focusOffset: OffsetExpectation;
};

/** Expected collapsed model and DOM selection agreement. */
export type CollapsedModelDOMSelectionExpectation = {
  offset: OffsetExpectation;
  path: number[];
  text: string;
};

/** Options for normalizing HTML before paste or clipboard assertions. */
export type HtmlNormalizationOptions = {
  ignoreClasses?: boolean;
  ignoreInlineStyles?: boolean;
  ignoreDir?: boolean;
};

/** Options for waiting until an example route is ready. */
/** Options for waiting until a editor example route is ready. */
export type ReadyOptions = {
  editor?: 'visible';
  placeholder?: 'visible' | 'hidden';
  selector?: string;
  text?: RegExp | string;
  selection?: 'settled' | SelectionSnapshot;
  timeoutMs?: number;
};

/** Options for selecting an editor surface on a page. */
/** Options for locating an editor surface on an example route. */
export type EditorSurfaceOptions = {
  frame?: string;
  scope?: string;
};

/** Options for opening an example route in the browser harness. */
/** Options for opening and preparing a editor example route. */
export type OpenExampleOptions = {
  query?:
    | Record<string, boolean | null | number | string | undefined>
    | URLSearchParams
    | string;
  ready?: ReadyOptions;
  surface?: EditorSurfaceOptions;
};

/** Document, selection, and shell state captured from an editor. */
/** Serialized editor state captured from an example route. */
export type EditorSnapshot = {
  text: string;
  blockTexts: string[];
  renderedBlocks: RenderedBlockDOMShapeSnapshot[];
  selectedText: string;
  selection: SelectionSnapshot | null;
  domSelection: DOMSelectionSnapshot | null;
  focusOwner: FocusOwnerSnapshot;
  kernelTrace: BrowserKernelTraceEntry[];
  lastCommit: unknown;
  placeholderShape: PlaceholderShape | null;
};

/** Summary of a rendered editor shell node. */
export type BrowserShellSummary = {
  isInline: boolean;
  isVoid: boolean;
  kind: string | null;
  path: string | null;
  nodeKey: string | null;
  tagName: string | null;
};

/** Snapshot of selected rendered shell nodes. */
export type BrowserSelectedShellSnapshot = {
  element: BrowserShellSummary | null;
  node: BrowserShellSummary | null;
  offset: number;
  path: number[];
  point: 'anchor' | 'focus';
};

/** Snapshot of rendered shell nodes related to selection. */
export type BrowserSelectionShellsSnapshot = {
  anchor: BrowserSelectedShellSnapshot;
  focus: BrowserSelectedShellSnapshot;
  nodeKeys: string[];
};

/** Full render state snapshot including selected and selection shells. */
/** Editor snapshot with rendered shell and DOM shape evidence. */
export type BrowserRenderStateSnapshot = EditorSnapshot & {
  renderCounts: ReactRenderProfilerSnapshot;
  selectionShells: BrowserSelectionShellsSnapshot | null;
};

/** Browser-side trace entry emitted by scenario runners. */
export type BrowserTraceEntry = {
  label: string;
  snapshot: EditorSnapshot;
  stepIndex: number | null;
};

/** Caller-provided metadata for browser scenario execution. */
/** Scenario metadata supplied by a browser scenario step. */
export type BrowserScenarioMetadata = {
  capabilities?: readonly string[];
  platform?: string;
  transport?: string;
};

/** Transport capability claim attached to a scenario step. */
export type BrowserTransportClaim =
  | 'desktop-native-clipboard'
  | 'desktop-native-ime-composition'
  | 'desktop-native-keyboard'
  | 'desktop-semantic-handle'
  | 'mixed-native-and-semantic'
  | 'mobile-semantic-handle'
  | 'mobile-synthetic-composition'
  | 'playwright-mobile-keyboard'
  | 'playwright-mobile-viewport'
  | 'synthetic-composition'
  | 'synthetic-datatransfer'
  | 'unspecified';

/** Normalized scenario metadata after transport classification. */
export type BrowserNormalizedScenarioMetadata = {
  capabilities: string[];
  claim: BrowserTransportClaim;
  platform: string | null;
  transport: string | null;
};

/** Metadata attached to one executable scenario step. */
export type BrowserScenarioStepMetadata = {
  iteration?: number;
  warmLoop?: string;
};

type BrowserWindowSelectionTextExpectation =
  | { contains: string; notEmpty?: boolean; text?: string }
  | { contains?: string; notEmpty: true; text?: string }
  | { contains?: string; notEmpty?: boolean; text: string };

type BrowserLocatorCountExpectation =
  | { count: number; max?: never; min?: never }
  | ({ count?: never } & AtLeastOne<{ max: number; min: number }>);

/** Executable browser scenario step. */
export type BrowserScenarioStep = (
  | {
      change: Record<string, unknown>;
      kind: 'applyChange';
      label?: string;
      tag?: string | string[];
    }
  | {
      kind: 'applyValueChange';
      label?: string;
      tag?: string | string[];
      value: Record<string, unknown>;
    }
  | ({
      kind: 'assertLocatorCount';
      label?: string;
      selector: string;
    } & BrowserLocatorCountExpectation)
  | ({
      index?: number;
      kind: 'assertLocatorCss';
      label?: string;
      property: string;
      selector: string;
    } & AtLeastOne<{ notValue: string; value: string }>)
  | ({
      afterSelector: string;
      beforeSelector: string;
      kind: 'assertLocatorVerticalGap';
      label?: string;
    } & AtLeastOne<{ max: number; min: number }>)
  | ({
      innerSelector: string;
      kind: 'assertLocatorVerticalOffset';
      label?: string;
      selector: string;
    } & AtLeastOne<{ max: number; min: number }>)
  | {
      kind: 'assertModelSelectionExpanded';
      label?: string;
    }
  | {
      kind: 'assertCapturedNodeKeyPath';
      label?: string;
      name: string;
      path: number[] | null;
    }
  | {
      budget: AtLeastOne<{
        byKind: AtLeastOne<Record<ReactRenderKind, BrowserNumberBudget>>;
        total: BrowserNumberBudget;
      }>;
      kind: 'assertRenderBudget';
      label?: string;
    }
  | ({
      kind: 'assertWindowSelectionText';
      label?: string;
    } & BrowserWindowSelectionTextExpectation)
  | {
      kind: 'assertDOMSelection';
      label?: string;
      selection: DOMSelectionSnapshotExpectation;
    }
  | {
      focusOwner: FocusOwnerSnapshot['kind'];
      kind: 'assertFocusOwner';
      label?: string;
    }
  | {
      kind: 'assertKernelTrace';
      label?: string;
      trace: BrowserKernelTraceExpectation;
    }
  | {
      kind: 'assertSelection';
      label?: string;
      selection: SelectionSnapshotExpectation;
    }
  | {
      expectation: BrowserSelectionContractExpectation;
      kind: 'assertSelectionContract';
      label?: string;
    }
  | {
      kind: 'assertSelectionLocation';
      label?: string;
      location: DOMSelectionLocationExpectation;
    }
  | { kind: 'assertModelText'; label?: string; text: string }
  | ({
      kind: 'assertLocatorText';
      label?: string;
      selector: string;
    } & AtLeastOne<{ contains: string; text: string }>)
  | { kind: 'assertSelectedText'; label?: string; text: string }
  | { kind: 'assertText'; label?: string; text: string }
  | {
      buttonName: string;
      expectedSelection: SelectionSnapshotExpectation;
      kind: 'activateShell';
      label?: string;
    }
  | { kind: 'assertLastCommit'; label?: string }
  | {
      kind: 'assertLastCommitIncludesTags';
      label?: string;
      tags: readonly [string, ...string[]];
    }
  | { kind: 'assertLastCommitTags'; label?: string; tags: readonly string[] }
  | { kind: 'clickTestId'; label?: string; testId: string }
  | { kind: 'clickSelector'; label?: string; selector: string }
  | { kind: 'captureNodeKey'; label?: string; name: string; path: number[] }
  | {
      committedText?: string;
      kind: 'composeText';
      label?: string;
      steps?: readonly string[];
      text: string;
      transport?: 'native' | 'synthetic';
    }
  | {
      kind: 'assertDOMCaret';
      label?: string;
      offset: number;
      text: string;
    }
  | {
      kind: 'assertBlockTexts';
      label?: string;
      startIndex?: number;
      texts: readonly string[];
    }
  | {
      kind: 'assertRenderedDOMShape';
      label?: string;
      shape: RenderedDOMShapeExpectation;
    }
  | {
      kind: 'clickTextOffset';
      label?: string;
      offset: number;
      path: number[];
    }
  | {
      kind: 'doubleClickTextOffset';
      label?: string;
      offset: number;
      path: number[];
      selectedText?: string;
    }
  | { kind: 'deleteBackward'; label?: string }
  | { kind: 'deleteForward'; label?: string }
  | {
      endXOffset?: number;
      index?: number;
      kind: 'dragTextSelection';
      label?: string;
      selector: string;
      startXOffset?: number;
      steps?: number;
      yOffset?: number;
    }
  | { html: string; kind: 'dropHtml'; label?: string; text?: string }
  | { kind: 'fillControl'; label?: string; selector: string; value: string }
  | { kind: 'focus'; label?: string }
  | { kind: 'insertText'; label?: string; text: string }
  | {
      data?: string;
      inputType?: string;
      kind: 'mutateTextDOM';
      label?: string;
      path: number[];
      selectionOffset?: number;
      text: string;
    }
  | { html: string; kind: 'pasteHtml'; label?: string; text?: string }
  | { kind: 'pasteText'; label?: string; text: string }
  | { key: string; kind: 'press'; label?: string }
  | { kind: 'rootClick'; label?: string }
  | { kind: 'rootMouseDown'; label?: string }
  | { kind: 'resetRenderProfiler'; label?: string }
  | { kind: 'select'; label?: string; selection: SelectionSnapshot }
  | { kind: 'selectDOM'; label?: string; selection: SelectionSnapshot }
  | { kind: 'selectAll'; label?: string }
  | { kind: 'settle'; label?: string; timeoutMs?: number }
  | { kind: 'snapshot'; label: string }
  | {
      caretAfterType: { offset: number; text: string };
      caretAfterUndo: { offset: number; text: string };
      expectedModelTextAfterType: string;
      expectedModelTextAfterUndo: string;
      kind: 'typeThenUndo';
      label?: string;
      text: string;
    }
  | { kind: 'type'; label?: string; text: string }
  | { expectedModelTextBefore?: string; kind: 'undo'; label?: string }
) &
  BrowserScenarioStepMetadata;

/** Result returned by a browser scenario run. */
export type BrowserScenarioResult = {
  metadata: BrowserNormalizedScenarioMetadata;
  name: string;
  replay: BrowserScenarioReplay;
  reductionCandidates: BrowserScenarioReductionCandidateSummary[];
  trace: BrowserTraceEntry[];
};

/** Options for running a browser scenario step list. */
export type BrowserScenarioRunOptions = {
  metadata?: BrowserScenarioMetadata;
  runtimeErrors?:
    | false
    | {
        patterns?: readonly string[];
      };
  tracePath?: string;
};

/** Candidate produced while reducing a failing scenario. */
export type BrowserScenarioReductionCandidate = {
  kind: 'iteration' | 'prefix' | 'single-step' | 'suffix';
  label: string;
  removedRange: { end: number; start: number };
  removedSteps: readonly BrowserScenarioStep[];
  steps: readonly BrowserScenarioStep[];
};

/** Human-readable summary of a scenario reduction candidate. */
export type BrowserScenarioReductionCandidateSummary = Omit<
  BrowserScenarioReductionCandidate,
  'removedSteps' | 'steps'
> & {
  removedStepLabels: string[];
  removedStepSummaries: string[];
  replay: BrowserScenarioReplay;
  stepLabels: string[];
  stepSummaries: string[];
};

/** Serialized scenario step used for replay artifacts. */
export type BrowserScenarioReplayStep = {
  iteration?: number;
  kind: BrowserScenarioStep['kind'];
  label: string;
  replayable: true;
  summary: string;
  value: BrowserScenarioStep;
  warmLoop?: string;
};

/** Replay artifact for reproducing a browser scenario. */
export type BrowserScenarioReplay = {
  replayable: true;
  steps: BrowserScenarioReplayStep[];
};

/** Options for one serializable internal-control fill step. */
export type BrowserFillStepOptions = {
  label?: string;
  target: string;
  value: string;
};

/** Explicitly non-replayable result from an imperative browser experiment. */
export type BrowserImperativeScenarioResult = Readonly<{
  kind: 'imperative-scenario';
  name: string;
  reducible: false;
  releaseGateCapable: false;
  replayable: false;
  steps: readonly BrowserTraceEntry[];
}>;

/** Controlled executor exposed inside an imperative browser experiment. */
export type BrowserImperativeScenarioContext = Readonly<{
  step: (label: string, action: () => Promise<void> | void) => Promise<void>;
}>;

/** Options for navigation-plus-typing gauntlet generation. */
export type BrowserNavigationTypingGauntletOptions = {
  insertedText: string;
  movedSelection: SelectionSnapshot;
  startSelection: SelectionSnapshot;
  textAfterInsert: string;
};

/** Options for clipboard paste gauntlet generation. */
export type BrowserClipboardPasteGauntletOptions = {
  html: string;
  plainText?: string;
  textAfterPaste: string;
};

/** Options for drag/drop data gauntlet generation. */
export type BrowserDropDataGauntletOptions = {
  html: string;
  plainText?: string;
  textAfterDrop: string;
};

/** Options for inline cut-and-type gauntlet generation. */
export type BrowserInlineCutTypingGauntletOptions = {
  domShape?: {
    afterCut?: RenderedDOMShapeExpectation;
    afterTyping?: RenderedDOMShapeExpectation;
  };
  replacementText: string;
  selection: SelectionSnapshot;
  textAfterTyping: string;
};

/** Options for internal native-control gauntlet generation. */
export type BrowserInternalControlGauntletOptions = {
  controlSelector: string;
  controlValue: string;
  followUpText: string;
  outerSelection: SelectionSnapshot;
  textAfterFollowUp: string;
};

/** Options for composition/IME gauntlet generation. */
export type BrowserCompositionGauntletOptions = {
  committedText?: string;
  selection?: SelectionSnapshot;
  steps?: readonly string[];
  text: string;
  textAfterComposition: string;
  transport?: 'native' | 'synthetic';
};

/** Options for text insertion gauntlet generation. */
export type BrowserTextInsertionGauntletOptions = {
  insertedText: string;
  textAfterInsert: string;
};

/** Options for shell activation gauntlet generation. */
export type BrowserShellActivationGauntletOptions = {
  buttonName: string;
  expectedSelection: SelectionSnapshotExpectation;
};

/** Options for mark typing gauntlet generation. */
export type BrowserMarkTypingGauntletOptions = {
  hotkey: string;
  insertedText: string;
  selection: SelectionSnapshot;
  textAfterInsert: string;
};

/** Options for mark-click typing gauntlet generation. */
export type BrowserMarkClickTypingGauntletOptions = {
  clickPoint: SelectionPoint;
  domCaretAfterInsert?: {
    offset: number;
    text: string;
  };
  hotkey: string;
  insertedText: string;
  markSelection: SelectionSnapshot;
  selectionAfterInsert?: SelectionSnapshotExpectation;
  selectionTransport?: 'dom' | 'model';
  textAfterInsert: string;
};

/** Options for toolbar mark-click typing gauntlet generation. */
export type BrowserToolbarMarkClickTypingGauntletOptions = Omit<
  BrowserMarkClickTypingGauntletOptions,
  'hotkey'
> & {
  markButtonTestId: string;
  selectionTransport?: 'dom' | 'model';
};

/** Options for repeating warm-up scenario steps. */
/** Options for warm-loop browser behavior packets. */
export type BrowserWarmLoopOptions = {
  createIteration: (iteration: number) => BrowserScenarioStep[];
  iterations?: number;
  label?: string;
};

type BrowserWarmToolbarArrowIterationOverride = Partial<
  Pick<
    BrowserWarmToolbarArrowGauntletOptions,
    | 'markDOMSelection'
    | 'markSelection'
    | 'selectionAfterArrowLeft'
    | 'selectionAfterCollapse'
  >
>;

/** Options for warm toolbar-arrow gauntlet generation. */
export type BrowserWarmToolbarArrowGauntletOptions = {
  domCaretAfterInsert?: {
    offset: number;
    text: string;
  };
  insertedText: string;
  markDOMSelection: DOMSelectionSnapshotExpectation;
  markButtonTestId: string;
  markSelection: SelectionSnapshot;
  selectedText: string;
  selectionAfterArrowLeft: SelectionSnapshotExpectation;
  selectionAfterCollapse: SelectionSnapshotExpectation;
  selectionAfterInsert: SelectionSnapshotExpectation;
  textAfterInsert: string;
  warmIterationOverrides?: readonly BrowserWarmToolbarArrowIterationOverride[];
  warmIterations?: number;
};

/** Options for mixed editing conformance gauntlet generation. */
export type BrowserMixedEditingConformanceGauntletOptions = {
  deleteKey: 'Backspace' | 'Delete';
  domCaretAfterDelete?: {
    offset: number;
    text: string;
  };
  domCaretAfterFollowUp?: {
    offset: number;
    text: string;
  };
  domShape?: {
    afterDelete?: RenderedDOMShapeExpectation;
    afterFollowUp?: RenderedDOMShapeExpectation;
    afterInsert?: RenderedDOMShapeExpectation;
  };
  insertedText: string;
  navigationKeys: readonly string[];
  selectionAfterDelete: SelectionSnapshotExpectation;
  selectionAfterFollowUp: SelectionSnapshotExpectation;
  selectionAfterInsert: SelectionSnapshotExpectation;
  selectionAfterNavigation: SelectionSnapshotExpectation;
  startSelection: SelectionSnapshot;
  textAfterDelete: string;
  textAfterFollowUp: string;
  textAfterInsert: string;
  toolbarButtonTestId: string;
  toolbarSelection: SelectionSnapshot;
  toolbarSelectionAfterCommand: SelectionSnapshotExpectation;
};

/** Options for destructive editing gauntlet generation. */
export type BrowserDestructiveEditingGauntletOptions = {
  deleteAfterPasteKey?: 'Backspace' | 'Delete';
  domShape?: {
    afterDeleteAfterPaste?: RenderedDOMShapeExpectation;
    afterFollowUp?: RenderedDOMShapeExpectation;
    afterPaste?: RenderedDOMShapeExpectation;
    afterWordDeleteFollowUp?: RenderedDOMShapeExpectation;
    afterWordDeleteIterations?: readonly RenderedDOMShapeExpectation[];
  };
  followUpText: string;
  pasteSelection: SelectionSnapshot;
  pastedText: string;
  selectionAfterDeleteAfterPaste?: SelectionSnapshotExpectation;
  selectionAfterFollowUp?: SelectionSnapshotExpectation;
  selectionAfterPaste?: SelectionSnapshotExpectation;
  tailBlockTextsAfterWordDelete: readonly string[];
  textAfterDeleteAfterPaste: string;
  textAfterFollowUp: string;
  textAfterPaste: string;
  wordDeleteIterations?: number;
  wordDeleteKey?: string;
  wordDeleteSelection: SelectionSnapshot;
};

/** Options for semantic editing conformance gauntlet generation. */
export type BrowserSemanticEditingConformanceGauntletOptions = {
  insertedText: string;
  selectionAfterDelete: SelectionSnapshotExpectation;
  selectionAfterFollowUp: SelectionSnapshotExpectation;
  selectionAfterInsert: SelectionSnapshotExpectation;
  startSelection: SelectionSnapshot;
  textAfterDelete: string;
  textAfterFollowUp: string;
  textAfterInsert: string;
  toolbarButtonTestId: string;
  toolbarSelection: SelectionSnapshot;
  toolbarSelectionAfterCommand: SelectionSnapshotExpectation;
};

/** Illegal kernel transition reported by kernel trace validation. */
export type BrowserIllegalKernelTransition = {
  label: string;
  reason: string | null;
  stepIndex: number | null;
};

/** Playwright helper bundle for opening routes and inspecting editors. */
/** Browser editor harness returned by `createBrowserEditorHarness`. */
export type BrowserEditorHarness = {
  name: string;
  page: Page;
  root: Locator;
  rootAt: (selector: string) => BrowserEditorHarness;
  get: {
    modelText: () => Promise<string>;
    modelBlockText: (index: number) => Promise<string | null>;
    modelBlockTexts: () => Promise<string[]>;
    modelValue: () => Promise<unknown>;
    text: () => Promise<string>;
    blockTexts: () => Promise<string[]>;
    renderedDOMShape: () => Promise<RenderedBlockDOMShapeSnapshot[]>;
    selectedText: () => Promise<string>;
    displayedSelection: () => Promise<BrowserDisplayedSelectionSnapshot>;
    html: () => Promise<string>;
    selection: () => Promise<SelectionSnapshot | null>;
    domSelection: () => Promise<DOMSelectionSnapshot | null>;
    focusOwner: () => Promise<FocusOwnerSnapshot>;
    kernelTrace: () => Promise<BrowserKernelTraceEntry[]>;
    history: () => Promise<unknown>;
    lastCommit: () => Promise<unknown>;
    placeholderShape: (selector?: string) => Promise<PlaceholderShape | null>;
  };
  selection: {
    select: (selection: SelectionSnapshot) => Promise<void>;
    selectDOM: (selection: SelectionSnapshot) => Promise<void>;
    dragTextRange: (options: BrowserDragTextRangeOptions) => Promise<void>;
    doubleClickDragTextRange: (
      options: BrowserDoubleClickDragTextRangeOptions
    ) => Promise<void>;
    collapse: (point: SelectionPoint) => Promise<void>;
    anchor: (
      options?: SelectionCaptureOptions
    ) => Promise<SelectionAnchorHandle>;
    resolve: (
      handle: SelectionAnchorHandle
    ) => Promise<SelectionSnapshot | null>;
    restore: (handle: SelectionAnchorHandle) => Promise<void>;
    release: (
      handle: SelectionAnchorHandle
    ) => Promise<SelectionSnapshot | null>;
    selectAll: () => Promise<void>;
    get: () => Promise<SelectionSnapshot | null>;
    displayed: () => Promise<BrowserDisplayedSelectionSnapshot>;
    dom: () => Promise<DOMSelectionSnapshot | null>;
    location: () => Promise<DOMSelectionLocationSnapshot | null>;
    importDOM: () => Promise<SelectionSnapshot | null>;
    rect: () => Promise<SelectionRectSnapshot | null>;
  };
  dom: {
    clickTextOffset: (options: BrowserTextOffsetClickOptions) => Promise<void>;
    clickTextRange: (
      options: BrowserTextPathRangeClickOptions
    ) => Promise<void>;
    collapseAtTextPath: (
      point: SelectionPoint,
      options?: BrowserDOMPathOptions
    ) => Promise<void>;
    waitForPendingNativeTextInputRepair: (options?: {
      timeoutMs?: number;
    }) => Promise<void>;
    waitForTextPath: (
      path: number[],
      options?: BrowserDOMPathOptions
    ) => Promise<void>;
  };
  locator: {
    block: (path: number[]) => Locator;
    text: (path: number[]) => Locator;
  };
  ready: (options: ReadyOptions) => Promise<void>;
  snapshot: () => Promise<EditorSnapshot>;
  focus: () => Promise<void>;
  click: () => Promise<void>;
  type: (text: string) => Promise<void>;
  press: (key: string) => Promise<void>;
  insertText: (text: string) => Promise<void>;
  insertBreak: () => Promise<void>;
  deleteFragment: () => Promise<void>;
  deleteBackward: () => Promise<void>;
  deleteForward: () => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  selectAll: () => Promise<void>;
  assert: {
    text: (text: RegExp | string) => Promise<void>;
    modelBlockText: (index: number, text: string | null) => Promise<void>;
    modelBlockTexts: (texts: string[]) => Promise<void>;
    blockTexts: (texts: string[]) => Promise<void>;
    html: (
      expectedHtml: string,
      options?: HtmlNormalizationOptions
    ) => Promise<void>;
    htmlContains: (expectedFragment: string) => Promise<void>;
    htmlEquals: (
      expectedHtml: string,
      options?: HtmlNormalizationOptions
    ) => Promise<void>;
    focusOwner: (expected: FocusOwnerSnapshot['kind']) => Promise<void>;
    kernelTrace: (expected: BrowserKernelTraceExpectation) => Promise<void>;
    selection: (expected: SelectionSnapshotExpectation) => Promise<void>;
    collapsedModelDOMSelection: (
      expected: CollapsedModelDOMSelectionExpectation
    ) => Promise<void>;
    noDoubleSelectionHighlight: () => Promise<void>;
    caretVisibleInScrollableParent: () => Promise<void>;
    noVisibleCaretInRoot: () => Promise<void>;
    domSelection: (expected: DOMSelectionSnapshotExpectation) => Promise<void>;
    domCaret: (expected: { offset: number; text: string }) => Promise<void>;
    domSelectionTarget: (
      expected: Partial<DOMSelectionLocationSnapshot>
    ) => Promise<void>;
    noUnexpectedZeroWidthBreaks: (blockIndex?: number) => Promise<void>;
    placeholderShape: (
      expected: PlaceholderShape,
      selector?: string
    ) => Promise<void>;
    placeholderVisible: (visible?: boolean) => Promise<void>;
    renderedBlockText: (blockIndex: number, text: string) => Promise<void>;
    renderedDOMShape: (expected: RenderedDOMShapeExpectation) => Promise<void>;
  };
  clipboard: {
    copy: () => Promise<void>;
    copyEventPayload: () => Promise<ClipboardPayloadSnapshot>;
    copyNativeEventPayload: () => Promise<ClipboardPayloadSnapshot>;
    cutEventPayload: () => Promise<ClipboardPayloadSnapshot>;
    cutNativeEventPayload: () => Promise<ClipboardPayloadSnapshot>;
    copyPayload: () => Promise<ClipboardPayloadSnapshot>;
    readText: () => Promise<string>;
    readHtml: () => Promise<string | null>;
    pasteEventPayload: (payload: {
      html?: string | null;
      fragment?: string | null;
      text: string;
    }) => Promise<void>;
    pasteNativeText: (text: string) => Promise<void>;
    pasteText: (text: string) => Promise<void>;
    pasteHtml: (html: string, plainText?: string) => Promise<void>;
    assert: {
      textContains: (expected: string) => Promise<void>;
      htmlContains: (expected: string) => Promise<void>;
      htmlEquals: (expected: string) => Promise<void>;
      types: (expected: string[]) => Promise<void>;
    };
  };
  ime: {
    enableKeyEvents: () => Promise<void>;
    startSynthetic: (options?: { text?: string }) => Promise<void>;
    updateSynthetic: (options: { text: string }) => Promise<void>;
    commitSynthetic: (options: { text: string }) => Promise<void>;
    compose: (options: {
      text: string;
      steps?: readonly string[];
      committedText?: string;
      transport?: 'native' | 'synthetic';
    }) => Promise<void>;
    composeDirect: (options: { text: string }) => Promise<void>;
  };
  scenario: {
    /** Run arbitrary browser work with editor-scoped trace snapshots. */
    runImperative: (
      name: string,
      run: (context: BrowserImperativeScenarioContext) => Promise<void> | void
    ) => Promise<BrowserImperativeScenarioResult>;
    run: (
      name: string,
      steps: readonly BrowserScenarioStep[],
      options?: BrowserScenarioRunOptions
    ) => Promise<BrowserScenarioResult>;
  };
  trace: {
    snapshot: (
      label: string,
      stepIndex?: number | null
    ) => Promise<BrowserTraceEntry>;
  };
};

/** Contract expectation for model, DOM, native, and visual selection proof. */
/** Expected selection state for `assertBrowserSelectionContract`. */
export type BrowserSelectionContractExpectation = AtLeastOne<{
  domSelection?: DOMSelectionSnapshotExpectation;
  domSelectionTarget?: DOMSelectionLocationExpectation;
  hasVisibleEditorSelection?: boolean;
  hasVisibleSelection?: boolean;
  noDoubleSelectionHighlight?: true;
  selectedText?: string;
  selection?: SelectionSnapshotExpectation;
}>;

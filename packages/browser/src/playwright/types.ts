import type { Locator, Page } from '@playwright/test';

import type { PlaceholderShape } from '../browser/zero-width';

import type {
  SlateReactRenderKind,
  SlateReactRenderProfilerSnapshot,
} from './render-profiler';

/** Slate model selection snapshot captured from an editor surface. */
/** Model selection snapshot captured from the editor runtime. */
export type SelectionSnapshot = {
  anchor: { path: number[]; offset: number };
  focus: { path: number[]; offset: number };
};

/** Owner metadata for a raw view-selection snapshot. */
export type SlateBrowserRawViewSelectionOwner = {
  childRoot: string;
  ownerPath: number[];
  ownerRoot: string;
};

/** Point in a raw view-selection snapshot. */
export type SlateBrowserRawViewSelectionPoint = {
  owner?: SlateBrowserRawViewSelectionOwner;
  point: { path: number[]; offset: number; root?: string };
};

/** Raw view-selection snapshot captured from Slate view state. */
export type SlateBrowserRawViewSelectionSnapshot = {
  anchor: SlateBrowserRawViewSelectionPoint;
  focus: SlateBrowserRawViewSelectionPoint;
  segments: { backward: boolean; [key: string]: unknown };
};

/** Browser DOM selection snapshot captured from the page. */
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

/** Combined model and native-selection summary for one root. */
/** Combined model and native selection summary for proof assertions. */
export type SlateBrowserNativeSelectionSummary = {
  collapsed: boolean | null;
  rangeCount: number;
  selection: SelectionSnapshot | null;
  textLength: number;
};

/** Slate view-selection snapshot used by browser proof helpers. */
export type SlateBrowserViewSelectionSnapshot = {
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
export type SlateBrowserDisplayedSelectionSnapshot = {
  displayed: SelectionSnapshot | null;
  doubleHighlighted: boolean;
  hasVisibleEditorSelection: boolean;
  hasVisibleSelection: boolean;
  model: SelectionSnapshot | null;
  native: SlateBrowserNativeSelectionSummary;
  source: 'native' | 'none' | 'view';
  view: SlateBrowserViewSelectionSnapshot;
};

/** Clipboard payload captured during a browser proof step. */
/** Clipboard payload snapshot captured during paste/copy proof. */
export type ClipboardPayloadSnapshot = {
  html: string | null;
  slateFragment?: string | null;
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
export type SlateBrowserNativeEventTraceType =
  | 'beforeinput'
  | 'compositionend'
  | 'compositionstart'
  | 'compositionupdate'
  | 'input'
  | 'selectionchange';

/** DOM node summary captured in a native event trace. */
export type SlateBrowserNativeEventTraceNodeSnapshot = {
  nodeName: string | null;
  parentNodeName: string | null;
  parentPath: string | null;
  parentSignature: string | null;
  path: string | null;
  text: string | null;
};

/** Selection summary captured during a native event trace. */
export type SlateBrowserNativeEventTraceSelectionSnapshot = {
  anchor: SlateBrowserNativeEventTraceNodeSnapshot | null;
  anchorOffset: number | null;
  collapsed: boolean | null;
  focus: SlateBrowserNativeEventTraceNodeSnapshot | null;
  focusOffset: number | null;
  rangeCount: number;
  selectedText: string;
};

/** Rectangle captured from native event target ranges. */
export type SlateBrowserNativeEventTraceRect = {
  height: number;
  width: number;
  x: number;
  y: number;
};

/** Target-range snapshot captured from a native input event. */
export type SlateBrowserNativeEventTraceTargetRangeSnapshot = {
  collapsed: boolean;
  end: SlateBrowserNativeEventTraceNodeSnapshot;
  endOffset: number;
  rects: SlateBrowserNativeEventTraceRect[];
  start: SlateBrowserNativeEventTraceNodeSnapshot;
  startOffset: number;
};

/** Text-node snapshot captured before or after a native event. */
export type SlateBrowserNativeEventTraceTextNodeSnapshot = {
  id: string;
  parentPath: string | null;
  parentSignature: string;
  text: string;
};

/** Text-node before/after delta captured by native event tracing. */
export type SlateBrowserNativeEventTraceTextNodeDelta = {
  after: SlateBrowserNativeEventTraceTextNodeSnapshot | null;
  before: SlateBrowserNativeEventTraceTextNodeSnapshot | null;
  type: 'added' | 'deleted' | 'modified' | 'moved';
};

/** DOM delta captured around one native event. */
export type SlateBrowserNativeEventTraceDOMDelta = {
  textNodes: SlateBrowserNativeEventTraceTextNodeDelta[];
};

/** Suspicious native-event trace finding. */
export type SlateBrowserNativeEventTraceAnomaly = {
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
export type SlateBrowserNativeEventTraceEntry = {
  data: string | null;
  domDelta: SlateBrowserNativeEventTraceDOMDelta | null;
  inputType: string | null;
  isComposing: boolean | null;
  selection: SlateBrowserNativeEventTraceSelectionSnapshot;
  targetRanges: SlateBrowserNativeEventTraceTargetRangeSnapshot[];
  timestamp: number;
  type: SlateBrowserNativeEventTraceType;
};

/** Complete native event trace collected from a Slate browser root. */
/** Complete native event trace snapshot. */
export type SlateBrowserNativeEventTraceSnapshot = {
  anomalies: SlateBrowserNativeEventTraceAnomaly[];
  entries: SlateBrowserNativeEventTraceEntry[];
};

/** Options controlling which native events are traced. */
/** Options for installing a native event trace recorder in the page. */
export type SlateBrowserNativeEventTraceOptions = {
  events?: readonly SlateBrowserNativeEventTraceType[];
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
export type SlateBrowserZeroWidthNodeShape = {
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
  unexpectedZeroWidthBreaks: SlateBrowserZeroWidthNodeShape[];
  zeroWidthNodes: SlateBrowserZeroWidthNodeShape[];
};

/** Expected rendered DOM shape for browser proof assertions. */
/** Expected rendered DOM shape for proof assertions. */
export type RenderedDOMShapeExpectation = {
  blockIndex?: number;
  domSelectionTarget?: Partial<DOMSelectionLocationSnapshot>;
  innerText?: string;
  lineBoxCount?:
    | number
    | {
        max?: number;
        min?: number;
      };
  noUnexpectedZeroWidthBreaks?: boolean;
  textContent?: string;
  zeroWidthBreakCount?: number;
  zeroWidthCount?: number;
};

/** High-level kernel trace event family. */
export type SlateBrowserKernelEventFamily =
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
export type SlateBrowserKernelState =
  | 'app-owned'
  | 'clipboard'
  | 'composition'
  | 'dom-selection'
  | 'dragging'
  | 'idle'
  | 'internal-control'
  | 'model-owned'
  | 'repairing'
  | 'shell-backed';

/** Owner classification for the current browser editing target. */
export type SlateBrowserKernelTargetOwner =
  | 'app-owned'
  | 'editor'
  | 'internal-control'
  | 'outside-editor'
  | 'shell'
  | 'unknown';

/** Model/native ownership classification for a kernel event. */
export type SlateBrowserKernelOwnership =
  | 'app-owned'
  | 'deferred'
  | 'model-owned'
  | 'native-allowed'
  | 'native-denied'
  | 'no-op';

/** Source that produced the selection observed by the kernel trace. */
export type SlateBrowserKernelSelectionSource =
  | 'app-owned'
  | 'composition-owned'
  | 'dom-current'
  | 'internal-control'
  | 'model-owned'
  | 'shell-backed'
  | 'unknown';

/** Origin of a selection change captured by the kernel trace. */
export type SlateBrowserKernelSelectionChangeOrigin =
  | 'browser-handle'
  | 'native-user'
  | 'programmatic-export'
  | 'repair-induced'
  | 'unknown';

/** Editing command observed by the browser kernel trace. */
export type SlateBrowserKernelCommand =
  | {
      direction: 'backward' | 'forward';
      kind: 'delete';
      unit?: 'block' | 'line' | 'word';
    }
  | { kind: 'delete-both'; unit: 'line' }
  | { direction?: 'backward' | 'forward'; kind: 'delete-fragment' }
  | { direction: 'redo' | 'undo'; kind: 'history' }
  | { kind: 'insert-break'; variant: 'paragraph' | 'soft' }
  | { data?: unknown; kind: 'insert-data' }
  | { inputType?: string; kind: 'insert-text'; text: string }
  | {
      axis: 'horizontal' | 'line' | 'word';
      extend?: boolean;
      kind: 'move-selection';
      reverse?: boolean;
    }
  | { kind: 'select'; selection: SelectionSnapshot }
  | { kind: 'select-all' }
  | { blockType: string; kind: 'set-block'; wrap?: string }
  | { kind: 'toggle-mark'; mark: string };

/** Ownership trace for keyboard or pointer movement through the editor. */
export type SlateBrowserKernelMovementOwnershipTrace = {
  axis: 'horizontal' | 'line' | 'unknown' | 'vertical' | 'word';
  extend: boolean;
  key: string;
  ownership: Extract<
    SlateBrowserKernelOwnership,
    'model-owned' | 'native-allowed'
  >;
  reason:
    | 'model-horizontal-inline-void'
    | 'model-line-browser'
    | 'model-word-boundary'
    | 'native-selection-key'
    | 'native-vertical-layout';
  reverse: boolean | null;
};

/** Selection policy attached to a kernel transition. */
export type SlateBrowserKernelSelectionPolicy = {
  kind:
    | 'clear'
    | 'export-model'
    | 'import-dom'
    | 'none'
    | 'preserve-model'
    | 'shell';
  reason:
    | 'internal-control'
    | 'model-owned'
    | 'native-selection'
    | 'not-requested'
    | 'selection-clear'
    | 'shell-backed'
    | 'unknown-selection';
};

/** Repair policy attached to a kernel transition. */
export type SlateBrowserKernelRepairPolicy = {
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
export type SlateBrowserKernelTransition = {
  allowed: boolean;
  reason: string | null;
};

/** Slate operation summary attached to a kernel trace frame. */
export type SlateBrowserKernelOperation = {
  type: string;
  [key: string]: unknown;
};

/** Repair request emitted while handling a kernel event frame. */
export type SlateBrowserKernelRepairRequest = {
  kind: string;
  [key: string]: unknown;
};

/** Native event frame and derived editor evidence. */
export type SlateBrowserKernelEventFrame = {
  active: boolean;
  eventFamily: SlateBrowserKernelEventFamily;
  focusOwner: SlateBrowserKernelTargetOwner;
  id: number;
  inputIntent: string | null;
  modelSelectionBefore: SelectionSnapshot | null;
  selectionSource: SlateBrowserKernelSelectionSource;
  startedAt: number;
  targetOwner: SlateBrowserKernelTargetOwner;
};

/** Kernel trace entry used by browser behavior assertions. */
export type SlateBrowserKernelTraceEntry = {
  command: SlateBrowserKernelCommand | null;
  epochId: number | null;
  eventFamily: SlateBrowserKernelEventFamily;
  frame: SlateBrowserKernelEventFrame | null;
  frameId: number | null;
  intent: string | null;
  movement: SlateBrowserKernelMovementOwnershipTrace | null;
  nativeAllowed: boolean;
  operations: readonly SlateBrowserKernelOperation[];
  ownership: SlateBrowserKernelOwnership;
  repair: SlateBrowserKernelRepairRequest | null;
  repairPolicy: SlateBrowserKernelRepairPolicy;
  selectionChangeOrigin: SlateBrowserKernelSelectionChangeOrigin;
  selectionAfter: SelectionSnapshot | null;
  selectionBefore: SelectionSnapshot | null;
  selectionPolicy: SlateBrowserKernelSelectionPolicy;
  selectionSource: SlateBrowserKernelSelectionSource;
  stateAfter: SlateBrowserKernelState;
  stateBefore: SlateBrowserKernelState;
  targetOwner: SlateBrowserKernelTargetOwner;
  transition: SlateBrowserKernelTransition;
};

/** Expected kernel trace properties for one assertion. */
export type SlateBrowserKernelTraceExpectation = {
  commandKind?: SlateBrowserKernelCommand['kind'] | null;
  eventFamily?: SlateBrowserKernelEventFamily;
  movement?: Partial<SlateBrowserKernelMovementOwnershipTrace> | null;
  ownership?: SlateBrowserKernelOwnership;
  repairPolicy?: Partial<SlateBrowserKernelRepairPolicy>;
  selectionChangeOrigin?: SlateBrowserKernelSelectionChangeOrigin;
  selectionPolicy?: Partial<SlateBrowserKernelSelectionPolicy>;
  selectionSource?: SlateBrowserKernelSelectionSource;
  stateAfter?: SlateBrowserKernelState;
  stateBefore?: SlateBrowserKernelState;
  targetOwner?: SlateBrowserKernelTargetOwner;
  transition?: Partial<SlateBrowserKernelTransition>;
};

/** Point shape reused from a model selection snapshot. */
export type SelectionPoint = SelectionSnapshot['anchor'];
/** Affinity used when capturing or restoring selection bookmarks. */
export type RangeRefAffinity =
  | 'forward'
  | 'backward'
  | 'outward'
  | 'inward'
  | null;

/** Serializable selection bookmark used by replay helpers. */
export type SelectionBookmark = {
  id: string;
};

/** Options for capturing Slate and DOM selection snapshots. */
/** Options for capturing model and DOM selection snapshots. */
export type SelectionCaptureOptions = {
  affinity?: RangeRefAffinity;
};

/** Options for resolving DOM paths in browser helpers. */
/** Options for resolving a DOM node from a Slate path. */
export type SlateBrowserDOMPathOptions = {
  align?: 'center' | 'end' | 'nearest' | 'start';
  timeoutMs?: number;
};

/** Options for clicking a text range by Slate path. */
/** Options for clicking a text range resolved by Slate path. */
export type SlateBrowserTextPathRangeClickOptions =
  SlateBrowserDOMPathOptions & {
    endOffset: number;
    xAffinity?: 'center' | 'end' | 'start';
    path: number[];
    startOffset: number;
  };

/** Options for clicking text by visible offset. */
/** Options for clicking a text node at a character offset. */
export type SlateBrowserTextOffsetClickOptions = {
  clickCount?: number;
  offset: number;
  path: number[];
  waitForSelectionSync?: boolean;
};

/** Options for dragging across a resolved text range. */
export type SlateBrowserDragTextRangeOptions = {
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
export type SlateBrowserDoubleClickDragTextRangeOptions = {
  doubleClickOffset: number;
  endOffset: number;
  gestureDelayMs?: number;
  steps?: number;
  text: string;
  textNodeIndex?: number;
};

/** Exact or inclusive offset expectation for selection assertions. */
export type OffsetExpectation = number | readonly [number, number];

/** Expected Slate model selection shape. */
/** Expected model selection snapshot shape. */
export type SelectionSnapshotExpectation = {
  anchor: { path: number[]; offset: OffsetExpectation };
  focus: { path: number[]; offset: OffsetExpectation };
};

/** Expected browser DOM selection shape. */
/** Expected browser-native DOM selection snapshot shape. */
export type DOMSelectionSnapshotExpectation = {
  anchorNodeText: string | null;
  anchorOffset: OffsetExpectation;
  focusNodeText: string | null;
  focusOffset: OffsetExpectation;
};

/** Combined expectation for a collapsed model and DOM selection. */
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
/** Options for waiting until a Slate example route is ready. */
export type ReadyOptions = {
  editor?: 'visible';
  placeholder?: 'visible' | 'hidden';
  selector?: string;
  text?: RegExp | string;
  selection?: 'settled' | SelectionSnapshot;
};

/** Options for selecting an editor surface on a page. */
/** Options for locating an editor surface on an example route. */
export type EditorSurfaceOptions = {
  frame?: string;
  scope?: string;
};

/** Options for opening an example route in the browser harness. */
/** Options for opening and preparing a Slate example route. */
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
  kernelTrace: SlateBrowserKernelTraceEntry[];
  lastCommit: unknown | null;
  placeholderShape: PlaceholderShape | null;
};

/** Summary of a rendered Slate shell node. */
export type SlateBrowserShellSummary = {
  isInline: boolean;
  isVoid: boolean;
  kind: string | null;
  path: string | null;
  runtimeId: string | null;
  tagName: string | null;
};

/** Snapshot of selected rendered shell nodes. */
export type SlateBrowserSelectedShellSnapshot = {
  element: SlateBrowserShellSummary | null;
  node: SlateBrowserShellSummary | null;
  offset: number;
  path: number[];
  point: 'anchor' | 'focus';
};

/** Snapshot of rendered shell nodes related to selection. */
export type SlateBrowserSelectionShellsSnapshot = {
  anchor: SlateBrowserSelectedShellSnapshot;
  focus: SlateBrowserSelectedShellSnapshot;
  runtimeIds: string[];
};

/** Full render state snapshot including selected and selection shells. */
/** Editor snapshot with rendered shell and DOM shape evidence. */
export type SlateBrowserRenderStateSnapshot = EditorSnapshot & {
  renderCounts: SlateReactRenderProfilerSnapshot;
  selectionShells: SlateBrowserSelectionShellsSnapshot | null;
};

/** Browser-side trace entry emitted by scenario runners. */
export type SlateBrowserTraceEntry = {
  label: string;
  snapshot: EditorSnapshot;
  stepIndex: number | null;
};

/** Caller-provided metadata for browser scenario execution. */
/** Scenario metadata supplied by a browser scenario step. */
export type SlateBrowserScenarioMetadata = {
  capabilities?: readonly string[];
  platform?: string;
  transport?: string;
};

/** Transport capability claim attached to a scenario step. */
export type SlateBrowserTransportClaim =
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
export type SlateBrowserNormalizedScenarioMetadata = {
  capabilities: string[];
  claim: SlateBrowserTransportClaim;
  platform: string | null;
  transport: string | null;
};

/** Metadata attached to one executable scenario step. */
export type SlateBrowserScenarioStepMetadata = {
  iteration?: number;
  warmLoop?: string;
};

/** Executable step in a browser scenario. */
/** Executable browser scenario step. */
export type SlateBrowserScenarioStep = (
  | {
      kind: 'applyOperations';
      label?: string;
      operations: readonly Record<string, unknown>[];
      tag?: string | string[];
    }
  | {
      count?: number;
      kind: 'assertLocatorCount';
      label?: string;
      max?: number;
      min?: number;
      selector: string;
    }
  | {
      index?: number;
      kind: 'assertLocatorCss';
      label?: string;
      notValue?: string;
      property: string;
      selector: string;
      value?: string;
    }
  | {
      afterSelector: string;
      beforeSelector: string;
      kind: 'assertLocatorVerticalGap';
      label?: string;
      max?: number;
      min?: number;
    }
  | {
      innerSelector: string;
      kind: 'assertLocatorVerticalOffset';
      label?: string;
      max?: number;
      min?: number;
      selector: string;
    }
  | {
      kind: 'assertModelSelectionExpanded';
      label?: string;
    }
  | {
      kind: 'assertCapturedRuntimeIdPath';
      label?: string;
      name: string;
      path: number[] | null;
    }
  | {
      budget: {
        byKind?: Partial<
          Record<
            SlateReactRenderKind,
            { exact?: number; max?: number; min?: number } | number
          >
        >;
        total?: { exact?: number; max?: number; min?: number } | number;
      };
      kind: 'assertRenderBudget';
      label?: string;
    }
  | {
      contains?: string;
      kind: 'assertWindowSelectionText';
      label?: string;
      notEmpty?: boolean;
      text?: string;
    }
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
      trace: SlateBrowserKernelTraceExpectation;
    }
  | {
      kind: 'assertSelection';
      label?: string;
      selection: SelectionSnapshotExpectation;
    }
  | {
      expectation: SlateBrowserSelectionContractExpectation;
      kind: 'assertSelectionContract';
      label?: string;
    }
  | {
      kind: 'assertSelectionLocation';
      label?: string;
      location: Partial<DOMSelectionLocationSnapshot>;
    }
  | { kind: 'assertModelText'; label?: string; text: string }
  | {
      contains?: string;
      kind: 'assertLocatorText';
      label?: string;
      selector: string;
      text?: string;
    }
  | { kind: 'assertSelectedText'; label?: string; text: string }
  | { kind: 'assertText'; label?: string; text: string }
  | {
      buttonName: RegExp | string;
      expectedSelection: SelectionSnapshotExpectation;
      kind: 'activateShell';
      label?: string;
    }
  | { kind: 'assertLastCommit'; label?: string }
  | { kind: 'assertLastCommitTags'; label?: string; tags: readonly string[] }
  | {
      command: { origin: string; type: string };
      kind: 'assertLastCommitCommand';
      label?: string;
    }
  | { kind: 'clickTestId'; label?: string; testId: string }
  | { kind: 'clickSelector'; label?: string; selector: string }
  | { kind: 'captureRuntimeId'; label?: string; name: string; path: number[] }
  | {
      committedText?: string;
      kind: 'composeText';
      label?: string;
      steps?: readonly string[];
      text: string;
      transport?: 'native' | 'synthetic';
    }
  | {
      kind: 'custom';
      label: string;
      run: (editor: SlateBrowserEditorHarness) => Promise<void> | void;
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
  SlateBrowserScenarioStepMetadata;

/** Result returned after running a browser scenario. */
/** Result returned by a browser scenario run. */
export type SlateBrowserScenarioResult = {
  metadata: SlateBrowserNormalizedScenarioMetadata;
  name: string;
  replay: SlateBrowserScenarioReplay;
  reductionCandidates: SlateBrowserScenarioReductionCandidateSummary[];
  trace: SlateBrowserTraceEntry[];
};

/** Options for running a browser scenario. */
/** Options for running a browser scenario step list. */
export type SlateBrowserScenarioRunOptions = {
  metadata?: SlateBrowserScenarioMetadata;
  runtimeErrors?:
    | false
    | {
        patterns?: readonly string[];
      };
  tracePath?: string;
};

/** Candidate reduced scenario produced from a failing run. */
/** Candidate produced while reducing a failing scenario. */
export type SlateBrowserScenarioReductionCandidate = {
  kind: 'iteration' | 'prefix' | 'single-step' | 'suffix';
  label: string;
  removedRange: { end: number; start: number };
  removedSteps: readonly SlateBrowserScenarioStep[];
  steps: readonly SlateBrowserScenarioStep[];
};

/** Serializable summary of a scenario reduction candidate. */
/** Human-readable summary of a scenario reduction candidate. */
export type SlateBrowserScenarioReductionCandidateSummary = Omit<
  SlateBrowserScenarioReductionCandidate,
  'removedSteps' | 'steps'
> & {
  removedStepLabels: string[];
  removedStepSummaries: string[];
  replay: SlateBrowserScenarioReplay;
  stepLabels: string[];
  stepSummaries: string[];
};

/** Serialized scenario step used for replay artifacts. */
export type SlateBrowserScenarioReplayStep = {
  iteration?: number;
  kind: string;
  label: string;
  replayable: boolean;
  summary: string;
  value: Record<string, unknown>;
  warmLoop?: string;
};

/** Replay artifact for a browser scenario. */
/** Replay artifact for reproducing a browser scenario. */
export type SlateBrowserScenarioReplay = {
  replayable: boolean;
  steps: SlateBrowserScenarioReplayStep[];
};

/** Options for the navigation-plus-typing gauntlet. */
/** Options for navigation-plus-typing gauntlet generation. */
export type SlateBrowserNavigationTypingGauntletOptions = {
  insertedText: string;
  movedSelection: SelectionSnapshot;
  startSelection: SelectionSnapshot;
  textAfterInsert: string;
};

/** Options for the clipboard paste gauntlet. */
/** Options for clipboard paste gauntlet generation. */
export type SlateBrowserClipboardPasteGauntletOptions = {
  html: string;
  plainText?: string;
  textAfterPaste: string;
};

/** Options for drag/drop data gauntlet generation. */
export type SlateBrowserDropDataGauntletOptions = {
  html: string;
  plainText?: string;
  textAfterDrop: string;
};

/** Options for inline cut-and-type gauntlet generation. */
export type SlateBrowserInlineCutTypingGauntletOptions = {
  domShape?: {
    afterCut?: RenderedDOMShapeExpectation;
    afterTyping?: RenderedDOMShapeExpectation;
  };
  replacementText: string;
  selection: SelectionSnapshot;
  textAfterTyping: string;
};

/** Options for internal native-control gauntlet generation. */
export type SlateBrowserInternalControlGauntletOptions = {
  controlSelector: string;
  controlValue: string;
  followUpText: string;
  outerSelection: SelectionSnapshot;
  textAfterFollowUp: string;
};

/** Options for composition/IME gauntlet generation. */
export type SlateBrowserCompositionGauntletOptions = {
  committedText?: string;
  selection?: SelectionSnapshot;
  steps?: readonly string[];
  text: string;
  textAfterComposition: string;
  transport?: 'native' | 'synthetic';
};

/** Options for text insertion gauntlet generation. */
export type SlateBrowserTextInsertionGauntletOptions = {
  insertedText: string;
  textAfterInsert: string;
};

/** Options for shell activation gauntlet generation. */
export type SlateBrowserShellActivationGauntletOptions = {
  buttonName: RegExp | string;
  expectedSelection: SelectionSnapshotExpectation;
};

/** Options for mark typing gauntlet generation. */
export type SlateBrowserMarkTypingGauntletOptions = {
  hotkey: string;
  insertedText: string;
  selection: SelectionSnapshot;
  textAfterInsert: string;
};

/** Options for mark-click typing gauntlet generation. */
export type SlateBrowserMarkClickTypingGauntletOptions = {
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
export type SlateBrowserToolbarMarkClickTypingGauntletOptions = Omit<
  SlateBrowserMarkClickTypingGauntletOptions,
  'hotkey'
> & {
  markButtonTestId: string;
  selectionTransport?: 'dom' | 'model';
};

/** Options for repeating warm-up scenario steps. */
/** Options for warm-loop browser behavior packets. */
export type SlateBrowserWarmLoopOptions = {
  createIteration: (iteration: number) => SlateBrowserScenarioStep[];
  iterations?: number;
  label?: string;
};

type SlateBrowserWarmToolbarArrowIterationOverride = Partial<
  Pick<
    SlateBrowserWarmToolbarArrowGauntletOptions,
    | 'markDOMSelection'
    | 'markSelection'
    | 'selectionAfterArrowLeft'
    | 'selectionAfterCollapse'
  >
>;

/** Options for warm toolbar-arrow gauntlet generation. */
export type SlateBrowserWarmToolbarArrowGauntletOptions = {
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
  warmIterationOverrides?: readonly SlateBrowserWarmToolbarArrowIterationOverride[];
  warmIterations?: number;
};

/** Options for mixed editing conformance gauntlet generation. */
export type SlateBrowserMixedEditingConformanceGauntletOptions = {
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
export type SlateBrowserDestructiveEditingGauntletOptions = {
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
export type SlateBrowserSemanticEditingConformanceGauntletOptions = {
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
export type SlateBrowserIllegalKernelTransition = {
  label: string;
  reason: string | null;
  stepIndex: number | null;
};

/** Playwright helper bundle for opening routes and inspecting editors. */
/** Browser editor harness returned by `createSlateBrowserEditorHarness`. */
export type SlateBrowserEditorHarness = {
  name: string;
  page: Page;
  root: Locator;
  rootAt: (selector: string) => SlateBrowserEditorHarness;
  get: {
    modelText: () => Promise<string>;
    modelBlockText: (index: number) => Promise<string | null>;
    modelBlockTexts: () => Promise<string[]>;
    text: () => Promise<string>;
    blockTexts: () => Promise<string[]>;
    renderedDOMShape: () => Promise<RenderedBlockDOMShapeSnapshot[]>;
    selectedText: () => Promise<string>;
    displayedSelection: () => Promise<SlateBrowserDisplayedSelectionSnapshot>;
    html: () => Promise<string>;
    selection: () => Promise<SelectionSnapshot | null>;
    domSelection: () => Promise<DOMSelectionSnapshot | null>;
    focusOwner: () => Promise<FocusOwnerSnapshot>;
    kernelTrace: () => Promise<SlateBrowserKernelTraceEntry[]>;
    history: () => Promise<unknown>;
    lastCommit: () => Promise<unknown | null>;
    placeholderShape: (selector?: string) => Promise<PlaceholderShape | null>;
  };
  selection: {
    select: (selection: SelectionSnapshot) => Promise<void>;
    selectDOM: (selection: SelectionSnapshot) => Promise<void>;
    dragTextRange: (options: SlateBrowserDragTextRangeOptions) => Promise<void>;
    doubleClickDragTextRange: (
      options: SlateBrowserDoubleClickDragTextRangeOptions
    ) => Promise<void>;
    collapse: (point: SelectionPoint) => Promise<void>;
    capture: (options?: SelectionCaptureOptions) => Promise<SelectionBookmark>;
    bookmark: (options?: SelectionCaptureOptions) => Promise<SelectionBookmark>;
    resolve: (bookmark: SelectionBookmark) => Promise<SelectionSnapshot | null>;
    restore: (bookmark: SelectionBookmark) => Promise<void>;
    unref: (bookmark: SelectionBookmark) => Promise<SelectionSnapshot | null>;
    selectAll: () => Promise<void>;
    get: () => Promise<SelectionSnapshot | null>;
    displayed: () => Promise<SlateBrowserDisplayedSelectionSnapshot>;
    dom: () => Promise<DOMSelectionSnapshot | null>;
    location: () => Promise<DOMSelectionLocationSnapshot | null>;
    importDOM: () => Promise<SelectionSnapshot | null>;
    rect: () => Promise<SelectionRectSnapshot | null>;
  };
  dom: {
    clickTextOffset: (
      options: SlateBrowserTextOffsetClickOptions
    ) => Promise<void>;
    clickTextRange: (
      options: SlateBrowserTextPathRangeClickOptions
    ) => Promise<void>;
    collapseAtTextPath: (
      point: SelectionPoint,
      options?: SlateBrowserDOMPathOptions
    ) => Promise<void>;
    waitForPendingNativeTextInputRepair: (options?: {
      timeoutMs?: number;
    }) => Promise<void>;
    waitForTextPath: (
      path: number[],
      options?: SlateBrowserDOMPathOptions
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
    kernelTrace: (
      expected: SlateBrowserKernelTraceExpectation
    ) => Promise<void>;
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
    cutEventPayload: () => Promise<ClipboardPayloadSnapshot>;
    copyPayload: () => Promise<ClipboardPayloadSnapshot>;
    readText: () => Promise<string>;
    readHtml: () => Promise<string | null>;
    pasteEventPayload: (payload: {
      html?: string | null;
      slateFragment?: string | null;
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
    run: (
      name: string,
      steps: readonly SlateBrowserScenarioStep[],
      options?: SlateBrowserScenarioRunOptions
    ) => Promise<SlateBrowserScenarioResult>;
  };
  trace: {
    snapshot: (
      label: string,
      stepIndex?: number | null
    ) => Promise<SlateBrowserTraceEntry>;
  };
  withExtension: <T>(extend: (editor: SlateBrowserEditorHarness) => T) => T;
};

/** Contract expectation for model, DOM, native, and visual selection proof. */
/** Expected selection state for `assertSlateBrowserSelectionContract`. */
export type SlateBrowserSelectionContractExpectation = {
  domSelection?: DOMSelectionSnapshotExpectation;
  domSelectionTarget?: Partial<DOMSelectionLocationSnapshot>;
  hasVisibleEditorSelection?: boolean;
  hasVisibleSelection?: boolean;
  noDoubleSelectionHighlight?: boolean;
  selectedText?: string;
  selection?: SelectionSnapshotExpectation;
};

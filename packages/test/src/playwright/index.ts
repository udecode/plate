import type { Locator, Page } from '@playwright/test';

import { getExampleRoute, prepareExampleRoute } from './example-route';
import { createEditorHarness } from './harness';
import { resolveSurface, type SurfaceTarget } from './surface';
import type {
  OpenExampleOptions,
  ReadyOptions,
  BrowserEditorHarness,
} from './types';

export {
  createBrowserFeatureContractRegistry,
  defineBrowserFeatureContract,
  type BrowserFeatureContractDefinition,
  type BrowserFeatureContractRegistry,
  type BrowserFeatureContractRow,
} from '../proof/feature-contracts';

export {
  attachPageScreenshot,
  attachBrowserJsonArtifact,
  attachBrowserSelectionScreenshot,
  type BrowserPageScreenshotOptions,
} from './artifacts';
export {
  assertBrowserCaretVisibleInScrollableParent,
  type CaretVisibilitySnapshot,
} from './caret-visibility';
export { withExclusiveClipboardAccess } from './clipboard';
export { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
export {
  getBrowserEditable,
  locateBrowserBlock,
  locateBrowserText,
} from './dom-locators';
export {
  resetBrowserNativeEventTrace,
  startBrowserNativeEventTrace,
  stopBrowserNativeEventTrace,
  takeBrowserNativeEventTrace,
} from './native-event-trace';
export {
  measureTrustedTyping,
  type TrustedTypingResult,
  type TrustedTypingRow,
} from './interaction-performance';
export {
  getReactRenderProfilerSnapshot,
  installReactRenderProfiler,
  resetReactRenderProfiler,
  type ReactRenderKind,
  type ReactRenderProfilerEvent,
  type ReactRenderProfilerSnapshot,
} from './render-profiler';
export { takeBrowserRenderStateSnapshot } from './render-state';
export {
  recordBrowserRuntimeErrors,
  type BrowserRuntimeErrorRecorder,
} from './runtime-errors';
export {
  browserStep,
  createBrowserClipboardPasteGauntlet,
  createBrowserCompositionGauntlet,
  createBrowserDropDataGauntlet,
  createBrowserInlineCutTypingGauntlet,
  createBrowserInternalControlGauntlet,
  createBrowserMarkClickTypingGauntlet,
  createBrowserMarkTypingGauntlet,
  createBrowserNavigationTypingGauntlet,
  createBrowserShellActivationGauntlet,
  createBrowserTextInsertionGauntlet,
  createBrowserToolbarMarkClickTypingGauntlet,
} from './scenario';
export {
  createBrowserMixedEditingConformanceGauntlet,
  createBrowserSemanticEditingConformanceGauntlet,
} from './scenario-conformance';
export { createBrowserDestructiveEditingGauntlet } from './scenario-destructive';
export {
  assertNoIllegalKernelTransitions,
  assertBrowserKernelTraceEntry,
  findBrowserKernelTraceEntry,
  getIllegalKernelTransitions,
  matchesBrowserKernelTrace,
} from './scenario-kernel-trace';
export {
  classifyScenarioTransportClaim,
  createScenarioReductionCandidates,
  createScenarioReplay,
  decodeScenarioReplay,
  normalizeScenarioMetadata,
  serializeScenarioStepForReplay,
  summarizeScenarioReductionCandidate,
  summarizeScenarioStep,
} from './scenario-replay';
export {
  createBrowserWarmLoopSteps,
  createBrowserWarmToolbarArrowGauntlet,
} from './scenario-warm';
export { assertBrowserSelectionContract } from './selectionContract';
export {
  takeDOMSelectionSnapshot,
  takeSelectionSnapshot,
} from './selection-snapshots';
export type {
  ClipboardPayloadSnapshot,
  CollapsedModelDOMSelectionExpectation,
  DOMSelectionLocationSnapshot,
  DOMSelectionSnapshot,
  DOMSelectionSnapshotExpectation,
  EditorSnapshot,
  EditorSurfaceOptions,
  FocusOwnerSnapshot,
  HtmlNormalizationOptions,
  OffsetExpectation,
  OpenExampleOptions,
  RangeAnchorAssociation,
  ReadyOptions,
  RenderedBlockDOMShapeSnapshot,
  RenderedDOMShapeExpectation,
  SelectionAnchorHandle,
  SelectionCaptureOptions,
  SelectionPoint,
  SelectionRectSnapshot,
  SelectionSnapshot,
  SelectionSnapshotExpectation,
  BrowserClipboardPasteGauntletOptions,
  BrowserCompositionGauntletOptions,
  BrowserDestructiveEditingGauntletOptions,
  BrowserDisplayedSelectionSnapshot,
  BrowserDOMPathOptions,
  BrowserDoubleClickDragTextRangeOptions,
  BrowserDragTextRangeOptions,
  BrowserDropDataGauntletOptions,
  BrowserEditorHarness,
  BrowserFillStepOptions,
  BrowserImperativeScenarioContext,
  BrowserImperativeScenarioResult,
  BrowserIllegalKernelTransition,
  BrowserInlineCutTypingGauntletOptions,
  BrowserInternalControlGauntletOptions,
  BrowserKernelCommand,
  BrowserKernelCommandDefinition,
  BrowserKernelEventFamily,
  BrowserKernelEventFrame,
  BrowserKernelInputIntent,
  BrowserKernelMovementOwnershipTrace,
  BrowserKernelOwnership,
  BrowserKernelRepairPolicy,
  BrowserKernelRepairRequest,
  BrowserKernelSelectionChangeOrigin,
  BrowserKernelSelectionPolicy,
  BrowserKernelSelectionSource,
  BrowserKernelSelectionSourceTransition,
  BrowserKernelState,
  BrowserKernelTargetOwner,
  BrowserKernelTraceEntry,
  BrowserKernelTraceExpectation,
  BrowserKernelTransition,
  BrowserMarkClickTypingGauntletOptions,
  BrowserMarkTypingGauntletOptions,
  BrowserMixedEditingConformanceGauntletOptions,
  BrowserNativeEventTraceAnomaly,
  BrowserNativeEventTraceDOMDelta,
  BrowserNativeEventTraceEntry,
  BrowserNativeEventTraceNodeSnapshot,
  BrowserNativeEventTraceOptions,
  BrowserNativeEventTraceRect,
  BrowserNativeEventTraceSelectionSnapshot,
  BrowserNativeEventTraceSnapshot,
  BrowserNativeEventTraceTargetRangeSnapshot,
  BrowserNativeEventTraceTextNodeDelta,
  BrowserNativeEventTraceTextNodeSnapshot,
  BrowserNativeEventTraceType,
  BrowserNativeSelectionSummary,
  BrowserNavigationTypingGauntletOptions,
  BrowserNumberBudget,
  BrowserNormalizedScenarioMetadata,
  BrowserRawViewSelectionOwner,
  BrowserRawViewSelectionPoint,
  BrowserRawViewSelectionSnapshot,
  BrowserRenderStateSnapshot,
  BrowserScenarioMetadata,
  BrowserScenarioReductionCandidate,
  BrowserScenarioReductionCandidateSummary,
  BrowserScenarioReplay,
  BrowserScenarioReplayStep,
  BrowserScenarioResult,
  BrowserScenarioRunOptions,
  BrowserScenarioStep,
  BrowserScenarioStepMetadata,
  BrowserSelectedShellSnapshot,
  BrowserSelectionContractExpectation,
  BrowserSelectionShellsSnapshot,
  BrowserSemanticEditingConformanceGauntletOptions,
  BrowserShellActivationGauntletOptions,
  BrowserShellSummary,
  BrowserTextInsertionGauntletOptions,
  BrowserTextOffsetClickOptions,
  BrowserTextPathRangeClickOptions,
  BrowserToolbarMarkClickTypingGauntletOptions,
  BrowserTraceEntry,
  BrowserTransportClaim,
  BrowserViewSelectionSnapshot,
  BrowserWarmLoopOptions,
  BrowserWarmToolbarArrowGauntletOptions,
  BrowserZeroWidthNodeShape,
} from './types';

/** Create a Playwright harness for opening examples and inspecting editors. */
export const createBrowserEditorHarness = (
  page: Page,
  name: string,
  root: Locator,
  surface: SurfaceTarget = page
): BrowserEditorHarness => createEditorHarness(page, name, surface, {}, root);

/** Open a editor example route with default harness options. */
export const openExample = async (
  page: Page,
  name: string,
  options: OpenExampleOptions = {}
) => openExampleWithOptions(page, name, options);

/** Open a editor example route with explicit harness options. */
export const openExampleWithOptions = async (
  page: Page,
  name: string,
  { query, ready, surface }: OpenExampleOptions
) => {
  await prepareExampleRoute(page);

  const { path: examplePath, url: exampleUrl } = getExampleRoute(name, query);
  const currentUrl = page.url();
  const currentPath =
    currentUrl && currentUrl !== 'about:blank'
      ? new URL(currentUrl).pathname
      : null;

  if (query && currentPath === examplePath) {
    await page.goto('about:blank', { waitUntil: 'commit' });
  }

  await page.goto(exampleUrl, {
    waitUntil: 'commit',
  });
  const resolvedSurface = await resolveSurface(page, surface);
  const editor = createEditorHarness(page, name, resolvedSurface, surface);

  const normalizedReady: ReadyOptions = ready ?? {
    editor: 'visible',
  };

  if (normalizedReady) {
    await editor.ready(normalizedReady);
  }

  return editor;
};

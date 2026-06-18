import type { Locator, Page } from '@playwright/test';
import { getExampleRoute, prepareExampleRoute } from './example-route';
import { createEditorHarness } from './harness';
import { resolveSurface, type SurfaceTarget } from './surface';
import type {
  OpenExampleOptions,
  ReadyOptions,
  SlateBrowserEditorHarness,
} from './types';

export {
  createSlateBrowserFeatureContractRegistry,
  defineSlateBrowserFeatureContract,
  type SlateBrowserFeatureContractDefinition,
  type SlateBrowserFeatureContractRegistry,
  type SlateBrowserFeatureContractRow,
} from '../core/feature-contracts';

export {
  attachPageScreenshot,
  attachSlateBrowserJsonArtifact,
  attachSlateBrowserSelectionScreenshot,
  type SlateBrowserPageScreenshotOptions,
} from './artifacts';
export {
  assertSlateBrowserCaretVisibleInScrollableParent,
  type CaretVisibilitySnapshot,
} from './caret-visibility';
export { withExclusiveClipboardAccess } from './clipboard';
export { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
export {
  resetSlateBrowserNativeEventTrace,
  startSlateBrowserNativeEventTrace,
  stopSlateBrowserNativeEventTrace,
  takeSlateBrowserNativeEventTrace,
} from './native-event-trace';
export {
  getSlateReactRenderProfilerSnapshot,
  installSlateReactRenderProfiler,
  resetSlateReactRenderProfiler,
  type SlateReactRenderKind,
  type SlateReactRenderProfilerEvent,
  type SlateReactRenderProfilerSnapshot,
} from './render-profiler';
export { takeSlateBrowserRenderStateSnapshot } from './render-state';
export {
  recordSlateBrowserRuntimeErrors,
  type SlateBrowserRuntimeErrorRecorder,
} from './runtime-errors';
export {
  createSlateBrowserClipboardPasteGauntlet,
  createSlateBrowserCompositionGauntlet,
  createSlateBrowserDropDataGauntlet,
  createSlateBrowserInlineCutTypingGauntlet,
  createSlateBrowserInternalControlGauntlet,
  createSlateBrowserMarkClickTypingGauntlet,
  createSlateBrowserMarkTypingGauntlet,
  createSlateBrowserNavigationTypingGauntlet,
  createSlateBrowserShellActivationGauntlet,
  createSlateBrowserTextInsertionGauntlet,
  createSlateBrowserToolbarMarkClickTypingGauntlet,
} from './scenario';
export {
  createSlateBrowserMixedEditingConformanceGauntlet,
  createSlateBrowserSemanticEditingConformanceGauntlet,
} from './scenario-conformance';
export { createSlateBrowserDestructiveEditingGauntlet } from './scenario-destructive';
export {
  assertNoIllegalKernelTransitions,
  assertSlateBrowserKernelTraceEntry,
  findSlateBrowserKernelTraceEntry,
  getIllegalKernelTransitions,
  matchesSlateBrowserKernelTrace,
} from './scenario-kernel-trace';
export {
  classifyScenarioTransportClaim,
  createScenarioReductionCandidates,
  createScenarioReplay,
  normalizeScenarioMetadata,
  serializeScenarioStepForReplay,
  summarizeScenarioReductionCandidate,
  summarizeScenarioStep,
} from './scenario-replay';
export {
  createSlateBrowserWarmLoopSteps,
  createSlateBrowserWarmToolbarArrowGauntlet,
} from './scenario-warm';
export { assertSlateBrowserSelectionContract } from './selection-contract';
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
  RangeRefAffinity,
  ReadyOptions,
  RenderedBlockDOMShapeSnapshot,
  RenderedDOMShapeExpectation,
  SelectionBookmark,
  SelectionCaptureOptions,
  SelectionPoint,
  SelectionRectSnapshot,
  SelectionSnapshot,
  SelectionSnapshotExpectation,
  SlateBrowserClipboardPasteGauntletOptions,
  SlateBrowserCompositionGauntletOptions,
  SlateBrowserDestructiveEditingGauntletOptions,
  SlateBrowserDisplayedSelectionSnapshot,
  SlateBrowserDOMPathOptions,
  SlateBrowserDoubleClickDragTextRangeOptions,
  SlateBrowserDragTextRangeOptions,
  SlateBrowserDropDataGauntletOptions,
  SlateBrowserEditorHarness,
  SlateBrowserIllegalKernelTransition,
  SlateBrowserInlineCutTypingGauntletOptions,
  SlateBrowserInternalControlGauntletOptions,
  SlateBrowserKernelCommand,
  SlateBrowserKernelEventFamily,
  SlateBrowserKernelEventFrame,
  SlateBrowserKernelMovementOwnershipTrace,
  SlateBrowserKernelOperation,
  SlateBrowserKernelOwnership,
  SlateBrowserKernelRepairPolicy,
  SlateBrowserKernelRepairRequest,
  SlateBrowserKernelSelectionChangeOrigin,
  SlateBrowserKernelSelectionPolicy,
  SlateBrowserKernelSelectionSource,
  SlateBrowserKernelState,
  SlateBrowserKernelTargetOwner,
  SlateBrowserKernelTraceEntry,
  SlateBrowserKernelTraceExpectation,
  SlateBrowserKernelTransition,
  SlateBrowserMarkClickTypingGauntletOptions,
  SlateBrowserMarkTypingGauntletOptions,
  SlateBrowserMixedEditingConformanceGauntletOptions,
  SlateBrowserNativeEventTraceAnomaly,
  SlateBrowserNativeEventTraceDOMDelta,
  SlateBrowserNativeEventTraceEntry,
  SlateBrowserNativeEventTraceNodeSnapshot,
  SlateBrowserNativeEventTraceOptions,
  SlateBrowserNativeEventTraceRect,
  SlateBrowserNativeEventTraceSelectionSnapshot,
  SlateBrowserNativeEventTraceSnapshot,
  SlateBrowserNativeEventTraceTargetRangeSnapshot,
  SlateBrowserNativeEventTraceTextNodeDelta,
  SlateBrowserNativeEventTraceTextNodeSnapshot,
  SlateBrowserNativeEventTraceType,
  SlateBrowserNativeSelectionSummary,
  SlateBrowserNavigationTypingGauntletOptions,
  SlateBrowserNormalizedScenarioMetadata,
  SlateBrowserRawViewSelectionOwner,
  SlateBrowserRawViewSelectionPoint,
  SlateBrowserRawViewSelectionSnapshot,
  SlateBrowserRenderStateSnapshot,
  SlateBrowserScenarioMetadata,
  SlateBrowserScenarioReductionCandidate,
  SlateBrowserScenarioReductionCandidateSummary,
  SlateBrowserScenarioReplay,
  SlateBrowserScenarioReplayStep,
  SlateBrowserScenarioResult,
  SlateBrowserScenarioRunOptions,
  SlateBrowserScenarioStep,
  SlateBrowserScenarioStepMetadata,
  SlateBrowserSelectedShellSnapshot,
  SlateBrowserSelectionContractExpectation,
  SlateBrowserSelectionShellsSnapshot,
  SlateBrowserSemanticEditingConformanceGauntletOptions,
  SlateBrowserShellActivationGauntletOptions,
  SlateBrowserShellSummary,
  SlateBrowserTextInsertionGauntletOptions,
  SlateBrowserTextOffsetClickOptions,
  SlateBrowserTextPathRangeClickOptions,
  SlateBrowserToolbarMarkClickTypingGauntletOptions,
  SlateBrowserTraceEntry,
  SlateBrowserTransportClaim,
  SlateBrowserViewSelectionSnapshot,
  SlateBrowserWarmLoopOptions,
  SlateBrowserWarmToolbarArrowGauntletOptions,
  SlateBrowserZeroWidthNodeShape,
} from './types';

/** Create a Playwright harness for opening examples and inspecting editors. */
export const createSlateBrowserEditorHarness = (
  page: Page,
  name: string,
  root: Locator,
  surface: SurfaceTarget = page
): SlateBrowserEditorHarness =>
  createEditorHarness(page, name, surface, {}, root);

/** Open a Slate example route with default harness options. */
export const openExample = async (
  page: Page,
  name: string,
  options: OpenExampleOptions = {}
) => openExampleWithOptions(page, name, options);

/** Open a Slate example route with explicit harness options. */
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

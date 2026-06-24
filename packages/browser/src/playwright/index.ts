import type { Locator, Page } from '@playwright/test';
import { getExampleRoute, prepareExampleRoute } from './example-route';
import { createEditorHarness } from './harness';
import { resolveSurface, type SurfaceTarget } from './surface';
import type {
  OpenExampleOptions,
  ReadyOptions,
  PliteBrowserEditorHarness,
} from './types';

export {
  createPliteBrowserFeatureContractRegistry,
  definePliteBrowserFeatureContract,
  type PliteBrowserFeatureContractDefinition,
  type PliteBrowserFeatureContractRegistry,
  type PliteBrowserFeatureContractRow,
} from '../core/feature-contracts';

export {
  attachPageScreenshot,
  attachPliteBrowserJsonArtifact,
  attachPliteBrowserSelectionScreenshot,
  type PliteBrowserPageScreenshotOptions,
} from './artifacts';
export {
  assertPliteBrowserCaretVisibleInScrollableParent,
  type CaretVisibilitySnapshot,
} from './caret-visibility';
export { withExclusiveClipboardAccess } from './clipboard';
export { takeDisplayedSelectionSnapshotForRoot } from './displayed-selection';
export {
  resetPliteBrowserNativeEventTrace,
  startPliteBrowserNativeEventTrace,
  stopPliteBrowserNativeEventTrace,
  takePliteBrowserNativeEventTrace,
} from './native-event-trace';
export {
  getPliteReactRenderProfilerSnapshot,
  installPliteReactRenderProfiler,
  resetPliteReactRenderProfiler,
  type PliteReactRenderKind,
  type PliteReactRenderProfilerEvent,
  type PliteReactRenderProfilerSnapshot,
} from './render-profiler';
export { takePliteBrowserRenderStateSnapshot } from './render-state';
export {
  recordPliteBrowserRuntimeErrors,
  type PliteBrowserRuntimeErrorRecorder,
} from './runtime-errors';
export {
  createPliteBrowserClipboardPasteGauntlet,
  createPliteBrowserCompositionGauntlet,
  createPliteBrowserDropDataGauntlet,
  createPliteBrowserInlineCutTypingGauntlet,
  createPliteBrowserInternalControlGauntlet,
  createPliteBrowserMarkClickTypingGauntlet,
  createPliteBrowserMarkTypingGauntlet,
  createPliteBrowserNavigationTypingGauntlet,
  createPliteBrowserShellActivationGauntlet,
  createPliteBrowserTextInsertionGauntlet,
  createPliteBrowserToolbarMarkClickTypingGauntlet,
} from './scenario';
export {
  createPliteBrowserMixedEditingConformanceGauntlet,
  createPliteBrowserSemanticEditingConformanceGauntlet,
} from './scenario-conformance';
export { createPliteBrowserDestructiveEditingGauntlet } from './scenario-destructive';
export {
  assertNoIllegalKernelTransitions,
  assertPliteBrowserKernelTraceEntry,
  findPliteBrowserKernelTraceEntry,
  getIllegalKernelTransitions,
  matchesPliteBrowserKernelTrace,
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
  createPliteBrowserWarmLoopSteps,
  createPliteBrowserWarmToolbarArrowGauntlet,
} from './scenario-warm';
export { assertPliteBrowserSelectionContract } from './selection-contract';
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
  PliteBrowserClipboardPasteGauntletOptions,
  PliteBrowserCompositionGauntletOptions,
  PliteBrowserDestructiveEditingGauntletOptions,
  PliteBrowserDisplayedSelectionSnapshot,
  PliteBrowserDOMPathOptions,
  PliteBrowserDoubleClickDragTextRangeOptions,
  PliteBrowserDragTextRangeOptions,
  PliteBrowserDropDataGauntletOptions,
  PliteBrowserEditorHarness,
  PliteBrowserIllegalKernelTransition,
  PliteBrowserInlineCutTypingGauntletOptions,
  PliteBrowserInternalControlGauntletOptions,
  PliteBrowserKernelCommand,
  PliteBrowserKernelEventFamily,
  PliteBrowserKernelEventFrame,
  PliteBrowserKernelMovementOwnershipTrace,
  PliteBrowserKernelOperation,
  PliteBrowserKernelOwnership,
  PliteBrowserKernelRepairPolicy,
  PliteBrowserKernelRepairRequest,
  PliteBrowserKernelSelectionChangeOrigin,
  PliteBrowserKernelSelectionPolicy,
  PliteBrowserKernelSelectionSource,
  PliteBrowserKernelState,
  PliteBrowserKernelTargetOwner,
  PliteBrowserKernelTraceEntry,
  PliteBrowserKernelTraceExpectation,
  PliteBrowserKernelTransition,
  PliteBrowserMarkClickTypingGauntletOptions,
  PliteBrowserMarkTypingGauntletOptions,
  PliteBrowserMixedEditingConformanceGauntletOptions,
  PliteBrowserNativeEventTraceAnomaly,
  PliteBrowserNativeEventTraceDOMDelta,
  PliteBrowserNativeEventTraceEntry,
  PliteBrowserNativeEventTraceNodeSnapshot,
  PliteBrowserNativeEventTraceOptions,
  PliteBrowserNativeEventTraceRect,
  PliteBrowserNativeEventTraceSelectionSnapshot,
  PliteBrowserNativeEventTraceSnapshot,
  PliteBrowserNativeEventTraceTargetRangeSnapshot,
  PliteBrowserNativeEventTraceTextNodeDelta,
  PliteBrowserNativeEventTraceTextNodeSnapshot,
  PliteBrowserNativeEventTraceType,
  PliteBrowserNativeSelectionSummary,
  PliteBrowserNavigationTypingGauntletOptions,
  PliteBrowserNormalizedScenarioMetadata,
  PliteBrowserRawViewSelectionOwner,
  PliteBrowserRawViewSelectionPoint,
  PliteBrowserRawViewSelectionSnapshot,
  PliteBrowserRenderStateSnapshot,
  PliteBrowserScenarioMetadata,
  PliteBrowserScenarioReductionCandidate,
  PliteBrowserScenarioReductionCandidateSummary,
  PliteBrowserScenarioReplay,
  PliteBrowserScenarioReplayStep,
  PliteBrowserScenarioResult,
  PliteBrowserScenarioRunOptions,
  PliteBrowserScenarioStep,
  PliteBrowserScenarioStepMetadata,
  PliteBrowserSelectedShellSnapshot,
  PliteBrowserSelectionContractExpectation,
  PliteBrowserSelectionShellsSnapshot,
  PliteBrowserSemanticEditingConformanceGauntletOptions,
  PliteBrowserShellActivationGauntletOptions,
  PliteBrowserShellSummary,
  PliteBrowserTextInsertionGauntletOptions,
  PliteBrowserTextOffsetClickOptions,
  PliteBrowserTextPathRangeClickOptions,
  PliteBrowserToolbarMarkClickTypingGauntletOptions,
  PliteBrowserTraceEntry,
  PliteBrowserTransportClaim,
  PliteBrowserViewSelectionSnapshot,
  PliteBrowserWarmLoopOptions,
  PliteBrowserWarmToolbarArrowGauntletOptions,
  PliteBrowserZeroWidthNodeShape,
} from './types';

/** Create a Playwright harness for opening examples and inspecting editors. */
export const createPliteBrowserEditorHarness = (
  page: Page,
  name: string,
  root: Locator,
  surface: SurfaceTarget = page
): PliteBrowserEditorHarness =>
  createEditorHarness(page, name, surface, {}, root);

/** Open a Plite example route with default harness options. */
export const openExample = async (
  page: Page,
  name: string,
  options: OpenExampleOptions = {}
) => openExampleWithOptions(page, name, options);

/** Open a Plite example route with explicit harness options. */
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

import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import {
  assertSlateBrowserFirstPartyParityContracts,
  SLATE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY,
} from "@platejs/browser/core";
import {
  assertNoIllegalKernelTransitions,
  createSlateBrowserInternalControlGauntlet,
  type EditorSurfaceOptions,
  installSlateReactRenderProfiler,
  openExample,
  type SlateBrowserScenarioStep,
  takeSlateBrowserRenderStateSnapshot,
} from "@platejs/browser/playwright";

import {
  createStressArtifact,
  type StressCase,
  stressArtifactPath,
  stressResultPath,
  writeStressArtifact,
} from "./stress-utils";

// Focus with STRESS_ROUTES/STRESS_FAMILIES/STRESS_SEED. Replay any emitted
// artifact with its replayCommand.
test.describe.configure({ mode: "serial" });

const enabledValues = (envName: string) =>
  new Set(
    (process.env[envName] ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );

const enabledRoutes = enabledValues("STRESS_ROUTES");
const enabledFamilies = enabledValues("STRESS_FAMILIES");
const seed = process.env.STRESS_SEED ?? "default";
const numericSeed =
  seed === "default"
    ? 1
    : Array.from(seed).reduce(
        (value, character) =>
          (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0,
        0
      );
const seedQuery = seed === "default" ? "" : `&seed=${encodeURIComponent(seed)}`;

const routeEnabled = (route: string) =>
  enabledRoutes.size === 0 || enabledRoutes.has(route);

const familyEnabled = (family: string) =>
  enabledFamilies.size === 0 || enabledFamilies.has(family);

assertSlateBrowserFirstPartyParityContracts();

const contractByFamily =
  SLATE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY.rowByFamily;

const point = (path: number[], offset: number) => ({ path, offset });

const collapsedSelection = (path: number[], offset: number) => ({
  anchor: point(path, offset),
  focus: point(path, offset),
});

const inlineVoidBoundaryRenderBudget = {
  byKind: {
    editable: { max: 4 },
    element: 0,
    leaf: 0,
    text: 0,
    void: { max: 1 },
  },
  total: { max: 4 },
};

const createStressCase = ({
  family,
  route,
  steps,
  surface,
}: {
  family: string;
  route: string;
  steps: SlateBrowserScenarioStep[];
  surface?: EditorSurfaceOptions;
}): StressCase => ({
  contract: contractByFamily.get(family),
  family,
  id: `${seed}-${route}-${family}`,
  route,
  seed,
  surface,
  steps,
});

const pasteNormalizeUndo = (route: string): StressCase =>
  createStressCase({
    family: "paste-normalize-undo",
    route,
    steps: [
      { kind: "selectAll", label: "select-all" },
      {
        kind: "pasteText",
        label: "paste-two-lines",
        text: "Alpha\nBeta",
      },
      {
        kind: "assertBlockTexts",
        label: "assert-pasted-blocks",
        texts: ["Alpha", "Beta"],
      },
      {
        kind: "assertRenderedDOMShape",
        label: "assert-first-pasted-block-dom-shape",
        shape: {
          blockIndex: 0,
          innerText: "Alpha",
          noUnexpectedZeroWidthBreaks: true,
          textContent: "Alpha",
          zeroWidthBreakCount: 0,
        },
      },
      {
        kind: "assertRenderedDOMShape",
        label: "assert-second-pasted-block-dom-shape",
        shape: {
          blockIndex: 1,
          innerText: "Beta",
          noUnexpectedZeroWidthBreaks: true,
          textContent: "Beta",
          zeroWidthBreakCount: 0,
        },
      },
      {
        kind: "assertKernelTrace",
        label: "assert-paste-command-trace",
        trace: {
          commandKind: "insert-data",
          transition: { allowed: true },
        },
      },
      { kind: "assertLastCommit", label: "assert-paste-commit" },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      { kind: "type", label: "type-follow-up", text: "!" },
      {
        kind: "assertBlockTexts",
        label: "assert-follow-up-text",
        texts: ["Alpha", "Beta!"],
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-collapsed-follow-up-selection",
        location: { isCollapsed: true },
      },
      { kind: "undo", label: "undo-follow-up-type" },
      {
        kind: "assertBlockTexts",
        label: "assert-after-undo",
        texts: ["Alpha", "Beta"],
      },
    ],
  });

const getHugeDocumentBlockText = (targetIndex: number) => {
  faker.seed(numericSeed);

  let text = "";

  for (let index = 0; index <= targetIndex; index += 1) {
    text = index % 100 === 0 ? faker.lorem.sentence() : faker.lorem.paragraph();
  }

  return text;
};

const hugeDocumentCut = (): StressCase => {
  const cutIndex = 2500;
  const followingText = getHugeDocumentBlockText(cutIndex + 2);

  return createStressCase({
    family: "huge-document-cut",
    route: `huge-document?blocks=5000&content_visibility=none&strict=false${seedQuery}`,
    steps: [
      {
        kind: "select",
        label: "select-two-top-level-blocks",
        selection: {
          anchor: { path: [cutIndex, 0], offset: 0 },
          focus: { path: [cutIndex + 2, 0], offset: 0 },
        },
      },
      { key: "ControlOrMeta+X", kind: "press", label: "cut-two-blocks" },
      {
        kind: "assertKernelTrace",
        label: "assert-cut-command-trace",
        trace: {
          commandKind: "delete-fragment",
          transition: { allowed: true },
        },
      },
      {
        contains: followingText,
        kind: "assertLocatorText",
        label: "assert-following-block-shifted-up",
        selector: `[data-slate-path="${cutIndex}"]`,
      },
    ],
  });
};

const inlineVoidBoundaryNavigation = (): StressCase => {
  const beforeFirstMentionText = "Try mentioning characters, like ";
  const betweenMentionsText = " or ";

  return createStressCase({
    family: "inline-void-boundary-navigation",
    route: "mentions",
    steps: [
      {
        kind: "select",
        label: "select-before-first-mention",
        selection: collapsedSelection([1, 0], beforeFirstMentionText.length),
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-first-right" },
      { key: "ArrowRight", kind: "press", label: "arrow-right-into-r2d2" },
      {
        kind: "assertSelection",
        label: "assert-r2d2-selected-from-left",
        selection: collapsedSelection([1, 1, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-r2d2-dom-location",
        location: { anchorOffset: 1, anchorPath: [1, 1, 0], isCollapsed: true },
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        budget: inlineVoidBoundaryRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-first-right-render-budget",
      },
      {
        kind: "select",
        label: "select-r2d2-from-right",
        selection: collapsedSelection([1, 2], 0),
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-left" },
      { key: "ArrowLeft", kind: "press", label: "arrow-left-before-r2d2" },
      {
        kind: "assertSelection",
        label: "assert-before-r2d2",
        selection: collapsedSelection([1, 1, 0], 0),
      },
      {
        budget: inlineVoidBoundaryRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-first-left-render-budget",
      },
      {
        kind: "select",
        label: "select-between-mentions",
        selection: collapsedSelection([1, 2], betweenMentionsText.length),
      },
      {
        kind: "resetRenderProfiler",
        label: "reset-render-before-second-right",
      },
      { key: "ArrowRight", kind: "press", label: "arrow-right-into-mace" },
      {
        kind: "assertSelection",
        label: "assert-mace-selected-from-left",
        selection: collapsedSelection([1, 3, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-mace-dom-location",
        location: { anchorOffset: 1, anchorPath: [1, 3, 0], isCollapsed: true },
      },
      {
        budget: inlineVoidBoundaryRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-second-right-render-budget",
      },
      {
        kind: "select",
        label: "select-mace-from-right",
        selection: collapsedSelection([1, 4], 0),
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-second-left" },
      { key: "ArrowLeft", kind: "press", label: "arrow-left-before-mace" },
      {
        kind: "assertSelection",
        label: "assert-between-mentions",
        selection: collapsedSelection([1, 3, 0], 0),
      },
      {
        budget: inlineVoidBoundaryRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-second-left-render-budget",
      },
    ],
  });
};

const markableInlineVoidFormatting = (): StressCase => {
  const beforeFirstMentionText = "Try mentioning characters, like ";

  return createStressCase({
    family: "markable-inline-void-formatting",
    route: "mentions",
    steps: [
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-visible-r2d2-mention",
        selector: '[data-cy="mention-R2-D2"]',
      },
      {
        kind: "assertLocatorCss",
        label: "assert-r2d2-mark-style",
        property: "font-weight",
        selector: '[data-cy="mention-R2-D2"]',
        value: "700",
      },
      {
        count: 0,
        kind: "assertLocatorCount",
        label: "assert-visible-mention-does-not-own-hidden-anchor",
        selector: '[data-cy="mention-R2-D2"] [data-slate-zero-width]',
      },
      {
        kind: "assertLocatorCount",
        label: "assert-inline-void-shells-own-hidden-anchor",
        min: 2,
        selector:
          '[data-slate-inline="true"][data-slate-void="true"] [data-slate-zero-width]',
      },
      {
        kind: "select",
        label: "select-before-markable-inline-void",
        selection: collapsedSelection([1, 0], beforeFirstMentionText.length),
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-markable" },
      { key: "ArrowRight", kind: "press", label: "arrow-right-into-markable" },
      {
        kind: "assertSelection",
        label: "assert-markable-inline-selected",
        selection: collapsedSelection([1, 1, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-markable-inline-dom-location",
        location: { anchorOffset: 1, anchorPath: [1, 1, 0], isCollapsed: true },
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        budget: inlineVoidBoundaryRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-markable-inline-render-budget",
      },
    ],
  });
};

const blockVoidNavigation = (route: "embeds" | "images"): StressCase => {
  const startOffset = route === "images" ? 113 : 177;
  const voidRenderBudget = {
    byKind: {
      editable: { max: 2 },
      element: { max: 1 },
      spacer: { max: 1 },
      void: { max: 1 },
    },
    total: { max: 4 },
  };

  return createStressCase({
    family: "block-void-navigation",
    route,
    steps: [
      {
        kind: "selectDOM",
        label: "select-before-block-void",
        selection: collapsedSelection([0, 0], startOffset),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-before-block-void-dom-location",
        location: {
          anchorOffset: startOffset,
          anchorPath: [0, 0],
          isCollapsed: true,
        },
      },
      ...(route === "images"
        ? ([
            {
              innerSelector: '[contenteditable="false"]',
              kind: "assertLocatorVerticalOffset",
              label: "assert-image-visible-content-offset",
              max: 1,
              min: 0,
              selector: '[data-slate-path="1"]',
            },
          ] satisfies SlateBrowserScenarioStep[])
        : []),
      ...(route === "embeds"
        ? ([
            {
              afterSelector: '[data-slate-path="2"]',
              beforeSelector: 'input[type="text"]',
              kind: "assertLocatorVerticalGap",
              label: "assert-embed-url-input-gap",
              max: 24,
              min: 12,
            },
          ] satisfies SlateBrowserScenarioStep[])
        : []),
      { kind: "resetRenderProfiler", label: "reset-render-before-void-enter" },
      {
        key: "ArrowRight",
        kind: "press",
        label: "arrow-right-into-block-void",
      },
      {
        kind: "assertSelection",
        label: "assert-block-void-selected",
        selection: collapsedSelection([1, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-block-void-dom-location",
        location: { anchorOffset: 0, anchorPath: [1, 0], isCollapsed: true },
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        budget: voidRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-void-enter-render-budget",
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-void-exit" },
      {
        key: "ArrowRight",
        kind: "press",
        label: "arrow-right-after-block-void",
      },
      {
        kind: "assertSelection",
        label: "assert-after-block-void",
        selection: collapsedSelection([2, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-after-block-void-dom-location",
        location: { anchorOffset: 0, anchorPath: [2, 0], isCollapsed: true },
      },
      {
        budget: voidRenderBudget,
        kind: "assertRenderBudget",
        label: "assert-void-exit-render-budget",
      },
      { key: "ArrowLeft", kind: "press", label: "arrow-left-back-to-void" },
      {
        kind: "assertSelection",
        label: "assert-block-void-selected-from-right",
        selection: collapsedSelection([1, 0], 0),
      },
    ],
  });
};

const staleTargetRemoteRebase = (): StressCase =>
  createStressCase({
    family: "stale-target-remote-rebase",
    route: "images",
    steps: [
      {
        kind: "captureRuntimeId",
        label: "capture-first-image-runtime-id",
        name: "first-image",
        path: [1],
      },
      {
        kind: "captureRuntimeId",
        label: "capture-first-image-text-runtime-id",
        name: "first-image-text",
        path: [1, 0],
      },
      {
        kind: "captureRuntimeId",
        label: "capture-second-image-runtime-id",
        name: "second-image",
        path: [4],
      },
      {
        kind: "select",
        label: "select-first-image-before-remote-remove",
        selection: collapsedSelection([1, 0], 0),
      },
      {
        kind: "applyOperations",
        label: "remote-remove-first-image-and-move-second-image",
        operations: [
          {
            type: "remove_node",
            path: [1],
            node: {
              type: "image",
              url: "https://picsum.photos/id/1015/160/90.jpg",
              children: [{ text: "" }],
            },
          },
          {
            type: "move_node",
            path: [3],
            newPath: [1],
          },
        ],
        tag: "remote-rebase",
      },
      {
        kind: "assertCapturedRuntimeIdPath",
        label: "assert-first-image-runtime-id-null",
        name: "first-image",
        path: null,
      },
      {
        kind: "assertCapturedRuntimeIdPath",
        label: "assert-first-image-text-runtime-id-null",
        name: "first-image-text",
        path: null,
      },
      {
        kind: "assertCapturedRuntimeIdPath",
        label: "assert-second-image-runtime-id-rebased",
        name: "second-image",
        path: [1],
      },
      {
        kind: "assertLastCommitTags",
        label: "assert-remote-rebase-tags",
        tags: ["remote-rebase"],
      },
      {
        kind: "select",
        label: "select-after-remote-rebase",
        selection: collapsedSelection([2, 0], 0),
      },
      { kind: "type", label: "type-after-remote-rebase", text: "After " },
      {
        kind: "assertBlockTexts",
        label: "assert-follow-up-type-after-rebase",
        startIndex: 2,
        texts: [
          "After This example shows images in action. It features two ways to add images. You can either add an image via the toolbar icon above, or if you want in on a little secret, copy an image URL to your clipboard and paste it anywhere in the editor!",
          "You can delete images with the cross in the top left. Try deleting this image:",
        ],
      },
    ],
  });

const pasteHtmlImageVoid = (): StressCase =>
  createStressCase({
    family: "paste-html-image-void",
    route: "paste-html",
    steps: [
      { kind: "selectAll", label: "select-all" },
      {
        html: '<p>Before image</p><img src="https://example.com/pasted-one.png"><img src="https://example.com/pasted-two.png"><p>After image</p>',
        kind: "pasteHtml",
        label: "paste-html-images",
        text: "Before image\nAfter image",
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-pasted-images-rendered",
        selector: 'img[src^="https://example.com/pasted-"]',
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-pasted-image-void-shell",
        selector: '[data-slate-void="true"]',
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-pasted-image-runtime-spacer",
        selector: '[data-slate-void="true"] [data-slate-spacer]',
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-pasted-image-visible-content-wrapper",
        selector: '[data-slate-void="true"] > [contenteditable="false"]',
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      { kind: "assertLastCommit", label: "assert-paste-commit" },
      {
        expectedModelTextBefore: "Before imageAfter image",
        kind: "undo",
        label: "undo-pasted-images",
      },
      {
        count: 0,
        kind: "assertLocatorCount",
        label: "assert-pasted-images-removed-after-undo",
        selector: 'img[src^="https://example.com/pasted-"]',
      },
    ],
  });

const editableIslandNativeFocus = (): StressCase =>
  createStressCase({
    family: "editable-island-native-focus",
    route: "editable-voids",
    steps: [
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-editable-island-shell",
        selector: '[data-slate-void="true"]',
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-editable-island-spacer",
        selector: '[data-slate-void="true"] [data-slate-spacer]',
      },
      ...createSlateBrowserInternalControlGauntlet({
        controlSelector: 'input[type="text"]',
        controlValue: "Typing",
        followUpText: "Outer ",
        outerSelection: collapsedSelection([0, 0], 0),
        textAfterFollowUp: "Outer In addition to nodes",
      }),
    ],
  });

const tableCellBoundaryNavigation = (): StressCase =>
  createStressCase({
    family: "table-cell-boundary-navigation",
    route: "tables",
    steps: [
      {
        kind: "select",
        label: "select-first-table-cell-start",
        selection: collapsedSelection([1, 0, 0, 0], 0),
      },
      {
        kind: "assertSelection",
        label: "assert-first-cell-start",
        selection: collapsedSelection([1, 0, 0, 0], 0),
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-cell-right" },
      { key: "ArrowRight", kind: "press", label: "arrow-right-next-cell" },
      {
        kind: "assertSelection",
        label: "assert-second-cell-start",
        selection: collapsedSelection([1, 0, 1, 0], 0),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-second-cell-dom-location",
        location: {
          anchorOffset: 0,
          anchorPath: [1, 0, 1, 0],
          isCollapsed: true,
        },
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        budget: {
          byKind: {
            editable: { max: 2 },
            element: 0,
            leaf: 0,
            text: 0,
            void: 0,
          },
          total: { max: 2 },
        },
        kind: "assertRenderBudget",
        label: "assert-table-navigation-render-budget",
      },
    ],
  });

const externalDecorationRefresh = (): StressCase =>
  createStressCase({
    family: "external-decoration-refresh",
    route: "search-highlighting",
    steps: [
      { kind: "resetRenderProfiler", label: "reset-render-before-search" },
      {
        kind: "fillControl",
        label: "type-search-query",
        selector: 'input[type="search"]',
        value: "t",
      },
      {
        kind: "assertLocatorCount",
        label: "assert-highlight-rendered",
        min: 1,
        selector: '[data-cy="search-highlighted"]',
      },
      {
        focusOwner: "outside",
        kind: "assertFocusOwner",
        label: "assert-search-input-keeps-focus",
      },
      {
        budget: {
          byKind: {
            editable: { max: 4 },
            element: 0,
            text: { max: 8 },
            void: 0,
          },
        },
        kind: "assertRenderBudget",
        label: "assert-search-refresh-render-budget",
      },
    ],
  });

const overlayManyDecorationSources = (): StressCase =>
  createStressCase({
    family: "overlay-many-decoration-sources",
    route: "linting",
    steps: [
      { kind: "resetRenderProfiler", label: "reset-render-before-overlays" },
      {
        kind: "clickSelector",
        label: "run-linter",
        selector: 'button:has-text("Run linter")',
      },
      {
        contains: "issues:2",
        kind: "assertLocatorText",
        label: "assert-lint-issue-count",
        selector: "#linting-count",
      },
      {
        kind: "assertLocatorCount",
        label: "assert-many-decoration-slices",
        min: 2,
        selector: "[data-lint-severity]",
      },
      {
        budget: {
          byKind: {
            editable: { max: 6 },
            element: { max: 4 },
            leaf: { max: 14 },
            text: { max: 6 },
          },
        },
        kind: "assertRenderBudget",
        label: "assert-many-decoration-render-budget",
      },
    ],
  });

const addReviewCommentSteps = (): SlateBrowserScenarioStep[] => [
  {
    kind: "clickSelector",
    label: "seed-review-comment",
    selector: 'button:has-text("Seed example comment")',
  },
  {
    count: 2,
    kind: "assertLocatorCount",
    label: "assert-review-comment-slice",
    selector: '[data-comment-tone="review"]',
  },
  {
    count: 1,
    kind: "assertLocatorCount",
    label: "assert-review-comment-widget",
    selector: "text=comment-1-widget:Comment 1",
  },
];

const overlayAnnotationMetadataOnly = (): StressCase =>
  createStressCase({
    family: "overlay-annotation-metadata-only",
    route: "comment-mode",
    steps: [
      ...addReviewCommentSteps(),
      { kind: "resetRenderProfiler", label: "reset-render-before-retone" },
      {
        kind: "clickSelector",
        label: "retone-comment",
        selector: 'button:has-text("Retone first comment")',
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-question-comment-slice",
        selector: '[data-comment-tone="question"]',
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-comment-card-stable",
        selector: "#comment-card-comment-1",
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-retone-widget-stable",
        selector: "text=comment-1-widget:Comment 1",
      },
    ],
  });

const overlayAnnotationBookmarkRebase = (): StressCase =>
  createStressCase({
    family: "overlay-annotation-bookmark-rebase",
    route: "comment-mode",
    steps: [
      ...addReviewCommentSteps(),
      {
        kind: "clickSelector",
        label: "insert-prefix-before-bookmark",
        selector: 'button:has-text("Insert prefix before first comment")',
      },
      {
        contains: "range:0.0:1|0.0:25",
        kind: "assertLocatorText",
        label: "assert-rebased-comment-range",
        selector: "#comment-card-comment-1",
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-rebased-inline-comment",
        selector: '[data-comment-tone="review"]',
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-rebased-widget-visible",
        selector: "text=comment-1-widget:Comment 1",
      },
    ],
  });

const overlayWidgetDirtyId = (): StressCase =>
  createStressCase({
    family: "overlay-widget-dirty-id",
    route: "comment-mode",
    steps: [
      ...addReviewCommentSteps(),
      {
        kind: "resetRenderProfiler",
        label: "reset-render-before-widget-retone",
      },
      {
        kind: "clickSelector",
        label: "retone-widget-comment",
        selector: 'button:has-text("Retone first comment")',
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-widget-survives-metadata-update",
        selector: "text=comment-1-widget:Comment 1",
      },
      {
        kind: "clickSelector",
        label: "clear-widget-comment",
        selector: 'button:has-text("Clear comments")',
      },
      {
        count: 0,
        kind: "assertLocatorCount",
        label: "assert-widget-cleared",
        selector: "text=comment-1-widget:Comment 1",
      },
    ],
  });

const overlayMixedUpdate = (): StressCase =>
  createStressCase({
    family: "overlay-mixed-update",
    route: "comment-mode",
    steps: [
      ...addReviewCommentSteps(),
      {
        kind: "clickSelector",
        label: "insert-prefix-before-comment",
        selector: 'button:has-text("Insert prefix before first comment")',
      },
      {
        count: 2,
        kind: "assertLocatorCount",
        label: "assert-mixed-inline-comment",
        selector: "[data-comment-tone]",
      },
      {
        count: 1,
        kind: "assertLocatorCount",
        label: "assert-mixed-widget-visible",
        selector: "text=comment-1-widget:Comment 1",
      },
      {
        kind: "clickSelector",
        label: "clear-mixed-comment",
        selector: 'button:has-text("Clear comments")',
      },
      {
        count: 0,
        kind: "assertLocatorCount",
        label: "assert-mixed-inline-cleared",
        selector: "[data-comment-tone]",
      },
      {
        count: 0,
        kind: "assertLocatorCount",
        label: "assert-mixed-widget-cleared",
        selector: "text=comment-1-widget:Comment 1",
      },
    ],
  });

const mouseSelectionToolbar = (): StressCase =>
  createStressCase({
    family: "mouse-selection-toolbar",
    route: "hovering-toolbar",
    steps: [
      {
        kind: "assertLocatorCss",
        label: "assert-toolbar-starts-hidden",
        property: "opacity",
        selector: '[data-test-id="menu"]',
        value: "0",
      },
      { kind: "resetRenderProfiler", label: "reset-render-before-mouse-drag" },
      {
        kind: "dragTextSelection",
        label: "drag-first-text-range",
        selector: 'span[data-slate-string="true"]',
        steps: 12,
      },
      {
        kind: "assertWindowSelectionText",
        label: "assert-native-selection-text",
        notEmpty: true,
      },
      {
        kind: "assertModelSelectionExpanded",
        label: "assert-model-selection-expanded",
      },
      {
        kind: "assertLocatorCss",
        label: "assert-toolbar-visible",
        property: "opacity",
        selector: '[data-test-id="menu"]',
        value: "1",
      },
      {
        kind: "assertLocatorCss",
        label: "assert-toolbar-top-positioned",
        notValue: "-10000px",
        property: "top",
        selector: '[data-test-id="menu"]',
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        budget: { byKind: { editable: { max: 4 } }, total: { max: 4 } },
        kind: "assertRenderBudget",
        label: "assert-mouse-selection-render-budget",
      },
    ],
  });

const webkitBackwardSelection = (): StressCase => {
  const firstText = "This is editable ";

  return createStressCase({
    family: "webkit-backward-selection",
    route: "richtext",
    steps: [
      {
        kind: "selectDOM",
        label: "select-dom-caret-after-first-word",
        selection: collapsedSelection([0, 0], 4),
      },
      {
        key: "Shift+ArrowLeft",
        kind: "press",
        label: "extend-selection-backward",
      },
      {
        kind: "assertDOMSelection",
        label: "assert-dom-selection-is-backward",
        selection: {
          anchorNodeText: firstText,
          anchorOffset: 4,
          focusNodeText: firstText,
          focusOffset: 3,
        },
      },
      {
        kind: "assertSelection",
        label: "assert-model-selection-is-backward",
        selection: {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 3 },
        },
      },
      {
        kind: "assertWindowSelectionText",
        label: "assert-selected-text",
        text: "s",
      },
    ],
  });
};

const domMutationImport = (): StressCase => {
  const prefix = "This is ";
  const insertedText = "DOM imported ";
  const originalText = `${prefix}editable `;
  const importedText = `${prefix}${insertedText}editable `;
  const followUpText = `${prefix}${insertedText}!editable `;
  const selectionOffset = prefix.length + insertedText.length;

  return createStressCase({
    family: "dom-mutation-import",
    route: "richtext",
    steps: [
      {
        kind: "selectDOM",
        label: "select-dom-import-point",
        selection: collapsedSelection([0, 0], prefix.length),
      },
      {
        data: insertedText,
        inputType: "insertText",
        kind: "mutateTextDOM",
        label: "mutate-first-leaf-dom-text",
        path: [0, 0],
        selectionOffset,
        text: importedText,
      },
      {
        kind: "assertModelText",
        label: "assert-dom-mutation-imported-to-model",
        text: importedText,
      },
      {
        kind: "assertSelection",
        label: "assert-model-selection-after-dom-import",
        selection: collapsedSelection([0, 0], selectionOffset),
      },
      {
        kind: "assertDOMSelection",
        label: "assert-native-selection-after-dom-import",
        selection: {
          anchorNodeText: importedText,
          anchorOffset: selectionOffset,
          focusNodeText: importedText,
          focusOffset: selectionOffset,
        },
      },
      { kind: "assertLastCommit", label: "assert-dom-import-commit" },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      { kind: "type", label: "type-after-dom-import", text: "!" },
      {
        kind: "assertKernelTrace",
        label: "assert-follow-up-type-command-trace",
        trace: {
          commandKind: "insert-text",
          eventFamily: "beforeinput",
          transition: { allowed: true },
        },
      },
      {
        kind: "assertModelText",
        label: "assert-follow-up-type-after-dom-import",
        text: followUpText,
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-follow-up-selection-after-dom-import",
        location: {
          anchorOffset: selectionOffset + 1,
          anchorPath: [0, 0],
          isCollapsed: true,
        },
      },
      {
        expectedModelTextBefore: followUpText,
        kind: "undo",
        label: "undo-follow-up-type-after-dom-import",
      },
      {
        kind: "assertKernelTrace",
        label: "assert-undo-command-trace",
        trace: {
          commandKind: "history",
          eventFamily: "keydown",
          transition: { allowed: true },
        },
      },
      {
        kind: "assertModelText",
        label: "assert-typing-batch-undo-restores-original-text",
        text: originalText,
      },
    ],
  });
};

const selectionRepairIme = (): StressCase =>
  createStressCase({
    family: "selection-repair-ime",
    route: "richtext",
    steps: [
      {
        kind: "select",
        label: "select-composition-point",
        selection: collapsedSelection([0, 0], "This is ".length),
      },
      {
        committedText: "e",
        kind: "composeText",
        label: "compose-e",
        steps: ["e"],
        text: "e",
        transport: "synthetic",
      },
      {
        kind: "assertText",
        label: "assert-composed-model-text",
        text: "This is eeditable",
      },
      { focusOwner: "editor", kind: "assertFocusOwner", label: "assert-focus" },
      {
        kind: "assertSelectionLocation",
        label: "assert-composition-selection-collapsed",
        location: { isCollapsed: true },
      },
    ],
  });

const imeCompositionInlineVoidBoundary = (): StressCase => {
  const beforeFirstMentionText = "Try mentioning characters, like ";

  return createStressCase({
    family: "ime-composition-inline-void-boundary",
    route: "mentions",
    steps: [
      {
        kind: "selectDOM",
        label: "select-before-first-mention",
        selection: collapsedSelection([1, 0], beforeFirstMentionText.length),
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-inline-void-selection-before-composition",
        location: {
          anchorOffset: beforeFirstMentionText.length,
          anchorPath: [1, 0],
          isCollapsed: true,
        },
      },
      {
        kind: "assertDOMSelection",
        label: "assert-inline-void-dom-selection-before-composition",
        selection: {
          anchorNodeText: beforeFirstMentionText,
          anchorOffset: beforeFirstMentionText.length,
          focusNodeText: beforeFirstMentionText,
          focusOffset: beforeFirstMentionText.length,
        },
      },
      {
        committedText: "すし",
        kind: "composeText",
        label: "compose-after-inline-void",
        steps: ["す", "すし"],
        text: "すし",
        transport: "synthetic",
      },
      {
        contains: "like すし@R2-D2",
        kind: "assertLocatorText",
        label: "assert-inline-void-composition-text",
        selector: '[data-slate-path="1"]',
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-inline-void-composition-selection-collapsed",
        location: { isCollapsed: true },
      },
    ],
  });
};

const imeCompositionUndo = (): StressCase => {
  const initialText = "This is editable ";
  const composedText = `${initialText}すし`;

  return createStressCase({
    family: "ime-composition-undo",
    route: "richtext",
    steps: [
      {
        kind: "select",
        label: "select-composition-point",
        selection: collapsedSelection([0, 0], initialText.length),
      },
      {
        kind: "assertDOMSelection",
        label: "assert-composition-dom-selection",
        selection: {
          anchorNodeText: initialText,
          anchorOffset: initialText.length,
          focusNodeText: initialText,
          focusOffset: initialText.length,
        },
      },
      {
        committedText: "すし",
        kind: "composeText",
        label: "compose-sushi",
        steps: ["す", "すし"],
        text: "すし",
        transport: "synthetic",
      },
      {
        kind: "assertText",
        label: "assert-composed-model-text",
        text: composedText,
      },
      {
        expectedModelTextBefore: composedText,
        kind: "undo",
        label: "undo-composition",
      },
      {
        kind: "assertText",
        label: "assert-after-composition-undo",
        text: initialText,
      },
      {
        kind: "assertSelectionLocation",
        label: "assert-undo-selection-collapsed",
        location: { isCollapsed: true },
      },
    ],
  });
};

const stressCases: StressCase[] = [
  inlineVoidBoundaryNavigation(),
  markableInlineVoidFormatting(),
  ...(["images", "embeds"] as const).map(blockVoidNavigation),
  staleTargetRemoteRebase(),
  pasteHtmlImageVoid(),
  editableIslandNativeFocus(),
  tableCellBoundaryNavigation(),
  externalDecorationRefresh(),
  overlayManyDecorationSources(),
  overlayAnnotationMetadataOnly(),
  overlayAnnotationBookmarkRebase(),
  overlayWidgetDirtyId(),
  overlayMixedUpdate(),
  mouseSelectionToolbar(),
  webkitBackwardSelection(),
  domMutationImport(),
  hugeDocumentCut(),
  ...["plaintext", "richtext", "forced-layout"].map(pasteNormalizeUndo),
  selectionRepairIme(),
  imeCompositionInlineVoidBoundary(),
  imeCompositionUndo(),
].filter(
  (stressCase) =>
    routeEnabled(stressCase.route) && familyEnabled(stressCase.family)
);

if (stressCases.length === 0) {
  throw new Error(
    "No stress cases selected. Check STRESS_ROUTES and STRESS_FAMILIES filters."
  );
}

for (const stressCase of stressCases) {
  test(`${stressCase.route} ${stressCase.family}`, async ({
    page,
  }, testInfo) => {
    const artifactPath = stressArtifactPath(testInfo.project.name, stressCase);
    const resultPath = stressResultPath(artifactPath);

    writeStressArtifact(
      artifactPath,
      createStressArtifact({
        artifactPath,
        projectName: testInfo.project.name,
        resultPath,
        status: "running",
        stressCase,
      })
    );

    try {
      await installSlateReactRenderProfiler(page);
      const editor = await openExample(
        page,
        stressCase.route.startsWith("slate/")
          ? stressCase.route
          : `slate/${stressCase.route}`,
        {
          ready: { editor: "visible" },
          surface: stressCase.surface,
        }
      );
      const result = await editor.scenario.run(
        stressCase.id,
        stressCase.steps,
        {
          metadata: {
            capabilities: [
              "generated-stress",
              stressCase.family,
              stressCase.route,
            ],
            platform: testInfo.project.name,
            transport: "playwright-browser",
          },
          tracePath: resultPath,
        }
      );
      const finalState = await takeSlateBrowserRenderStateSnapshot(editor);

      assertNoIllegalKernelTransitions(result);
      expect(result.replay.replayable).toBe(true);

      writeStressArtifact(
        artifactPath,
        createStressArtifact({
          artifactPath,
          finalSnapshot: {
            domSelection: finalState.domSelection,
            focusOwner: finalState.focusOwner,
            lastCommit: finalState.lastCommit,
            renderCounts: finalState.renderCounts,
            selection: finalState.selection,
          },
          projectName: testInfo.project.name,
          reductionCandidates: result.reductionCandidates,
          result,
          resultPath,
          status: "passed",
          stressCase,
        })
      );
    } catch (error) {
      writeStressArtifact(
        artifactPath,
        createStressArtifact({
          artifactPath,
          error,
          projectName: testInfo.project.name,
          resultPath,
          status: "failed",
          stressCase,
        })
      );
      throw error;
    }
  });
}

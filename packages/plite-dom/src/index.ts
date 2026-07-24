// Plugin

export type {
  DOMCoverageBoundary,
  DOMCoverageBoundaryAnchor,
  DOMCoverageBoundaryEdge,
  DOMCoverageBoundaryState,
  DOMCoverageCopyPolicy,
  DOMCoverageDOMPointResult,
  DOMCoverageDOMRangeResult,
  DOMCoverageFindPolicy,
  DOMCoverageMaterializeHandler,
  DOMCoverageMaterializeRangeRole,
  DOMCoverageMaterializeReason,
  DOMCoverageMaterializeResult,
  DOMCoveragePathRange,
  DOMCoverageReason,
  DOMCoverageRuntimeRange,
  DOMCoverageSelectionPolicy,
  DOMCoveragePlitePointResult,
} from './plugin/dom-coverage';
export { DOMCoverage } from './plugin/dom-coverage';
export type {
  DOMApi,
  DOMEditorClipboardCapability,
  DOMClipboardApi,
  DOMClipboardInsertDataHandler,
  ScrollIntoViewOptions,
  ScrollIntoViewTarget,
} from './plugin/dom-editor';
export type {
  DOMEditor,
  DOMExtension,
  DOMExtensionTypes,
} from './plugin/with-dom';
export { PliteDOMResolutionError } from './plugin/dom-editor';
export type { DOMEditorOptions } from './plugin/with-dom';
export { dom } from './plugin/with-dom';
export type {
  DOMFragmentDataHtml,
  DOMFragmentDataPayload,
} from './plugin/dom-clipboard-runtime';
export {
  getDOMClipboardFormatKey,
  writeDOMFragmentData,
  writeDOMRangeData,
} from './plugin/dom-clipboard-runtime';
export {
  defineHostCodec,
  hostCodecs,
  writeHostFragmentData,
} from './plugin/host-codec';
export { parseDOMClipboardHtml } from './plugin/dom-html';
export type {
  HostDataSource,
  HostCodec,
  HostCodecParseContext,
  HostCodecPhase,
  HostCodecSchemaTarget,
  HostCodecSerializeContext,
} from './plugin/host-codec';

// Utils
export { TRIPLE_CLICK } from './utils/constants';
export type { StringDiff, TextDiff } from './utils/diff-text';
export {
  applyStringDiff,
  mergeStringDiffs,
  normalizePoint,
  normalizeRange,
  normalizeStringDiff,
  targetRange,
  verifyDiffState,
} from './utils/diff-text';
export type {
  DOMElement,
  DOMNode,
  DOMPoint,
  DOMRange,
  DOMSelection,
  DOMStaticRange,
  DOMText,
} from './utils/dom';
export {
  closestShadowAware,
  containsShadowAware,
  getActiveElement,
  getDefaultView,
  getSelection,
  hasShadowRoot,
  isAfter,
  isBefore,
  isDOMElement,
  isDOMNode,
  isDOMSelection,
  isDOMText,
  isPlainTextOnlyPaste,
  isTrackedMutation,
  normalizeDOMPoint,
} from './utils/dom';

export { CAN_USE_DOM } from './utils/environment';
export type {
  HotkeyMatchOptions,
  HotkeyPlatform,
  HotkeySpec,
  KeyboardEventLike,
} from './utils/hotkeys';
export {
  Hotkeys,
  isHotkey,
} from './utils/hotkeys';

export { Key } from './utils/key';

export {
  getElements,
  getNodeDataAttributeKeys,
  isEditor,
  isElement,
  isLeaf,
  isNode,
  isString,
  isText,
  isVoid,
  keyToDataAttribute,
} from './utils/plite-dom-markers';

export {
  isElementDecorationsEqual,
  isTextDecorationsEqual,
  splitDecorationsByChild,
} from './utils/range-list';

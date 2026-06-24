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
  DOMClipboardApi,
  DOMClipboardInsertDataHandler,
} from './plugin/dom-editor';
export { PliteDOMResolutionError } from './plugin/dom-editor';
export type { DOMEditorOptions } from './plugin/with-dom';
export { dom } from './plugin/with-dom';

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

export {
  CAN_USE_DOM,
  HAS_BEFORE_INPUT_SUPPORT,
  IS_ANDROID,
  IS_CHROME,
  IS_FIREFOX,
  IS_IOS,
  IS_UC_MOBILE,
  IS_WEBKIT,
  IS_WECHATBROWSER,
} from './utils/environment';
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
  isElementDecorationsEqual,
  isTextDecorationsEqual,
  splitDecorationsByChild,
} from './utils/range-list';

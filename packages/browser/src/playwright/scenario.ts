import type {
  PliteBrowserClipboardPasteGauntletOptions,
  PliteBrowserCompositionGauntletOptions,
  PliteBrowserDropDataGauntletOptions,
  PliteBrowserInlineCutTypingGauntletOptions,
  PliteBrowserInternalControlGauntletOptions,
  PliteBrowserMarkClickTypingGauntletOptions,
  PliteBrowserMarkTypingGauntletOptions,
  PliteBrowserNavigationTypingGauntletOptions,
  PliteBrowserScenarioStep,
  PliteBrowserShellActivationGauntletOptions,
  PliteBrowserTextInsertionGauntletOptions,
  PliteBrowserToolbarMarkClickTypingGauntletOptions,
} from './types';

/** Create a scenario that mixes navigation and typing through editor content. */
export const createPliteBrowserNavigationTypingGauntlet = ({
  insertedText,
  movedSelection,
  startSelection,
  textAfterInsert,
}: PliteBrowserNavigationTypingGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-start',
    selection: startSelection,
  },
  {
    key: 'ArrowRight',
    kind: 'press',
    label: 'move-right',
  },
  {
    kind: 'assertSelection',
    label: 'assert-moved-selection',
    selection: movedSelection,
  },
  {
    kind: 'insertText',
    label: 'insert-after-navigation',
    text: insertedText,
  },
  {
    kind: 'assertText',
    label: 'assert-inserted-text',
    text: textAfterInsert,
  },
];

/** Create a scenario that validates clipboard paste behavior. */
export const createPliteBrowserClipboardPasteGauntlet = ({
  html,
  plainText,
  textAfterPaste,
}: PliteBrowserClipboardPasteGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'selectAll',
    label: 'select-all',
  },
  {
    html,
    kind: 'pasteHtml',
    label: 'paste-html',
    text: plainText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-paste-command-trace',
    trace: {
      commandKind: 'insert-data',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-paste-repair-trace',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-pasted-text',
    text: textAfterPaste,
  },
];

/** Create a scenario that validates drag/drop data insertion behavior. */
export const createPliteBrowserDropDataGauntlet = ({
  html,
  plainText,
  textAfterDrop,
}: PliteBrowserDropDataGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'dropHtml',
    label: 'drop-html',
    html,
    text: plainText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-drop-command-trace',
    trace: {
      commandKind: 'insert-data',
      eventFamily: 'drop',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-dropped-text',
    text: textAfterDrop,
  },
];

/** Create a scenario that validates inline cut followed by typing. */
export const createPliteBrowserInlineCutTypingGauntlet = ({
  domShape,
  replacementText,
  selection,
  textAfterTyping,
}: PliteBrowserInlineCutTypingGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-inline-text',
    selection,
  },
  {
    key: 'ControlOrMeta+X',
    kind: 'press',
    label: 'cut-inline-text',
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-inline-cut-command-trace',
    trace: {
      commandKind: 'delete-fragment',
      transition: { allowed: true },
    },
  },
  ...(domShape?.afterCut
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-inline-cut',
          shape: domShape.afterCut,
        },
      ]
    : []),
  {
    kind: 'type',
    label: 'type-replacement',
    text: replacementText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-inline-repair-trace-after-type',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-replacement-text',
    text: textAfterTyping,
  },
  ...(domShape?.afterTyping
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-inline-cut-typing',
          shape: domShape.afterTyping,
        },
      ]
    : []),
];

/** Create a scenario for editor behavior around internal native controls. */
export const createPliteBrowserInternalControlGauntlet = ({
  controlSelector,
  controlValue,
  followUpText,
  outerSelection,
  textAfterFollowUp,
}: PliteBrowserInternalControlGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-outer-editor',
    selection: outerSelection,
  },
  {
    kind: 'fillControl',
    label: 'edit-internal-control',
    selector: controlSelector,
    value: controlValue,
  },
  {
    focusOwner: 'internal-control',
    kind: 'assertFocusOwner',
    label: 'assert-internal-control-focus',
  },
  {
    kind: 'assertSelection',
    label: 'assert-outer-selection-preserved',
    selection: outerSelection,
  },
  {
    kind: 'focus',
    label: 'focus-outer-editor',
  },
  {
    kind: 'insertText',
    label: 'insert-after-internal-control',
    text: followUpText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-internal-control-follow-up-insert-trace',
    trace: {
      commandKind: 'insert-text',
      eventFamily: 'repair',
      selectionChangeOrigin: 'browser-handle',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-follow-up-text',
    text: textAfterFollowUp,
  },
];

/** Create a scenario that validates composition/IME input behavior. */
export const createPliteBrowserCompositionGauntlet = ({
  committedText,
  selection,
  steps,
  text,
  textAfterComposition,
  transport,
}: PliteBrowserCompositionGauntletOptions): PliteBrowserScenarioStep[] => [
  ...(selection
    ? [
        {
          kind: 'select' as const,
          label: 'select-composition-start',
          selection,
        },
      ]
    : []),
  {
    committedText,
    kind: 'composeText',
    label: 'compose-text',
    steps,
    text,
    transport,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-composition-start-trace',
    trace: {
      eventFamily: 'compositionstart',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-composition-update-trace',
    trace: {
      eventFamily: 'compositionupdate',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-composition-end-trace',
    trace: {
      eventFamily: 'compositionend',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-composed-text',
    text: textAfterComposition,
  },
];

/** Create a scenario for plain text insertion behavior. */
export const createPliteBrowserTextInsertionGauntlet = ({
  insertedText,
  textAfterInsert,
}: PliteBrowserTextInsertionGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'insertText',
    label: 'insert-text',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-text-insert-command-trace',
    trace: {
      commandKind: 'insert-text',
      eventFamily: 'repair',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-inserted-text',
    text: textAfterInsert,
  },
];

/** Create a scenario for shell activation and editor focus ownership. */
export const createPliteBrowserShellActivationGauntlet = ({
  buttonName,
  expectedSelection,
}: PliteBrowserShellActivationGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    buttonName,
    expectedSelection,
    kind: 'activateShell',
    label: 'activate-shell',
  },
];

/** Create a scenario that validates mark toggling followed by typing. */
export const createPliteBrowserMarkTypingGauntlet = ({
  hotkey,
  insertedText,
  selection,
  textAfterInsert,
}: PliteBrowserMarkTypingGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-mark-start',
    selection,
  },
  {
    key: hotkey,
    kind: 'press',
    label: 'toggle-mark',
  },
  { kind: 'type', label: 'type-marked-text', text: insertedText },
  {
    kind: 'assertText',
    label: 'assert-marked-text',
    text: textAfterInsert,
  },
];

/** Create a scenario that validates mark toolbar clicks followed by typing. */
export const createPliteBrowserMarkClickTypingGauntlet = ({
  clickPoint,
  domCaretAfterInsert,
  hotkey,
  insertedText,
  markSelection,
  selectionAfterInsert,
  selectionTransport = 'model',
  textAfterInsert,
}: PliteBrowserMarkClickTypingGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: selectionTransport === 'dom' ? 'selectDOM' : 'select',
    label: 'select-mark-range',
    selection: markSelection,
  },
  {
    key: hotkey,
    kind: 'press',
    label: 'toggle-mark',
  },
  {
    kind: 'clickTextOffset',
    label: 'click-after-mark-split',
    offset: clickPoint.offset,
    path: clickPoint.path,
  },
  {
    kind: 'type',
    label: 'type-after-mark-click',
    text: insertedText,
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-mark-click',
    text: textAfterInsert,
  },
  ...(selectionAfterInsert
    ? [
        {
          kind: 'assertSelection' as const,
          label: 'assert-selection-after-mark-click',
          selection: selectionAfterInsert,
        },
      ]
    : []),
  ...(domCaretAfterInsert
    ? [
        {
          kind: 'assertDOMCaret' as const,
          label: 'assert-dom-caret-after-mark-click',
          offset: domCaretAfterInsert.offset,
          text: domCaretAfterInsert.text,
        },
      ]
    : []),
];

/** Create a scenario that validates toolbar mark clicks and editor typing. */
export const createPliteBrowserToolbarMarkClickTypingGauntlet = ({
  clickPoint,
  domCaretAfterInsert,
  insertedText,
  markButtonTestId,
  markSelection,
  selectionTransport = 'model',
  selectionAfterInsert,
  textAfterInsert,
}: PliteBrowserToolbarMarkClickTypingGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: selectionTransport === 'dom' ? 'selectDOM' : 'select',
    label: 'select-mark-range',
    selection: markSelection,
  },
  {
    kind: 'clickTestId',
    label: 'toggle-mark-from-toolbar',
    testId: markButtonTestId,
  },
  {
    kind: 'clickTextOffset',
    label: 'click-after-toolbar-mark-split',
    offset: clickPoint.offset,
    path: clickPoint.path,
  },
  {
    kind: 'type',
    label: 'type-after-toolbar-mark-click',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-repair-trace-after-toolbar-mark-click',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-toolbar-mark-click',
    text: textAfterInsert,
  },
  ...(selectionAfterInsert
    ? [
        {
          kind: 'assertSelection' as const,
          label: 'assert-selection-after-toolbar-mark-click',
          selection: selectionAfterInsert,
        },
      ]
    : []),
  ...(domCaretAfterInsert
    ? [
        {
          kind: 'assertDOMCaret' as const,
          label: 'assert-dom-caret-after-toolbar-mark-click',
          offset: domCaretAfterInsert.offset,
          text: domCaretAfterInsert.text,
        },
      ]
    : []),
];

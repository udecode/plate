import type {
  PliteBrowserMixedEditingConformanceGauntletOptions,
  PliteBrowserScenarioStep,
  PliteBrowserSemanticEditingConformanceGauntletOptions,
} from './types';

/** Create a mixed editing conformance scenario across text and structure. */
export const createPliteBrowserMixedEditingConformanceGauntlet = ({
  deleteKey,
  domCaretAfterDelete,
  domCaretAfterFollowUp,
  domShape,
  insertedText,
  navigationKeys,
  selectionAfterDelete,
  selectionAfterFollowUp,
  selectionAfterInsert,
  selectionAfterNavigation,
  startSelection,
  textAfterDelete,
  textAfterFollowUp,
  textAfterInsert,
  toolbarButtonTestId,
  toolbarSelection,
  toolbarSelectionAfterCommand,
}: PliteBrowserMixedEditingConformanceGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-navigation-start',
    selection: startSelection,
  },
  ...navigationKeys.map(
    (key, index): PliteBrowserScenarioStep => ({
      key,
      kind: 'press',
      label: `navigate-${index + 1}-${key}`,
    })
  ),
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-navigation',
    selection: selectionAfterNavigation,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-navigation-command-trace',
    trace: {
      commandKind: 'move-selection',
      transition: { allowed: true },
    },
  },
  {
    kind: 'type',
    label: 'type-after-navigation',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-repair-trace-after-type',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-type',
    text: textAfterInsert,
  },
  ...(domShape?.afterInsert
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-type',
          shape: domShape.afterInsert,
        },
      ]
    : []),
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-type',
    selection: selectionAfterInsert,
  },
  {
    key: deleteKey,
    kind: 'press',
    label: `delete-after-type-${deleteKey}`,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-delete-command-trace',
    trace: {
      commandKind: 'delete',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-delete',
    text: textAfterDelete,
  },
  ...(domShape?.afterDelete
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-delete',
          shape: domShape.afterDelete,
        },
      ]
    : []),
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-delete',
    selection: selectionAfterDelete,
  },
  ...(domCaretAfterDelete
    ? [
        {
          kind: 'assertDOMCaret' as const,
          label: 'assert-dom-caret-after-delete',
          offset: domCaretAfterDelete.offset,
          text: domCaretAfterDelete.text,
        },
      ]
    : []),
  {
    kind: 'rootMouseDown',
    label: 'activate-editor-dom-selection',
  },
  {
    kind: 'selectDOM',
    label: 'select-toolbar-target-through-dom',
    selection: toolbarSelection,
  },
  {
    kind: 'clickTestId',
    label: 'run-toolbar-command',
    testId: toolbarButtonTestId,
  },
  {
    kind: 'assertSelection',
    label: 'assert-toolbar-selection-after-command',
    selection: toolbarSelectionAfterCommand,
  },
  {
    kind: 'type',
    label: 'type-after-toolbar-command',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-repair-trace-after-toolbar-follow-up',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    focusOwner: 'editor',
    kind: 'assertFocusOwner',
    label: 'assert-editor-focus-after-toolbar-follow-up',
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-toolbar-follow-up',
    text: textAfterFollowUp,
  },
  ...(domShape?.afterFollowUp
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-toolbar-follow-up',
          shape: domShape.afterFollowUp,
        },
      ]
    : []),
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-toolbar-follow-up',
    selection: selectionAfterFollowUp,
  },
  ...(domCaretAfterFollowUp
    ? [
        {
          kind: 'assertDOMCaret' as const,
          label: 'assert-dom-caret-after-toolbar-follow-up',
          offset: domCaretAfterFollowUp.offset,
          text: domCaretAfterFollowUp.text,
        },
      ]
    : []),
];

/** Create a semantic editing conformance scenario. */
export const createPliteBrowserSemanticEditingConformanceGauntlet = ({
  insertedText,
  selectionAfterDelete,
  selectionAfterFollowUp,
  selectionAfterInsert,
  startSelection,
  textAfterDelete,
  textAfterFollowUp,
  textAfterInsert,
  toolbarButtonTestId,
  toolbarSelection,
  toolbarSelectionAfterCommand,
}: PliteBrowserSemanticEditingConformanceGauntletOptions): PliteBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-semantic-start',
    selection: startSelection,
  },
  {
    kind: 'insertText',
    label: 'semantic-insert-text',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-semantic-insert-command-trace',
    trace: {
      commandKind: 'insert-text',
      eventFamily: 'repair',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-semantic-insert',
    text: textAfterInsert,
  },
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-semantic-insert',
    selection: selectionAfterInsert,
  },
  {
    kind: 'deleteBackward',
    label: 'semantic-delete-backward',
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-semantic-delete-command-trace',
    trace: {
      commandKind: 'delete',
      eventFamily: 'repair',
      selectionChangeOrigin: 'browser-handle',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-semantic-delete',
    text: textAfterDelete,
  },
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-semantic-delete',
    selection: selectionAfterDelete,
  },
  {
    kind: 'rootMouseDown',
    label: 'activate-editor-dom-selection',
  },
  {
    kind: 'selectDOM',
    label: 'select-toolbar-target-through-dom',
    selection: toolbarSelection,
  },
  {
    kind: 'clickTestId',
    label: 'run-toolbar-command',
    testId: toolbarButtonTestId,
  },
  {
    kind: 'assertSelection',
    label: 'assert-toolbar-selection-after-command',
    selection: toolbarSelectionAfterCommand,
  },
  {
    kind: 'insertText',
    label: 'semantic-insert-after-toolbar-command',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-semantic-toolbar-follow-up-trace',
    trace: {
      commandKind: 'insert-text',
      eventFamily: 'repair',
      selectionChangeOrigin: 'browser-handle',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-toolbar-follow-up',
    text: textAfterFollowUp,
  },
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-toolbar-follow-up',
    selection: selectionAfterFollowUp,
  },
];

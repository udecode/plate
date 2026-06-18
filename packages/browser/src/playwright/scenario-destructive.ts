import type {
  SlateBrowserDestructiveEditingGauntletOptions,
  SlateBrowserScenarioStep,
} from './types';

/** Create a destructive editing conformance scenario. */
export const createSlateBrowserDestructiveEditingGauntlet = ({
  deleteAfterPasteKey = 'Backspace',
  domShape,
  followUpText,
  pasteSelection,
  pastedText,
  selectionAfterDeleteAfterPaste,
  selectionAfterFollowUp,
  selectionAfterPaste,
  tailBlockTextsAfterWordDelete,
  textAfterDeleteAfterPaste,
  textAfterFollowUp,
  textAfterPaste,
  wordDeleteIterations = 4,
  wordDeleteKey = 'Alt+Backspace',
  wordDeleteSelection,
}: SlateBrowserDestructiveEditingGauntletOptions): SlateBrowserScenarioStep[] => [
  {
    kind: 'select',
    label: 'select-paste-range',
    selection: pasteSelection,
  },
  {
    kind: 'pasteText',
    label: 'paste-over-selected-range',
    text: pastedText,
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-paste',
    text: textAfterPaste,
  },
  ...(domShape?.afterPaste
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-paste',
          shape: domShape.afterPaste,
        },
      ]
    : []),
  ...(selectionAfterPaste
    ? [
        {
          kind: 'assertSelection' as const,
          label: 'assert-selection-after-paste',
          selection: selectionAfterPaste,
        },
      ]
    : []),
  {
    key: deleteAfterPasteKey,
    kind: 'press',
    label: `delete-after-paste-${deleteAfterPasteKey}`,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-delete-trace-after-paste',
    trace: {
      commandKind: 'delete',
      transition: { allowed: true },
    },
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-delete-after-paste',
    text: textAfterDeleteAfterPaste,
  },
  ...(domShape?.afterDeleteAfterPaste
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-delete-after-paste',
          shape: domShape.afterDeleteAfterPaste,
        },
      ]
    : []),
  ...(selectionAfterDeleteAfterPaste
    ? [
        {
          kind: 'assertSelection' as const,
          label: 'assert-selection-after-delete-after-paste',
          selection: selectionAfterDeleteAfterPaste,
        },
      ]
    : []),
  {
    kind: 'type',
    label: 'type-after-delete-after-paste',
    text: followUpText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-repair-trace-after-delete-follow-up',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    focusOwner: 'editor',
    kind: 'assertFocusOwner',
    label: 'assert-focus-after-delete-follow-up',
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-delete-follow-up',
    text: textAfterFollowUp,
  },
  ...(domShape?.afterFollowUp
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-delete-follow-up',
          shape: domShape.afterFollowUp,
        },
      ]
    : []),
  ...(selectionAfterFollowUp
    ? [
        {
          kind: 'assertSelection' as const,
          label: 'assert-selection-after-delete-follow-up',
          selection: selectionAfterFollowUp,
        },
      ]
    : []),
  {
    kind: 'select',
    label: 'select-word-delete-start',
    selection: wordDeleteSelection,
  },
  ...Array.from(
    { length: Math.max(1, wordDeleteIterations) },
    (_, index): SlateBrowserScenarioStep[] => [
      {
        key: wordDeleteKey,
        kind: 'press',
        label: `word-delete-backward-${index + 1}`,
      },
      {
        kind: 'assertKernelTrace',
        label: `assert-word-delete-trace-${index + 1}`,
        trace: {
          commandKind: 'delete',
          transition: { allowed: true },
        },
      },
      {
        kind: 'assertBlockTexts',
        label: `assert-tail-blocks-after-word-delete-${index + 1}`,
        startIndex: 1,
        texts: tailBlockTextsAfterWordDelete,
      },
      ...(domShape?.afterWordDeleteIterations?.[index]
        ? [
            {
              kind: 'assertRenderedDOMShape' as const,
              label: `assert-dom-shape-after-word-delete-${index + 1}`,
              shape: domShape.afterWordDeleteIterations[index]!,
            },
          ]
        : []),
    ]
  ).flat(),
  {
    kind: 'type',
    label: 'type-after-word-delete',
    text: followUpText,
  },
  {
    kind: 'assertBlockTexts',
    label: 'assert-tail-blocks-after-word-delete-follow-up',
    startIndex: 1,
    texts: tailBlockTextsAfterWordDelete,
  },
  ...(domShape?.afterWordDeleteFollowUp
    ? [
        {
          kind: 'assertRenderedDOMShape' as const,
          label: 'assert-dom-shape-after-word-delete-follow-up',
          shape: domShape.afterWordDeleteFollowUp,
        },
      ]
    : []),
];

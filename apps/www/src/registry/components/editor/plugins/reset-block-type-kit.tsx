'use client';

import { KEYS } from '@udecode/plate';
import {
  isCodeBlockEmpty,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from '@udecode/plate-code-block';
import { ResetNodePlugin } from '@udecode/plate/react';

const resetBlockTypesCommonRule = {
  defaultType: KEYS.p,
  types: [...KEYS.heading, KEYS.blockquote, KEYS.callout],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: KEYS.p,
  types: [KEYS.codeBlock],
  onReset: unwrapCodeBlock,
};

export const ResetBlockTypeKit = [
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Enter',
          predicate: (editor) =>
            editor.api.isEmpty(editor.selection, { block: true }),
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Backspace',
          predicate: (editor) => editor.api.isAt({ start: true }),
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: 'Enter',
          predicate: isCodeBlockEmpty,
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: 'Backspace',
          predicate: isSelectionAtCodeBlockStart,
        },
      ],
    },
  }),
];

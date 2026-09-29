/// <reference types="@testing-library/jest-dom" />

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { ContentSlice } from '../../core';
import { definePlugin } from '../../lib';
import { createEditor } from '../editor';
import type { EditablePasteResult } from '../plite-react';
import { EditorRoot } from './Plate';
import { EditorContent } from './PlateContent';

const ReportingPastePlugin = definePlugin('reportingPaste', {
  dataTransferFormats: [
    {
      decode: ({ data, report }) => {
        report({ impact: 'lossy', message: 'Left out an embedded chart.' });

        return ContentSlice.closed([
          { children: [{ text: data }], type: 'paragraph' },
        ]);
      },
      mimeType: 'text/plain',
      scope: 'document',
    },
  ],
});

test('EditorContent delivers Plate format reports through onPasteResult', async () => {
  const editor = createEditor({
    plugins: [ReportingPastePlugin],
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });
  const results: EditablePasteResult[] = [];
  const { container } = render(
    <EditorRoot editor={editor}>
      <EditorContent
        onPasteResult={(result) => {
          results.push(result);
        }}
      />
    </EditorRoot>
  );
  const editable = container.querySelector<HTMLElement>(
    '[data-editor="true"]'
  )!;
  const clipboardData = {
    files: [],
    getData: (format: string) => (format === 'text/plain' ? 'pasted' : ''),
    types: ['text/plain'],
  };

  act(() => {
    editor.update.selection.set({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });
  await act(async () => {
    fireEvent.paste(editable, { clipboardData });
  });

  expect(editor.read.text.string([])).toBe('pasted');
  expect(results).toEqual([
    {
      diagnostics: [
        { impact: 'lossy', message: 'Left out an embedded chart.' },
      ],
      inserted: true,
    },
  ]);
});

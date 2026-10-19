import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { SelectionApi } from '../core';
import { BaseLinkPlugin } from '../features/link';
import { MarkdownPlugin } from '../markdown';
import { TestPlate as EditorRoot } from './__tests__/TestPlate';
import { EditorContent } from './components/PlateContent';
import { createEditor } from './editor';

describe('Markdown paste result', () => {
  it('reports a removed script destination once, after inserting its label', async () => {
    const editor = createEditor({
      plugins: [BaseLinkPlugin, MarkdownPlugin],
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      }),
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const results: unknown[] = [];
    const { getByRole } = render(
      <EditorRoot editor={editor}>
        <EditorContent onPasteResult={(result) => results.push(result)} />
      </EditorRoot>
    );
    const editable = getByRole('textbox');
    const data = new DataTransfer();

    Object.defineProperty(editable, 'isContentEditable', {
      configurable: true,
      value: true,
    });
    data.setData('text/markdown', '[label](javascript:alert(1))');
    data.setData('text/plain', '[label](javascript:alert(1))');
    let pasteNotCanceled = true;

    await act(async () => {
      pasteNotCanceled = fireEvent.paste(editable, { clipboardData: data });
    });
    // Browsers send beforeinput only after a paste that was not canceled.
    if (pasteNotCanceled) {
      const beforeInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertFromPaste',
      });

      Object.defineProperty(beforeInput, 'dataTransfer', { value: data });
      await act(async () => {
        editable.dispatchEvent(beforeInput);
      });
    }

    expect(editor.read.text.string([])).toBe('label');
    expect(results).toEqual([
      {
        diagnostics: [
          {
            impact: 'lossless',
            message:
              'Markdown link destination is not safe to open and was removed; its label was kept.',
          },
        ],
        inserted: true,
      },
    ]);
  });
});

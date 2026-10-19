import { expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';

import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { SelectionApi } from '../../../../../../packages/platejs/src/core';
import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link/lib/BaseLinkPlugin';
import { TestPlate as EditorRoot } from '../../../../../../packages/platejs/src/react/__tests__/TestPlate';
import { EditorContent } from '../../../../../../packages/platejs/src/react/components/PlateContent';
import { createEditor } from '../../../../../../packages/platejs/src/react/editor';

// A mounted HTML paste delivers the HTML format's reports through onPasteResult.
const paste = async (html: string) => {
  const editor = createEditor({
    plugins: [BaseLinkPlugin],
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
  });
  const results: unknown[] = [];
  const { getByRole, unmount } = render(
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
  data.setData('text/html', html);
  let pasteNotCanceled = true;

  await act(async () => {
    pasteNotCanceled = fireEvent.paste(editable, { clipboardData: data });
  });
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
  const text = editor.read.text.string([]);

  unmount();

  return { results, text };
};

test('mounted HTML paste reports reach onPasteResult', async () => {
  const unsafeHref = await paste(
    '<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>'
  );
  const droppedImage = await paste(
    '<p>Keep</p><img src="https://example.com/a.png">'
  );

  writeFileSync(
    `${import.meta.dir}/paste-result.json`,
    `${JSON.stringify({ droppedImage, unsafeHref }, null, 2)}\n`
  );
  expect(unsafeHref).toEqual({
    results: [
      {
        diagnostics: [
          {
            impact: 'lossless',
            message: 'Removed unsafe HTML attribute "href" from <a>.',
          },
        ],
        inserted: true,
      },
    ],
    text: 'Before LABEL After',
  });
  expect(droppedImage).toEqual({
    results: [
      {
        diagnostics: [
          {
            impact: 'lossy',
            message: 'Plate HTML decode has no mapping for <img>.',
          },
        ],
        inserted: true,
      },
    ],
    text: 'Keep',
  });
});

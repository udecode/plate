import type { Locator } from '@playwright/test';
import { act, render } from '@testing-library/react';
import { createEditor, installBrowserHandle } from 'platejs/react';
import React from 'react';

import { insertDataThroughHandle } from '../../src/playwright/clipboard';
import { EditorTest } from '../../src/react';

installBrowserHandle();

const copyFragment = (text: string) => {
  const source = createEditor({
    initialSelection: {
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: text.length, path: [0, 0] },
    },
    initialValue: [{ children: [{ text }], type: 'paragraph' }],
  });
  const records = new Map<string, string>();

  source.api.dom.clipboard.writeSelection({
    getData: (format) => records.get(format) ?? '',
    setData: (format, value) => {
      records.set(format, value);
    },
  });

  return records.get('application/x-editor-fragment') ?? null;
};

describe('handle clipboard transport', () => {
  it('pastes the editor fragment instead of its HTML and text', async () => {
    const fragment = copyFragment('from fragment');
    const editor = createEditor({
      initialSelection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 'target'.length, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'target' }], type: 'paragraph' }],
    });

    let rendered!: ReturnType<typeof render>;

    await act(async () => {
      rendered = render(<EditorTest editor={editor} suppressInstanceWarning />);
    });

    const root = rendered.container.querySelector('[contenteditable="true"]');
    const locator = {
      evaluate: async <Arg,>(
        callback: (element: Element, arg: Arg) => unknown,
        arg: Arg
      ) => callback(root!, arg),
    } as unknown as Locator;

    expect(fragment).not.toBeNull();

    await act(async () => {
      await insertDataThroughHandle(locator, {
        fragment,
        html: '<p>from html</p>',
        text: 'from text',
      });
    });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'from fragment' }], type: 'paragraph' },
    ]);
  });
});

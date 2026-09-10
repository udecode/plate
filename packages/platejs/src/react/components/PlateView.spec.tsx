import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { createEditor, defineBasePlugin, property } from '../../core';
import { createDataTransfer } from '../../testing';
import { PlateView } from './PlateView';

describe('PlateView clipboard document', () => {
  afterEach(() => {
    cleanup();
    window.getSelection()?.removeAllRanges();
  });

  it.each([false, true])(
    'copies displayed text and marks with explicit value=%s',
    (controlled) => {
      const editor = createEditor({
        initialValue: [
          { type: 'paragraph', children: [{ text: 'canonical' }] },
        ],
        plugins: [
          defineBasePlugin('bold', { schema: { mark: property.boolean() } }),
        ],
      });
      const value = {
        children: [
          { type: 'paragraph', children: [{ text: 'draft', bold: true }] },
        ],
      };
      const before = editor.read.value();
      const commits = mock();
      const unsubscribe = editor.subscribe(commits);
      const view = render(
        <PlateView editor={editor} value={controlled ? value : undefined} />
      );
      const text = view.container.querySelector(
        '[data-plite-string]'
      )!.firstChild!;
      const range = document.createRange();
      range.selectNodeContents(text);
      window.getSelection()!.addRange(range);
      const data = createDataTransfer();
      fireEvent.copy(
        view.container.querySelector('[data-plite-node="value"]')!,
        { clipboardData: data }
      );
      const payload = JSON.parse(
        decodeURIComponent(atob(data.getData('application/x-plite-fragment')))
      );
      expect(data.getData('text/plain')).toBe(
        controlled ? 'draft' : 'canonical'
      );
      expect(payload.slice.content).toEqual(
        controlled ? value.children : before.children
      );
      expect(editor.read.value()).toEqual(before);
      expect(commits).not.toHaveBeenCalled();
      unsubscribe();
    }
  );

  it('preserves an explicit custom clipboard handler', () => {
    const editor = createEditor();
    const view = render(
      <PlateView
        editor={editor}
        onCopy={(event) => {
          event.clipboardData.setData('text/plain', 'custom');
          event.preventDefault();
        }}
      />
    );
    const data = createDataTransfer();
    fireEvent.copy(view.container.querySelector('[data-plite-node="value"]')!, {
      clipboardData: data,
    });
    expect(data.getData('text/plain')).toBe('custom');
    expect(data.getData('application/x-plite-fragment')).toBe('');
  });
});

import { expect, test } from 'bun:test';

import { act, render } from '@testing-library/react';
import React from 'react';

import { createEditor, Plate } from '../../react/core';
import { DndPlugin } from './DndPlugin';
import { useDndPlugin } from './useDndPlugin';

function Cleanup({ element }: { element: HTMLElement | null }) {
  useDndPlugin(element);
  return null;
}

test('each mounted view listens on its supplied document and removes only its own handlers', () => {
  const first = createEditor({ plugins: [DndPlugin] });
  const second = createEditor({ plugins: [DndPlugin] });
  const iframe = document.createElement('iframe');
  document.body.append(iframe);
  const foreignDocument = iframe.contentDocument;
  if (!foreignDocument) throw new Error('Expected iframe document');
  const foreignElement = foreignDocument.createElement('div');
  foreignDocument.body.append(foreignElement);
  const firstElement = document.createElement('div');
  document.body.append(firstElement);
  const one = render(
    <Plate editor={first}>
      <Cleanup element={firstElement} />
    </Plate>
  );
  const two = render(
    <Plate editor={second}>
      <Cleanup element={foreignElement} />
    </Plate>
  );
  try {
    act(() => {
      first.plugin(DndPlugin).store.set({ _isOver: true });
      second.plugin(DndPlugin).store.set({ _isOver: true });
      document.dispatchEvent(new Event('drop'));
    });
    expect(first.plugin(DndPlugin).store.get('_isOver')).toBe(false);
    expect(second.plugin(DndPlugin).store.get('_isOver')).toBe(true);
    act(() => {
      foreignDocument.dispatchEvent(new Event('drop'));
    });
    expect(second.plugin(DndPlugin).store.get('_isOver')).toBe(false);
    one.rerender(
      <Plate editor={first}>
        <Cleanup element={null} />
      </Plate>
    );
    act(() => {
      first.plugin(DndPlugin).store.set({ _isOver: true });
      document.dispatchEvent(new Event('drop'));
    });
    expect(first.plugin(DndPlugin).store.get('_isOver')).toBe(true);
    act(() => {
      second.plugin(DndPlugin).store.set({ _isOver: true });
      foreignDocument.dispatchEvent(new Event('drop'));
    });
    expect(second.plugin(DndPlugin).store.get('_isOver')).toBe(false);
  } finally {
    one.unmount();
    two.unmount();
    iframe.remove();
    firstElement.remove();
  }
});

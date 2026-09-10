import { TooltipProvider } from '@radix-ui/react-tooltip';
import { act, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { findDOMRootRuntime } from '../../../../../packages/plitejs/src/dom/internal';
import { basicBlocksValue } from './values/basic-blocks-value';
import { basicMarksValue } from './values/basic-marks-value';
import { imageValue } from './values/media-value';

Object.assign(globalThis, { React });

it('/blocks/multiple-editors-demo binds each independent editor to its complete document and isolates editing and undo', async () => {
  window.location.href = 'http://localhost:3297/blocks/multiple-editors-demo';
  const { default: MultipleEditorsDemo } =
    await import('./multiple-editors-demo');
  const view = render(
    <TooltipProvider>
      <MultipleEditorsDemo />
    </TooltipProvider>
  );
  const roots = view.getAllByRole('textbox');
  expect(roots).toHaveLength(3);
  const editors = roots.map((root) => findDOMRootRuntime(root)!.editor);
  const values = [basicBlocksValue, basicMarksValue, imageValue.children];
  expect(new Set(editors).size).toBe(3);
  const initial = editors.map((editor) => editor.read.children());
  for (const [index, editor] of editors.entries()) {
    expect(initial[index]).toEqual(values[index]);
    expect(roots[index].textContent).toContain(editor.read.text.string([0]));
    act(() => {
      roots[index].focus();
      editor.update.selection.set({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      editor.update.text.insert(`isolated-${index}`);
    });
    expect(editor.read.text.string([0])).toContain(`isolated-${index}`);
    await waitFor(() =>
      expect(roots[index].textContent).toContain(`isolated-${index}`)
    );
    expect(document.activeElement).toBe(roots[index]);
    for (const [otherIndex, other] of editors.entries()) {
      if (otherIndex === index) continue;
      expect(other.read.children()).toEqual(initial[otherIndex]);
      expect(roots[otherIndex].textContent).not.toContain(`isolated-${index}`);
    }
    act(() => {
      editor.update.history.undo();
    });
    expect(editor.read.children()).toEqual(initial[index]);
    await waitFor(() =>
      expect(roots[index].textContent).not.toContain(`isolated-${index}`)
    );
    expect(document.activeElement).toBe(roots[index]);
  }
});

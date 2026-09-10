import { fireEvent, render } from '@testing-library/react';
import { defineEditorSchema, schema } from 'plitejs';
import * as React from 'react';

import { createEditor, Editable, Plite } from '../../src/react';

const drawingSchema = defineEditorSchema('schema:void-interactive-mouse', {
  elements: { drawing: { void: 'block' } },
  id: 'void-interactive-mouse',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

it('lets canvas controls receive their first mouse gesture without selecting the void', () => {
  const editor = createEditor({
    initialValue: { children: [{ type: 'drawing', children: [{ text: '' }] }] },
  });
  editor.install(drawingSchema);
  const view = render(
    <Plite editor={editor}>
      <Editable
        renderElement={({ attributes, children }) => (
          <div {...attributes}>
            <div contentEditable={false} data-plite-root-chrome-ignore="true">
              <label>
                <input type="radio" aria-label="Rectangle" />
                <span>Rectangle tool</span>
              </label>
              <canvas data-testid="canvas" />
            </div>
            <button type="button">Drawing settings</button>
            <span data-testid="void-surface">Drawing surface</span>
            {children}
          </div>
        )}
      />
    </Plite>
  );
  for (const target of [
    view.getByText('Rectangle tool'),
    view.getByTestId('canvas'),
    view.getByRole('button', { name: 'Drawing settings' }),
  ]) {
    expect(fireEvent.mouseDown(target)).toBe(true);
    fireEvent.mouseUp(target);
    fireEvent.click(target);
    expect(editor.read.selection()).toBeNull();
  }
  expect(fireEvent.mouseDown(view.getByTestId('void-surface'))).toBe(false);
  expect(editor.read.selection()).not.toBeNull();
  view.unmount();
});

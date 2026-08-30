import { afterAll, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import type { CodeDrawingElement } from 'platejs/code-drawing';
import * as React from 'react';

mock.module('platejs/static', () => ({
  PliteElement: ({ children }: React.ComponentProps<'div'>) => (
    <div>{children}</div>
  ),
}));
mock.module('platejs/code-drawing', () => ({
  BaseCodeDrawingPlugin: {
    configure: mock(() => ({ name: 'codeDrawing' })),
    name: 'codeDrawing',
  },
}));

describe('CodeDrawingElementStatic', () => {
  afterAll(() => {
    mock.restore();
  });

  it('preserves authored source in preview-only output', async () => {
    const { CodeDrawingElementStatic } = await import(
      `./code-drawing-static?test=${Math.random().toString(36).slice(2)}`
    );
    const element = {
      children: [{ text: '' }],
      code: 'graph TD; A-->B',
      language: 'mermaid',
      type: 'codeDrawing',
      view: 'preview',
    } satisfies CodeDrawingElement;
    const view = render(
      <CodeDrawingElementStatic attributes={{}} element={element}>
        {null}
      </CodeDrawingElementStatic>
    );

    expect(view.getByText('graph TD; A-->B')).toBeTruthy();
    expect(view.queryByText('Mermaid')).toBeNull();
  });
});

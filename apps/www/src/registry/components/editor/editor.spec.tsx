import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const PlateContainerMock = mock(({ children, className }: any) => (
  <div className={className} data-testid="plate-container">
    {children}
  </div>
));

const PlateContentMock = mock(({ className }: any) => (
  <div className={className} data-testid="plate-content" />
));

const PlateViewMock = mock(({ className }: any) => (
  <div className={className} data-testid="plate-view" />
));

const PlateStaticMock = mock(({ className }: any) => (
  <div className={className} data-testid="plate-static" />
));

mock.module('platejs/react', () => ({
  PlateContainer: PlateContainerMock,
  PlateContent: PlateContentMock,
  PlateView: PlateViewMock,
}));

mock.module('platejs/static', () => ({
  PlateStatic: PlateStaticMock,
}));

describe('editor whitespace wrapping', () => {
  beforeEach(() => {
    PlateContainerMock.mockClear();
    PlateContentMock.mockClear();
    PlateViewMock.mockClear();
    PlateStaticMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('wraps preserved spaces in editable editor surfaces', async () => {
    const { Editor, EditorView } = await import(
      `./editor?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <>
        <Editor />
        <EditorView />
      </>
    );

    for (const editor of [
      view.getByTestId('plate-content'),
      view.getByTestId('plate-view'),
    ]) {
      expect(editor.className).toContain('whitespace-break-spaces');
      expect(editor.className).not.toContain('whitespace-pre-wrap');
    }
  });

  it('wraps preserved spaces in static editor surfaces', async () => {
    const { EditorStatic } = await import(
      `./editor-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(<EditorStatic />);
    const editor = view.getByTestId('plate-static');

    expect(editor.className).toContain('whitespace-break-spaces');
    expect(editor.className).not.toContain('whitespace-pre-wrap');
  });
});

import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

const setOpen = mock();
const useEditorMock = mock();
const usePluginStoreMock = mock();
const buttonUi = await import('@/components/ui/button');
const utils = await import('@/lib/utils');
const plateReact = await import('platejs/react');

mock.module('platejs/react', () => ({
  ...plateReact,
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  useEditor: () => useEditorMock(),
  useEditorPlugin: () => ({ api: { setOpen } }),
  usePluginStore: () => usePluginStoreMock(),
}));

mock.module('@/components/ui/button', () => ({
  ...buttonUi,
  Button: ({
    children,
    size: _,
    variant: __,
    ...props
  }: React.ComponentProps<'button'> & { size?: string; variant?: string }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

mock.module('@/lib/utils', () => ({
  ...utils,
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('Details registry components', () => {
  beforeEach(() => {
    setOpen.mockReset();
    useEditorMock.mockReset();
    useEditorMock.mockReturnValue({ key: () => 'details-key' });
    usePluginStoreMock.mockReset();
    usePluginStoreMock.mockReturnValue(new Set());
  });

  afterAll(() => {
    mock.restore();
  });

  it('owns the collapsed body through a content boundary', async () => {
    const contentBoundary = mock((_options: unknown) => (
      <p data-testid="details-body">Body</p>
    ));
    const children = mock((_options: unknown) => <summary>Summary</summary>);
    const { DetailsElement } = await import(
      `./details?boundary=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <DetailsElement
        element={{
          children: [
            { children: [{ text: 'Summary' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        }}
        slots={{ children, contentBoundary } as any}
      />
    );

    expect(children).toHaveBeenCalledWith({ from: 0, to: 0 });
    expect(contentBoundary).toHaveBeenCalledWith({
      copyPolicy: 'model',
      mounted: false,
      onMaterialize: expect.any(Function),
      reason: 'app-collapse',
      renderPlaceholder: expect.any(Function),
      scope: { from: 1, to: 1, type: 'children' },
      selectionPolicy: 'skip',
    });

    fireEvent.click(view.getByRole('button', { name: 'Expand details' }));
    expect(setOpen).toHaveBeenCalledWith('details-key', true);

    const boundaryOptions = contentBoundary.mock.calls[0][0] as {
      onMaterialize: () => void;
    };

    boundaryOptions.onMaterialize();
    expect(setOpen).toHaveBeenLastCalledWith('details-key', true);
  });

  it('renders native Details and Summary tags without browser state', async () => {
    const { DetailsElementStatic, DetailsSummaryElementStatic } = await import(
      `./details-static?native=${Math.random().toString(36).slice(2)}`
    );
    const summary = ReactDOMServer.renderToStaticMarkup(
      <DetailsSummaryElementStatic attributes={{}}>
        Summary
      </DetailsSummaryElementStatic>
    );
    const details = ReactDOMServer.renderToStaticMarkup(
      <DetailsElementStatic
        attributes={{}}
        element={{
          children: [
            { children: [{ text: 'Summary' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        }}
        slots={
          {
            children: ({ from }: { from: number }) =>
              from === 0 ? <summary>Summary</summary> : <p>Body</p>,
          } as any
        }
      />
    );

    expect(summary.startsWith('<summary')).toBe(true);
    expect(summary.endsWith('>Summary</summary>')).toBe(true);
    expect(details.startsWith('<details')).toBe(true);
    expect(details).toContain('<summary>Summary</summary><p>Body</p>');
    expect(details).not.toContain(' open');
    expect(details).not.toContain(' name=');
  });
});

import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useMediaStateMock = mock();

mock.module('@platejs/media/react', () => ({
  useMediaState: (...args: any[]) => useMediaStateMock(...args),
}));

mock.module('@platejs/resizable', () => ({
  ResizableProvider: ({ children }: any) => <>{children}</>,
}));

mock.module('platejs/react', () => ({
  PlateElement: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div className={className} data-testid="plate-element" {...props}>
      {children}
    </div>
  ),
  useReadOnly: () => false,
  withHOC: (_Provider: any, Component: any) => Component,
}));

mock.module('platejs/static', () => ({
  SlateElement: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div className={className} data-testid="slate-element" {...props}>
      {children}
    </div>
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./caption', () => ({
  Caption: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="caption">{children}</div>
  ),
  CaptionTextarea: () => <div data-testid="caption-textarea" />,
}));

afterAll(() => {
  mock.restore();
});

describe('FileElement', () => {
  beforeEach(() => {
    useMediaStateMock.mockReset();
    useMediaStateMock.mockReturnValue({
      name: 'report.pdf',
      unsafeUrl: 'https://cdn.example.com/report.pdf',
    });
  });

  it('renders without requiring suggestion plugin data', async () => {
    const { FileElement } = await import(
      `./media-file-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElement
        attributes={{}}
        editor={{}}
        element={{ children: [{ text: '' }], type: 'file' } as any}
      >
        {null}
      </FileElement>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'https://cdn.example.com/report.pdf'
    );
    expect(view.container.textContent).toContain('report.pdf');
  });

  it('omits unsafe file URLs', async () => {
    useMediaStateMock.mockReturnValue({
      name: 'report.pdf',
      unsafeUrl: 'javascript:alert(document.domain)',
    });

    const { FileElement } = await import(
      `./media-file-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElement
        attributes={{}}
        editor={{}}
        element={{ children: [{ text: '' }], type: 'file' } as any}
      >
        {null}
      </FileElement>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBeNull();
  });

  it('keeps relative file URLs', async () => {
    useMediaStateMock.mockReturnValue({
      name: 'report.pdf',
      unsafeUrl: 'files/report.pdf',
    });

    const { FileElement } = await import(
      `./media-file-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElement
        attributes={{}}
        editor={{}}
        element={{ children: [{ text: '' }], type: 'file' } as any}
      >
        {null}
      </FileElement>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'files/report.pdf'
    );
  });

  it('keeps blob file URLs', async () => {
    useMediaStateMock.mockReturnValue({
      name: 'report.pdf',
      unsafeUrl: 'blob:https://example.com/file-id',
    });

    const { FileElement } = await import(
      `./media-file-node?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElement
        attributes={{}}
        editor={{}}
        element={{ children: [{ text: '' }], type: 'file' } as any}
      >
        {null}
      </FileElement>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'blob:https://example.com/file-id'
    );
  });
});

describe('FileElementStatic', () => {
  it('omits unsafe file URLs', async () => {
    const { FileElementStatic } = await import(
      `./media-file-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElementStatic
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            name: 'report.pdf',
            type: 'file',
            url: 'javascript:alert(document.domain)',
          } as any
        }
      >
        {null}
      </FileElementStatic>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBeNull();
  });

  it('keeps relative file URLs', async () => {
    const { FileElementStatic } = await import(
      `./media-file-node-static?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElementStatic
        attributes={{}}
        editor={{}}
        element={
          {
            children: [{ text: '' }],
            name: 'report.pdf',
            type: 'file',
            url: 'files/report.pdf',
          } as any
        }
      >
        {null}
      </FileElementStatic>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'files/report.pdf'
    );
  });
});

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

describe('FileElement', () => {
  beforeEach(() => {
    useMediaStateMock.mockReset();
    useMediaStateMock.mockReturnValue({
      name: 'report.pdf',
      unsafeUrl: 'https://cdn.example.com/report.pdf',
    });
  });

  afterAll(() => {
    mock.restore();
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
});

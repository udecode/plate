import * as React from 'react';

import * as actualResizable from '@platejs/resizable';
import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useMediaStateMock = mock();

mock.module('@platejs/media/react', () => ({
  useMediaState: (...args: any[]) => useMediaStateMock(...args),
}));

mock.module('@platejs/resizable', () => ({
  ...actualResizable,
  useResizableValue: () => '100%',
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
  useEditor: () => ({
    read: { selection: () => null },
  }),
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector({
      read: { selection: () => null },
    }),
  useElement: () => ({ children: [{ text: '' }], type: 'file' }),
  useEditorMounted: () => true,
  useEditorReadOnly: () => false,
  withHOC: (_Provider: any, Component: any) => Component,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./resize-handle', () => ({
  withResizableProvider: (Component: React.ComponentType) => Component,
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
        editor={{ read: { selection: () => null } } as any}
        element={
          {
            children: [{ text: 'Quarterly report' }],
            type: 'file',
          } as any
        }
        path={[0]}
        slots={
          {
            contentBoundary: () => <div data-testid="caption-boundary" />,
          } as any
        }
      >
        <span data-testid="caption-content">Quarterly report</span>
      </FileElement>
    );

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'https://cdn.example.com/report.pdf'
    );
    expect(view.container.textContent).toContain('report.pdf');
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(
      view.getByTestId('caption-content').closest('figcaption')
    ).toBeTruthy();
  });
});

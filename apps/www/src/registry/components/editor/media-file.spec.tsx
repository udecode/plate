import { afterAll, describe, expect, it, mock } from 'bun:test';

import { render } from '@testing-library/react';
import * as React from 'react';

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
  useElementSelected: () => false,
  usePath: () => [0],
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('FileElement', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders without requiring suggestion plugin data', async () => {
    const { FileElement } = await import(
      `./media-file?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <FileElement
        attributes={{}}
        editor={{ read: { selection: () => null } } as any}
        element={
          {
            children: [{ text: 'Quarterly report' }],
            name: 'report.pdf',
            type: 'file',
            url: 'https://cdn.example.com/report.pdf',
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

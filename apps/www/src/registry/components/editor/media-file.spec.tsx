import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

const readOnlyMock = mock(() => false);

mock.module('platejs/react', () => ({
  EditorElement: ({
    children,
    className,
    ...props
  }: React.ComponentProps<'div'>) => (
    <div className={className} data-testid="plate-element" {...props}>
      {children}
    </div>
  ),
  useEditor: () => ({
    read: Object.assign(() => undefined, {
      nodes: { get: () => undefined },
      selection: Object.assign(() => null, { nodes: () => [] }),
    }),
  }),
  useEditorFocused: () => false,
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector({
      read: {
        nodes: { get: () => undefined },
        selection: Object.assign(() => null, { nodes: () => [] }),
      },
    }),
  useElement: () => ({ children: [{ text: '' }], type: 'file' }),
  useEditorMounted: () => true,
  useEditorReadOnly: () => readOnlyMock(),
  useElementSelected: () => false,
  usePath: () => [0],
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('./media-toolbar', () => ({
  MediaToolbar: ({ children }: React.PropsWithChildren) => children,
}));

describe('FileElement', () => {
  beforeEach(() => {
    readOnlyMock.mockReset();
    readOnlyMock.mockReturnValue(false);
  });

  afterAll(() => {
    mock.restore();
  });

  const renderFile = async () => {
    const { FileElement } = await import(
      `./media-file?test=${Math.random().toString(36).slice(2)}`
    );

    return render(
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
  };

  it('renders without requiring suggestion plugin data', async () => {
    const view = await renderFile();

    expect(view.container.querySelector('a')?.getAttribute('href')).toBe(
      'https://cdn.example.com/report.pdf'
    );
    expect(view.container.textContent).toContain('report.pdf');
    expect(view.getAllByTestId('caption-content')).toHaveLength(1);
    expect(
      view.getByTestId('caption-content').closest('figcaption')
    ).toBeTruthy();
  });

  it('lets a read-only click follow the file link', async () => {
    readOnlyMock.mockReturnValue(true);

    const view = await renderFile();

    expect(fireEvent.click(view.container.querySelector('a')!)).toBe(true);
  });
});

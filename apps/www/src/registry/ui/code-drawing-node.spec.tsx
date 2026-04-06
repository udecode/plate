import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';

mock.module('@platejs/code-drawing', () => ({
  CODE_DRAWING_TYPE_ARRAY: ['Mermaid'],
  DEFAULT_MIN_HEIGHT: 300,
  DOWNLOAD_FILENAME: 'drawing',
  RENDER_DEBOUNCE_DELAY: 0,
  VIEW_MODE: { Both: 'Both', Code: 'Code' },
  VIEW_MODE_ARRAY: ['Both', 'Code'],
  downloadImage: () => {},
  renderCodeDrawing: async () => '',
}));

mock.module('platejs/react', () => ({
  PlateElement: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  useEditorRef: () => ({
    api: { findPath: () => [0] },
    tf: { removeNodes: () => {}, setNodes: () => {} },
  }),
  useEditorSelector: () => true,
  useElement: () => ({
    data: {
      code: 'graph TD; A-->B',
      drawingMode: 'Both',
      drawingType: 'Mermaid',
    },
  }),
  useFocusedLast: () => false,
  useReadOnly: () => false,
  useSelected: () => false,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverAnchor: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

mock.module('@/components/ui/select', () => ({
  Select: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectTrigger: ({ children }: React.PropsWithChildren) => (
    <button>{children}</button>
  ),
  SelectValue: () => <span />,
}));

mock.module('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@/registry/ui/suggestion-node', () => ({
  getElementSuggestionData: () => {},
  voidRemoveSuggestionClass: 'void-remove-suggestion',
}));

mock.module('lucide-react', () => ({
  DownloadIcon: (props: React.ComponentProps<'svg'>) => <svg {...props} />,
  Trash2: (props: React.ComponentProps<'svg'>) => <svg {...props} />,
}));

import { CodeDrawingElement } from './code-drawing-node';

describe('CodeDrawingElement', () => {
  afterAll(() => {
    mock.restore();
  });

  it('renders children so block-selection overlays can mount', () => {
    const { container } = render(
      React.createElement(
        CodeDrawingElement as any,
        {
          attributes: { 'data-slate-node': 'element', ref: null },
          editor: {},
          element: {
            data: {
              code: 'graph TD; A-->B',
              drawingMode: 'Both',
              drawingType: 'Mermaid',
            },
          },
        },
        <div data-testid="overlay-child" />
      )
    );

    expect(
      container.querySelector('[data-testid="overlay-child"]')
    ).toBeTruthy();
  });
});

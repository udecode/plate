import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

const PlateElementMock = mock(
  ({ children, as: Comp = 'div', attributes, className, ...props }: any) => (
    <Comp {...attributes} {...props} className={className}>
      {children}
    </Comp>
  )
);

const ButtonMock = mock(({ children, className, ...props }: any) => (
  <button type="button" {...props} className={className}>
    {children}
  </button>
));

const flashTargetMock = mock();
const headingElement = document.createElement('h2');
const headings = [
  { depth: 1, key: 'intro', title: 'Intro', type: 'h1' },
  { depth: 2, key: 'benefits', title: 'Benefits', type: 'h2' },
];
const useEditorSelectorMock = mock(
  (
    selector: (currentEditor: typeof editor) => unknown,
    _options?: {
      equalityFn?: (
        previous: typeof headings | null,
        next: typeof headings
      ) => boolean;
      shouldUpdate?: (change?: {
        changed: { hasAny: (kind: string) => boolean };
      }) => boolean;
    }
  ) => selector(editor)
);
const editor = {
  api: { dom: { resolveDOMNode: () => headingElement } },
  plugin: () => ({ read: { headings: () => headings } }),
  read: {
    nodes: {
      get: () => [{ children: [{ text: '' }], type: 'heading' }, [0]],
      path: () => [0],
    },
  },
};

class IntersectionObserverMock {
  disconnect() {}
  observe() {}
}

globalThis.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

mock.module('platejs/react', () => ({
  TocPlugin: {
    configure: mock(() => ({ name: 'toc' })),
    name: 'toc',
  },
  PlateElement: PlateElementMock,
  NavigationFeedbackPlugin: {},
  useEditor: () => editor,
  useEditorPlugin: () => ({ update: { flashTarget: flashTargetMock } }),
  useEditorScrollElement: () => null,
  useEditorSelector: useEditorSelectorMock,
  usePluginStore: (_plugin: unknown, key: string) =>
    key === 'isScroll' ? false : 0,
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

describe('toc node rendering', () => {
  beforeEach(() => {
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    flashTargetMock.mockReset();
    useEditorSelectorMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('marks only the active heading row as current', async () => {
    const { TocElement } = await import(
      `./toc?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <TocElement attributes={{}} element={{ children: [{ text: '' }] } as any}>
        <span />
      </TocElement>
    );

    const intro = view.getByRole('button', { name: 'Intro' });
    const benefits = view.getByRole('button', { name: 'Benefits' });

    expect(intro.getAttribute('aria-current')).toBeNull();
    expect(benefits.getAttribute('aria-current')).toBeNull();

    fireEvent.click(benefits);

    expect(benefits.getAttribute('aria-current')).toBe('location');
    expect(view.container.querySelectorAll('[aria-current]').length).toBe(1);
    expect(flashTargetMock).toHaveBeenCalledWith({
      target: { path: [0], type: 'node' },
    });
  });

  it('ignores selection commits and equal heading snapshots', async () => {
    const { TocElement } = await import(
      `./toc?test=${Math.random().toString(36).slice(2)}`
    );

    render(
      <TocElement attributes={{}} element={{ children: [{ text: '' }] } as any}>
        <span />
      </TocElement>
    );

    const options = useEditorSelectorMock.mock.calls[0]?.[1];

    expect(options?.shouldUpdate?.()).toBe(true);
    expect(options?.shouldUpdate?.({ changed: { hasAny: () => false } })).toBe(
      false
    );
    expect(
      options?.shouldUpdate?.({
        changed: { hasAny: (kind) => kind === 'document' },
      })
    ).toBe(true);
    expect(options?.equalityFn?.(null, headings)).toBe(false);
    expect(options?.equalityFn?.([...headings], [...headings])).toBe(true);
    expect(
      options?.equalityFn?.(
        headings.map((heading, index) =>
          index === 0 ? { ...heading, title: 'Changed' } : heading
        ),
        headings
      )
    ).toBe(false);
  });
});

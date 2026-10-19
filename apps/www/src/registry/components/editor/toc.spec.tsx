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
const scrollIntoViewMock = mock();
const headingElement = document.createElement('h2');
const introElement = document.createElement('h1');
let domElements: Record<string, HTMLElement> = {
  intro: introElement,
  benefits: headingElement,
};
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
  api: {
    dom: {
      resolveDOMNode: (node: { key: string }) => domElements[node.key],
      scrollIntoView: scrollIntoViewMock,
    },
  },
  plugin: () => ({
    api: { flashTarget: flashTargetMock },
    read: { headings: () => headings },
  }),
  read: {
    nodes: {
      get: (key: string) => [
        { key, children: [{ text: '' }], type: 'heading' },
        [0],
      ],
      path: () => [0],
    },
  },
};

mock.module('platejs/react', () => ({
  TocPlugin: {
    configure: mock(() => ({ name: 'toc' })),
    name: 'toc',
  },
  EditorElement: PlateElementMock,
  NavigationFeedbackPlugin: {},
  useEditor: () => editor,
  useEditorSelector: useEditorSelectorMock,
  useElementSelected: () => false,
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

const tocProps = {
  attributes: { 'data-editor-node': 'element' },
  element: { children: [{ text: '' }], type: 'toc' },
} as unknown as React.ComponentProps<typeof import('./toc').TocElement>;

describe('toc node rendering', () => {
  beforeEach(() => {
    domElements = { intro: introElement, benefits: headingElement };
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    flashTargetMock.mockReset();
    scrollIntoViewMock.mockReset();
    headingElement.style.scrollMarginTop = '';
    useEditorSelectorMock.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('scrolls to and flashes the clicked heading', async () => {
    const { TocElement } = await import(
      `./toc?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <TocElement {...tocProps}>
        <span />
      </TocElement>
    );

    fireEvent.click(view.getByRole('button', { name: 'Benefits' }));

    expect(flashTargetMock).toHaveBeenCalledWith({
      key: 'benefits',
      attributes: { className: 'rounded-md bg-(--color-highlight)' },
    });
    expect(scrollIntoViewMock).toHaveBeenCalledWith([0], {
      behavior: 'smooth',
      block: 'start',
      scrollMode: 'always',
    });
    expect(headingElement.style.scrollMarginTop).toBe('80px');
  });

  it('ignores selection commits and equal heading snapshots', async () => {
    const { TocElement } = await import(
      `./toc?test=${Math.random().toString(36).slice(2)}`
    );

    render(
      <TocElement {...tocProps}>
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
  it('configures scrolling on the copied view', async () => {
    const { TocElement } = await import('./toc');
    const view = render(
      <TocElement {...tocProps} isScroll={false} topOffset={120}>
        <span />
      </TocElement>
    );
    fireEvent.click(view.getByRole('button', { name: 'Benefits' }));
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
    expect(headingElement.style.scrollMarginTop).toBe('120px');
    expect(flashTargetMock).toHaveBeenCalledTimes(1);
  });
});

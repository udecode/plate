import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render } from '@testing-library/react';
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
let observers: IntersectionObserverMock[] = [];
const originalObserver = window.IntersectionObserver;
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
  plugin: () => ({ read: { headings: () => headings } }),
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

class IntersectionObserverMock {
  callback: (
    entries: Array<{ target: Element; isIntersecting: boolean }>
  ) => void;
  constructor(callback: IntersectionObserverMock['callback']) {
    this.callback = callback;
    observers.push(this);
  }
  disconnect = mock();
  observe = mock();
  unobserve = mock();
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
  useEditorPlugin: () => ({ api: { flashTarget: flashTargetMock } }),
  useEditorScrollElement: () => null,
  useEditorRootElement: () => headingElement,
  useEditorSelector: useEditorSelectorMock,
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

const tocProps = {
  attributes: { 'data-plite-node': 'element' },
  element: { children: [{ text: '' }], type: 'toc' },
} as unknown as React.ComponentProps<typeof import('./toc').TocElement>;

describe('toc node rendering', () => {
  beforeEach(() => {
    observers = [];
    domElements = { intro: introElement, benefits: headingElement };
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    flashTargetMock.mockReset();
    scrollIntoViewMock.mockReset();
    headingElement.style.scrollMarginTop = '';
    useEditorSelectorMock.mockClear();
  });

  afterAll(() => {
    window.IntersectionObserver = originalObserver;
    mock.restore();
  });

  it('marks only the active heading row as current', async () => {
    const { TocElement } = await import(
      `./toc?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(
      <TocElement {...tocProps}>
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
  it('keeps one observer across scrolling and replaces only a remounted heading', async () => {
    const { TocElement } = await import('./toc');
    const view = render(
      <TocElement {...tocProps}>
        <span />
      </TocElement>
    );
    expect(observers.length).toBe(1);
    const observer = observers[0];
    expect(observer.observe).toHaveBeenCalledTimes(2);
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    expect(observers.length).toBe(1);
    expect(observer.observe).toHaveBeenCalledTimes(2);
    const replacement = document.createElement('h1');
    domElements.intro = replacement;
    fireEvent.scroll(window);
    expect(observer.unobserve).toHaveBeenCalledWith(introElement);
    expect(observer.observe).toHaveBeenLastCalledWith(replacement);
    view.unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
    fireEvent.scroll(window);
    expect(observer.observe).toHaveBeenCalledTimes(3);
  });

  it('retains intersection state across partial batches and follows document order', async () => {
    const { TocElement } = await import('./toc');
    const view = render(
      <TocElement {...tocProps}>
        <span />
      </TocElement>
    );
    const observer = observers[0];
    act(() =>
      observer.callback([{ target: headingElement, isIntersecting: true }])
    );
    expect(
      view
        .getByRole('button', { name: 'Benefits' })
        .getAttribute('aria-current')
    ).toBe('location');
    act(() =>
      observer.callback([{ target: introElement, isIntersecting: true }])
    );
    expect(
      view.getByRole('button', { name: 'Intro' }).getAttribute('aria-current')
    ).toBe('location');
    act(() =>
      observer.callback([{ target: headingElement, isIntersecting: false }])
    );
    expect(
      view.getByRole('button', { name: 'Intro' }).getAttribute('aria-current')
    ).toBe('location');
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
  it('does not revive a stale clicked heading when scrolling back', async () => {
    const { TocElement } = await import('./toc');
    const view = render(
      <TocElement {...tocProps}>
        <span />
      </TocElement>
    );
    const observer = observers[0];
    act(() =>
      observer.callback([{ target: introElement, isIntersecting: true }])
    );
    fireEvent.click(view.getByRole('button', { name: 'Benefits' }));
    act(() =>
      observer.callback([
        { target: introElement, isIntersecting: false },
        { target: headingElement, isIntersecting: true },
      ])
    );
    act(() =>
      observer.callback([
        { target: introElement, isIntersecting: true },
        { target: headingElement, isIntersecting: false },
      ])
    );
    expect(
      view.getByRole('button', { name: 'Intro' }).getAttribute('aria-current')
    ).toBe('location');
    expect(
      view
        .getByRole('button', { name: 'Benefits' })
        .getAttribute('aria-current')
    ).toBeNull();
  });
  it('ignores a disposed observer after Strict Mode remount', async () => {
    const { TocElement } = await import('./toc');
    const view = render(
      <React.StrictMode>
        <TocElement {...tocProps}>
          <span />
        </TocElement>
      </React.StrictMode>
    );
    expect(observers.length).toBe(2);
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    act(() =>
      observers[1].callback([{ target: introElement, isIntersecting: true }])
    );
    expect(
      view.getByRole('button', { name: 'Intro' }).getAttribute('aria-current')
    ).toBe('location');
    act(() =>
      observers[0].callback([{ target: headingElement, isIntersecting: true }])
    );
    expect(
      view.getByRole('button', { name: 'Intro' }).getAttribute('aria-current')
    ).toBe('location');
    view.unmount();
    expect(observers[1].disconnect).toHaveBeenCalledTimes(1);
  });
});

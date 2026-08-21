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
  { depth: 1, key: 'intro', title: 'Intro' },
  { depth: 2, key: 'benefits', title: 'Benefits' },
];
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
  PlateElement: PlateElementMock,
  NavigationFeedbackPlugin: {},
  useEditor: () => editor,
  useEditorPlugin: () => ({ update: { flashTarget: flashTargetMock } }),
  useEditorScrollElement: () => null,
  useEditorSelector: (selector: (currentEditor: typeof editor) => unknown) =>
    selector(editor),
  usePluginStore: (_plugin: unknown, key: string) =>
    key === 'isScroll' ? false : 0,
}));

mock.module('@platejs/toc/react', () => ({
  TocPlugin: {
    configure: mock(() => ({ name: 'toc' })),
    name: 'toc',
  },
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

describe('toc node rendering', () => {
  beforeEach(() => {
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    flashTargetMock.mockReset();
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
});

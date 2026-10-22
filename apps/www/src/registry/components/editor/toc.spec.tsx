import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render, type RenderResult } from '@testing-library/react';
import * as actualCoreReact from 'platejs/react';
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
const twoHeadings = [
  { key: 'intro', level: 1, title: 'Intro' },
  { key: 'benefits', level: 2, title: 'Benefits' },
];
const sixHeadings = [
  { key: 'one', level: 1, title: 'One' },
  { key: 'two', level: 2, title: 'Two' },
  { key: 'three', level: 3, title: 'Three' },
  { key: 'four', level: 4, title: 'Four' },
  { key: 'five', level: 5, title: 'Five' },
  { key: 'six', level: 6, title: 'Six' },
];
let headings = twoHeadings;
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
  ...actualCoreReact,
  EditorElement: PlateElementMock,
  NavigationFeedbackPlugin: {},
  useEditor: () => editor,
  useEditorSelector: (selector: (currentEditor: typeof editor) => unknown) =>
    selector(editor),
  useElementSelected: () => false,
}));

mock.module('@/components/ui/button', () => ({
  Button: ButtonMock,
}));

const headingInsets = (view: RenderResult) =>
  view.getAllByRole('button').map((button) => {
    const [, pixels, spacing] =
      /\bpl-(?:\[(\d+)px\]|([\d.]+))/.exec(button.className) ?? [];

    return pixels ? Number(pixels) : Number(spacing ?? 0) * 4;
  });

const tocProps = {
  attributes: { 'data-editor-node': 'element' },
  element: { children: [{ text: '' }], type: 'toc' },
} as unknown as React.ComponentProps<typeof import('./toc').TocElement>;

describe('toc node rendering', () => {
  beforeEach(() => {
    domElements = { intro: introElement, benefits: headingElement };
    headings = twoHeadings;
    PlateElementMock.mockClear();
    ButtonMock.mockClear();
    flashTargetMock.mockReset();
    scrollIntoViewMock.mockReset();
    headingElement.style.scrollMarginTop = '';
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

  it('insets each deeper heading level further', async () => {
    headings = sixHeadings;
    const { TocElement } = await import('./toc');
    const insets = headingInsets(
      render(
        <TocElement {...tocProps}>
          <span />
        </TocElement>
      )
    );

    expect(insets).toEqual(insets.toSorted((a, b) => a - b));
    expect(new Set(insets).size).toBe(6);
  });

  it('insets each deeper heading level further in the static view', async () => {
    headings = sixHeadings;
    const { TocElementStatic } = await import('./toc-static');
    const insets = headingInsets(
      render(
        <TocElementStatic
          {...({
            ...tocProps,
            editor,
            path: [0],
          } as unknown as React.ComponentProps<typeof TocElementStatic>)}
        >
          <span />
        </TocElementStatic>
      )
    );

    expect(insets).toEqual(insets.toSorted((a, b) => a - b));
    expect(new Set(insets).size).toBe(6);
  });
});

import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

let selected = true;
let selectionCollapsed = true;
let readOnly = true;
const renderEquation = mock();
const setExpression = mock();
let textareaProps: React.ComponentProps<'textarea'>;
const updateWithOptions = mock((options: unknown) => ({
  set: (...args: unknown[]) => {
    const [properties] = args as [{ latex: string }];

    element.latex = properties.latex;

    return setExpression(options, ...args);
  },
}));

const element = {
  children: [{ text: '' }],
  latex: 'E=mc^2',
  type: 'inlineEquation',
};

const mockPlugin = (name: string) => ({
  name,
  configure: mock(() => ({ name })),
});

mock.module('@platejs/math/react', () => ({
  EquationPlugin: mockPlugin('equation'),
  InlineEquationPlugin: mockPlugin('inlineEquation'),
}));

mock.module('@platejs/math', () => ({
  MathRules: { markdown: mock(() => ({})) },
}));

mock.module('katex', () => ({
  default: { render: renderEquation },
}));

mock.module('react-textarea-autosize', () => ({
  default: (props: React.ComponentProps<'textarea'>) => {
    textareaProps = props;

    return <textarea {...props} />;
  },
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { name: 'blockSelection' },
}));

mock.module('platejs', () => ({
  isHotkey: (hotkey: string) => (event: KeyboardEvent) =>
    event.key.toLowerCase() === hotkey.toLowerCase(),
}));

mock.module('platejs/react', () => ({
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  useEditor: () => ({
    api: { dom: { focus: mock() } },
    key: mock(),
    plugin: () => ({
      api: { set: mock() },
      update: Object.assign(updateWithOptions, { set: mock() }),
    }),
    read: { nodes: { path: () => [0] }, points: { after: mock() } },
    update: { selection: { set: mock() } },
  }),
  useEditorReadOnly: () => readOnly,
  useEditorSelector: () => selectionCollapsed,
  useElement: () => element,
  useElementSelected: () => selected,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) => (
    <div data-open={open} data-testid="popover">
      {children}
    </div>
  ),
  PopoverAnchor: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@/registry/lib/suggestion', () => ({
  inlineSuggestionVariants: () => '',
}));

describe('InlineEquationElement', () => {
  beforeEach(() => {
    readOnly = true;
    selected = true;
    selectionCollapsed = true;
    element.latex = 'E=mc^2';
    renderEquation.mockReset();
    setExpression.mockReset();
    updateWithOptions.mockClear();
  });

  afterAll(() => {
    mock.restore();
  });

  it('closes the open popover when keyboard navigation deselects the equation', async () => {
    const { InlineEquationElement } = await import(
      `./math?test=${Math.random().toString(36).slice(2)}`
    );
    const props = {
      attributes: {},
      children: <span />,
      editor: {},
      element,
    } as any;
    const view = render(<InlineEquationElement {...props} />);

    expect(view.getByTestId('popover').dataset.open).toBe('true');

    selected = false;
    selectionCollapsed = true;
    view.rerender(<InlineEquationElement {...props} />);

    await waitFor(() =>
      expect(view.getByTestId('popover').dataset.open).toBe('false')
    );
    expect(renderEquation).toHaveBeenCalledWith(
      'E=mc^2',
      expect.any(HTMLElement),
      expect.objectContaining({ displayMode: true })
    );
  });

  it('merges an escaped inline rollback into the edit history batch', async () => {
    readOnly = false;
    const { InlineEquationElement } = await import(
      `./math?test=${Math.random().toString(36).slice(2)}`
    );
    const props = {
      attributes: {},
      children: <span />,
      editor: {},
      element,
    } as any;
    const view = render(<InlineEquationElement {...props} />);
    const input = view.getByPlaceholderText('E = mc^2') as HTMLInputElement;

    await waitFor(() => expect(document.activeElement).toBe(input));
    updateWithOptions.mockClear();
    setExpression.mockReset();

    act(() =>
      textareaProps.onChange?.({
        currentTarget: { value: 'discarded' },
      } as React.ChangeEvent<HTMLTextAreaElement>)
    );
    view.rerender(<InlineEquationElement {...props} />);

    expect(input.value).toBe('discarded');
    expect(setExpression).toHaveBeenCalledWith(
      { history: 'merge' },
      { latex: 'discarded' },
      { at: [0] }
    );
    updateWithOptions.mockClear();
    setExpression.mockReset();

    fireEvent.keyDown(input, { key: 'Escape' });
    view.rerender(<InlineEquationElement {...props} />);

    expect(input.value).toBe('E=mc^2');
    expect(updateWithOptions).toHaveBeenCalledWith({ history: 'merge' });
    expect(setExpression).toHaveBeenCalledWith(
      { history: 'merge' },
      { latex: 'E=mc^2' },
      { at: [0] }
    );
  });

  it('renders external equation updates without writing stale local state', async () => {
    readOnly = false;
    const { InlineEquationElement } = await import(
      `./math?test=${Math.random().toString(36).slice(2)}`
    );
    const props = {
      attributes: {},
      children: <span />,
      editor: {},
      element,
    } as any;
    const view = render(<InlineEquationElement {...props} />);
    const input = view.getByPlaceholderText('E = mc^2') as HTMLInputElement;

    await waitFor(() => expect(document.activeElement).toBe(input));
    updateWithOptions.mockClear();
    setExpression.mockReset();

    element.latex = 'a^2 + b^2';
    view.rerender(<InlineEquationElement {...props} />);

    expect(input.value).toBe('a^2 + b^2');
    expect(setExpression).not.toHaveBeenCalled();
  });
});

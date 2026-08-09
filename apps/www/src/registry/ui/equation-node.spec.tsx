import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import { afterAll, describe, expect, it, mock } from 'bun:test';

let selected = true;
let selectionCollapsed = true;

const element = {
  children: [{ text: '' }],
  texExpression: 'E=mc^2',
  type: 'inlineEquation',
};

mock.module('@platejs/math/react', () => ({
  EquationPlugin: { name: 'equation' },
  InlineEquationPlugin: { name: 'inlineEquation' },
  useEquationElement: () => undefined,
  useEquationInput: () => ({}),
}));

mock.module('@platejs/selection/react', () => ({
  BlockSelectionPlugin: { name: 'blockSelection' },
}));

mock.module('platejs/react', () => ({
  createPrimitiveComponent: () => () => () => null,
  PlateElement: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  useEditor: () => ({
    api: { dom: { focus: mock() } },
    plugin: () => ({ api: { set: mock() } }),
    read: { points: { after: mock() } },
    update: { selection: { set: mock() } },
  }),
  useEditorReadOnly: () => true,
  useEditorSelector: () => selectionCollapsed,
  useElement: () => element,
  useElementSelected: () => selected,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children, open }: React.PropsWithChildren<{ open: boolean }>) => (
    <div data-open={open} data-testid="popover">
      {children}
    </div>
  ),
  PopoverContent: () => null,
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
  afterAll(() => {
    mock.restore();
  });

  it('closes the open popover when keyboard navigation deselects the equation', async () => {
    const { InlineEquationElement } = await import(
      `./equation-node?test=${Math.random().toString(36).slice(2)}`
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
  });
});

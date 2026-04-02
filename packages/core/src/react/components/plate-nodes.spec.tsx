/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createPlateEditor } from '../editor';
import { PlateStoreProvider } from '../stores';
import { PlateElement } from './plate-nodes';

const createElement = (id?: string) =>
  ({
    ...(id ? { id } : {}),
    children: [{ text: 'Body' }],
    type: 'p',
  }) as any;

const createProps = (
  editor: ReturnType<typeof createPlateEditor>,
  id?: string
) =>
  ({
    attributes: {} as any,
    children: 'Body',
    editor,
    element: createElement(id),
    path: [0],
  }) as any;

const renderWithStore = ({
  editor,
  isMounted,
}: {
  editor: ReturnType<typeof createPlateEditor>;
  isMounted: boolean;
}) =>
  render(
    <PlateStoreProvider
      containerRef={{ current: null }}
      editor={editor}
      isMounted={isMounted}
      primary
      scope={editor.id}
      scrollRef={{ current: null }}
    >
      <PlateElement {...createProps(editor, 'block-1')} />
    </PlateStoreProvider>
  );

describe('PlateElement', () => {
  it('renders elements without ids outside a Plate store', () => {
    const editor = createPlateEditor({
      value: [createElement()],
    });
    const { container } = render(<PlateElement {...createProps(editor)} />);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-block-id');
  });

  it('renders data-block-id before the editor is mounted', () => {
    const editor = createPlateEditor({
      value: [createElement('block-1')],
    });
    const { container } = renderWithStore({ editor, isMounted: false });
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-block-id', 'block-1');
  });

  it('renders data-block-id after the editor is mounted', () => {
    const editor = createPlateEditor({
      value: [createElement('block-1')],
    });
    const { container } = renderWithStore({ editor, isMounted: true });
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('data-block-id', 'block-1');
  });

  it('keeps the Slate attributes ref on the fast path', () => {
    const editor = createPlateEditor({
      value: [createElement()],
    });
    const attributeRef = mock();

    render(
      <PlateElement
        {...createProps(editor)}
        attributes={{ ref: attributeRef } as any}
      />
    );

    expect(attributeRef).toHaveBeenCalled();
  });

  it('composes forwarded refs when merged attributes are needed', () => {
    const editor = createPlateEditor({
      value: [createElement()],
    });
    const attributeRef = mock();
    const forwardedRef = React.createRef<HTMLDivElement>();

    render(
      <PlateElement
        {...createProps(editor)}
        attributes={{ ref: attributeRef } as any}
        className="extra-class"
        ref={forwardedRef}
      />
    );

    expect(attributeRef).toHaveBeenCalled();
    expect(forwardedRef.current).not.toBeNull();
  });
});

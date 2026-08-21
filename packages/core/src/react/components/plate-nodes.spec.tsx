/// <reference types="@testing-library/jest-dom" />

import { render } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { ElementIdPlugin } from '../../lib';
import {
  type PlateEditor,
  type PlateEditorReference,
  createPlateEditor,
} from '../editor';
import { PlateStoreProvider } from '../stores';
import { PlateElement } from './plate-nodes';

const createElement = (id?: string) =>
  ({
    ...(id ? { id } : {}),
    children: [{ text: 'Body' }],
    type: 'paragraph',
  }) as any;

type TestPlateEditor = PlateEditorReference & Pick<PlateEditor, 'id'>;

const createProps = (editor: TestPlateEditor, id?: string) =>
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
  editor: TestPlateEditor;
  isMounted: boolean;
}) =>
  render(
    <PlateStoreProvider
      containerRef={{ current: null }}
      editor={editor}
      isMounted={isMounted}
      primary
      scope={editor.id}
    >
      <PlateElement {...createProps(editor, 'block-1')} />
    </PlateStoreProvider>
  );

describe('PlateElement', () => {
  it('renders elements without ids outside a Plate store', () => {
    const editor = createPlateEditor({
      initialValue: [createElement()],
    });
    const { container } = render(<PlateElement {...createProps(editor)} />);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-block-id');
  });

  it('never renders persisted element ids in server output', () => {
    const editor = createPlateEditor({
      initialValue: [createElement('block-1')],
      plugins: [ElementIdPlugin],
    });
    const html = renderToString(
      <PlateElement {...createProps(editor, 'block-1')} />
    );

    expect(html).not.toContain('data-block-id');
  });

  it('never renders persisted element ids after the editor is mounted', () => {
    const editor = createPlateEditor({
      initialValue: [createElement('block-1')],
      plugins: [ElementIdPlugin],
    });
    const { container } = renderWithStore({ editor, isMounted: true });
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).not.toHaveAttribute('data-block-id');
  });

  it('keeps the Plite attributes ref on the fast path', () => {
    const editor = createPlateEditor({
      initialValue: [createElement()],
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
      initialValue: [createElement()],
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

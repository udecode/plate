import type { Element as PliteElementNode } from '@platejs/plite';
import {
  getPathByNodeKey as editorGetPathByNodeKey,
  getNodeKey as editorGetNodeKey,
  moveNodes as editorMoveNodes,
} from '@platejs/plite/internal';
import { act, render } from '@testing-library/react';
import React from 'react';

import { createReactEditor, PliteElement, usePliteNodeRef } from '../src';
import {
  EditorContext,
  ElementContext,
  ElementPathContext,
  NodeKeyContext,
} from '../src/context';
import {
  getPliteNodeElementByPath,
  getPliteNodePathFromDOMElement,
  syncPliteNodePathBindingsToDOM,
} from '../src/hooks/use-plite-node-ref';

const readElement = (
  editor: ReturnType<typeof createReactEditor>,
  path: number[]
) => editor.read((state) => state.nodes.get(path))[0] as PliteElementNode;

describe('PliteElement node ref binding', () => {
  test('keeps every DOM binding for a shared editor path', () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'block', children: [{ text: 'one' }] }],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const renderElement = (testId: string) => (
      <EditorContext value={editor}>
        <NodeKeyContext value={nodeKey}>
          <ElementPathContext value={[0]}>
            <ElementContext value={readElement(editor, [0])}>
              <PliteElement data-testid={testId}>content</PliteElement>
            </ElementContext>
          </ElementPathContext>
        </NodeKeyContext>
      </EditorContext>
    );

    const first = render(renderElement('first'));
    const second = render(renderElement('second'));

    expect(getPliteNodeElementByPath(editor, [0])).toBe(
      second.getByTestId('second')
    );

    second.unmount();

    expect(getPliteNodeElementByPath(editor, [0])).toBe(
      first.getByTestId('first')
    );
  });

  test('rebinds DOM maps when a stable node key moves to another path', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const renderElement = (path: number[]) => (
      <EditorContext value={editor}>
        <NodeKeyContext value={nodeKey}>
          <ElementPathContext value={path}>
            <ElementContext value={readElement(editor, path)}>
              <PliteElement data-testid="bound-element">content</PliteElement>
            </ElementContext>
          </ElementPathContext>
        </NodeKeyContext>
      </EditorContext>
    );

    const rendered = render(renderElement([0]));
    const element = rendered.getByTestId('bound-element');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(element);
    expect(getPliteNodePathFromDOMElement(element)).toEqual([0]);

    act(() => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    expect(editorGetPathByNodeKey(editor, nodeKey)).toEqual([1]);

    rendered.rerender(renderElement([1]));

    expect(rendered.getByTestId('bound-element')).toBe(element);
    expect(element.getAttribute('data-plite-path')).toBe('1');
    expect(getPliteNodeElementByPath(editor, [0])).toBe(null);
    expect(getPliteNodeElementByPath(editor, [1])).toBe(element);
    expect(getPliteNodePathFromDOMElement(element)).toEqual([1]);
  });

  test('ignores stale path map entries after a DOM node is rebound', () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'block', children: [{ text: 'one' }] }],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    render(
      <EditorContext value={editor}>
        <NodeKeyContext value={nodeKey}>
          <ElementPathContext value={[0]}>
            <ElementContext value={readElement(editor, [0])}>
              <PliteElement data-testid="bound-element">content</PliteElement>
            </ElementContext>
          </ElementPathContext>
        </NodeKeyContext>
      </EditorContext>
    );

    const element = getPliteNodeElementByPath(editor, [0]);

    expect(element).toBeTruthy();

    element?.setAttribute('data-plite-path', '1');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(null);
  });

  test('repairs a stale declarative path after an external rerender', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const nodeKey = editorGetNodeKey(editor, [0]);
    const pliteNode = readElement(editor, [0]);

    if (!nodeKey) {
      throw new Error('Missing node key at 0');
    }

    const BoundNode = ({ revision }: { revision: number }) => {
      const ref = usePliteNodeRef(nodeKey, { path: [0], pliteNode });

      return (
        <div
          data-plite-path="0"
          data-revision={revision}
          data-testid="bound-node"
          ref={ref}
        />
      );
    };
    const renderNode = (revision: number) => (
      <EditorContext value={editor}>
        <BoundNode revision={revision} />
      </EditorContext>
    );
    const rendered = render(renderNode(0));
    const element = rendered.getByTestId('bound-node');

    act(() => {
      editorMoveNodes(editor, { at: [0], to: [2] });
      syncPliteNodePathBindingsToDOM(editor, [nodeKey]);
    });

    expect(element.getAttribute('data-plite-path')).toBe('1');
    element.setAttribute('data-plite-path', '0');
    rendered.rerender(renderNode(1));

    expect(element.getAttribute('data-plite-path')).toBe('1');
    expect(getPliteNodePathFromDOMElement(element)).toEqual([1]);
  });
});

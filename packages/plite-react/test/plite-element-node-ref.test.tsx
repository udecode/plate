import { act, render } from '@testing-library/react';
import React from 'react';
import type { Element as PliteElementNode } from '@platejs/plite';
import {
  getPathByRuntimeId as editorGetPathByRuntimeId,
  getRuntimeId as editorGetRuntimeId,
  moveNodes as editorMoveNodes,
} from '@platejs/plite/internal';
import { createReactEditor, PliteElement } from '../src';
import {
  EditorContext,
  ElementContext,
  ElementPathContext,
  NodeRuntimeIdContext,
} from '../src/context';
import {
  getPliteNodeElementByPath,
  getPliteNodePathFromDOMElement,
} from '../src/hooks/use-plite-node-ref';

const readElement = (
  editor: ReturnType<typeof createReactEditor>,
  path: number[]
) => editor.read((state) => state.nodes.get(path))[0] as PliteElementNode;

describe('PliteElement node ref binding', () => {
  test('rebinds DOM maps when a stable runtime id moves to another path', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const runtimeId = editorGetRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Missing runtime id at 0');
    }

    const renderElement = (path: number[]) => (
      <EditorContext.Provider value={editor}>
        <NodeRuntimeIdContext.Provider value={runtimeId}>
          <ElementPathContext.Provider value={path}>
            <ElementContext.Provider value={readElement(editor, path)}>
              <PliteElement data-testid="bound-element">content</PliteElement>
            </ElementContext.Provider>
          </ElementPathContext.Provider>
        </NodeRuntimeIdContext.Provider>
      </EditorContext.Provider>
    );

    const rendered = render(renderElement([0]));
    const element = rendered.getByTestId('bound-element');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(element);
    expect(getPliteNodePathFromDOMElement(element)).toEqual([0]);

    act(() => {
      editorMoveNodes(editor, { at: [0], to: [2] });
    });

    expect(editorGetPathByRuntimeId(editor, runtimeId)).toEqual([1]);

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
    const runtimeId = editorGetRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Missing runtime id at 0');
    }

    render(
      <EditorContext.Provider value={editor}>
        <NodeRuntimeIdContext.Provider value={runtimeId}>
          <ElementPathContext.Provider value={[0]}>
            <ElementContext.Provider value={readElement(editor, [0])}>
              <PliteElement data-testid="bound-element">content</PliteElement>
            </ElementContext.Provider>
          </ElementPathContext.Provider>
        </NodeRuntimeIdContext.Provider>
      </EditorContext.Provider>
    );

    const element = getPliteNodeElementByPath(editor, [0]);

    expect(element).toBeTruthy();

    element?.setAttribute('data-plite-path', '1');

    expect(getPliteNodeElementByPath(editor, [0])).toBe(null);
  });
});

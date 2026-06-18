import { act, render } from '@testing-library/react';
import React from 'react';
import type { Element as SlateElementNode } from '@platejs/slate';
import { Editor } from '@platejs/slate/internal';
import { createReactEditor, SlateElement } from '../src';
import {
  EditorContext,
  ElementContext,
  ElementPathContext,
  NodeRuntimeIdContext,
} from '../src/context';
import {
  getSlateNodeElementByPath,
  getSlateNodePathFromDOMElement,
} from '../src/hooks/use-slate-node-ref';

const readElement = (
  editor: ReturnType<typeof createReactEditor>,
  path: number[]
) => editor.read((state) => state.nodes.get(path))[0] as SlateElementNode;

describe('SlateElement node ref binding', () => {
  test('rebinds DOM maps when a stable runtime id moves to another path', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'one' }] },
        { type: 'block', children: [{ text: 'two' }] },
      ],
    });
    const runtimeId = Editor.getRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Missing runtime id at 0');
    }

    const renderElement = (path: number[]) => (
      <EditorContext.Provider value={editor}>
        <NodeRuntimeIdContext.Provider value={runtimeId}>
          <ElementPathContext.Provider value={path}>
            <ElementContext.Provider value={readElement(editor, path)}>
              <SlateElement data-testid="bound-element">content</SlateElement>
            </ElementContext.Provider>
          </ElementPathContext.Provider>
        </NodeRuntimeIdContext.Provider>
      </EditorContext.Provider>
    );

    const rendered = render(renderElement([0]));
    const element = rendered.getByTestId('bound-element');

    expect(getSlateNodeElementByPath(editor, [0])).toBe(element);
    expect(getSlateNodePathFromDOMElement(element)).toEqual([0]);

    act(() => {
      Editor.moveNodes(editor, { at: [0], to: [2] });
    });

    expect(Editor.getPathByRuntimeId(editor, runtimeId)).toEqual([1]);

    rendered.rerender(renderElement([1]));

    expect(rendered.getByTestId('bound-element')).toBe(element);
    expect(element.getAttribute('data-slate-path')).toBe('1');
    expect(getSlateNodeElementByPath(editor, [0])).toBe(null);
    expect(getSlateNodeElementByPath(editor, [1])).toBe(element);
    expect(getSlateNodePathFromDOMElement(element)).toEqual([1]);
  });

  test('ignores stale path map entries after a DOM node is rebound', () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'block', children: [{ text: 'one' }] }],
    });
    const runtimeId = Editor.getRuntimeId(editor, [0]);

    if (!runtimeId) {
      throw new Error('Missing runtime id at 0');
    }

    render(
      <EditorContext.Provider value={editor}>
        <NodeRuntimeIdContext.Provider value={runtimeId}>
          <ElementPathContext.Provider value={[0]}>
            <ElementContext.Provider value={readElement(editor, [0])}>
              <SlateElement data-testid="bound-element">content</SlateElement>
            </ElementContext.Provider>
          </ElementPathContext.Provider>
        </NodeRuntimeIdContext.Provider>
      </EditorContext.Provider>
    );

    const element = getSlateNodeElementByPath(editor, [0]);

    expect(element).toBeTruthy();

    element?.setAttribute('data-slate-path', '1');

    expect(getSlateNodeElementByPath(editor, [0])).toBe(null);
  });
});

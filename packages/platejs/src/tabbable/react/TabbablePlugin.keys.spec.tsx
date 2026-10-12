import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { schema } from '../../core';
import {
  createEditor,
  definePlugin,
  EditorContent,
  EditorRoot,
  useEditor,
} from '../../react/core';
import type { TabbablePluginState } from '../lib/TabbablePluginTypes';
import { TabbablePlugin } from './TabbablePlugin';

const ButtonsPlugin = definePlugin('buttons', {
  schema: { element: { void: 'block' } },
}).configure({
  component: ({ attributes, children }) => (
    <div {...attributes}>
      <div contentEditable={false}>
        <button type="button">Button 1</button>
        <button type="button">Button 2</button>
      </div>
      {children}
    </div>
  ),
});

const HostPlugin = definePlugin('host', {
  schema: { element: schema.element.textBlock() },
}).configure({
  component: ({ attributes, children }) => (
    <div {...attributes}>
      <div contentEditable={false}>
        <input aria-label="Host" />
      </div>
      {children}
    </div>
  ),
});

const mount = (state: Partial<TabbablePluginState>) => {
  const view: { editor?: unknown } = {};

  function ViewEditor() {
    const editor = useEditor();

    React.useEffect(() => {
      view.editor = editor;
    }, [editor]);

    return null;
  }

  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'buttons' },
      { children: [{ text: 'two' }], type: 'paragraph' },
      { children: [{ text: 'host' }], type: 'host' },
    ],
    plugins: [
      ButtonsPlugin,
      HostPlugin,
      definePlugin('viewEditor', {
        slots: { afterEditable: ViewEditor },
      }),
      TabbablePlugin.configure({ initialState: state }),
    ],
  });
  const rendered = render(
    <>
      <button id="outside" type="button">
        Outside
      </button>
      <svg aria-label="Drawing" id="drawing" role="button" tabIndex={0} />
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
      </EditorRoot>
    </>
  );
  const editable = rendered.container.querySelector<HTMLElement>(
    '[contenteditable="true"]'
  );

  if (!editable) throw new Error('Expected editable root');

  return { ...rendered, editable, editor, view };
};

const pressTabOn = (element: HTMLElement | SVGElement) => {
  act(() => {
    element.focus();
  });

  return !fireEvent.keyDown(element, { code: 'Tab', key: 'Tab' });
};

describe('TabbablePlugin keys', () => {
  beforeEach(() => {
    const rects = [new DOMRect(0, 0, 10, 10)];

    spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
      Object.assign(rects, { item: (index: number) => rects[index] ?? null })
    );
  });

  afterEach(() => {
    mock.restore();
  });

  it('hands every callback the view editor that received the key', () => {
    const seen: Record<string, boolean> = {};
    const { editable, view } = mount({
      insertTabbableEntries: ({ editor }) => {
        seen.insertTabbableEntries = editor === view.editor;

        return [];
      },
      isTabbable: ({ editor, entry }) => {
        seen.isTabbable = editor === view.editor;

        return editor.read.schema.isVoid(entry.slateNode);
      },
      query: ({ editor }) => {
        seen.query = editor === view.editor;

        return true;
      },
    });

    pressTabOn(editable);

    expect(seen).toEqual({
      insertTabbableEntries: true,
      isTabbable: true,
      query: true,
    });
  });

  it('moves on from the last button of a void even when query declines', () => {
    const { editor, getByRole } = mount({ query: () => false });
    const handled = pressTabOn(getByRole('button', { name: 'Button 2' }));

    expect({ anchor: editor.read.selection()?.anchor, handled }).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      handled: true,
    });
  });

  it('leaves Tab to a focused control that isTabbable rejects', () => {
    const { getByRole } = mount({ query: () => false });

    expect(pressTabOn(getByRole('textbox', { name: 'Host' }))).toBe(false);
  });

  it('moves on from an inserted entry outside the editor even when query declines', () => {
    const { editor, getByRole } = mount({
      globalEventListener: true,
      insertTabbableEntries: ({ editor: viewEditor }) => {
        const outside = document.querySelector<HTMLElement>('#outside');
        const paragraph = viewEditor.read.nodes.get([2]);

        return outside && paragraph
          ? [{ domNode: outside, path: [2], slateNode: paragraph[0] }]
          : [];
      },
      query: () => false,
    });
    const handled = pressTabOn(getByRole('button', { name: 'Outside' }));

    expect({ anchor: editor.read.selection()?.anchor, handled }).toEqual({
      anchor: { offset: 0, path: [3, 0] },
      handled: true,
    });
  });

  it('moves on from an inserted SVG entry outside the editor even when query declines', () => {
    const { editor, getByRole } = mount({
      globalEventListener: true,
      insertTabbableEntries: ({ editor: viewEditor }) => {
        const drawing = document.querySelector<SVGElement>('#drawing');
        const paragraph = viewEditor.read.nodes.get([2]);

        return drawing && paragraph
          ? [{ domNode: drawing, path: [2], slateNode: paragraph[0] }]
          : [];
      },
      query: () => false,
    });
    const handled = pressTabOn(getByRole('button', { name: 'Drawing' }));

    expect({ anchor: editor.read.selection()?.anchor, handled }).toEqual({
      anchor: { offset: 0, path: [3, 0] },
      handled: true,
    });
  });
});

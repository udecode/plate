/** @jsx jsxt */

import {
  type Descendant,
  type EditorNodeChangeContext,
  type EditorTextChangeContext,
  property,
  schema,
  target,
} from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';

import { type BaseEditor, createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import {
  createPlateChangeHandlersExtension,
  subscribePlateChangeCallbacks,
} from './plateChangeHandlers';

jsxt;

const textNode: Descendant = { text: 'node' };
const createNodeChange = (
  editor: BaseEditor
): EditorNodeChangeContext<BaseEditor> => ({
  commit: editor.read.lastCommit()!,
  editor,
  kind: 'insert',
  node: textNode,
  path: [0],
  previousPath: null,
  previousNode: null,
  root: 'main',
});
const createTextChange = (
  editor: BaseEditor
): EditorTextChangeContext<BaseEditor> => ({
  commit: editor.read.lastCommit()!,
  editor,
  node: textNode,
  path: [0],
  previousPath: [0],
  previousText: 'prev',
  root: 'main',
  text: 'next',
});
const dispatchPlateChange = (
  editor: BaseEditor,
  event: 'nodeChange' | 'textChange',
  context: object
) => {
  const on = Reflect.get(createPlateChangeHandlersExtension(editor), 'on');

  if (typeof on !== 'object' || on === null) {
    throw new Error('Expected Plate change lifecycle callbacks.');
  }
  Reflect.apply(Reflect.get(on, event), undefined, [context]);
};

describe('plate change handlers', () => {
  it('dispatches node change handlers from Plite node change events', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = defineBasePlugin('nodeObserver', {
      schema: {
        properties: {
          variant: schema.elementProperty(property.string(), {
            target: target.type('paragraph'),
          }),
        },
      },
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.set({ variant: 'lead' }, { at: [0] });

    expect(onNodeChange).toHaveBeenCalledTimes(1);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello' }],
        type: 'paragraph',
        variant: 'lead',
      },
      previousNode: {
        children: [{ text: 'hello' }],
        type: 'paragraph',
      },
    });
  });

  it('dispatches inserted and removed node payloads', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = defineBasePlugin('nodeObserver', {
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.insert(
      { children: [{ text: 'inserted' }], type: 'paragraph' },
      { at: [1] }
    );
    editor.update.nodes.remove({ at: [1] });

    expect(onNodeChange).toHaveBeenCalledTimes(2);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: {
        children: [{ text: 'inserted' }],
        type: 'paragraph',
      },
      path: [1],
      previousPath: null,
      previousNode: null,
    });
    expect(onNodeChange.mock.calls[1]?.[0]).toMatchObject({
      kind: 'remove',
      node: null,
      path: [1],
      previousPath: [1],
      previousNode: {
        children: [{ text: 'inserted' }],
        type: 'paragraph',
      },
    });
  });

  it('does not dispatch node handlers for text intents', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = defineBasePlugin('nodeObserver', {
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onNodeChange.mockClear();

    editor.update.text.insert('!');

    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('dispatches text change handlers from Plite text change events', () => {
    const onTextChange = mock();
    const TextObserverPlugin = defineBasePlugin('textObserver', {
      on: { textChange: onTextChange },
    });
    const editor = createBaseEditor({
      plugins: [TextObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onTextChange.mockClear();

    editor.update.text.insert('!');

    expect(onTextChange).toHaveBeenCalledTimes(1);
    expect(onTextChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello!' }],
        type: 'paragraph',
      },
      previousText: 'hello',
      text: 'hello!',
    });
  });

  it('runs text observers while the editor is read-only', () => {
    const onTextChange = mock(() => {});
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('textObserver', {
          editOnly: true,
          on: { textChange: onTextChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onTextChange.mockClear();

    dispatchPlateChange(editor, 'textChange', createTextChange(editor));

    expect(onTextChange).toHaveBeenCalledTimes(1);
  });

  it('runs every text-change observer', () => {
    const first = mock(() => {});
    const second = mock(() => {});
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('first', {
          on: { textChange: first },
        }),
        defineBasePlugin('second', {
          on: { textChange: second },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    first.mockClear();
    second.mockClear();
    editor.update.text.insert('!', { at: { offset: 5, path: [0, 0] } });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first.mock.calls[0]?.[0]).toMatchObject({
      previousText: 'hello',
      root: undefined,
      text: 'hello!',
    });
  });

  it('runs node observers while the editor is read-only', () => {
    const onNodeChange = mock(() => {});
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('nodeObserver', {
          editOnly: true,
          on: { nodeChange: onNodeChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    onNodeChange.mockClear();

    dispatchPlateChange(editor, 'nodeChange', createNodeChange(editor));

    expect(onNodeChange).toHaveBeenCalledTimes(1);
  });

  it('runs every node-change observer', () => {
    const first = mock(() => {});
    const second = mock(() => {});
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('firstNodeObserver', {
          on: { nodeChange: first },
        }),
        defineBasePlugin('secondNodeObserver', {
          on: { nodeChange: second },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    first.mockClear();
    second.mockClear();

    editor.update.nodes.insert(
      { children: [{ text: 'inserted' }], type: 'paragraph' },
      { at: [1] }
    );

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: {
        children: [{ text: 'inserted' }],
        type: 'paragraph',
      },
      root: undefined,
    });
  });

  it('keeps provider observers independent from plugin handler fallback', () => {
    const pluginHandler = mock(() => true);
    const providerObserver = mock();
    const editor = createBaseEditor({
      plugins: [
        defineBasePlugin('textHandler', {
          on: { textChange: pluginHandler },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });
    const unsubscribe = subscribePlateChangeCallbacks(editor, {
      onTextChange: providerObserver,
    });

    pluginHandler.mockClear();
    editor.update.text.insert('!', { at: { offset: 5, path: [0, 0] } });

    expect(pluginHandler).toHaveBeenCalledTimes(1);
    expect(providerObserver).toHaveBeenCalledTimes(1);

    unsubscribe();
    editor.update.text.insert('?', { at: { offset: 6, path: [0, 0] } });

    expect(pluginHandler).toHaveBeenCalledTimes(2);
    expect(providerObserver).toHaveBeenCalledTimes(1);
  });
});

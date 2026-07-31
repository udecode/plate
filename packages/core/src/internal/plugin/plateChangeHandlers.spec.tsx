/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import {
  type Descendant,
  type EditorNodeChangeContext,
  type EditorTextChangeContext,
  property,
  schema,
  target,
  type Value,
} from '@platejs/plite';

jsxt;

import { type BaseEditor, createBaseEditor } from '../../lib/editor';
import {
  type AnyBasePluginDefinition,
  createBasePlugin,
} from '../../lib/plugin';
import {
  createPlateChangeHandlersExtension,
  subscribePlateChangeCallbacks,
} from './plateChangeHandlers';

const textNode: Descendant = { text: 'node' };
const createNodeChange = <P extends AnyBasePluginDefinition>(
  editor: BaseEditor<Value, P>
): EditorNodeChangeContext<BaseEditor<Value, P>> => ({
  commit: editor.read.lastCommit()!,
  editor,
  kind: 'insert',
  node: textNode,
  path: [0],
  previousPath: null,
  prevNode: null,
  root: 'main',
});
const createTextChange = <P extends AnyBasePluginDefinition>(
  editor: BaseEditor<Value, P>
): EditorTextChangeContext<BaseEditor<Value, P>> => ({
  commit: editor.read.lastCommit()!,
  editor,
  node: textNode,
  path: [0],
  previousPath: [0],
  prevText: 'prev',
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
    const NodeObserverPlugin = createBasePlugin({
      name: 'nodeObserver',
      schema: {
        properties: [
          schema.elementProperty('variant', property.string(), {
            target: target.type('p'),
          }),
        ],
      },
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.set({ variant: 'lead' } as any, { at: [0] });

    expect(onNodeChange).toHaveBeenCalledTimes(1);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello' }],
        type: 'p',
        variant: 'lead',
      },
      prevNode: {
        children: [{ text: 'hello' }],
        type: 'p',
      },
    });
  });

  it('dispatches inserted and removed node payloads', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      name: 'nodeObserver',
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.nodes.insert(
      { children: [{ text: 'inserted' }], type: 'p' },
      { at: [1] }
    );
    editor.update.nodes.remove({ at: [1] });

    expect(onNodeChange).toHaveBeenCalledTimes(2);
    expect(onNodeChange.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: {
        children: [{ text: 'inserted' }],
        type: 'p',
      },
      path: [1],
      previousPath: null,
      prevNode: null,
    });
    expect(onNodeChange.mock.calls[1]?.[0]).toMatchObject({
      kind: 'remove',
      node: null,
      path: [1],
      previousPath: [1],
      prevNode: {
        children: [{ text: 'inserted' }],
        type: 'p',
      },
    });
  });

  it('does not dispatch node handlers for text intents', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      name: 'nodeObserver',
      on: { nodeChange: onNodeChange },
    });
    const editor = createBaseEditor({
      plugins: [NodeObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    editor.update.text.insert('!');

    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('dispatches text change handlers from Plite text change events', () => {
    const onTextChange = mock();
    const TextObserverPlugin = createBasePlugin({
      name: 'textObserver',
      on: { textChange: onTextChange },
    });
    const editor = createBaseEditor({
      plugins: [TextObserverPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onTextChange.mockClear();

    editor.update.text.insert('!');

    expect(onTextChange).toHaveBeenCalledTimes(1);
    expect(onTextChange.mock.calls[0]?.[0]).toMatchObject({
      node: {
        children: [{ text: 'hello!' }],
        type: 'p',
      },
      prevText: 'hello',
      text: 'hello!',
    });
  });

  it('skips plugin handlers while the editor is read-only', () => {
    const onTextChange = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'textObserver',
          editOnly: true,
          on: { textChange: onTextChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onTextChange.mockClear();

    dispatchPlateChange(editor, 'textChange', createTextChange(editor));

    expect(onTextChange).not.toHaveBeenCalled();
  });

  it('dispatches read-only lifecycle events when editOnly.on is false', () => {
    const onTextChange = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'textObserver',
          editOnly: { on: false },
          on: { textChange: onTextChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onTextChange.mockClear();

    dispatchPlateChange(editor, 'textChange', createTextChange(editor));

    expect(onTextChange).toHaveBeenCalledTimes(1);
  });

  it('stops dispatch after a plugin handles the change', () => {
    const first = mock(() => true);
    const second = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'first',
          on: { textChange: first },
        }),
        createBasePlugin({
          name: 'second',
          on: { textChange: second },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    first.mockClear();
    second.mockClear();
    editor.update.text.insert('!', { at: { offset: 5, path: [0, 0] } });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(first.mock.calls[0]?.[0]).toMatchObject({
      prevText: 'hello',
      root: undefined,
      text: 'hello!',
    });
  });

  it('skips node handlers while the editor is read-only', () => {
    const onNodeChange = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'nodeObserver',
          editOnly: true,
          on: { nodeChange: onNodeChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    dispatchPlateChange(editor, 'nodeChange', createNodeChange(editor));

    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('stops node dispatch after a plugin handles the change', () => {
    const first = mock(() => true);
    const second = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'firstNodeObserver',
          on: { nodeChange: first },
        }),
        createBasePlugin({
          name: 'secondNodeObserver',
          on: { nodeChange: second },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    first.mockClear();
    second.mockClear();

    editor.update.nodes.insert(
      { children: [{ text: 'inserted' }], type: 'p' },
      { at: [1] }
    );

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(first.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: {
        children: [{ text: 'inserted' }],
        type: 'p',
      },
      root: undefined,
    });
  });

  it('keeps provider observers independent from plugin handler fallback', () => {
    const pluginHandler = mock(() => true);
    const providerObserver = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          name: 'textHandler',
          on: { textChange: pluginHandler },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
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

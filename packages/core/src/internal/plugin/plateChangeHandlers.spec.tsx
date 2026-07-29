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
import { type AnyPluginConfig, createBasePlugin } from '../../lib/plugin';
import {
  createPlateChangeHandlersExtension,
  subscribePlateChangeCallbacks,
} from './plateChangeHandlers';

const textNode: Descendant = { text: 'node' };
const createNodeChange = <P extends AnyPluginConfig>(
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
const createTextChange = <P extends AnyPluginConfig>(
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

describe('plate change handlers', () => {
  it('dispatches node change handlers from Plite node change events', () => {
    const onNodeChange = mock();
    const NodeObserverPlugin = createBasePlugin({
      key: 'nodeObserver',
      schema: {
        properties: [
          schema.elementProperty('variant', property.string(), {
            target: target.type('p'),
          }),
        ],
      },
      handlers: { onNodeChange },
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
      key: 'nodeObserver',
      handlers: { onNodeChange },
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
      key: 'nodeObserver',
      handlers: { onNodeChange },
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
      key: 'textObserver',
      handlers: { onTextChange },
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
          key: 'textObserver',
          handlers: { onTextChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onTextChange.mockClear();

    createPlateChangeHandlersExtension(editor).on?.textChange?.(
      createTextChange(editor)
    );
    expect(onTextChange).not.toHaveBeenCalled();
  });

  it('stops dispatch after a plugin handles the change', () => {
    const first = mock(() => true);
    const second = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'first',
          handlers: { onTextChange: first },
        }),
        createBasePlugin({
          key: 'second',
          handlers: { onTextChange: second },
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
          key: 'nodeObserver',
          handlers: { onNodeChange },
        }),
      ],
      readOnly: true,
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    onNodeChange.mockClear();

    createPlateChangeHandlersExtension(editor).on?.nodeChange?.(
      createNodeChange(editor)
    );
    expect(onNodeChange).not.toHaveBeenCalled();
  });

  it('stops node dispatch after a plugin handles the change', () => {
    const first = mock(() => true);
    const second = mock(() => true);
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'firstNodeObserver',
          handlers: { onNodeChange: first },
        }),
        createBasePlugin({
          key: 'secondNodeObserver',
          handlers: { onNodeChange: second },
        }),
      ],
      initialValue: [{ children: [{ text: 'hello' }], type: 'p' }],
    });

    first.mockClear();
    second.mockClear();

    createPlateChangeHandlersExtension(editor).on?.nodeChange?.(
      createNodeChange(editor)
    );

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
    expect(first.mock.calls[0]?.[0]).toMatchObject({
      kind: 'insert',
      node: textNode,
      root: undefined,
    });
  });

  it('keeps provider observers independent from plugin handler fallback', () => {
    const pluginHandler = mock(() => true);
    const providerObserver = mock();
    const editor = createBaseEditor({
      plugins: [
        createBasePlugin({
          key: 'textHandler',
          handlers: { onTextChange: pluginHandler },
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

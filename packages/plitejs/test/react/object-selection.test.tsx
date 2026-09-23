import { act, fireEvent, render } from '@testing-library/react';
import {
  defineEditorSchema,
  definePlugin,
  type Descendant,
  type PluginInput,
  schema,
  SelectionApi,
} from 'plitejs';
import { domCommands } from 'plitejs/dom';
import { history } from 'plitejs/history';
import { createDataTransfer } from 'plitejs/testing';

import { getEditorLiveSelection } from '../../src/internal';
import {
  createEditor,
  Editable,
  type EditableProps,
  type RenderElementProps,
  EditorRoot,
} from '../../src/react';
import { writeCollapsedModelSelectionDOMPreference } from '../../src/react/editable/model-selection-dom-preference';

const objectSchema = defineEditorSchema('schema:object-selection', {
  elements: {
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      object: true,
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'object-selection',
  root: schema.content.types(['media', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const initialValue = (): Descendant[] => [
  { type: 'paragraph', children: [{ text: 'start' }] },
  { type: 'paragraph', children: [{ text: 'before' }] },
  { type: 'media', children: [{ text: 'caption' }] },
  { type: 'paragraph', children: [{ text: 'after' }] },
];

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) =>
  element.type === 'media' ? (
    <figure {...attributes}>
      <div contentEditable={false} data-testid="asset" draggable>
        asset
      </div>
      <figcaption>{children}</figcaption>
    </figure>
  ) : (
    <p {...attributes}>{children}</p>
  );

const renderSelectableOwnerEditor = (
  props: Pick<EditableProps, 'onClick' | 'onMouseUp'> = {},
  options: { history?: boolean; plugins?: readonly PluginInput[] } = {}
) => {
  const editor = createEditor({
    plugins: [
      ...(options.history ? [history()] : []),
      ...(options.plugins ?? []),
      objectSchema,
    ],
    initialValue: initialValue(),
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      <Editable {...props} renderElement={renderElement} />
    </EditorRoot>
  );
  const editable =
    rendered.container.querySelector<HTMLElement>('[data-editor]');

  expect(editable).toBeTruthy();
  Object.defineProperty(editable!, 'isContentEditable', {
    configurable: true,
    value: true,
  });

  return { editable: editable!, editor, rendered };
};

const selectAsset = async (
  rendered: ReturnType<typeof renderSelectableOwnerEditor>['rendered']
) => {
  const asset = rendered.getByTestId('asset');

  await act(async () => {
    expect(fireEvent.mouseDown(asset)).toBe(true);
    fireEvent.mouseUp(asset);
    fireEvent.click(asset);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  });
};

describe('object element selection', () => {
  test('Delete clears a full child text selection and keeps the object', async () => {
    const { editable, editor } = renderSelectableOwnerEditor();

    await act(async () => {
      editor.update.selection.set(
        SelectionApi.text({
          anchor: { offset: 0, path: [2, 0] },
          focus: { offset: 7, path: [2, 0] },
        })
      );
    });

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Delete' });
    });

    expect(editor.read.value().children[2]).toEqual({
      type: 'media',
      children: [{ text: '' }],
    });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
  });

  test('keeps node focus DOM-less and moves between owner and direct text', async () => {
    const getTextNodeAtPath = (path: string) => {
      const host = document.querySelector<HTMLElement>(
        `[data-editor-path="${path}"]`
      );
      const string = host?.matches('[data-editor-string]')
        ? host
        : host?.querySelector<HTMLElement>('[data-editor-string]');

      return string?.firstChild;
    };
    const writeStaleDOMSelection = () => {
      const text = getTextNodeAtPath('0,0');

      expect(text).toBeTruthy();
      document.getSelection()?.setBaseAndExtent(text!, 0, text!, 0);
    };
    const { editable, editor, rendered } = renderSelectableOwnerEditor({
      onClick: writeStaleDOMSelection,
      onMouseUp: writeStaleDOMSelection,
    });
    const asset = rendered.getByTestId('asset');

    await act(async () => {
      fireEvent.mouseDown(asset);
      fireEvent.mouseUp(asset);
      fireEvent.click(asset);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
    expect(document.activeElement).toBe(editable);
    expect(document.getSelection()?.rangeCount).toBe(0);

    const staleDOMPoint = getTextNodeAtPath('1,0');

    expect(staleDOMPoint).toBeTruthy();
    writeCollapsedModelSelectionDOMPreference(
      editor,
      SelectionApi.text({
        anchor: { offset: 0, path: [2, 0] },
        focus: { offset: 0, path: [2, 0] },
      }),
      { node: staleDOMPoint!, offset: 0 }
    );

    await act(async () => {
      document
        .getSelection()
        ?.setBaseAndExtent(staleDOMPoint!, 0, staleDOMPoint!, 0);
      fireEvent.keyDown(editable, { key: 'ArrowDown' });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    const captionSelection = editor.read((state) => state.selection());

    expect(captionSelection).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
    expect(
      document
        .getSelection()
        ?.anchorNode?.parentElement?.closest('[data-editor-path]')
        ?.getAttribute('data-editor-path')
    ).toBe('2,0');

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowUp' });
    });

    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
    expect(document.activeElement).toBe(editable);
    expect(document.getSelection()?.rangeCount).toBe(0);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Backspace' });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 6, path: [1, 0] },
      focus: { offset: 6, path: [1, 0] },
    });
  });

  test('horizontal arrows stop on the owner before entering or leaving child text', async () => {
    const { editable, editor } = renderSelectableOwnerEditor();
    const beforeEnd = { offset: 6, path: [1, 0] };
    const captionStart = { offset: 0, path: [2, 0] };
    const press = async (key: string) => {
      await act(async () => {
        fireEvent.keyDown(editable, { key });
      });
    };

    await act(async () => {
      editor.update.selection.set(beforeEnd);
    });
    await press('ArrowRight');
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    await press('ArrowRight');
    expect(editor.read.selection()).toEqual({
      anchor: captionStart,
      focus: captionStart,
    });

    await press('ArrowLeft');
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    await press('ArrowLeft');
    expect(editor.read.selection()).toEqual({
      anchor: beforeEnd,
      focus: beforeEnd,
    });
  });

  test('RTL horizontal arrows traverse the same owner and child stops', async () => {
    const { editable, editor } = renderSelectableOwnerEditor();
    const beforeEnd = { offset: 6, path: [1, 0] };
    const captionStart = { offset: 0, path: [2, 0] };

    editable.dir = 'rtl';
    await act(async () => {
      editor.update.selection.set(beforeEnd);
    });

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowLeft' });
    });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowLeft' });
    });
    expect(editor.read.selection()).toEqual({
      anchor: captionStart,
      focus: captionStart,
    });

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowRight' });
    });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'ArrowRight' });
    });
    expect(editor.read.selection()).toEqual({
      anchor: beforeEnd,
      focus: beforeEnd,
    });
  });

  test('Delete removes the exact node selection and moves to the next text', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Delete' });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 0, path: [2, 0] },
    });
  });

  test('Enter preserves a node selection with no aggregate break target', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.keyDown(editable, { key: 'Enter' });
    });

    expect(editor.read.value()).toEqual({ children: initialValue() });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });
  });

  test('copies and cuts the exact selected owner', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();
    const copyClipboard = createDataTransfer();

    await selectAsset(rendered);

    await act(async () => {
      fireEvent.copy(editable, { clipboardData: copyClipboard });
    });

    const encoded = copyClipboard.getData('application/x-editor-fragment');

    expect(encoded).not.toBe('');
    expect(JSON.parse(decodeURIComponent(atob(encoded)))).toEqual({
      slice: {
        content: [{ type: 'media', children: [{ text: 'caption' }] }],
        openEnd: 0,
        openStart: 0,
      },
      version: 1,
    });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [2],
      focusPath: [2],
      kind: 'node',
      paths: [[2]],
    });

    const cutClipboard = createDataTransfer();

    await act(async () => {
      fireEvent.cut(editable, { clipboardData: cutClipboard });
    });

    expect(
      JSON.parse(
        decodeURIComponent(
          atob(cutClipboard.getData('application/x-editor-fragment'))
        )
      )
    ).toEqual({
      slice: {
        content: [{ type: 'media', children: [{ text: 'caption' }] }],
        openEnd: 0,
        openStart: 0,
      },
      version: 1,
    });
    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 6, path: [1, 0] },
      focus: { offset: 6, path: [1, 0] },
    });
  });

  test('printable input replaces the exact selected owner', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();

    await selectAsset(rendered);

    await act(async () => {
      expect(fireEvent.keyDown(editable, { key: 'x' })).toBe(false);
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'x' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 1, path: [2, 0] },
      focus: { offset: 1, path: [2, 0] },
    });
  });

  test('undo restores the exact directional node selection after printable replacement', async () => {
    const { editable, editor } = renderSelectableOwnerEditor(
      {},
      { history: true }
    );

    editor.update.selection.setNodes([[1], [2]], { anchor: [1], focus: [2] });

    await act(async () => {
      expect(fireEvent.keyDown(editable, { key: 'x' })).toBe(false);
    });

    await act(async () => {
      fireEvent.keyDown(editable, {
        code: 'KeyZ',
        ctrlKey: true,
        key: 'z',
      });
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(editor.read.value()).toEqual({ children: initialValue() });
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [1],
      focusPath: [2],
      kind: 'node',
      paths: [[1], [2]],
    });
  });

  test('beforeinput replaces a model-only node selection', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();

    await selectAsset(rendered);

    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: 'y',
      inputType: 'insertText',
    });

    expect(SelectionApi.isNode(getEditorLiveSelection(editor))).toBe(true);

    await act(async () => {
      editable.dispatchEvent(beforeInput);
    });

    expect(beforeInput.defaultPrevented).toBe(true);
    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'y' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 1, path: [2, 0] },
      focus: { offset: 1, path: [2, 0] },
    });
  });

  test('paste replaces the exact selected owner', async () => {
    const { editable, editor, rendered } = renderSelectableOwnerEditor();
    const clipboard = createDataTransfer();

    clipboard.setData('text/plain', 'paste');
    await selectAsset(rendered);

    await act(async () => {
      fireEvent.paste(editable, { clipboardData: clipboard });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'paste' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 5, path: [2, 0] },
      focus: { offset: 5, path: [2, 0] },
    });
  });

  test('paste handlers receive the exact multi-node selection', async () => {
    let projectedSelection: unknown;
    const selectedPaths: number[][] = [];
    const ClipboardObserverPlugin = definePlugin('clipboard-observer', {
      commands: ({ handle }) => [
        handle(domCommands.insertData, ({ state }) => {
          projectedSelection = state.selection();
          selectedPaths.push(
            ...state.selection.nodes().map(([, path]) => [...path])
          );

          return state.transaction(() => {});
        }),
      ],
    });
    const { editable, editor } = renderSelectableOwnerEditor(
      {},
      { plugins: [ClipboardObserverPlugin] }
    );
    const clipboard = createDataTransfer();

    clipboard.setData('text/plain', 'paste');
    editor.update.selection.setNodes([[1], [2]], {
      anchor: [1],
      focus: [2],
    });

    await act(async () => {
      fireEvent.paste(editable, { clipboardData: clipboard });
    });

    expect(projectedSelection).toEqual({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 7, path: [2, 0] },
    });
    expect(selectedPaths).toEqual([[1], [2]]);
    expect(getEditorLiveSelection(editor)).toEqual({
      anchorPath: [1],
      focusPath: [2],
      kind: 'node',
      paths: [[1], [2]],
    });
  });

  test('routes body-targeted paste to the focused node selection', async () => {
    const { editor, rendered } = renderSelectableOwnerEditor();
    const clipboard = createDataTransfer();

    clipboard.setData('text/plain', 'paste');
    await selectAsset(rendered);

    await act(async () => {
      fireEvent.paste(document.body, { clipboardData: clipboard });
    });

    expect(editor.read.value()).toEqual({
      children: [
        { type: 'paragraph', children: [{ text: 'start' }] },
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'paragraph', children: [{ text: 'paste' }] },
        { type: 'paragraph', children: [{ text: 'after' }] },
      ],
    });
    expect(editor.read((state) => state.selection())).toEqual({
      anchor: { offset: 5, path: [2, 0] },
      focus: { offset: 5, path: [2, 0] },
    });
  });
});

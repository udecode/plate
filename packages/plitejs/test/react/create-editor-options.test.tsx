import { runInNewContext } from 'node:vm';

import { renderHook } from '@testing-library/react';
import {
  createEditor as createHeadlessEditor,
  SelectionApi,
  type Value,
} from 'plitejs';
import { history } from 'plitejs/history';
import { createEditor, useEditor } from 'plitejs/react';

const initialValue: Value = [
  { children: [{ text: 'One' }], type: 'paragraph' },
];
const unknownValueMessage =
  'Unknown editor option "value". Use "initialValue" to set the document.';

describe('editor constructors given options the options object inherits', () => {
  it.each([
    [
      'plitejs createEditor',
      (inherited: object) => createHeadlessEditor(Object.create(inherited)),
    ],
    [
      'plitejs/react createEditor',
      (inherited: object) => createEditor(Object.create(inherited)),
    ],
  ])('%s builds the editor from them', (_entry, create) => {
    const caret = { offset: 1, path: [0, 0] };
    const editor = create({
      id: 'inherited',
      initialSelection: SelectionApi.text({ anchor: caret, focus: caret }),
      initialValue,
      maxLength: 5,
    });
    const viewOnly = create(
      Object.defineProperty({}, 'readOnly', { value: true })
    );
    const selection = editor.read.selection();

    editor.update.text.insert('abc', { at: { offset: 3, path: [0, 0] } });

    expect({
      id: editor.id,
      readOnly: viewOnly.read.view.isReadOnly(),
      selection,
      text: editor.read.text.string([]),
    }).toEqual({
      id: 'inherited',
      readOnly: true,
      selection: { anchor: caret, focus: caret },
      text: 'Oneab',
    });
  });
});

describe('editor constructors given an option they do not know', () => {
  it.each([
    [
      'plitejs createEditor',
      () =>
        // @ts-expect-error -- the document goes in initialValue
        createHeadlessEditor({
          plugins: [history()],
          value: initialValue,
        }),
    ],
    [
      'plitejs/react createEditor',
      () =>
        createEditor({
          plugins: [history()],
          // @ts-expect-error -- the document goes in initialValue
          value: initialValue,
        }),
    ],
    [
      'plitejs/react useEditor',
      () =>
        renderHook(() =>
          useEditor({
            plugins: [history()],
            // @ts-expect-error -- the document goes in initialValue
            value: initialValue,
          })
        ),
    ],
  ])('%s refuses it at compile time and at runtime', (_entry, create) => {
    expect(create).toThrow(unknownValueMessage);
  });

  it('plitejs/react useEditor refuses it on a later render', () => {
    const { rerender, result } = renderHook((options) => useEditor(options), {
      initialProps: Object.create({ initialValue }),
    });
    const children = result.current.read.children();
    let message: string | undefined;

    try {
      rerender(Object.create({ value: initialValue }));
    } catch (error) {
      ({ message } = error as Error);
    }

    expect({ children, message }).toEqual({
      children: initialValue,
      message: unknownValueMessage,
    });
  });

  it('refuses one the options inherit behind a getter without reading it', () => {
    let reads = 0;
    const options = Object.create(
      Object.defineProperty({}, 'value', {
        get: () => {
          reads += 1;

          return initialValue;
        },
      })
    );
    let message: string | undefined;

    try {
      createHeadlessEditor(options);
    } catch (error) {
      ({ message } = error as Error);
    }

    expect({ message, reads }).toEqual({
      message: unknownValueMessage,
      reads: 0,
    });
  });

  it('refuses an own one named after a key every object inherits', () => {
    expect(() =>
      createHeadlessEditor({ initialValue, toString: () => 'options' })
    ).toThrow('Unknown editor option "toString".');
  });

  it('refuses one inherited from a parent that has no prototype', () => {
    const parent = Object.assign(Object.create(null), { value: initialValue });

    expect(() => createHeadlessEditor(Object.create(parent))).toThrow(
      unknownValueMessage
    );
  });

  it('refuses one inherited from a parent after a script adds it to every object', () => {
    // oxlint-disable-next-line eslint/no-extend-native -- The case extends Object.prototype, as some scripts do, and restores it below.
    Object.defineProperty(Object.prototype, 'initialValu', {
      configurable: true,
      value: undefined,
      writable: true,
    });
    let message: string | undefined;

    try {
      createHeadlessEditor(Object.create({ initialValu: initialValue }));
    } catch (error) {
      ({ message } = error as Error);
    } finally {
      Reflect.deleteProperty(Object.prototype, 'initialValu');
    }

    expect(message).toBe('Unknown editor option "initialValu".');
  });

  it.each([
    [
      'in another realm',
      () =>
        runInNewContext(
          '({ initialValue: [{ children: [{ text: "One" }], type: "paragraph" }] })'
        ),
    ],
    [
      'from a class',
      () =>
        new (class Options {
          initialValue = initialValue;
        })(),
    ],
  ])('accepts options built %s', (_built, createOptions) => {
    const editor = createHeadlessEditor(createOptions());

    expect(JSON.stringify(editor.read((state) => state.children()))).toBe(
      JSON.stringify(initialValue)
    );
  });
});

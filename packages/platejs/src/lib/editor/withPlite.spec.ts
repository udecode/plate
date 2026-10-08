import { defineEditorSchema, schema } from '../../core';
import {
  createEditor as createPliteEditor,
  defineRuntimePluginSlot,
} from '../../facade';
import { createEditor } from './withPlite';

describe('createEditor', () => {
  it('uses one complete schema supplied through a runtime plugin', () => {
    const CustomSchema = defineEditorSchema('schema:custom', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const editor = createEditor({
      plugins: [CustomSchema],
      initialValue: [
        { children: [{ text: 'custom document' }], type: 'paragraph' },
      ],
    });

    expect(editor.read.schema.createDefaultRootChild()).toEqual({
      children: [{ text: '' }],
      type: 'paragraph',
    });
    expect(editor.read.text.string([])).toBe('custom document');
  });

  it('uses one complete schema supplied through a runtime plugin slot', () => {
    const CustomSchema = defineEditorSchema('schema:slotted-custom', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'slotted-custom',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const schemaSlot = defineRuntimePluginSlot('plate-schema-test');
    const editor = createEditor({
      plugins: [schemaSlot.of(CustomSchema)],
      initialValue: [
        { children: [{ text: 'slotted document' }], type: 'paragraph' },
      ],
    });

    expect(editor.read.schema.identity()).toMatchObject({
      id: 'slotted-custom',
      kind: 'named',
      version: 1,
    });
    expect(editor.read.text.string([])).toBe('slotted document');
  });
});

describe('createEditor removed options', () => {
  it('refuses an existing editor that the options hold as a hidden key', () => {
    const options = {};

    Object.defineProperty(options, 'editor', { value: createPliteEditor() });

    expect(() => createEditor(options)).toThrow(
      'Plate editor constructors always create a new editor'
    );
  });

  it.each([
    [
      'an inherited editor',
      () => Object.create({ editor: createPliteEditor() }),
      'Plate editor constructors always create a new editor',
    ],
    [
      'an undefined editor',
      () => ({ editor: undefined, readOnly: false }),
      'Plate editor constructors always create a new editor',
    ],
    [
      'an inherited editor that a proxy hides from the in operator',
      () =>
        new Proxy(Object.create({ editor: createPliteEditor() }), {
          has: (target, key) => key !== 'editor' && key in target,
        }),
      'Plate editor constructors always create a new editor',
    ],
    [
      'an editor that a proxy shows only through its has and get traps',
      () => {
        const backing = { editor: createPliteEditor() };

        return new Proxy(
          {},
          {
            get: (_target, key) => Reflect.get(backing, key),
            has: (_target, key) => Reflect.has(backing, key),
          }
        );
      },
      'Plate editor constructors always create a new editor',
    ],
    [
      'inherited migrations',
      () => Object.create({ migrations: {} }),
      'editor `migrations` is unsupported',
    ],
  ])('refuses %s', (_label, createOptions, message) => {
    expect(() => createEditor(createOptions())).toThrow(message);
  });

  it('refuses an editor getter without reading it', () => {
    let reads = 0;
    const options = {
      get editor() {
        reads += 1;

        return createPliteEditor();
      },
      readOnly: false,
    };
    let message: string | undefined;

    try {
      createEditor(options);
    } catch (error) {
      ({ message } = error as Error);
    }

    expect({ message, reads }).toEqual({
      message: expect.stringContaining(
        'Plate editor constructors always create a new editor'
      ),
      reads: 0,
    });
  });
});

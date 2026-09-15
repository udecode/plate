import { defineEditorSchema, schema } from '../../core';
import { defineRuntimePluginSlot } from '../../facade';
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

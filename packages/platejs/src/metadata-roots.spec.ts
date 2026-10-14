import { property, schema } from './core';
import { compare } from './diff';
import { exportDocx } from './docx/export/lib';
import { defineRuntimePlugin } from './facade';
import { serializeHtml } from './html';
import { createEditor } from './lib/editor';
import { ElementIdPlugin } from './lib/plugins/element-id';
import { serializeMarkdown } from './markdown';
import { serializePlainText } from './plain-text';

const RecordsPlugin = defineRuntimePlugin('records', {
  schema: {
    elements: {
      record: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { ctx: property.string() },
      },
    },
    roots: { $records: schema.content.type('record') },
  },
});

const record = () => ({ children: [{ text: '' }], ctx: 'c:1', type: 'record' });

const valueWithDuplicateRecords = {
  children: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
  roots: { $records: [record(), record()] },
};

describe('metadata roots', () => {
  it('keep generated element IDs off their records', () => {
    const editor = createEditor({
      initialValue: valueWithDuplicateRecords,
      plugins: [ElementIdPlugin, RecordsPlugin],
    });

    expect(editor.read.value().roots).toEqual({
      $records: [record(), record()],
    });
  });

  it('export to DOCX under the reject policy with no diagnostic', async () => {
    const editor = createEditor({
      initialValue: valueWithDuplicateRecords,
      plugins: [RecordsPlugin],
    });
    const result = await exportDocx(editor, { projection: 'proposed' });

    expect({ diagnostics: result.diagnostics, ok: result.ok }).toEqual({
      diagnostics: [],
      ok: true,
    });
  });

  it.each([
    [
      'HTML',
      () =>
        serializeHtml(valueWithDuplicateRecords, { plugins: [RecordsPlugin] }),
      '<p>Body</p>',
    ],
    [
      'Markdown',
      () =>
        serializeMarkdown(valueWithDuplicateRecords, {
          plugins: [RecordsPlugin],
        }),
      'Body\n',
    ],
    [
      'plain text',
      () =>
        serializePlainText(
          createEditor({
            initialValue: valueWithDuplicateRecords,
            plugins: [RecordsPlugin],
          })
        ),
      'Body',
    ],
  ])('serialize to %s with no diagnostic', (_format, serialize, data) => {
    const result = serialize();

    expect({ data: result.data, diagnostics: result.diagnostics }).toEqual({
      data,
      diagnostics: [],
    });
  });

  it('leave a records-only difference out of a comparison', async () => {
    const editor = createEditor({
      initialValue: valueWithDuplicateRecords,
      plugins: [RecordsPlugin],
    });
    const comparison = await compare({
      after: editor.read.value(),
      before: { ...editor.read.value(), roots: { $records: [record()] } },
      schema: editor.read.schema,
    });

    expect(comparison.changes).toEqual([]);
  });
});

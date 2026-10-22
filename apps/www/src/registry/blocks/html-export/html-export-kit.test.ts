import { describe, expect, it } from 'bun:test';

import { createEditor as createStaticEditor } from 'platejs';
import { createEditor, ParagraphPlugin } from 'platejs/react';

import { HtmlExportKit } from '@/registry/components/editor/html-export-kit';
import { HtmlExportSchemaKit } from '@/registry/components/editor/html-export-schema-kit';

describe('HtmlExportKit', () => {
  const createValue = () => ({
    children: [
      {
        children: [{ text: 'Heading' }],
        id: 'heading-id',
        type: 'paragraph',
      },
    ],
  });

  it('accepts ids in the static export editor value', () => {
    expect(() =>
      createStaticEditor({
        plugins: HtmlExportKit,
        initialValue: createValue(),
      })
    ).not.toThrow();
  });

  it('accepts ids in the client editor value', () => {
    expect(() =>
      createEditor({
        plugins: [ParagraphPlugin, ...HtmlExportSchemaKit],
        initialValue: createValue(),
      })
    ).not.toThrow();
  });
});

import { describe, expect, it } from 'bun:test';

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

  it('declares the static schema owner for element ids', () => {
    expect(HtmlExportKit.map((plugin) => plugin.name)).toContain('elementId');
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

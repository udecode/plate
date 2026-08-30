import { describe, expect, it } from 'bun:test';

import { createEditor, ParagraphPlugin } from 'platejs/react';

import { PlateToHtmlClientSchemaKit } from '@/registry/components/editor/plate-to-html-client-kit';
import { PlateToHtmlEditorKit } from '@/registry/components/editor/plate-to-html-kit';

describe('PlateToHtmlEditorKit', () => {
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
    expect(PlateToHtmlEditorKit.map((plugin) => plugin.name)).toContain(
      'elementId'
    );
  });

  it('accepts ids in the client editor value', () => {
    expect(() =>
      createEditor({
        plugins: [ParagraphPlugin, ...PlateToHtmlClientSchemaKit],
        initialValue: createValue(),
      })
    ).not.toThrow();
  });
});

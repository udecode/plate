import { describe, expect, it } from 'bun:test';

import JSZip from 'jszip';
import { createEditor, type Value } from 'platejs';
import { exportDocx } from 'platejs/docx/export';

import { DOCX_EXPORT_STYLES } from './docx-export';
import { EditorStatic } from './editor-static';
import { BaseEditorKit } from './plugins-static';

const exportXml = async (initialValue: Value, stylesheet: string) => {
  const editor = createEditor({ initialValue, plugins: BaseEditorKit });
  const result = await exportDocx(editor, {
    component: EditorStatic,
    presentation: BaseEditorKit,
    projection: 'proposed',
    stylesheet,
  });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  return zip.file('word/document.xml')!.async('string');
};

describe('DOCX_EXPORT_STYLES', () => {
  it('lets the app stylesheet restyle a code block', async () => {
    const xml = await exportXml(
      [{ children: [{ text: 'CODE' }], type: 'codeBlock' }] as Value,
      `${DOCX_EXPORT_STYLES}
.editor-codeBlock > [data-docx-preserve-whitespace] {
  background-color: #123456;
  font-family: Arial;
  font-size: 14pt;
}`
    );

    expect(xml).toMatch(/w:fill="123456"/i);
    expect(xml).toContain('w:ascii="Arial"');
    expect(xml).toContain('<w:sz w:val="28"/>');
  });

  it('gives callout cells the default background', async () => {
    const xml = await exportXml(
      [{ children: [{ text: 'Note' }], icon: '💡', type: 'callout' }] as Value,
      DOCX_EXPORT_STYLES
    );

    expect(xml.match(/w:fill="f4f4f5"/gi)).toHaveLength(2);
  });
});

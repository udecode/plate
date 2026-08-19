import { DocxExportPlugin as LeafDocxExportPlugin } from '@platejs/docx-export';
import { DocxImportPlugin as LeafDocxImportPlugin } from '@platejs/docx-import';
import { DocxPastePlugin as LeafDocxPastePlugin } from '@platejs/docx-paste';

import { DocxExportPlugin, DocxImportPlugin, DocxPastePlugin } from './index';

describe('@platejs/docx', () => {
  it('reexports each focused DOCX descriptor', () => {
    expect(DocxPastePlugin).toBe(LeafDocxPastePlugin);
    expect(DocxImportPlugin).toBe(LeafDocxImportPlugin);
    expect(DocxExportPlugin).toBe(LeafDocxExportPlugin);
  });
});

import { getPlateRuntime } from 'platejs';
import { createEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { DocxKit } from '@/registry/components/editor/docx';
import { deserializeDocxValue } from '@/registry/examples/values/deserialize-docx-value';

describe('DOCX example composition', () => {
  it('installs each full-DOCX capability once', () => {
    const editor = createEditor({
      plugins: [...BasicBlocksKit, ...DocxKit],
      initialValue: deserializeDocxValue,
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    for (const name of ['docxPaste', 'docxImport', 'docxExport', 'juice']) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }
  });
});

import { compileEditor } from 'platejs/compiler';
import { createEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { DocxKit } from '@/registry/components/editor/docx';
import { deserializeDocxValue } from '@/registry/examples/values/deserialize-docx-value';

describe('DOCX example composition', () => {
  it('installs the DOCX paste capability once', () => {
    const editor = createEditor({
      plugins: [...BasicBlocksKit, ...DocxKit],
      initialValue: deserializeDocxValue,
    });
    const names = compileEditor({
      plugins: [...BasicBlocksKit, ...DocxKit],
    }).bindings.map((binding) => binding.name);

    expect(editor.plugin('docx').installed).toBe(true);
    expect(names.filter((name) => name === 'docx')).toHaveLength(1);
  });
});

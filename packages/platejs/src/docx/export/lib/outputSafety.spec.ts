import JSZip from 'jszip';

import { createEditor } from '../../../core';
import { exportDocx } from './exportDocx';
import { checkDocxOutput } from './outputSafety';

const RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

const exportBody = async () => {
  const result = await exportDocx(
    createEditor({
      initialValue: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
    }),
    { projection: 'proposed' }
  );

  if (!result.ok) throw new Error('Fixture DOCX generation failed.');

  return JSZip.loadAsync(await result.blob.arrayBuffer());
};

const edit = async (
  zip: JSZip,
  name: string,
  change: (source: string) => string
) => {
  const source = await zip.file(name)!.async('string');

  zip.file(name, change(source));
};

describe('checkDocxOutput', () => {
  it('accepts writer output', async () => {
    const zip = await exportBody();

    expect(
      await checkDocxOutput(await zip.generateAsync({ type: 'blob' }))
    ).toBeNull();
  });

  it('withholds an active field written into the body', async () => {
    const zip = await exportBody();

    await edit(zip, 'word/document.xml', (source) =>
      source.replace(
        '</w:body>',
        '<w:p><w:fldSimple w:instr=" DDEAUTO cmd.exe "/></w:p></w:body>'
      )
    );

    expect(
      await checkDocxOutput(await zip.generateAsync({ type: 'blob' }))
    ).toEqual({
      code: 'invalid-package',
      message: expect.stringContaining('DDEAUTO'),
      part: 'word/document.xml',
      severity: 'error',
    });
  });

  it('withholds a written script hyperlink', async () => {
    const zip = await exportBody();

    await edit(zip, 'word/_rels/document.xml.rels', (source) =>
      source.replace(
        '</Relationships>',
        `<Relationship Id="rIdScript" Type="${RELATIONSHIPS}/hyperlink" Target="javascript:alert(1)" TargetMode="External"/></Relationships>`
      )
    );

    expect(
      await checkDocxOutput(await zip.generateAsync({ type: 'blob' }))
    ).toEqual(
      expect.objectContaining({
        code: 'invalid-package',
        part: 'word/_rels/document.xml.rels',
      })
    );
  });

  it('reports malformed written XML as an invalid package', async () => {
    const zip = await exportBody();

    zip.file('word/document.xml', '<w:document');

    expect(
      await checkDocxOutput(await zip.generateAsync({ type: 'blob' }))
    ).toEqual(
      expect.objectContaining({ code: 'invalid-package', severity: 'error' })
    );
  });
});

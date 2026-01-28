import { expect } from 'vitest';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { getTestDataByFileName } from '@tests/helpers/helpers.js';
import { getExportedResult } from '../../export/export-helpers/index';
import { loadTestDataForEditorTests, initTestEditor } from '@tests/helpers/helpers.js';

describe('[sdt-node-comment.docx] Test basic text SDT tag from gdocs', async () => {
  const fileName = 'sdt-node-comment.docx';
  let docx, media, mediaFiles, fonts, editor, dispatch;
  let doc;
  let exported, body;

  beforeAll(async () => {
    ({ docx, media, mediaFiles, fonts } = await loadTestDataForEditorTests(fileName));
    ({ editor, dispatch } = initTestEditor({ content: docx, media, mediaFiles, fonts }));
    doc = editor.getJSON();

    exported = await getExportedResult(fileName);
    body = exported.elements?.find((el) => el.name === 'w:body');
  });

  it('imports the sdt node with content', () => {
    const content = doc.content;
    expect(content.length).toBe(2);

    const p1 = content[0];
    expect(p1.type).toBe('paragraph');
    expect(p1.content.length).toBe(2);

    const sdtNode = p1.content[0];
    expect(sdtNode.type).toBe('structuredContent');
    expect(sdtNode.content.length).toBe(3);
    expect(sdtNode.attrs.sdtPr).toBeDefined();

    const sdtPr = sdtNode.attrs.sdtPr;
    expect(sdtPr.elements.length).toBe(3);
    expect(sdtPr.name).toBe('w:sdtPr');

    const { marks } = sdtNode;
    expect(marks.length).toBe(2);

    const bold = marks.find((mark) => mark.type === 'bold');
    expect(bold).toBeDefined();

    const textStyle = marks.find((mark) => mark.type === 'textStyle');
    expect(textStyle).toBeDefined();

    const textBeforeComment = sdtNode.content[0];
    expect(textBeforeComment.type).toBe('text');
    expect(textBeforeComment.text).toBe('SDT field with ');

    const commentText = sdtNode.content[1];
    expect(commentText.type).toBe('text');
    expect(commentText.text).toBe('text and comment');

    const extraTextAfterSdt = p1.content[1];
    expect(extraTextAfterSdt.type).toBe('text');
    expect(extraTextAfterSdt.text).toBe(' text');

    const { marks: extraTextMarks } = extraTextAfterSdt;
    expect(extraTextMarks.length).toBe(2);
    const extraBold = extraTextMarks.find((mark) => mark.type === 'bold');
    expect(extraBold).toBeDefined();

    const extraTextStyle = extraTextMarks.find((mark) => mark.type === 'textStyle');
    expect(extraTextStyle).toBeDefined();
  });

  it('exports the sdt node correctly', () => {
    const p1 = body.elements[0];

    const sdtNode = p1.elements[1];
    expect(sdtNode).toBeDefined();
    expect(sdtNode.name).toBe('w:sdt');
    expect(sdtNode.elements.length).toBe(2);

    const sdtPr = sdtNode.elements[0];
    expect(sdtPr.name).toBe('w:sdtPr');
    expect(sdtPr.elements.length).toBe(3);

    const sdtContent = sdtNode.elements[1];
    expect(sdtContent.name).toBe('w:sdtContent');
    expect(sdtContent.elements.length).toBe(2);

    const textBeforeComment = sdtContent.elements[0]?.elements.find((el) => el.name === 'w:t');
    expect(textBeforeComment.name).toBe('w:t');
    expect(textBeforeComment.elements[0].text).toBe('SDT field with ');

    const commentText = sdtContent.elements[1]?.elements.find((el) => el.name === 'w:t');
    expect(commentText.name).toBe('w:t');
    expect(commentText.elements[0].text).toBe('text and comment');

    const extraTextAfterSdt = p1.elements[2]?.elements.find((el) => el.name === 'w:t');
    expect(extraTextAfterSdt.name).toBe('w:t');
    expect(extraTextAfterSdt.elements[0].text).toBe(' text');
  });
});

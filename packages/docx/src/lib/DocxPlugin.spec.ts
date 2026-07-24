import { createBaseEditor, prepareHtmlPluginContext } from '@platejs/core';

import { DocxPlugin } from './DocxPlugin';
import { cleanDocx } from './docx-cleaner/cleanDocx';

describe('DocxPlugin', () => {
  const editor = createBaseEditor({
    plugins: [DocxPlugin],
  });
  const createContext = prepareHtmlPluginContext(editor, DocxPlugin);
  const context = editor.read((state) => createContext(state));
  const source = (dataTransfer: DataTransfer) => ({
    files: dataTransfer.files,
    getData: (format: string) => dataTransfer.getData(format),
    types: [...dataTransfer.types],
  });

  it('routes html transformData through cleanDocx with rtf input', () => {
    const transformData = DocxPlugin.parsers.html?.transformData;
    const html = '<p class="MsoQuote">Quote</p>';
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/rtf', '{\\rtf1}');

    expect(transformData).toBeDefined();

    if (!transformData) return;

    expect(
      transformData({
        ...context,
        data: html,
        format: 'text/html',
        source: source(dataTransfer),
      })
    ).toBe(cleanDocx(html, '{\\rtf1}'));
  });

  it('normalizes docx list content before node matching', () => {
    const transformData = DocxPlugin.parsers.html?.transformData;
    const html =
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span><!--[if !supportLists]--><span>drop</span><!--[endif]-->Item</p>';
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const listItem = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelector('li') as HTMLElement;

    expect(listItem.dataset.indent).toBe('2');
    expect(listItem.dataset.listStyleType).toBe('decimal');
    expect(listItem.innerHTML).not.toContain('mso-list:Ignore');
    expect(listItem.innerHTML).not.toContain('[if !supportLists]');
    expect(listItem.textContent).toContain('Item');
  });

  it('normalizes paragraph indentation and suppresses docx images', () => {
    const transformData = DocxPlugin.parsers.html?.transformData;
    const dataTransfer = new DataTransfer();
    dataTransfer.setData(
      'text/rtf',
      String.raw`\shp shplid2049 jpegblip bliptag ffd8ff}`
    );

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: [
        '<p class="MsoNormal" style="margin-left:72pt;text-indent:36pt">Body</p>',
        '<img src="https://cdn.example.com/image.png" />',
        '<v:shape o:spid="_x0000_s2049"><v:imagedata src="file:///C:/shape.png"></v:imagedata></v:shape>',
      ].join(''),
      format: 'text/html',
      source: source(dataTransfer),
    });
    const body = new DOMParser().parseFromString(result, 'text/html').body;
    const paragraph = body.querySelector('p') as HTMLElement;

    expect(paragraph.dataset.indent).toBe('2');
    expect(paragraph.dataset.textIndent).toBe('1');
    expect(body.querySelector('img')).toBeNull();
  });

  it('does not suppress images in ordinary html', () => {
    const transformData = DocxPlugin.parsers.html?.transformData;
    const dataTransfer = new DataTransfer();
    const html = '<p>plain html</p><img src="/plain.png" />';

    expect(transformData).toBeDefined();

    if (!transformData) return;

    expect(
      transformData({
        ...context,
        data: html,
        format: 'text/html',
        source: source(dataTransfer),
      })
    ).toBe(html);
  });
});

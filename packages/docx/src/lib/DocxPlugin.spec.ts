import { createBaseEditor, prepareParserPluginContext } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { DocxPlugin } from './DocxPlugin';
import { cleanDocx } from './docx-cleaner/cleanDocx';

describe('DocxPlugin', () => {
  const editor = createBaseEditor({
    plugins: [DocxPlugin],
  });
  const createContext = prepareParserPluginContext(editor, DocxPlugin);
  const context = editor.read((state) => createContext(state));
  const source = (dataTransfer: DataTransfer) => ({
    files: dataTransfer.files,
    getData: (format: string) => dataTransfer.getData(format),
    types: [...dataTransfer.types],
  });

  it('routes html transformData through cleanDocx with rtf input', () => {
    const transformData =
      DocxPlugin.inject?.plugins?.[KEYS.html]?.parser?.transformData;
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

  it('parses docx list content into indent and list metadata', () => {
    const parse =
      DocxPlugin.override.plugins?.p?.parsers?.html?.deserializer?.parse;
    const element = new DOMParser().parseFromString(
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span><!--[if !supportLists]--><span>drop</span><!--[endif]-->Item</p>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(parse).toBeDefined();

    if (!parse) return;

    expect(parse({ ...context, element, node: {}, type: 'p' })).toEqual({
      indent: 2,
      listStyleType: 'decimal',
      type: 'p',
    });
    expect(element.innerHTML).not.toContain('mso-list:Ignore');
    expect(element.innerHTML).not.toContain('[if !supportLists]');
    expect(element.textContent).toContain('Item');
  });

  it('parses paragraph indentation and image query gating', () => {
    const parse =
      DocxPlugin.override.plugins?.p?.parsers?.html?.deserializer?.parse;
    const query = DocxPlugin.override.plugins?.img?.parser?.query;
    const element = new DOMParser().parseFromString(
      '<p style="margin-left:72pt;text-indent:36pt">Body</p>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(parse).toBeDefined();
    expect(query).toBeDefined();

    if (!parse || !query) return;

    expect(parse({ ...context, element, node: {}, type: 'p' })).toEqual({
      indent: 2,
      textIndent: 1,
      type: 'p',
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.setData('text/html', '<p class="MsoNormal">docx</p>');

    expect(
      query({
        ...context,
        data: '',
        format: 'text/html',
        source: source(dataTransfer),
      })
    ).toBe(false);

    dataTransfer.setData('text/html', '<p>plain html</p>');

    expect(
      query({
        ...context,
        data: '',
        format: 'text/html',
        source: source(dataTransfer),
      })
    ).toBe(true);
  });
});

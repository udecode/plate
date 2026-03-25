import { KEYS } from 'platejs';

import { DocxPlugin } from './DocxPlugin';
import { cleanDocx } from './docx-cleaner/cleanDocx';

describe('DocxPlugin', () => {
  const docxPlugin = DocxPlugin as any;

  it('routes html transformData through cleanDocx with rtf input', () => {
    const transformData =
      docxPlugin.inject.plugins[KEYS.html].parser.transformData;
    const html = '<p class="MsoQuote">Quote</p>';
    const dataTransfer = {
      getData: (type: string) => (type === 'text/rtf' ? '{\\rtf1}' : ''),
    };

    expect(transformData({ data: html, dataTransfer })).toBe(
      cleanDocx(html, '{\\rtf1}')
    );
  });

  it('parses docx list content into indent and list metadata', () => {
    const parse = docxPlugin.override.plugins.p.parsers.html.deserializer.parse;
    const element = new DOMParser().parseFromString(
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span><!--[if !supportLists]--><span>drop</span><!--[endif]-->Item</p>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(parse({ element, type: 'p' })).toEqual({
      indent: 2,
      listStyleType: 'decimal',
      type: 'p',
    });
    expect(element.innerHTML).not.toContain('mso-list:Ignore');
    expect(element.innerHTML).not.toContain('[if !supportLists]');
    expect(element.textContent).toContain('Item');
  });

  it('parses paragraph indentation and image query gating', () => {
    const parse = docxPlugin.override.plugins.p.parsers.html.deserializer.parse;
    const query = docxPlugin.override.plugins.img.parser.query;
    const element = new DOMParser().parseFromString(
      '<p style="margin-left:72pt;text-indent:36pt">Body</p>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(parse({ element, type: 'p' })).toEqual({
      indent: 2,
      textIndent: 1,
      type: 'p',
    });
    expect(
      query({
        dataTransfer: {
          getData: () => '<p class="MsoNormal">docx</p>',
        },
      })
    ).toBe(false);
    expect(
      query({
        dataTransfer: {
          getData: () => '<p>plain html</p>',
        },
      })
    ).toBe(true);
  });
});

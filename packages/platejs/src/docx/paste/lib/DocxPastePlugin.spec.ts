import {
  createEditor,
  prepareHtmlPluginContext,
  prepareHtmlRegistry,
} from '../../../core';
import { cleanWordHtml } from './cleanWordHtml';
import { DocxPastePlugin } from './DocxPastePlugin';

describe('DocxPastePlugin', () => {
  const editor = createEditor({
    plugins: [DocxPastePlugin],
  });
  const createContext = prepareHtmlPluginContext(editor, DocxPastePlugin);
  const context = editor.read((state) => createContext(state));
  const transformData = prepareHtmlRegistry(editor).plugins.find(
    ({ name }) => name === DocxPastePlugin.name
  )?.transformData;
  const source = (dataTransfer: DataTransfer) => ({
    files: dataTransfer.files,
    getData: (format: string) => dataTransfer.getData(format),
    types: [...dataTransfer.types],
  });

  it('routes html transformData through cleanWordHtml with rtf input', () => {
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
    ).toBe(cleanWordHtml(html, '{\\rtf1}'));
  });

  it('normalizes docx list content before node matching', () => {
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
    expect(listItem.dataset.listType).toBe('numbered');
    expect(listItem.innerHTML).not.toContain('mso-list:Ignore');
    expect(listItem.innerHTML).not.toContain('[if !supportLists]');
    expect(listItem.textContent).toContain('Item');
  });

  it('recognizes Word list marker declarations with additional styles', () => {
    const html =
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore;font-family:Symbol">1.</span>Item</p>';
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const item = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelector<HTMLElement>('li');

    expect(item?.dataset.listType).toBe('numbered');
    expect(item?.textContent).toBe('Item');
  });

  it('keeps alpha and roman inference scoped to each Word list identity', () => {
    const html = [
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">f.</span>Alpha</p>',
      '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">i.</span>Roman</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[0].dataset.listStyle).toBe('lower-alpha');
    expect(items[1].dataset.listStyle).toBe('lower-roman');
  });

  it('prefers Word list declarations for ambiguous markers', () => {
    const html = [
      '<style>@list l0:level1 {mso-level-number-format:alpha-lower;}</style>',
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">i.</span>Alpha nine</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const item = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelector<HTMLElement>('li');

    expect(item?.dataset.listStyle).toBe('lower-alpha');
    expect(item?.dataset.listRestart).toBe('9');
  });

  it('recognizes parenthesized Word list markers as ordered', () => {
    const html =
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1)</span>Item</p>';
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const item = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelector<HTMLElement>('li');

    expect(item?.dataset.listType).toBe('numbered');
  });

  it('recognizes Word list markers wrapped in parentheses', () => {
    const html =
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">(1)</span>Item</p>';
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const item = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelector<HTMLElement>('li');

    expect(item?.dataset.listType).toBe('numbered');
  });

  it('preserves Word sequence identities and explicit starts', () => {
    const html = [
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>First</p>',
      '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">1.</span>Restart</p>',
      '<p style="mso-list:l2 level1 lfo3"><span style="mso-list:Ignore">5)</span>Five</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[0].dataset.listRestart).toBeUndefined();
    expect(items[1].dataset.listRestart).toBe('1');
    expect(items[2].dataset.listRestart).toBe('5');
  });

  it('emits boundaries when Word list identities interleave', () => {
    const html = [
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>A1</p>',
      '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">1.</span>B1</p>',
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>A2</p>',
      '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">2.</span>B2</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect([...items].map((item) => item.dataset.listRestart)).toEqual([
      undefined,
      '1',
      '2',
      '2',
    ]);
  });

  it('uses the final component of compound decimal markers', () => {
    const html = [
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.1</span>Child one</p>',
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.2</span>Child two</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[1].dataset.listRestart).toBeUndefined();
  });

  it('uses the final component of compound alpha and roman markers', () => {
    const html = [
      '<style>@list l0:level2 {mso-level-number-format:alpha-lower;} @list l1:level2 {mso-level-number-format:roman-lower;}</style>',
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.a.</span>Alpha one</p>',
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.b.</span>Alpha two</p>',
      '<p style="mso-list:l1 level2 lfo2"><span style="mso-list:Ignore">1.i.</span>Roman one</p>',
      '<p style="mso-list:l1 level2 lfo2"><span style="mso-list:Ignore">1.ii.</span>Roman two</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect([...items].map((item) => item.dataset.listRestart)).toEqual([
      undefined,
      undefined,
      '1',
      undefined,
    ]);
  });

  it('preserves a nested ordinal after returning to a shallower level', () => {
    const html = [
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>Parent one</p>',
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span>Child one</p>',
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>Parent two</p>',
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">2.</span>Child two</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[3].dataset.listRestart).toBe('2');
  });

  it('emits a boundary when an ordered Word list resumes after a paragraph', () => {
    const html = [
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>One</p>',
      '<p class="MsoNormal">Break</p>',
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>Two</p>',
    ].join('');
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[1].dataset.listRestart).toBe('2');
  });

  it.each([
    [
      'an unmatched block',
      [
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>One</p>',
        '<hr>',
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>Two</p>',
      ].join(''),
    ],
    [
      'a container boundary',
      [
        '<div><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>One</p></div>',
        '<div><p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>Two</p></div>',
      ].join(''),
    ],
  ])('emits a boundary after %s', (_, html) => {
    const dataTransfer = new DataTransfer();

    expect(transformData).toBeDefined();

    if (!transformData) return;

    const result = transformData({
      ...context,
      data: html,
      format: 'text/html',
      source: source(dataTransfer),
    });
    const items = new DOMParser()
      .parseFromString(result, 'text/html')
      .body.querySelectorAll<HTMLElement>('li');

    expect(items[1].dataset.listRestart).toBe('2');
  });

  it('normalizes paragraph indentation and suppresses docx images', () => {
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
    const { body } = new DOMParser().parseFromString(result, 'text/html');
    const paragraph = body.querySelector('p') as HTMLElement;

    expect(paragraph.dataset.indent).toBe('2');
    expect(paragraph.dataset.textIndent).toBe('1');
    expect(body.querySelector('img')).toBeNull();
  });

  it('does not suppress images in ordinary html', () => {
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

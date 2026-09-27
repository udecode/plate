import { createEditor, ElementApi, NodeApi, PLUGINS } from '../../../core';
import { BaseBoldPlugin } from '../../../features/basic-nodes/lib/BaseMarkPlugins';
import { BaseTextIndentPlugin } from '../../../features/basic-styles/lib/BaseStylePlugins';
import { BaseIndentPlugin } from '../../../features/indent/lib/BaseIndentPlugin';
import { BaseListPlugin } from '../../../features/list/lib/BaseListPlugin';
import { BaseImagePlugin } from '../../../features/media/lib/image/BaseImagePlugin';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
} from '../../../features/table/lib/BaseTablePlugin';
import { WordPastePlugin } from './WordPastePlugin';

const createTransfer = (html: string, rtf = '') => {
  const transfer = new DataTransfer();

  transfer.setData('text/html', html);
  if (rtf) transfer.setData('text/rtf', rtf);

  return transfer;
};

const insertHtml = (
  html: string,
  options: Readonly<{
    plugins?: Parameters<typeof createEditor>[0]['plugins'];
    rtf?: string;
  }> = {}
) => {
  const editor = createEditor({
    plugins: [...(options.plugins ?? []), WordPastePlugin],
  });

  expect(
    editor.api.dom.clipboard.insertData(createTransfer(html, options.rtf))
  ).toBe(true);

  return editor;
};

describe('WordPastePlugin', () => {
  it('leaves ordinary html to the installed html format', () => {
    const editor = insertHtml('<p>plain html</p>');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'plain html' }], type: 'paragraph' },
    ]);
  });

  it('cleans Word-only comments and nodes before html parsing', () => {
    const editor = insertHtml(
      [
        '<p class="MsoNormal">Before</p>',
        '<p><br /><!--[if !supportLineBreakNewLine]--><span>drop</span><!--[endif]-->After</p>',
        '<img src="file:///C:/word.png" />',
      ].join(''),
      { rtf: '{\\rtf1}' }
    );

    expect(
      editor.read.children().map((node) => NodeApi.string(node).trim())
    ).toEqual(['Before', 'After']);
  });

  it('inlines Word styles before the installed html parser runs', () => {
    const editor = insertHtml(
      '<style><!-- .x { font-weight: 700; } --></style><p class="MsoNormal x">Bold</p>',
      { plugins: [BaseBoldPlugin] }
    );

    expect(editor.read.children()).toEqual([
      {
        children: [{ bold: true, text: 'Bold' }],
        type: 'paragraph',
      },
    ]);
  });

  it('normalizes Word list markers through public DataTransfer insertion', () => {
    const editor = insertHtml(
      [
        '<style>@list l0:level1 {mso-level-number-format:alpha-lower;}</style>',
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">i.</span>Alpha nine</p>',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );
    const item = editor.read.children()[0];

    expect(NodeApi.string(item)).toBe('Alpha nine');
    expect(item).toEqual(
      expect.objectContaining({
        indent: 1,
        listRestart: 9,
        listStyle: 'lower-alpha',
      })
    );
  });

  it('preserves list sequence boundaries and nested ordinals', () => {
    const editor = insertHtml(
      [
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>Parent one</p>',
        '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span>Child one</p>',
        '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">1.</span>Restart</p>',
        '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">2.</span>Child two</p>',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );
    const children = editor.read.children();

    expect(children.map(NodeApi.string)).toEqual([
      'Parent one',
      'Child one',
      'Restart',
      'Child two',
    ]);
    expect(children.map((node) => Reflect.get(node, 'listRestart'))).toEqual([
      undefined,
      undefined,
      1,
      2,
    ]);
  });

  it('keeps alpha and roman inference scoped to each Word list identity', () => {
    const editor = insertHtml(
      [
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">f.</span>Alpha</p>',
        '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">i.</span>Roman</p>',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );

    expect(
      editor.read.children().map((node) => Reflect.get(node, 'listStyle'))
    ).toEqual(['lower-alpha', 'lower-roman']);
  });

  it.each(['1)', '(1)'])(
    'recognizes the parenthesized Word marker %s as ordered',
    (marker) => {
      const editor = insertHtml(
        `<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">${marker}</span>Item</p>`,
        { plugins: [BaseListPlugin] }
      );

      expect(editor.read.children()[0]).toEqual(
        expect.objectContaining({ listType: 'numbered' })
      );
    }
  );

  it('preserves explicit starts across interleaved Word sequences', () => {
    const editor = insertHtml(
      [
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>A1</p>',
        '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">1.</span>B1</p>',
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>A2</p>',
        '<p style="mso-list:l1 level1 lfo2"><span style="mso-list:Ignore">2.</span>B2</p>',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );

    expect(
      editor.read.children().map((node) => Reflect.get(node, 'listRestart'))
    ).toEqual([undefined, 1, 2, 2]);
  });

  it('uses the final component of compound Word markers', () => {
    const editor = insertHtml(
      [
        '<style>@list l0:level2 {mso-level-number-format:alpha-lower;} @list l1:level2 {mso-level-number-format:roman-lower;}</style>',
        '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.a.</span>Alpha one</p>',
        '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.b.</span>Alpha two</p>',
        '<p style="mso-list:l1 level2 lfo2"><span style="mso-list:Ignore">1.i.</span>Roman one</p>',
        '<p style="mso-list:l1 level2 lfo2"><span style="mso-list:Ignore">1.ii.</span>Roman two</p>',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );

    expect(
      editor.read.children().map((node) => Reflect.get(node, 'listRestart'))
    ).toEqual([undefined, undefined, 1, undefined]);
  });

  it.each([
    ['a paragraph', '<p class="MsoNormal">Break</p>'],
    ['an unmatched block', '<hr>'],
    ['a container boundary', '</div><div>'],
  ])('emits a restart after %s', (_label, boundary) => {
    const editor = insertHtml(
      [
        boundary === '</div><div>' ? '<div>' : '',
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">1.</span>One</p>',
        boundary,
        '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">2.</span>Two</p>',
        boundary === '</div><div>' ? '</div>' : '',
      ].join(''),
      { plugins: [BaseListPlugin] }
    );
    const listItems = editor.read
      .children()
      .filter((node) => Reflect.has(node, 'listType'));

    expect(listItems.at(-1)).toEqual(
      expect.objectContaining({ listRestart: 2 })
    );
  });

  it('normalizes Word indentation and suppresses Word images only', () => {
    const wordEditor = insertHtml(
      [
        '<p class="MsoNormal" style="margin-left:72pt;text-indent:36pt">Body</p>',
        '<img src="https://cdn.example.com/word.png" />',
      ].join(''),
      {
        plugins: [BaseImagePlugin, BaseIndentPlugin, BaseTextIndentPlugin],
      }
    );

    expect(wordEditor.read.children()).toEqual([
      expect.objectContaining({ indent: 2, textIndent: 1, type: 'paragraph' }),
    ]);

    const plainEditor = insertHtml(
      '<p>Body</p><img src="https://cdn.example.com/plain.png" />',
      { plugins: [BaseImagePlugin] }
    );

    expect(plainEditor.read.children()).toEqual([
      { children: [{ text: 'Body' }], type: 'paragraph' },
      expect.objectContaining({
        type: plainEditor.plugin(BaseImagePlugin).schema.type,
        url: 'https://cdn.example.com/plain.png',
      }),
    ]);
  });

  it('strips Word table presentation after html parsing', () => {
    const tableHtml = [
      '<table><colgroup><col style="width: 120px" /></colgroup>',
      '<tbody><tr><td style="border: 2px solid red; width: 120px"><p>Cell</p></td></tr></tbody>',
      '</table>',
    ].join('');
    const plainEditor = createEditor({ plugins: [BaseTablePlugin] });

    expect(
      plainEditor.api.dom.clipboard.insertData(createTransfer(tableHtml))
    ).toBe(true);

    const plainTable = plainEditor.read
      .children()
      .find(
        (node) => ElementApi.isElement(node) && node.type === PLUGINS.table
      );
    const plainCell = ElementApi.isElement(plainTable)
      ? plainTable.children
          .flatMap((row) => (ElementApi.isElement(row) ? row.children : []))
          .find(
            (node) =>
              ElementApi.isElement(node) &&
              node.type === plainEditor.plugin(BaseTableCellPlugin).schema.type
          )
      : undefined;

    expect(plainTable).toHaveProperty('columnWidths', [120]);
    expect(plainCell).toHaveProperty('borders');

    const editor = insertHtml(`<p class="MsoNormal">Before</p>${tableHtml}`, {
      plugins: [BaseTablePlugin],
    });
    const table = editor.read
      .children()
      .find(
        (node) => ElementApi.isElement(node) && node.type === PLUGINS.table
      );
    const cell = ElementApi.isElement(table)
      ? table.children
          .flatMap((row) => (ElementApi.isElement(row) ? row.children : []))
          .find(
            (node) =>
              ElementApi.isElement(node) &&
              node.type === editor.plugin(BaseTableCellPlugin).schema.type
          )
      : undefined;

    expect(table).toBeDefined();
    expect(table).not.toHaveProperty('columnWidths');
    expect(cell).toBeDefined();
    expect(cell).not.toHaveProperty('borders');
    expect(cell).not.toHaveProperty('size');
  });
});

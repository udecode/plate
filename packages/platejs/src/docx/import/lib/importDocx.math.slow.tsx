import JSZip from 'jszip';
import katex from 'katex';
import React from 'react';

import { createEditor } from '../../../core';
import { BaseIndentPlugin } from '../../../features/indent';
import { BaseListPlugin } from '../../../features/list';
import { BaseParagraphPlugin } from '../../../lib';
import { BaseEquationPlugin, BaseInlineEquationPlugin } from '../../../math';
import { exportDocx } from '../../export/lib/exportDocx';
import { importDocx } from './importDocx';

const plugins = [
  BaseParagraphPlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
];

const M =
  'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"';
const W =
  'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const run = (text: string, properties = '') =>
  `<m:r>${properties ? `<m:rPr>${properties}</m:rPr>` : ''}<m:t>${text}</m:t></m:r>`;

const wordFile = async (
  replacements: Readonly<Record<string, string>>,
  comments: readonly string[] = []
) => {
  const editor = createEditor({
    initialValue: Object.keys(replacements).map((text) => ({
      children: [{ text }],
      type: 'paragraph',
    })),
    plugins,
  });
  const result = await exportDocx(editor, {
    comments: comments.map((text, index) => ({
      author: { name: 'Ada' },
      body: [{ children: [{ text }], type: 'paragraph' }],
      createdAt: '2026-10-10T00:00:00.000Z',
      durableId: null,
      id: `comment-${index}`,
      parentId: null,
      resolved: null,
      target: {
        range: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      },
    })),
    projection: 'proposed',
  });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

  for (const part of ['word/document.xml', 'word/comments.xml']) {
    let xml = await zip.file(part)?.async('string');

    if (!xml) continue;
    for (const [placeholder, math] of Object.entries(replacements)) {
      xml = xml.replace(
        new RegExp(
          `<w:r>(?:(?!<w:r>)[\\s\\S])*?${placeholder}</w:t>\\s*</w:r>`
        ),
        math
      );
    }
    zip.file(part, xml);
  }

  return zip.generateAsync({ type: 'arraybuffer' });
};

const commentedWordFile = async (rewrite: (xml: string) => string) => {
  const editor = createEditor({
    initialValue: [{ children: [{ text: 'PLACE' }], type: 'paragraph' }],
    plugins,
  });
  const result = await exportDocx(editor, {
    comments: [
      {
        author: { name: 'Ada' },
        body: [{ children: [{ text: 'Note' }], type: 'paragraph' }],
        createdAt: '2026-10-10T00:00:00.000Z',
        durableId: null,
        id: 'comment-0',
        parentId: null,
        resolved: null,
        target: {
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 5, path: [0, 0] },
          },
        },
      },
    ],
    projection: 'proposed',
  });

  if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
  const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
  const xml = await zip.file('word/document.xml')!.async('string');

  zip.file('word/document.xml', rewrite(xml));

  return zip.generateAsync({ type: 'arraybuffer' });
};

const commentedRun = /<r xmlns="[^"]+">(?:(?!<r )[\s\S])*?PLACE<\/t>\s*<\/r>/;

const roundTrip = async (
  latex: string,
  type: 'equation' | 'inlineEquation'
) => {
  const editor = createEditor({
    initialValue:
      type === 'equation'
        ? [{ children: [{ text: '' }], latex, type }]
        : [
            {
              children: [
                { text: 'a ' },
                { children: [{ text: '' }], latex, type },
              ],
              type: 'paragraph',
            },
          ],
    plugins,
  });
  const exported = await exportDocx(editor, { projection: 'proposed' });

  if (!exported.ok) throw new Error(JSON.stringify(exported.diagnostics));
  const imported = await importDocx(await exported.blob.arrayBuffer(), {
    plugins,
  });

  if (!imported.ok) throw new Error(JSON.stringify(imported.diagnostics));

  return equations(imported.document.children) as Array<{
    latex: string;
    type: string;
  }>;
};

const meaningful = new Set([
  'accent',
  'accentunder',
  'linethickness',
  'mathvariant',
  'notation',
  'width',
]);

const presentation = (tex: string) =>
  katex
    .renderToString(tex, { output: 'mathml', throwOnError: true })
    .replace(/<annotation[\s\S]*?<\/annotation>/, '')
    .replaceAll(/<\/?mrow>/g, '')
    .replaceAll(
      /<(\w+)((?:\s[^>]*)?)>/g,
      (_tag, name: string, rest: string) => {
        const kept = [...rest.matchAll(/(\w+)="([^"]*)"/g)]
          .filter(([, attribute]) => meaningful.has(attribute))
          .map(([attribute]) => ` ${attribute}`);

        return `<${name}${kept.join('')}>`;
      }
    );

const equations = (value: readonly unknown[]): unknown[] =>
  value.flatMap((node) => {
    const element = node as {
      children?: unknown[];
      latex?: string;
      type?: string;
    };

    if (element.type === 'equation' || element.type === 'inlineEquation') {
      return [{ latex: element.latex, type: element.type }];
    }

    return equations(element.children ?? []);
  });

describe('importDocx Word math', () => {
  it('imports Word math as equation nodes whose TeX renders the same', async () => {
    const file = await wordFile({
      BLOCKMATH: `<m:oMathPara ${M}><m:oMath><m:f><m:num>${run('a')}</m:num><m:den>${run('b')}</m:den></m:f></m:oMath></m:oMathPara>`,
      INLINEMATH: `<m:oMath ${M}>${run('α')}${run('≤')}<m:func><m:fName>${run('sin', '<m:sty m:val="p"/>')}</m:fName><m:e>${run('x')}</m:e></m:func>${run('{')}${run('a')}${run('}')}</m:oMath>`,
      TEXTMATH: `<m:oMath ${M}>${run('\\text{50\\% off}', '<m:nor/>')}</m:oMath>`,
    });
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const found = equations(result.document.children) as Array<{
      latex: string;
      type: string;
    }>;

    expect(found.map(({ type }) => type)).toEqual([
      'equation',
      'inlineEquation',
      'inlineEquation',
    ]);
    expect(presentation(found[0].latex)).toBe(presentation('\\frac{a}{b}'));
    expect(presentation(found[1].latex)).toBe(
      presentation('\\alpha \\le \\sin x \\{a\\}')
    );
    expect(found[2].latex).toBe('\\text{50\\% off}');
  });

  it('keeps the bold of a bold digit', async () => {
    const file = await wordFile({
      BOLDMATH: `<m:oMath ${M}>${run('1', '<m:sty m:val="b"/>')}</m:oMath>`,
    });
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const [found] = equations(result.document.children) as Array<{
      latex: string;
    }>;

    expect(
      katex.renderToString(found.latex, {
        output: 'mathml',
        throwOnError: true,
      })
    ).toContain('mathvariant="bold"');
  });

  it('exports imported Word math as Word math again', async () => {
    const file = await wordFile({
      BLOCKMATH: `<m:oMathPara ${M}><m:oMath><m:f><m:num>${run('a')}</m:num><m:den>${run('b')}</m:den></m:f></m:oMath></m:oMathPara>`,
    });
    const imported = await importDocx(file, { plugins });

    if (!imported.ok) throw new Error(JSON.stringify(imported.diagnostics));
    const editor = createEditor({
      initialValue: imported.document.children,
      plugins,
    });
    const result = await exportDocx(editor, {
      projection: 'proposed',
      stylesheet: 'p { color: #123456; }',
    });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    expect(await zip.file('word/document.xml')!.async('string')).toContain(
      '<m:f>'
    );
  });

  it('keeps Word math in a comment body as its TeX', async () => {
    const file = await wordFile({ BODYTEXT: '<w:r><w:t>Body</w:t></w:r>' }, [
      'COMMENTMATH',
    ]);
    const zip = await JSZip.loadAsync(file);
    const commentsXml = await zip.file('word/comments.xml')!.async('string');
    const comments = commentsXml.replace(
      /<r>(?:(?!<r>)[\s\S])*?COMMENTMATH<\/t>\s*<\/r>/,
      `<m:oMath ${M}><m:f><m:num>${run('a')}</m:num><m:den>${run('b')}</m:den></m:f></m:oMath>`
    );

    zip.file('word/comments.xml', comments);
    const result = await importDocx(
      await zip.generateAsync({ type: 'arraybuffer' }),
      { plugins }
    );

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(JSON.stringify(result.comments)).toContain('\\\\frac{a}{b}');
  });

  it('drops deleted runs inside Word math and reports the flattened revision', async () => {
    const file = await wordFile({
      REVISIONMATH: `<m:oMath ${M} ${W}>${run('x')}<w:del w:id="7" w:author="Ada" w:date="2026-10-10T00:00:00Z">${run('y')}</w:del><w:ins w:id="8" w:author="Ada" w:date="2026-10-10T00:00:00Z">${run('z')}</w:ins></m:oMath>`,
    });
    const result = await importDocx(file, { lossPolicy: 'allow', plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(equations(result.document.children)).toEqual([
      { latex: 'xz', type: 'inlineEquation' },
    ]);
    expect(
      result.diagnostics.some(
        (diagnostic) =>
          diagnostic.code === 'unsupported-content' &&
          diagnostic.feature === 'tracked-revision'
      )
    ).toBe(true);
  });

  it('ends a named delimiter before the next letter', async () => {
    for (const latex of [
      '\\left\\langle x\\right\\rangle',
      '\\left\\lceil x\\right\\rceil y',
    ]) {
      const [found] = await roundTrip(latex, 'equation');

      expect(presentation(found.latex)).toBe(presentation(latex));
    }
  });

  it('reads the bar delimiters KaTeX draws', async () => {
    for (const latex of ['\\left| x \\right|', '\\left\\Vert x\\right\\Vert']) {
      const [found] = await roundTrip(latex, 'equation');

      expect(presentation(found.latex)).toBe(presentation(latex));
    }
  });

  it('reads every other delimiter KaTeX draws', async () => {
    for (const latex of [
      '\\left\\backslash x\\right/',
      '\\left\\uparrow x\\right\\downarrow',
      '\\left\\Uparrow x\\right\\Downarrow',
      '\\left\\updownarrow x\\right\\Updownarrow',
      '\\left\\lgroup x\\right\\rgroup',
      '\\left\\lmoustache x\\right\\rmoustache',
      '\\left< x \\right>',
    ]) {
      const [found] = await roundTrip(latex, 'equation');

      expect(presentation(found.latex)).toBe(presentation(latex));
    }
  });

  it('keeps a delimiter TeX cannot stretch as its character', async () => {
    const file = await wordFile({
      ANGLEMATH: `<m:oMath ${M}><m:d><m:dPr><m:begChr m:val="〈"/><m:endChr m:val="〉"/></m:dPr><m:e>${run('x')}</m:e></m:d></m:oMath>`,
    });
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const [found] = equations(result.document.children) as Array<{
      latex: string;
    }>;

    expect(() =>
      katex.renderToString(found.latex, { throwOnError: true })
    ).not.toThrow();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'converter-message' })
    );
  });

  it('keeps a trailing no-break space as TeX', async () => {
    const file = await wordFile({
      SPACEMATH: `<m:oMath ${M}><m:r><m:t xml:space="preserve">x&#160;</m:t></m:r></m:oMath>`,
    });
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const [found] = equations(result.document.children) as Array<{
      latex: string;
    }>;

    expect(() =>
      katex.renderToString(found.latex, { throwOnError: true })
    ).not.toThrow();
  });

  it('reads the exporter TeX fallback back exactly', async () => {
    expect(await roundTrip('\\raisebox{1em}{x}\\ ', 'equation')).toEqual([
      { latex: '\\raisebox{1em}{x}\\ ', type: 'equation' },
    ]);
    expect(await roundTrip('\\frac{', 'inlineEquation')).toEqual([
      { latex: '\\frac{', type: 'inlineEquation' },
    ]);
  });

  it('keeps a comment inside an equation on the equation', async () => {
    const file = await commentedWordFile((xml) =>
      xml.replace(
        /<w:commentRangeStart w:id="0"\/>[\s\S]*?<w:commentReference w:id="0"\/><\/w:r>/,
        `<m:oMath ${M}><w:commentRangeStart w:id="0"/>${run('x')}<w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r></m:oMath>`
      )
    );
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(result.comments[0].target).not.toBeNull();
  });

  it('keeps a comment on a display equation by importing it inline', async () => {
    const file = await commentedWordFile((xml) =>
      xml.replace(
        commentedRun,
        `<m:oMathPara ${M}><m:oMath>${run('x')}</m:oMath></m:oMathPara>`
      )
    );
    const result = await importDocx(file, { plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(equations(result.document.children)).toEqual([
      { latex: 'x', type: 'inlineEquation' },
    ]);
    expect(result.comments[0].target).not.toBeNull();
  });

  it('keeps an inserted display equation', async () => {
    const file = await wordFile({
      INSERTEDMATH: `<w:ins w:id="9" w:author="Ada" w:date="2026-10-10T00:00:00Z"><m:oMathPara ${M}><m:oMath>${run('x')}</m:oMath></m:oMathPara></w:ins>`,
    });
    const result = await importDocx(file, { lossPolicy: 'allow', plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(equations(result.document.children)).toEqual([
      { latex: 'x', type: 'inlineEquation' },
    ]);
  });

  it('keeps a list item that holds only a display equation in its list', async () => {
    const listPlugins = [
      ...plugins,
      BaseIndentPlugin,
      BaseListPlugin.configure({
        slots: {
          wrapNodeChildren: ({ element }) =>
            element.listType
              ? ({ children }) => (
                  <ol>
                    <li>{children}</li>
                  </ol>
                )
              : undefined,
        },
      }),
    ];
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'LISTMATH' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: 'Second' }],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
      plugins: listPlugins,
    });
    const exported = await exportDocx(editor, { projection: 'proposed' });

    if (!exported.ok) throw new Error(JSON.stringify(exported.diagnostics));
    const zip = await JSZip.loadAsync(await exported.blob.arrayBuffer());
    const xml = (await zip.file('word/document.xml')?.async('string')) ?? '';

    zip.file(
      'word/document.xml',
      xml.replace(
        /<w:r>(?:(?!<w:r>)[\s\S])*?LISTMATH<\/w:t>\s*<\/w:r>/,
        `<m:oMathPara ${M}><m:oMath>${run('x')}</m:oMath></m:oMathPara>`
      )
    );
    const result = await importDocx(
      await zip.generateAsync({ type: 'arraybuffer' }),
      { plugins: listPlugins }
    );

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(result.document.children[0]).toMatchObject({
      indent: 1,
      listType: 'numbered',
    });
    expect(equations(result.document.children)).toEqual([
      { latex: 'x', type: 'inlineEquation' },
    ]);
  });

  it('keeps a comment on an equation read as TeX text', async () => {
    const file = await commentedWordFile((xml) =>
      xml.replace(
        /<w:commentRangeStart w:id="0"\/>[\s\S]*?<w:commentReference w:id="0"\/><\/w:r>/,
        `<w:r><w:t xml:space="preserve">a </w:t></w:r><w:commentRangeStart w:id="0"/><m:oMath ${M}>${run('x')}</m:oMath><w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r><w:r><w:t xml:space="preserve"> b</w:t></w:r>`
      )
    );
    const result = await importDocx(file, {
      plugins: [BaseParagraphPlugin, BaseEquationPlugin],
    });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const range = result.comments[0].target?.range;
    const [paragraph] = result.document.children as ReadonlyArray<{
      children: ReadonlyArray<{ text: string }>;
    }>;

    expect(range?.anchor.path).toEqual([0, 0]);
    expect(range?.focus.path).toEqual([0, 0]);
    expect(
      paragraph.children[0].text.slice(
        range?.anchor.offset,
        range?.focus.offset
      )
    ).toBe('x');
  });

  it('reports a tracked formatting change inside an equation', async () => {
    const file = await wordFile({
      FORMATMATH: `<m:oMath ${M}><m:r><m:rPr><m:sty m:val="b"/></m:rPr><w:rPr><w:b/><w:rPrChange w:id="7" w:author="Ada" w:date="2026-10-10T00:00:00Z"><w:rPr/></w:rPrChange></w:rPr><m:t>x</m:t></m:r></m:oMath>`,
    });
    const result = await importDocx(file, { lossPolicy: 'allow', plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unsupported-content',
        feature: 'tracked-revision',
      })
    );
  });

  it('drops an equation whose runs are all deleted', async () => {
    const file = await wordFile({
      GONEMATH: `<m:oMath ${M} ${W}><w:del w:id="7" w:author="Ada" w:date="2026-10-10T00:00:00Z">${run('y')}</w:del></m:oMath>`,
    });
    const result = await importDocx(file, { lossPolicy: 'allow', plugins });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));

    expect(equations(result.document.children)).toEqual([]);
  });
});

import { describe, expect, it } from 'bun:test';

describe('exportToDocx', () => {
  it('exports quoted font families and preserves literal text', async () => {
    const text = '<tag> & "quotes" \'apostrophes\'';
    const fonts = [
      { fontFamily: "'Courier New', monospace", fontName: 'Courier New' },
      {
        fontFamily: '"Apple Color Emoji", sans-serif',
        fontName: 'Apple Color Emoji',
      },
    ];
    const exportModule = new URL('./docx-export-plugin.tsx', import.meta.url)
      .pathname;
    const script = `
      import { createElement } from 'react';
      import { NodeApi } from 'platejs';
      import JSZip from ${JSON.stringify(import.meta.resolve('jszip'))};
      import { exportToDocx } from ${JSON.stringify(exportModule)};

      const documents = [];
      for (const { fontFamily } of ${JSON.stringify(fonts)}) {
        const blob = await exportToDocx([
          { type: 'p', children: [{ text: ${JSON.stringify(text)} }] },
        ], {
          editorStaticComponent: ({ editor }) => createElement('p', {
            style: { fontFamily },
          }, NodeApi.string(editor.children[0])),
        });
        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        documents.push(await zip.file('word/document.xml').async('string'));
      }
      console.log(JSON.stringify(documents));
    `;
    const subprocess = Bun.spawn([process.execPath, '--eval', script], {
      stderr: 'pipe',
      stdout: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(subprocess.stdout).text(),
      new Response(subprocess.stderr).text(),
      subprocess.exited,
    ]);

    expect(stderr).toBe('');
    expect(exitCode).toBe(0);

    const documents: string[] = JSON.parse(stdout);

    expect(documents).toHaveLength(fonts.length);

    for (const [index, documentXml] of documents.entries()) {
      const document = new DOMParser().parseFromString(
        documentXml,
        'application/xml'
      );
      const exportedFonts = Array.from(
        document.getElementsByTagName('w:rFonts'),
        (font) => font.getAttribute('w:ascii')
      );
      const exportedText = Array.from(
        document.getElementsByTagName('w:t'),
        (run) => run.textContent
      ).join('');

      expect(exportedFonts).toContain(fonts[index].fontName);
      expect(exportedText).toBe(text);
    }
  });

  it('numbers the pages in a footer the section references when pageNumber is set', async () => {
    const exportModule = new URL('./docx-export-plugin.tsx', import.meta.url)
      .pathname;
    const script = `
      import JSZip from ${JSON.stringify(import.meta.resolve('jszip'))};
      import { exportToDocx } from ${JSON.stringify(exportModule)};

      const blob = await exportToDocx([{ type: 'p', children: [{ text: 'Body' }] }], {
        pageNumber: true,
      });
      const zip = await JSZip.loadAsync(await blob.arrayBuffer());
      const parts = {};
      for (const file of Object.values(zip.files)) {
        if (!file.dir) parts[file.name] = await file.async('string');
      }
      console.log(JSON.stringify(parts));
    `;
    const subprocess = Bun.spawn([process.execPath, '--eval', script], {
      stderr: 'pipe',
      stdout: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(subprocess.stdout).text(),
      new Response(subprocess.stderr).text(),
      subprocess.exited,
    ]);

    expect(stderr).toBe('');
    expect(exitCode).toBe(0);

    const parts: Record<string, string> = JSON.parse(stdout);
    const parse = (path: string) =>
      new DOMParser().parseFromString(parts[path], 'application/xml');
    const sectionProperties = Array.from(
      parse('word/document.xml').getElementsByTagName('w:body')[0].children
    ).find((child) => child.tagName === 'w:sectPr');
    const footerId = sectionProperties
      ?.getElementsByTagName('w:footerReference')[0]
      ?.getAttribute('r:id');

    expect(footerId).toBeTruthy();

    const footerRelationship = Array.from(
      parse('word/_rels/document.xml.rels').getElementsByTagName('Relationship')
    ).find((relationship) => relationship.getAttribute('Id') === footerId);
    const footerPath = `word/${footerRelationship?.getAttribute('Target')}`;
    const footerContentType = Array.from(
      parse('[Content_Types].xml').getElementsByTagName('Override')
    )
      .find(
        (override) => override.getAttribute('PartName') === `/${footerPath}`
      )
      ?.getAttribute('ContentType');

    expect(footerRelationship?.getAttribute('Type')).toBe(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer'
    );
    expect(footerContentType).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml'
    );

    const pageFields = Array.from(parse(footerPath).getElementsByTagName('*'))
      .filter((element) => element.localName === 'fldSimple')
      .map((field) => [
        field.parentElement?.localName,
        Array.from(field.attributes).find(
          (attribute) => attribute.name.split(':').pop() === 'instr'
        )?.value,
      ]);

    expect(pageFields).toEqual([['p', 'PAGE']]);
  });

  it('writes paragraphSpacing and headingSpacing into the document styles', async () => {
    const exportModule = new URL('./docx-export-plugin.tsx', import.meta.url)
      .pathname;
    const script = `
      import JSZip from ${JSON.stringify(import.meta.resolve('jszip'))};
      import { exportToDocx } from ${JSON.stringify(exportModule)};

      const blob = await exportToDocx([{ type: 'p', children: [{ text: 'Body' }] }], {
        headingSpacing: { before: 0 },
        paragraphSpacing: { after: 0 },
      });
      const zip = await JSZip.loadAsync(await blob.arrayBuffer());
      console.log(await zip.file('word/styles.xml').async('string'));
    `;
    const subprocess = Bun.spawn([process.execPath, '--eval', script], {
      stderr: 'pipe',
      stdout: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(subprocess.stdout).text(),
      new Response(subprocess.stderr).text(),
      subprocess.exited,
    ]);

    expect(stderr).toBe('');
    expect(exitCode).toBe(0);

    const styles = new DOMParser().parseFromString(stdout, 'application/xml');
    const heading2 = Array.from(styles.getElementsByTagName('w:style')).find(
      (style) => style.getAttribute('w:styleId') === 'Heading2'
    );

    expect(
      styles
        .getElementsByTagName('w:pPrDefault')[0]
        ?.getElementsByTagName('w:spacing')[0]
        ?.getAttribute('w:after')
    ).toBe('0');
    expect(
      heading2?.getElementsByTagName('w:spacing')[0]?.getAttribute('w:before')
    ).toBe('0');
  });

  it('exports nested tables and ends every table cell with a paragraph', async () => {
    const p = (text: string) => `<p>${text}</p>`;
    const staticTable = (...cells: string[]) =>
      `<div><div><table><tbody><tr>${cells
        .map((cell) => `<td><div>${cell}</div></td>`)
        .join('')}</tr></tbody></table></div></div>`;
    const cases = {
      deepBesideText: {
        expected: { depth: 3, nestedTables: 2, text: ['deep', 'right'] },
        html: staticTable(staticTable(staticTable(p('deep'))), p('right')),
      },
      imageOnly: {
        expected: { depth: 1, nestedTables: 0, text: [] },
        html: staticTable('<img src="https://example.com/image.webp">'),
      },
      multiple: {
        expected: { depth: 2, nestedTables: 2, text: ['first', 'second'] },
        html: staticTable(staticTable(p('first')) + staticTable(p('second'))),
      },
      nestedThenText: {
        expected: { depth: 2, nestedTables: 1, text: ['inner', 'after'] },
        html: staticTable(staticTable(p('inner')) + p('after')),
      },
      plainHtml: {
        expected: { depth: 2, nestedTables: 1, text: ['inner'] },
        html: `<table><tbody><tr><td><table><tbody><tr><td>${p('inner')}</td></tr></tbody></table></td></tr></tbody></table>`,
      },
    };
    const exportModule = import.meta.resolve('./docx-export-plugin.tsx');
    const script = `
      import { createElement } from 'react';
      import JSZip from ${JSON.stringify(import.meta.resolve('jszip'))};
      import { exportToDocx } from ${JSON.stringify(exportModule)};

      const documents = {};
      for (const [name, { html }] of Object.entries(${JSON.stringify(cases)})) {
        const blob = await exportToDocx([{ type: 'p', children: [{ text: '' }] }], {
          editorStaticComponent: () =>
            createElement('div', { dangerouslySetInnerHTML: { __html: html } }),
        });
        const zip = await JSZip.loadAsync(await blob.arrayBuffer());
        documents[name] = await zip.file('word/document.xml').async('string');
      }
      console.log(JSON.stringify(documents));
    `;
    const subprocess = Bun.spawn([process.execPath, '--eval', script], {
      stderr: 'pipe',
      stdout: 'pipe',
    });
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(subprocess.stdout).text(),
      new Response(subprocess.stderr).text(),
      subprocess.exited,
    ]);

    expect(stderr).toBe('');
    expect(exitCode).toBe(0);

    const documents: Record<string, string> = JSON.parse(stdout);
    const childrenNamed = (element: Element, tagName: string) =>
      Array.from(element.children).filter((child) => child.tagName === tagName);
    const gridWidths = (table: Element) =>
      childrenNamed(table, 'w:tblGrid').flatMap((grid) =>
        childrenNamed(grid, 'w:gridCol').map((column) =>
          Number(column.getAttribute('w:w'))
        )
      );
    const tableDepth = (element: Element) => {
      let depth = 0;

      for (
        let ancestor: Element | null = element;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        if (ancestor.tagName === 'w:tbl') depth += 1;
      }

      return depth;
    };
    const summarize = (xml: string) => {
      const document = new DOMParser().parseFromString(xml, 'application/xml');
      const tables = Array.from(document.getElementsByTagName('w:tbl'));
      const nestedTables = tables.filter(
        (table) => table.parentElement?.tagName === 'w:tc'
      );

      return {
        // Word rejects a cell that does not end with a paragraph.
        cellsEndWithParagraph: Array.from(
          document.getElementsByTagName('w:tc')
        ).every((cell) => cell.lastElementChild?.tagName === 'w:p'),
        depth: Math.max(...tables.map(tableDepth)),
        nestedTables: nestedTables.length,
        nestedTablesFitTheirCell: tables.every((table) =>
          childrenNamed(table, 'w:tr').every((row) =>
            childrenNamed(row, 'w:tc').every((cell, column) =>
              childrenNamed(cell, 'w:tbl').every(
                (nested) =>
                  gridWidths(nested).reduce((a, b) => a + b, 0) <=
                  gridWidths(table)[column]
              )
            )
          )
        ),
        // Word merges adjacent tables that have no paragraph between them.
        nestedTablesFollowedByParagraph: nestedTables.every(
          (nested) => nested.nextElementSibling?.tagName === 'w:p'
        ),
        parseErrors: document.getElementsByTagName('parsererror').length,
        text: Array.from(
          document.getElementsByTagName('w:t'),
          (run) => run.textContent
        ),
      };
    };

    expect(
      Object.fromEntries(
        Object.entries(documents).map(([name, xml]) => [name, summarize(xml)])
      )
    ).toEqual(
      Object.fromEntries(
        Object.entries(cases).map(([name, { expected }]) => [
          name,
          {
            cellsEndWithParagraph: true,
            nestedTablesFitTheirCell: true,
            nestedTablesFollowedByParagraph: true,
            parseErrors: 0,
            ...expected,
          },
        ])
      )
    );
  });
});

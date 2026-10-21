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

  it('exports tables nested in table cells at any depth', async () => {
    const cases = {
      deep: ['deep'],
      multiple: ['first', 'second'],
      nestedOnly: ['inner'],
      nestedThenText: ['inner', 'after'],
      textThenNested: ['before', 'inner'],
    };
    const exportModule = import.meta.resolve('./docx-export-plugin.tsx');
    const script = `
      import { createElement } from 'react';
      import JSZip from ${JSON.stringify(import.meta.resolve('jszip'))};
      import { exportToDocx } from ${JSON.stringify(exportModule)};

      const p = (text) => '<p>' + text + '</p>';
      // Mirrors the static table markup: wrapper divs around <table> and a
      // content div inside every cell.
      const table = (...cells) =>
        '<div><div><table><tbody><tr>' +
        cells.map((cell) => '<td><div>' + cell + '</div></td>').join('') +
        '</tr></tbody></table></div></div>';
      const htmls = {
        deep: table(table(table(p('deep')))),
        multiple: table(table(p('first')) + table(p('second'))),
        nestedOnly: table(table(p('inner'))),
        nestedThenText: table(table(p('inner')) + p('after')),
        textThenNested: table(p('before') + table(p('inner'))),
      };
      const documents = {};
      for (const [name, html] of Object.entries(htmls)) {
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

    for (const [name, expectedText] of Object.entries(cases)) {
      const document = new DOMParser().parseFromString(
        documents[name],
        'application/xml'
      );
      const tables = Array.from(document.getElementsByTagName('w:tbl'));
      const cells = Array.from(document.getElementsByTagName('w:tc'));
      const nestedTables = tables.filter(
        (table) => table.parentElement?.tagName === 'w:tc'
      );
      const exportedText = Array.from(
        document.getElementsByTagName('w:t'),
        (run) => run.textContent
      );

      expect(document.getElementsByTagName('parsererror')).toHaveLength(0);
      expect(exportedText).toEqual(expectedText);
      expect(nestedTables).toHaveLength(
        name === 'deep' || name === 'multiple' ? 2 : 1
      );
      expect(Math.max(...tables.map(tableDepth))).toBe(name === 'deep' ? 3 : 2);

      // Word rejects a cell that does not end with a paragraph.
      for (const cell of cells) {
        expect(cell.lastElementChild?.tagName).toBe('w:p');
      }
    }
  });
});

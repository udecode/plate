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
});

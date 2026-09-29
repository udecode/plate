import { expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { ContentSlice, createEditor, definePlugin, property, schema } from '../../../../../../packages/platejs/src/core';
import { writeDataTransferFragment } from 'platejs/dom';
import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link/lib/BaseLinkPlugin';
import { BaseImagePlugin, BaseVideoPlugin } from 'platejs/media';
import { MarkdownPlugin } from 'platejs/markdown';
import { parseHtml, serializeHtml } from 'platejs/html';
import { importDocx } from 'platejs/docx/import';
import { exportDocx } from 'platejs/docx/export';
import { WordPastePlugin } from 'platejs/docx/paste';

const output = `${import.meta.dir}/${process.env.PROBE_OUTPUT ?? "results.json"}`;
const require = createRequire(new URL('../../../../../../packages/platejs/package.json', import.meta.url));
const JSZip = require('jszip');
const plugins = [BaseLinkPlugin, BaseImagePlugin, BaseVideoPlugin, MarkdownPlugin];
const rows: unknown[] = [];
const record = async (name: string, run: () => unknown) => {
  try { rows.push({ name, result: await run() }); }
  catch (error) { rows.push({ name, threw: String(error) }); }
  writeFileSync(output, JSON.stringify(rows, null, 2) + '\n');
};
const linkDoc = (url: string) => ({ children: [{ type: 'paragraph', children: [{ type: 'link', url, children: [{ text: 'LABEL' }] }] }] });
const mediaDoc = (type: string, url: string) => ({ children: [{ type, url, children: [{ text: '' }] }] });
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const makeDocx = async (url: string) => {
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body><w:p><w:r><w:t>Before </w:t></w:r><w:hyperlink r:id="rIdLink"><w:r><w:t>LABEL</w:t></w:r></w:hyperlink><w:r><w:t> After</w:t></w:r></w:p></w:body></w:document>');
  zip.file('word/_rels/document.xml.rels', `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdLink" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${url}" TargetMode="External"/></Relationships>`);
  return zip.generateAsync({ type: 'arraybuffer' });
};

// A normal parent mapping may inspect a descendant before decoding children.
const CaptureParagraph = definePlugin('captureParagraph', {
  schema: { element: { content: schema.content.text({ default: 'text', min: 1 }), properties: { captured: property.string() } } },
  formats: ({ defineFormats }) => defineFormats({ html: {
    match: [{ tag: 'p' }], priority: 100, decodeOnly: true,
    decode: ({ element }) => ({ captured: element.querySelector('a')?.getAttribute('href') ?? 'ABSENT' }),
  } }),
});

test('bounded conversion safety observations from actual source APIs', async () => {
  const editor = createEditor({ plugins });
  for (const [name, source] of [
    ['link-js', '[LABEL](javascript:alert%281%29)'],
    ['image-js', '![ALT](javascript:alert%281%29)'],
    ['video-js', '<video src="javascript:alert(1)" />'],
    ['script', '<script>alert(1)</script>'],
    ['image-png', `![ALT](${png})`],
  ]) {
    await record(`markdown/${name}`, () => {
      const parsed = editor.api.markdown.parse(source);
      return { parsed, serialized: parsed.ok ? editor.api.markdown.serialize({ document: parsed.document }) : null };
    });
  }
  for (const [name, source] of [
    ['link-js', '<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>'],
    ['link-control', '<p>Before <a href="java&#9;script:alert(1)">LABEL</a> After</p>'],
    ['script-event', '<script>alert(1)</script><p onclick="alert(1)">SAFE</p>'],
    ['svg-content', '<p>SAFE</p><svg><text>LOST</text></svg>'],
    ['image-svg', '<img src="data:image/svg+xml;base64,PHN2Zy8+">'],
    ['image-png', `<img src="${png}">`],
    ['image-blob', '<img src="blob:https://example.test/id">'],
    ['href-blob', '<p><a href="blob:https://example.test/id">LABEL</a></p>'],
    ['video-data', '<video src="data:video/mp4;base64,AAAA"></video>'],
    ['video-blob', '<video src="blob:https://example.test/id"></video>'],
    ['video-control', '<figure class="editor-video"><video src="java&#9;script:alert(1)"></video><figcaption>CAPTION</figcaption></figure>'],
  ]) {
    for (const lossPolicy of ['reject', 'allow'] as const) {
      await record(`html/${name}/${lossPolicy}`, () => parseHtml(source, { plugins, lossPolicy }));
    }
  }
  for (const [name, document] of [
    ['link-js', linkDoc('javascript:alert(1)')],
    ['image-js', mediaDoc('image', 'javascript:alert(1)')],
    ['video-js', mediaDoc('video', 'javascript:alert(1)')],
    ['image-png', mediaDoc('image', png)],
    ['image-blob', mediaDoc('image', 'blob:https://example.test/id')],
    ['video-data', mediaDoc('video', 'data:video/mp4;base64,AAAA')],
  ] as const) {
    for (const lossPolicy of ['reject', 'allow'] as const) {
      await record(`html-egress/${name}/${lossPolicy}`, () => serializeHtml(document, { plugins, lossPolicy }));
    }
  }
  await record('link-render-vs-data', () => ({
    attributes: editor.plugin(BaseLinkPlugin).api.getAttributes(linkDoc('javascript:alert(1)').children[0].children[0]),
    document: linkDoc('javascript:alert(1)'),
  }));
  for (const [name, mime, source, word] of [
    ['html', 'text/html', '<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>', false],
    ['markdown', 'text/markdown', '[LABEL](javascript:alert%281%29)', false],
    ['word', 'text/html', '<p class="MsoNormal">Before <a href="javascript:alert(1)">LABEL</a> After</p>', true],
  ] as const) {
    await record(`paste/${name}`, () => {
      const target = createEditor({ plugins: [...plugins, ...(word ? [WordPastePlugin] : [])] });
      const transfer = new DataTransfer(); transfer.setData(mime, source);
      const inserted = target.api.dom.clipboard.insertData(transfer);
      return { inserted, document: target.read.value() };
    });
  }
  const unsafeDocx = await makeDocx('javascript:alert(1)');
  for (const lossPolicy of ['reject', 'allow'] as const) {
    await record(`docx/default/${lossPolicy}`, () => importDocx(unsafeDocx, { plugins, lossPolicy }));
    await record(`docx/custom/${lossPolicy}`, () => importDocx(unsafeDocx, { plugins: [CaptureParagraph], lossPolicy }));
  }
  await record('html/custom-comparator', () => parseHtml('<p>Before <a href="javascript:alert(1)">LABEL</a> After</p>', { plugins: [CaptureParagraph] }));
  await record('docx/safe-control', async () => importDocx(await makeDocx('https://example.test/'), { plugins }));
  await record('docx/export-default-js-link', async () => {
    const target = createEditor({ plugins, initialValue: linkDoc('javascript:alert(1)') });
    const result = await exportDocx(target, { projection: 'proposed' });
    if (!result.ok) return result;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    return { ok: result.ok, diagnostics: result.diagnostics, relationships: await zip.file('word/_rels/document.xml.rels')?.async('string'), documentXml: await zip.file('word/document.xml')?.async('string') };
  });
  await record('markdown/script-allow', () => editor.api.markdown.parse('<script>alert(1)</script>', { lossPolicy: 'allow' }));
  for (const [name, document] of [
    ['link-js', linkDoc('javascript:alert(1)')],
    ['image-js', mediaDoc('image', 'javascript:alert(1)')],
  ] as const) {
    await record(`clipboard-egress/${name}`, () => {
      const transfer = new DataTransfer();
      const written = writeDataTransferFragment(editor, transfer, ContentSlice.closed(document.children));
      return { written, data: Object.fromEntries(transfer.types.map((type) => [type, transfer.getData(type)])) };
    });
  }
  await record('docx/retained-exact-js-link', async () => {
    const imported = await importDocx(unsafeDocx, { plugins, retainSource: true });
    if (!imported.ok) return imported;
    const target = createEditor({ plugins, initialValue: imported.document });
    const exported = await exportDocx(target, { projection: 'review', source: imported.source });
    if (!exported.ok) return exported;
    const zip = await JSZip.loadAsync(await exported.blob.arrayBuffer());
    return { importedDocument: imported.document, importDiagnostics: imported.diagnostics, exportDiagnostics: exported.diagnostics, relationships: await zip.file('word/_rels/document.xml.rels')?.async('string') };
  });
  await record('docx/custom-component-data-href', async () => {
    const target = createEditor({ plugins });
    const exported = await exportDocx(target, {
      projection: 'proposed',
      component: () => React.createElement('p', null, React.createElement('a', { href: 'data:text/html;base64,SGVsbG8=' }, 'CUSTOM')),
    });
    if (!exported.ok) return exported;
    const zip = await JSZip.loadAsync(await exported.blob.arrayBuffer());
    return { ok: exported.ok, diagnostics: exported.diagnostics, relationships: await zip.file('word/_rels/document.xml.rels')?.async('string') };
  });
  await record('html/custom-component-data-href-comparator', () => {
    const Custom = definePlugin('customDataHref', {
      schema: { element: schema.element.textBlock() },
      formats: ({ defineFormats }) => defineFormats({ html: {
        match: [{ tag: 'a' }], decode: () => ({}),
        encode: ({ content }) => ({ tag: 'a', attributes: { href: 'data:text/html;base64,SGVsbG8=' }, children: content }),
      } }),
    });
    return serializeHtml({ children: [{ type: 'customDataHref', children: [{ text: 'CUSTOM' }] }] }, { plugins: [Custom] });
  });
  expect(rows.length).toBeGreaterThan(40);
  const byName = new Map(rows.map((row: any) => [row.name, row]));
  const unsafe = (name: string) =>
    byName.get(name).result.diagnostics.filter((diagnostic: any) => diagnostic.code === 'html-unsafe-content');
  // HTML lane: every entry sanitizes the whole source before a mapping reads it, keeps labels and reports each removal.
  for (const policy of ['reject', 'allow']) {
    for (const name of ['link-js', 'link-control']) {
      expect(byName.get(`html/${name}/${policy}`).result).toMatchObject({ ok: true, document: { children: [{ children: [{ text: 'Before LABEL After' }] }] } });
      expect(unsafe(`html/${name}/${policy}`)).toMatchObject([{ impact: 'lossless', kind: 'url', severity: 'warning' }]);
    }
    expect(byName.get(`html/href-blob/${policy}`).result).toMatchObject({ ok: true, document: { children: [{ children: [{ text: 'LABEL' }] }] } });
    expect(unsafe(`html/href-blob/${policy}`)).toMatchObject([{ impact: 'lossless', kind: 'url' }]);
    expect(byName.get(`html/video-control/${policy}`).result).toMatchObject({ ok: true, document: { children: [{ type: 'paragraph', children: [{ text: 'CAPTION' }] }] } });
    expect(unsafe(`html/video-control/${policy}`)).toMatchObject([{ impact: 'lossless', kind: 'url' }]);
    expect(byName.get(`docx/default/${policy}`).result).toMatchObject({
      ok: true,
      document: { children: [{ children: [{ text: 'Before LABEL After' }] }] },
      diagnostics: [{ action: 'unwrapped', code: 'unsupported-content', message: 'Removed unsafe HTML attribute "href" from <a>.', severity: 'warning' }],
    });
    expect(byName.get(`docx/custom/${policy}`).result.document.children[0]).toMatchObject({ captured: 'ABSENT', children: [{ text: 'Before LABEL After' }] });
  }
  expect(byName.get('html/custom-comparator').result.document.children[0].captured).toBe('ABSENT');
  expect(byName.get('html/svg-content/reject').result.ok).toBe(false);
  expect(byName.get('html/video-data/reject').result.ok).toBe(false);
  expect(byName.get('html/image-png/reject').result.ok).toBe(true);
  expect(byName.get('paste/word').result.document.children[0].children).toEqual([{ text: 'Before LABEL After' }]);
  expect(byName.get('html/custom-component-data-href-comparator').result).toEqual({
    data: '<a>CUSTOM</a>',
    diagnostics: [{ action: 'removed', code: 'html-unsafe-content', impact: 'lossless', kind: 'url', message: 'Removed unsafe HTML attribute "href" from <a>.', model: { path: [0], root: 'main' }, severity: 'warning' }],
    ok: true,
  });
  console.log(`Wrote ${rows.length} observations to ${output}`);
}, 60000);

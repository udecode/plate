import { expect, it } from 'bun:test';

import JSZip from 'jszip';

import { htmlToDocxBlob } from './html-to-docx.internal';

async function readBookmarks(html: string) {
  const blob = await htmlToDocxBlob(html);
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const xml = await zip.file('word/document.xml')!.async('string');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  return {
    anchors: [...document.getElementsByTagName('w:hyperlink')].map((node) =>
      node.getAttribute('w:anchor')
    ),
    names: [...document.getElementsByTagName('w:bookmarkStart')].map((node) =>
      node.getAttribute('w:name')
    ),
    ids: [...document.getElementsByTagName('w:bookmarkStart')].map((node) =>
      node.getAttribute('w:id')
    ),
  };
}

it('maps opaque HTML ids and fragment links to unique Word bookmarks', async () => {
  const ids = ['key:a', 'key-a', 'key_a', `headingあ${'a'.repeat(80)}`];
  const html =
    ids.map((id) => `<p><a href="#${id}">${id}</a></p>`).join('') +
    ids.map((id) => `<h1><span id="${id}"></span>${id}</h1>`).join('');
  const result = await readBookmarks(html);
  expect(result.anchors).toEqual(result.names);
  expect(new Set(result.names).size).toBe(ids.length);
  for (const name of result.names) expect(name).toMatch(/^plate_\d+$/);
});

it('keeps bookmark ids and names local to concurrent document conversions', async () => {
  const html =
    '<h1><span id="same"></span>Heading</h1><p><a href="#same">Go</a></p>';
  const [first, second] = await Promise.all([
    readBookmarks(html),
    readBookmarks(html),
  ]);
  expect(first.ids).toEqual(['0']);
  expect(second).toEqual(first);
});

it('preserves fragment links whose bookmark is absent from the document', async () => {
  const result = await readBookmarks(
    '<p><a href="#missing_bookmark">Go</a></p>'
  );
  expect(result.anchors).toEqual(['missing_bookmark']);
  expect(result.names).toEqual([]);
});

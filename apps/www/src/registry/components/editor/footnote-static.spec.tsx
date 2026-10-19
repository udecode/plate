import { createEditor } from 'platejs';
import { parseHtml } from 'platejs/html';
import { renderStaticHtml } from 'platejs/static';

import { BaseFootnoteKit } from './footnote-static';
import { BaseEditorKit } from './plugins-static';

it('round-trips static footnotes with fragment links and no presentation text', async () => {
  const children = [
    {
      type: 'paragraph',
      children: [
        { text: 'Claim' },
        { type: 'footnoteReference', ref: 'a b', children: [{ text: '' }] },
        { text: ' again' },
        { type: 'footnoteReference', ref: 'a b', children: [{ text: '' }] },
        { text: '.' },
      ],
    },
    {
      type: 'footnoteDefinition',
      ref: 'a b',
      children: [{ type: 'paragraph', children: [{ text: 'Source text' }] }],
    },
    {
      type: 'footnoteDefinition',
      ref: 'a b',
      children: [{ type: 'paragraph', children: [{ text: 'Duplicate' }] }],
    },
  ];
  const editor = createEditor({
    plugins: BaseFootnoteKit,
    initialValue: children,
  });
  const result = await renderStaticHtml(editor, {
    presentation: BaseFootnoteKit,
  });
  const host = new DOMParser().parseFromString(result.data, 'text/html');

  expect(
    [...host.querySelectorAll('a')].map((anchor) => ({
      id: anchor.id,
      href: anchor.getAttribute('href'),
      ref: anchor.getAttribute('data-editor-footnote-ref'),
      text: anchor.textContent,
      chrome: anchor.hasAttribute('data-editor-footnote-chrome'),
    }))
  ).toEqual([
    {
      id: 'fnref-a%20b',
      href: '#fn-a%20b',
      ref: 'a b',
      text: '[a b]',
      chrome: false,
    },
    {
      id: 'fnref-a%20b:2',
      href: '#fn-a%20b',
      ref: 'a b',
      text: '[a b]',
      chrome: false,
    },
    { id: '', href: '#fnref-a%20b', ref: null, text: '↩', chrome: true },
  ]);
  expect(
    [...host.querySelectorAll('[data-editor-footnote-definition]')].map(
      (node) => node.id
    )
  ).toEqual(['fn-a%20b', 'fn-a%20b:2']);
  expect(parseHtml(result.data, { plugins: BaseEditorKit })).toMatchObject({
    ok: true,
    document: { children },
  });
});

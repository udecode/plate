import { expect, test as it } from 'bun:test';

it('TODO: serialize list to html', () => {
  expect(1).toBe(1);
});

import { BaseLinkPlugin } from '@platejs/link';
import { BaseImagePlugin } from '@platejs/media';

import { createStaticEditor as createSlateEditor } from '../editor/withStatic';
import { BaseParagraphPlugin } from '../../lib/plugins';
import { serializeHtml } from '../serializeHtml';

const plugins = [
  BaseParagraphPlugin,
  BaseLinkPlugin.extend(() => ({
    node: {
      dangerouslyAllowAttributes: ['target'],
      props: ({ element }) =>
        /^https?:\/\/slatejs.org\/?/.test((element as any).url)
          ? {}
          : { target: '_blank' },
    },
  })),
  BaseImagePlugin.extend({
    node: {
      props: ({ element }) => ({
        alt: (element as any).attributes?.alt,
        width: (element as any).url.split('/').pop(),
      }),
    },
  }),
];

it('serialize link to html with attributes', async () => {
  const staticEditor = createSlateEditor({
    plugins,
    value: [
      {
        children: [
          { text: 'An external ' },
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://theuselessweb.com/',
          },
          { text: ' and an internal ' },
          {
            children: [{ text: 'link' }],
            target: '_self',
            type: 'a',
            url: 'https://slatejs.org/',
          },
          { text: '.' },
        ],
        type: 'p',
      },
    ],
  });

  expect(
    await serializeHtml(staticEditor, {
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    })
  ).toContain(`target="_blank"`);
});

it('serialize image with alt to html', async () => {
  const staticEditor = createSlateEditor({
    plugins,
    value: [
      {
        children: [
          {
            attributes: { alt: 'Placeholder' },
            children: [{ text: '' }],
            type: 'img',
            url: 'https://via.placeholder.com/300',
          },
        ],
        type: 'p',
      },
    ],
  });

  const htmlString = await serializeHtml(staticEditor, {
    preserveClassNames: [],
    stripClassNames: true,
    stripDataAttributes: true,
  });

  expect(htmlString).toContain(`alt="Placeholder"`);
  expect(htmlString).toContain(`width="300"`);
});

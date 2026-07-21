import { property } from '@platejs/plite';

import { BaseParagraphPlugin } from '../lib/plugins';
import { createBasePlugin } from '../lib/plugin';
import { createStaticEditor } from './editor/withStatic';
import { serializeHtml } from './serializeHtml';

const getStringProp = (record: Record<string, unknown>, key: string) => {
  const value = record[key];

  return typeof value === 'string' ? value : '';
};

const getObjectProp = (record: Record<string, unknown>, key: string) => {
  const value = record[key];

  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const plugins = [
  BaseParagraphPlugin,
  createBasePlugin({
    key: 'a',
    node: {
      dangerouslyAllowAttributes: ['target'],
      element: {
        inline: true,
        properties: {
          target: property.string(),
          url: property.string(),
        },
      },
      props: ({ element }) =>
        /^https?:\/\/platejs.org\/?/.test(getStringProp(element, 'url'))
          ? {}
          : { target: '_blank' },
      type: 'a',
    },
  }),
  createBasePlugin({
    key: 'img',
    node: {
      element: {
        inline: true,
        properties: {
          attributes: property.json(),
          url: property.string(),
        },
      },
      props: ({ element }) => ({
        alt: getObjectProp(element, 'attributes').alt,
        width: getStringProp(element, 'url').split('/').pop(),
      }),
      type: 'img',
    },
  }),
];

describe('serializeHtml plugin node props', () => {
  it('renders link props returned by plugin callbacks', async () => {
    const staticEditor = createStaticEditor({
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
              url: 'https://platejs.org/',
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

  it('renders image props returned by plugin callbacks', async () => {
    const staticEditor = createStaticEditor({
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
});

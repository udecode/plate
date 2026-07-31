import { schema, property } from '@platejs/plite';
import { createElement } from 'react';

import { BaseParagraphPlugin } from '../lib/plugins';
import { createBasePlugin } from '../lib/plugin';
import { createStaticEditor } from './editor/withStatic';
import { renderStaticHtml } from './renderStaticHtml';

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
    name: 'a',
    type: 'a',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: {
          target: property.string(),
          url: property.string(),
        },
      },
    },
    render: {
      nodeProps: ({ element }) =>
        /^https?:\/\/platejs.org\/?/.test(getStringProp(element, 'url'))
          ? {}
          : { target: '_blank' },
    },
  }),
  createBasePlugin({
    name: 'img',
    type: 'img',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: {
          attributes: property.json(),
          secret: property.string(),
          url: property.string(),
        },
      },
    },
    render: {
      nodeProps: ({ element }) => ({
        alt: getObjectProp(element, 'attributes').alt,
        width: getStringProp(element, 'url').split('/').pop(),
      }),
    },
  }),
];

describe('static HTML plugin node props', () => {
  it('renders a component declared by a Base plugin', async () => {
    const staticEditor = createStaticEditor({
      plugins: [
        createBasePlugin({
          component: ({ attributes, children }) =>
            createElement(
              'aside',
              {
                ...attributes,
                'data-static-component': 'callout',
              },
              children
            ),
          name: 'static-callout',
          render: {
            nodeProps: () => ({ 'data-static-plugin-prop': 'preserved' }),
          },
          schema: { element: { void: 'block' } },
        }),
      ],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'static-callout',
        },
      ],
    });

    const html = await renderStaticHtml(staticEditor);

    expect(html).toContain('data-static-component="callout"');
    expect(html).toContain('data-static-plugin-prop="preserved"');
  });

  it('renders link props returned by plugin callbacks', async () => {
    const staticEditor = createStaticEditor({
      plugins,
      initialValue: [
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
      await renderStaticHtml(staticEditor, {
        preserveClassNames: [],
        stripClassNames: true,
        stripDataAttributes: true,
      })
    ).toContain(`target="_blank"`);
  });

  it('renders image props returned by plugin callbacks', async () => {
    const staticEditor = createStaticEditor({
      plugins,
      initialValue: [
        {
          children: [
            {
              attributes: {
                alt: 'Placeholder',
                onerror: 'window.__plateXss = true',
              },
              children: [{ text: '' }],
              secret: 'private',
              type: 'img',
              url: 'https://via.placeholder.com/300',
            },
          ],
          type: 'p',
        },
      ],
    });

    const htmlString = await renderStaticHtml(staticEditor, {
      preserveClassNames: [],
      stripClassNames: true,
    });

    expect(htmlString).toContain(`alt="Placeholder"`);
    expect(htmlString).toContain(`width="300"`);
    expect(htmlString).not.toContain('data-plite-secret');
    expect(htmlString).not.toContain('onerror');
  });
});

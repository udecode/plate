import { createElement } from 'react';

import { schema, property } from '../core';
import { definePlugin } from '../lib/plugin';
import { BaseParagraphPlugin } from '../lib/plugins';
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
  definePlugin('link', {
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
      attributes: ({ element }) =>
        /^https?:\/\/platejs.org\/?/.test(getStringProp(element, 'url'))
          ? {}
          : { target: '_blank' },
    },
  }),
  definePlugin('image', {
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
      attributes: ({ element }) => ({
        alt: getObjectProp(element, 'attributes').alt,
        width: getStringProp(element, 'url').split('/').pop(),
      }),
    },
  }),
];

describe('static HTML plugin node props', () => {
  it('omits interactive editor slots from static output', async () => {
    const staticEditor = createStaticEditor({
      initialValue: [
        { children: [{ text: 'Static content' }], type: 'paragraph' },
      ],
      plugins: [
        BaseParagraphPlugin,
        definePlugin('interactiveShell', {
          slots: {
            wrapContent: () => {
              throw new Error('Interactive shell rendered during export.');
            },
          },
        }),
      ],
    });

    const { data } = await renderStaticHtml(staticEditor);

    expect(data).toContain('Static content');
  });

  it('renders a component declared by a Base plugin', async () => {
    const staticEditor = createStaticEditor({
      plugins: [
        definePlugin('staticCallout', {
          component: ({ attributes, children }) =>
            createElement(
              'aside',
              {
                ...attributes,
                'data-static-component': 'callout',
              },
              children
            ),
          render: {
            attributes: () => ({ 'data-static-plugin-prop': 'preserved' }),
          },
          schema: { element: { void: 'block' } },
        }),
      ],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'staticCallout',
        },
      ],
    });

    const { data: html } = await renderStaticHtml(staticEditor);

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
              type: 'link',
              url: 'https://theuselessweb.com/',
            },
            { text: ' and an internal ' },
            {
              children: [{ text: 'link' }],
              target: '_self',
              type: 'link',
              url: 'https://platejs.org/',
            },
            { text: '.' },
          ],
          type: 'paragraph',
        },
      ],
    });

    const { data } = await renderStaticHtml(staticEditor);

    expect(data).toContain(`target="_blank"`);
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
              type: 'image',
              url: 'https://via.placeholder.com/300',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    const { data: htmlString } = await renderStaticHtml(staticEditor);

    expect(htmlString).toContain(`alt="Placeholder"`);
    expect(htmlString).toContain(`width="300"`);
    expect(htmlString).not.toContain('data-editor-secret');
    expect(htmlString).not.toContain('onerror');
  });
});

import React from 'react';

import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  property,
  schema,
} from '../core';
import { BaseBlockquotePlugin } from '../features/basic-nodes/lib';
import { BaseParagraphPlugin } from '../lib';
import { renderStaticHtml } from './renderStaticHtml';

const EditingOnly = (): React.ReactNode => {
  throw new Error('Editing component rendered during export.');
};

const NoteSchema = defineEditorSchema('schema:presentation-note', {
  elements: {
    note: { content: schema.content.text({ default: 'text', min: 1 }) },
    paragraph: { content: schema.content.text({ default: 'text', min: 1 }) },
  },
  root: schema.content.types(['paragraph', 'note'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

describe('static HTML presentation', () => {
  it('draws an element with its static peer instead of the editing component', async () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin.configure({ component: EditingOnly })],
      initialValue: [{ children: [{ text: 'Quoted' }], type: 'blockquote' }],
    });

    const { data } = await renderStaticHtml(editor, {
      presentation: [
        BaseBlockquotePlugin.configure({
          component: ({ attributes, children }) => (
            <blockquote {...attributes} data-static-peer="">
              {children}
            </blockquote>
          ),
        }),
      ],
    });

    expect(data).toContain('data-static-peer');
  });

  it('wraps node children with the static peer of a wrapper slot', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlugin('frame', {
          slots: { wrapNodeChildren: () => EditingOnly },
        }),
      ],
      initialValue: [{ children: [{ text: 'Framed' }], type: 'paragraph' }],
    });

    const { data } = await renderStaticHtml(editor, {
      presentation: [
        definePlugin('frame', {
          slots: {
            wrapNodeChildren:
              () =>
              ({ children }) => <div data-static-frame="">{children}</div>,
          },
        }),
      ],
    });

    expect(data).toContain('data-static-frame');
  });

  it('draws a text-placement mark with its static peer', async () => {
    const TonePlugin = definePlugin('tone', {
      schema: { mark: property.boolean({ default: false, omitDefault: true }) },
      render: { mark: { placement: 'text' } },
    });
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        TonePlugin.configure({ component: EditingOnly }),
      ],
      initialValue: [
        { children: [{ text: 'Warm', tone: true }], type: 'paragraph' },
      ],
    });

    const { data } = await renderStaticHtml(editor, {
      presentation: [
        TonePlugin.configure({
          component: ({ attributes, children }) => (
            <span {...attributes} data-static-tone="">
              {children}
            </span>
          ),
        }),
      ],
    });

    expect(data).toContain('data-static-tone');
  });

  it('draws a named root with the same presentation as the main root', async () => {
    const FigurePlugin = definePlugin('figure', {
      component: ({ attributes, slots }) => (
        <figure {...attributes}>
          <figcaption>{slots.contentRoot('caption')}</figcaption>
        </figure>
      ),
      schema: {
        element: {
          blockContent: true,
          contentRoots: {
            caption: {
              content: schema.content.type('paragraph', {
                default: { type: 'paragraph' },
                min: 1,
              }),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin.configure({ component: EditingOnly }),
        FigurePlugin,
      ],
      initialValue: {
        children: [
          {
            childRoots: { caption: 'caption:1' },
            children: [{ text: '' }],
            type: 'figure',
          },
        ],
        roots: {
          'caption:1': [{ children: [{ text: 'Caption' }], type: 'paragraph' }],
        },
      },
    });

    const { data } = await renderStaticHtml(editor, {
      presentation: [
        BaseParagraphPlugin.configure({
          component: ({ attributes, children }) => (
            <p {...attributes} data-static-paragraph="">
              {children}
            </p>
          ),
        }),
        FigurePlugin,
      ],
    });

    expect(data).toContain('data-static-paragraph');
  });

  it('reports a plugin with no static peer once and draws its content plainly', async () => {
    const quote = (text: string) => ({
      children: [{ children: [{ text }], type: 'paragraph' }],
      type: 'blockquote',
    });
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin.configure({ component: EditingOnly })],
      initialValue: [quote('First'), quote('Second')],
    });

    const result = await renderStaticHtml(editor, { presentation: [] });

    expect(result).toMatchObject({
      data: expect.stringContaining('Second'),
      diagnostics: [
        {
          code: 'missing-static-presentation',
          plugin: 'blockquote',
          severity: 'warning',
        },
      ],
    });
  });

  it('leaves out an edit-only wrapper without reporting it', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlugin('editingControls', {
          editOnly: true,
          slots: { wrapNodeChildren: () => EditingOnly },
        }),
      ],
      initialValue: [{ children: [{ text: 'Plain' }], type: 'paragraph' }],
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: [],
    });

    expect(diagnostics).toEqual([]);
  });

  it('draws with the current entries of a reused presentation array', async () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin.configure({ component: EditingOnly })],
      initialValue: [
        {
          children: [{ children: [{ text: 'Quoted' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
    });
    const quoteDrawnAs = (choice: string) =>
      BaseBlockquotePlugin.configure({
        component: ({ attributes, children }) => (
          <blockquote {...attributes} data-choice={choice}>
            {children}
          </blockquote>
        ),
      });
    const presentation = [quoteDrawnAs('first')];

    await renderStaticHtml(editor, { presentation });
    presentation[0] = quoteDrawnAs('second');
    const { data } = await renderStaticHtml(editor, { presentation });

    expect(data).toContain('data-choice="second"');
  });

  it('stops the export when a presentation slot reads its configure context', async () => {
    const editor = createEditor({
      plugins: [
        BaseBlockquotePlugin.configure({
          slots: { afterNodeChildren: () => <EditingOnly /> },
        }),
      ],
      initialValue: [
        {
          children: [{ children: [{ text: 'Quoted' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
    });

    await expect(
      renderStaticHtml(editor, {
        presentation: [
          BaseBlockquotePlugin.configure((context) => ({
            slots: {
              afterNodeChildren: () => <span data-type={context.schema.type} />,
            },
          })),
        ],
      })
    ).rejects.toThrow('Plate runtime is not installed.');
  });

  it('compiles the presentation without activating its plugins', async () => {
    let activations = 0;
    const editor = createEditor({
      plugins: [BaseParagraphPlugin],
      initialValue: [{ children: [{ text: 'Plain' }], type: 'paragraph' }],
    });

    await renderStaticHtml(editor, {
      presentation: [
        definePlugin('watcher', {
          activate: () => {
            activations += 1;
          },
        }),
      ],
    });

    expect(activations).toBe(0);
  });

  it('reports an afterNodeChildren peer the static render cannot call', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlugin('tail', {
          slots: { afterNodeChildren: () => <EditingOnly /> },
        }),
      ],
      initialValue: [{ children: [{ text: 'Plain' }], type: 'paragraph' }],
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: [
        definePlugin('tail', {
          slots: {
            afterNodeChildren: React.memo(() => <aside data-static-tail="" />),
          },
        }),
      ],
    });

    expect(diagnostics).toMatchObject([
      { code: 'missing-static-presentation', plugin: 'tail' },
    ]);
  });

  it('reports an installed memo afterNodeChildren the presentation lacks', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlugin('tail', {
          slots: { afterNodeChildren: React.memo(EditingOnly) },
        }),
      ],
      initialValue: [{ children: [{ text: 'Plain' }], type: 'paragraph' }],
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: [BaseParagraphPlugin],
    });

    expect(diagnostics).toMatchObject([
      { code: 'missing-static-presentation', plugin: 'tail' },
    ]);
  });

  it('reports an installed memo afterNodeChildren whose peer is a memo too', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        definePlugin('tail', {
          slots: { afterNodeChildren: React.memo(EditingOnly) },
        }),
      ],
      initialValue: [{ children: [{ text: 'Plain' }], type: 'paragraph' }],
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: [
        definePlugin('tail', {
          slots: {
            afterNodeChildren: React.memo(() => <aside data-static-tail="" />),
          },
        }),
      ],
    });

    expect(diagnostics).toMatchObject([
      { code: 'missing-static-presentation', plugin: 'tail' },
    ]);
  });

  it('draws the afterNodeChildren of an element no plugin renders from the presentation', async () => {
    const editor = createEditor({
      plugins: [
        NoteSchema,
        definePlugin('tail', {
          slots: { afterNodeChildren: () => <EditingOnly /> },
        }),
      ],
      initialValue: [{ children: [{ text: 'Unowned' }], type: 'note' }],
    });

    const { data } = await renderStaticHtml(editor, {
      presentation: [
        definePlugin('tail', {
          slots: { afterNodeChildren: () => <aside data-static-tail="" /> },
        }),
      ],
    });

    expect(data).toContain('data-static-tail');
  });

  it('reports the afterNodeChildren of an element no plugin renders when the presentation lacks it', async () => {
    const editor = createEditor({
      plugins: [
        NoteSchema,
        definePlugin('tail', {
          slots: { afterNodeChildren: () => <EditingOnly /> },
        }),
      ],
      initialValue: [{ children: [{ text: 'Unowned' }], type: 'note' }],
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: [],
    });

    expect(diagnostics).toMatchObject([
      { code: 'missing-static-presentation', plugin: 'tail' },
    ]);
  });
});

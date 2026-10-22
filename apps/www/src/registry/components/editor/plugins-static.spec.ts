import { describe, expect, it } from 'bun:test';

import { createEditor } from 'platejs';
import {
  createEditor as createLiveEditor,
  ParagraphPlugin,
} from 'platejs/react';
import { renderStaticHtml } from 'platejs/static';

import { DEMO_VALUES } from '@/registry/examples/values/demo-values';
import { playgroundValue } from '@/registry/examples/values/playground-value';

import { BaseEditorKit } from './plugins-static';

describe('BaseEditorKit', () => {
  it('reuses the server-safe formatting kits', async () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: [
        {
          children: [{ text: 'Title' }],
          level: 1,
          lineHeight: 2,
          textAlign: 'center',
          type: 'heading',
        },
      ],
    });
    const { data } = await renderStaticHtml(editor);
    const host = document.createElement('div');
    host.innerHTML = data;
    const heading = host.querySelector<HTMLElement>('h1');

    expect(heading?.style.textAlign).toBe('center');
    expect(heading?.style.lineHeight).toBe('2');
  });

  it('loads and serializes the playground document used by AI requests', () => {
    const editor = createEditor({
      plugins: BaseEditorKit,
      initialValue: playgroundValue,
    });

    const result = editor.api.markdown.serialize();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.diagnostics[0].message);
    expect(result.data).toContain('Welcome to the Plate Playground!');
    expect(result.data).toContain('```mermaid\nclassDiagram');
  });

  it('draws everything EditorKit draws except AI highlights', async () => {
    const { EditorKit } = await import('./plugins');
    const live = createLiveEditor({ plugins: EditorKit });
    const presentation = createEditor({ plugins: BaseEditorKit });
    const drawings = ({
      component,
      render,
      slots,
    }: {
      component?: unknown;
      render: { mark?: { leafComponent?: unknown } | null };
      slots: Partial<
        Record<'afterNodeChildren' | 'wrapNode' | 'wrapNodeChildren', unknown>
      >;
    }) => ({
      component: component ?? undefined,
      leaf: render.mark?.leafComponent ?? undefined,
      ...Object.fromEntries(
        (['afterNodeChildren', 'wrapNode', 'wrapNodeChildren'] as const).map(
          (slot) => [
            slot,
            typeof slots[slot] === 'function' ? slots[slot] : undefined,
          ]
        )
      ),
    });
    const missing = EditorKit.flatMap((plugin) => {
      const peerPlugin = BaseEditorKit.find(({ name }) => name === plugin.name);
      const peer = peerPlugin ? drawings(presentation.plugin(peerPlugin)) : {};
      // `editor.plugin()` resolves the kit's configured paragraph only through
      // the core `ParagraphPlugin` descriptor.
      const own = drawings(
        live.plugin(
          plugin.name === ParagraphPlugin.name ? ParagraphPlugin : plugin
        )
      );

      return Object.entries(own).flatMap(([part, drawing]) =>
        drawing &&
        typeof drawing !== 'string' &&
        peer[part as keyof typeof peer] === undefined
          ? [`${plugin.name} ${part}`]
          : []
      );
    });

    // No static AI mark exists; export draws AI-marked text plainly with a
    // warning.
    expect(missing).toEqual(['ai component']);
  });

  it('exports the demo documents with no missing static drawing', async () => {
    const { EditorKit } = await import('./plugins');
    const editor = createLiveEditor({
      plugins: EditorKit,
      initialValue: (
        [
          'playground',
          'basic-blocks',
          'basic-marks',
          'callout',
          'code-block',
          'column',
          'date',
          'details',
          'equation',
          'font',
          'footnote',
          'indent',
          'line-height',
          'link',
          'list',
          'media',
          'mention',
          'table',
          'align',
          'toc',
          'docx',
        ] as const
      ).flatMap((id) => {
        const value = DEMO_VALUES[id];

        return Array.isArray(value) ? value : value.children;
      }),
    });

    const { diagnostics } = await renderStaticHtml(editor, {
      presentation: BaseEditorKit,
      projection: 'proposed',
    });

    expect(
      diagnostics.filter(({ code }) => code === 'missing-static-presentation')
    ).toEqual([]);
  });

  it('loads an indented list image, which EditorKit can write', () => {
    expect(() =>
      createEditor({
        plugins: BaseEditorKit,
        initialValue: [
          {
            children: [{ text: '' }],
            indent: 1,
            listType: 'bulleted',
            type: 'image',
            url: 'https://example.com/a.png',
          },
        ],
      })
    ).not.toThrow();
  });
});

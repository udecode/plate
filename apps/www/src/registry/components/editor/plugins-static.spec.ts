import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

import { createEditor } from 'platejs';
import {
  createEditor as createLiveEditor,
  ParagraphPlugin,
} from 'platejs/react';
import { renderStaticHtml } from 'platejs/static';

import { DEMO_VALUES } from '@/registry/examples/values/demo-values';
import { playgroundValue } from '@/registry/examples/values/playground-value';

import { AlignKit } from './align';
import { LineHeightKit } from './line-height';
import { BaseEditorKit } from './plugins-static';

describe('BaseEditorKit', () => {
  it('reuses the server-safe formatting kits', () => {
    expect(BaseEditorKit).toContain(AlignKit[0]);
    expect(BaseEditorKit).toContain(LineHeightKit[0]);

    expect(() =>
      createEditor({
        plugins: [...AlignKit, ...LineHeightKit],
      })
    ).not.toThrow();

    for (const fileName of ['align.tsx', 'line-height.tsx']) {
      const source = readFileSync(new URL(fileName, import.meta.url), 'utf-8');

      expect(source).not.toMatch(/["']use client["']/);
      expect(source).not.toMatch(/from ["']platejs\/react["']/);
    }
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
    expect(result.data).toContain('<codeDrawing');
    expect(result.data).toContain('classDiagram');
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
          'text-align',
          'toc',
          'docx',
        ] as const
      )
        .flatMap((id) => {
          const value = DEMO_VALUES[id];

          return Array.isArray(value) ? value : value.children;
        })
        // EditorKit does not install code drawings.
        .filter((block) => block.type !== 'codeDrawing'),
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

import { getPlateRuntime } from '@platejs/core/internal';
import { MarkdownPlugin } from '@platejs/markdown';
import { PLUGINS, createBaseEditor, defineBasePlugin, property } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import {
  FootnoteDefinitionElement,
  FootnoteReferenceElement,
} from '@/registry/ui/footnote-node';
import {
  FootnoteDefinitionElementStatic,
  FootnoteReferenceElementStatic,
} from '@/registry/ui/footnote-node-static';
import { registryBlocks } from '@/registry/registry-blocks';
import { registryKits } from '@/registry/registry-kits';

import { BaseFootnoteKit } from './footnote-base-kit';
import { FootnoteKit } from './footnote-kit';
import { BaseCodeDrawingKit } from './code-drawing-base-kit';
import { MarkdownKit } from './markdown-kit';

const footnoteNames = [
  'footnote',
  PLUGINS.footnoteDefinition,
  PLUGINS.footnoteInput,
];

describe('MarkdownKit', () => {
  it('configures both live and base editors', () => {
    const editors = [
      createPlateEditor({ plugins: MarkdownKit }),
      createBaseEditor({ plugins: MarkdownKit }),
    ];

    for (const editor of editors) {
      expect(typeof editor.api.markdown.serialize).toBe('function');
    }
  });

  it('resolves configured mark keys from the installed schema', () => {
    const SuggestionMarkPlugin = defineBasePlugin(PLUGINS.suggestion, {
      schema: {
        mark: { key: 'suggestionMark', property: property.boolean() },
      },
    });
    const CommentMarkPlugin = defineBasePlugin(PLUGINS.comment, {
      schema: { mark: { key: 'commentMark', property: property.boolean() } },
    });
    const editor = createBaseEditor({
      plugins: [SuggestionMarkPlugin, CommentMarkPlugin, ...MarkdownKit],
    });

    expect(editor.plugin(MarkdownPlugin).store.get('plainMarks')).toEqual([
      'suggestionMark',
      'commentMark',
    ]);
  });

  it('round-trips code drawings through the generated editor Markdown surface', () => {
    const value = [
      {
        children: [{ text: '' }],
        data: {
          code: 'graph TD; A-->B',
          drawingMode: 'Both',
          drawingType: 'Mermaid',
        },
        type: 'codeDrawing',
      },
    ];
    const editor = createBaseEditor({
      plugins: [...BaseCodeDrawingKit, ...MarkdownKit],
      initialValue: value,
    });

    const markdown = editor.api.markdown.serialize();

    expect(markdown).toContain('<codeDrawing');
    expect(editor.api.markdown.deserialize(markdown).children).toMatchObject(
      value
    );
  });

  it('composes once with live Footnote renderers', () => {
    const editor = createPlateEditor({
      plugins: [...FootnoteKit, ...MarkdownKit],
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(getPlateRuntime(editor).components.footnote).toBe(
      FootnoteReferenceElement
    );
    expect(getPlateRuntime(editor).components.footnoteDefinition).toBe(
      FootnoteDefinitionElement
    );
    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('composes once with static Footnote renderers', () => {
    const editor = createBaseEditor({
      plugins: [...BaseFootnoteKit, ...MarkdownKit],
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(getPlateRuntime(editor).components.footnote).toBe(
      FootnoteReferenceElementStatic
    );
    expect(getPlateRuntime(editor).components.footnoteDefinition).toBe(
      FootnoteDefinitionElementStatic
    );
    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('installs renderer-specific Footnote kits from editor presets', () => {
    const items = new Map(
      [...registryKits, ...registryBlocks].map((item) => [item.name, item])
    );

    expect(items.get('markdown-kit')?.registryDependencies).toBeUndefined();
    expect(items.get('editor-kit')?.registryDependencies).toEqual(
      expect.arrayContaining(['@plate/footnote-kit', '@plate/markdown-kit'])
    );
    expect(items.get('editor-ai')?.registryDependencies).toEqual(
      expect.arrayContaining(['@plate/footnote-kit', '@plate/markdown-kit'])
    );
    expect(items.get('editor-base-kit')?.registryDependencies).toEqual(
      expect.arrayContaining([
        '@plate/footnote-base-kit',
        '@plate/markdown-kit',
      ])
    );
  });
});

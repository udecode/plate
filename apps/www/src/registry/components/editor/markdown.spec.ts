import {
  getPlateRuntime,
  PLUGINS,
  createEditor,
  defineBasePlugin,
  property,
} from 'platejs';
import { MarkdownPlugin } from 'platejs/markdown';
import { createEditor as createReactEditor } from 'platejs/react';

import { registryBlocks } from '@/registry/registry-blocks';
import { registryFeatures } from '@/registry/registry-features';

import { BaseCodeDrawingKit } from './code-drawing-static';
import { FootnoteKit } from './footnote';
import { BaseFootnoteKit } from './footnote-static';
import { MarkdownKit } from './markdown';

const footnoteNames = [
  'footnote',
  PLUGINS.footnoteDefinition,
  PLUGINS.footnoteInput,
];

describe('MarkdownKit', () => {
  it('configures both live and base editors', () => {
    const editors = [
      createReactEditor({ plugins: MarkdownKit }),
      createEditor({ plugins: MarkdownKit }),
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
    const editor = createEditor({
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
        code: 'graph TD; A-->B',
        children: [{ text: '' }],
        language: 'mermaid',
        type: 'codeDrawing',
        view: 'split',
      },
    ];
    const editor = createEditor({
      plugins: [...BaseCodeDrawingKit, ...MarkdownKit],
      initialValue: value,
    });

    const markdown = editor.api.markdown.serialize();

    expect(markdown).toContain('<codeDrawing');
    expect(editor.api.markdown.deserialize(markdown).children).toMatchObject(
      value
    );
  });

  it('composes without duplicating live Footnote plugins', () => {
    const editor = createReactEditor({
      plugins: [...FootnoteKit, ...MarkdownKit],
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('composes without duplicating static Footnote plugins', () => {
    const editor = createEditor({
      plugins: [...BaseFootnoteKit, ...MarkdownKit],
    });
    const names = getPlateRuntime(editor).pluginList.map(
      (plugin) => plugin.name
    );

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('keeps renderer-specific Footnote kits in editor presets', () => {
    const items = new Map(
      [...registryFeatures, ...registryBlocks].map((item) => [item.name, item])
    );

    expect(items.get('markdown')?.registryDependencies).toBeUndefined();
    expect(items.get('editor-plugins')?.registryDependencies).toEqual(
      expect.arrayContaining(['@plate/footnote', '@plate/markdown'])
    );
    expect(items.get('editor-ai')?.registryDependencies).toContain(
      '@plate/editor'
    );
    expect(items.get('editor-ai')?.registryDependencies).not.toContain(
      '@plate/footnote'
    );
    expect(items.get('editor-ai')?.registryDependencies).not.toContain(
      '@plate/markdown'
    );
    expect(items.get('editor-plugins-static')?.registryDependencies).toEqual(
      expect.arrayContaining(['@plate/footnote-static', '@plate/markdown'])
    );
  });
});

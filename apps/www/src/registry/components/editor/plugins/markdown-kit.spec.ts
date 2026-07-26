import { getPlateRuntime } from '@platejs/core/internal';
import { createBaseEditor, KEYS } from 'platejs';
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
import { MarkdownKit } from './markdown-kit';

const footnoteKeys = [
  KEYS.footnoteDefinition,
  KEYS.footnoteInput,
  KEYS.footnoteReference,
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

  it('composes once with live Footnote renderers', () => {
    const editor = createPlateEditor({
      plugins: [...FootnoteKit, ...MarkdownKit],
    });
    const keys = getPlateRuntime(editor).pluginList.map((plugin) => plugin.key);

    for (const key of footnoteKeys) {
      expect(keys.filter((pluginKey) => pluginKey === key)).toHaveLength(1);
    }

    expect(getPlateRuntime(editor).components[KEYS.footnoteReference]).toBe(
      FootnoteReferenceElement
    );
    expect(getPlateRuntime(editor).components[KEYS.footnoteDefinition]).toBe(
      FootnoteDefinitionElement
    );
    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('composes once with static Footnote renderers', () => {
    const editor = createBaseEditor({
      plugins: [...BaseFootnoteKit, ...MarkdownKit],
    });
    const keys = getPlateRuntime(editor).pluginList.map((plugin) => plugin.key);

    for (const key of footnoteKeys) {
      expect(keys.filter((pluginKey) => pluginKey === key)).toHaveLength(1);
    }

    expect(getPlateRuntime(editor).components[KEYS.footnoteReference]).toBe(
      FootnoteReferenceElementStatic
    );
    expect(getPlateRuntime(editor).components[KEYS.footnoteDefinition]).toBe(
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

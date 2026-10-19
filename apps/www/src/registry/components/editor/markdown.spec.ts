import { join } from 'node:path';

import { PLUGINS, createEditor } from 'platejs';
import { compileEditor } from 'platejs/compiler';
import { createEditor as createReactEditor } from 'platejs/react';

import { createPlateRegistry } from '@/registry/registry';

import { deriveRegistryDependencies } from '../../../../scripts/registry-package-dependencies.mts';
import { FootnoteKit } from './footnote';
import { BaseFootnoteKit } from './footnote-static';
import { MarkdownKit } from './markdown';

const footnoteNames = ['footnote', PLUGINS.footnoteDefinition];

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

  it('composes without duplicating live Footnote plugins', () => {
    const editor = createReactEditor({
      plugins: [...FootnoteKit, ...MarkdownKit],
    });
    const names = compileEditor({
      plugins: [...FootnoteKit, ...MarkdownKit],
    }).bindings.map((binding) => binding.name);

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('composes without duplicating static Footnote plugins', () => {
    const editor = createEditor({
      plugins: [...BaseFootnoteKit, ...MarkdownKit],
    });
    const names = compileEditor({
      plugins: [...BaseFootnoteKit, ...MarkdownKit],
    }).bindings.map((binding) => binding.name);

    for (const name of footnoteNames) {
      expect(names.filter((candidate) => candidate === name)).toHaveLength(1);
    }

    expect(typeof editor.api.markdown.serialize).toBe('function');
  });

  it('keeps renderer-specific Footnote kits in editor presets', () => {
    const items = new Map(
      deriveRegistryDependencies(createPlateRegistry(), {
        sourceRoot: join(import.meta.dir, '../..'),
      }).items.map((item) => [item.name, item])
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

import React from 'react';

import { authored } from '../authored';
import { createEditor, createEditorView } from '../core';
import { BaseParagraphPlugin } from '../lib';
import { HtmlPlugin } from '../lib/plugins/html/HtmlPlugin';
import { EditorStatic, type EditorStaticProps } from './components/PlateStatic';
import { renderStaticHtml } from './renderStaticHtml';

describe('authored HTML', () => {
  it('renders accepted and proposed semantic projections', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        HtmlPlugin,
        authored({ authorId: 'alice' }),
      ],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    editor.update((tx) => {
      tx.authored.propose({ changeId: 'private-original' });
      tx.text.insert('unpublished proposal', {
        at: { offset: 0, path: [0, 0] },
      });
    });
    editor.update.authored.decide({
      action: 'reject',
      selection: editor.read.authored.select({ ids: ['private-original'] }),
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert(' draft', {
      at: { offset: 4, path: [0, 0] },
    });
    const accepted = await renderStaticHtml(editor, {
      projection: 'accepted',
    });
    const proposed = await renderStaticHtml(editor, {
      projection: 'proposed',
    });
    expect(accepted.data).not.toContain('unpublished proposal');
    expect(proposed.data).not.toContain('unpublished proposal');
    expect(
      JSON.stringify(editor.read.authored.details('private-original')?.original)
    ).toContain('unpublished proposal');
    expect(accepted.data).toContain('Base');
    expect(accepted.data).not.toContain('draft');
    expect(proposed.data).toContain('Base draft');
    expect(accepted.diagnostics[0]?.code).toBe('authored-lossy-projection');
    expect(proposed.data).not.toContain('application/vnd.editor.authored+json');
  });

  it('renders one captured projection when the live editor changes', async () => {
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        HtmlPlugin,
        authored({ authorId: 'alice' }),
      ],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });
    let mutated = false;
    const MutatingStatic = (props: EditorStaticProps) => {
      if (!mutated) {
        mutated = true;
        view.update.text.insert(' late', {
          at: { offset: 4, path: [0, 0] },
        });
      }

      return React.createElement(EditorStatic, props);
    };
    const result = await renderStaticHtml(editor, {
      component: MutatingStatic,
      projection: 'proposed',
    });

    expect(result.data).toContain('Base');
    expect(result.data).not.toContain('late');
    expect(mutated).toBe(true);
  });
});

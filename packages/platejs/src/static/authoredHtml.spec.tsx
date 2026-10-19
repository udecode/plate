import React from 'react';

import { AuthoredPlugin } from '../authored';
import { createEditor, createEditorView } from '../core';
import { BaseParagraphPlugin } from '../lib';
import { HtmlPlugin } from '../lib/plugins/html/HtmlPlugin';
import { EditorStatic, type EditorStaticProps } from './components/PlateStatic';
import { renderStaticHtml } from './renderStaticHtml';

describe('authored HTML', () => {
  it('renders accepted and proposed semantic projections', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, HtmlPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base old' }], type: 'paragraph' }],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
    });

    view.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 8, path: [0, 0] },
        },
      });
      tx.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    });
    const accepted = await renderStaticHtml(editor, {
      projection: 'accepted',
    });
    const proposed = await renderStaticHtml(editor, {
      projection: 'proposed',
    });
    expect(accepted.data).toContain('Base old');
    expect(accepted.data).not.toContain('draft');
    expect(proposed.data).toContain('Base draft');
    expect(proposed.data).not.toContain('old');
    expect(accepted.diagnostics[0]?.code).toBe('authored-lossy-projection');
    expect(proposed.data).not.toContain('application/vnd.editor.authored+json');
  });

  it('renders one captured projection when the live editor changes', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, HtmlPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
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

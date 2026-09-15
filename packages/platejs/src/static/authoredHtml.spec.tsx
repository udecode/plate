import { authored } from '../authored';
import { createEditor, createEditorView } from '../core';
import { BaseParagraphPlugin } from '../lib';
import { HtmlPlugin } from '../lib/plugins/html/HtmlPlugin';
import { deserializeAuthoredHtml, renderAuthoredHtml } from './authoredHtml';

describe('authored HTML', () => {
  it('renders explicit projections and reloads the review envelope', async () => {
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

    view.update.text.insert(' draft', {
      at: { offset: 4, path: [0, 0] },
    });
    const accepted = await renderAuthoredHtml(editor, {
      projection: 'accepted',
    });
    const proposed = await renderAuthoredHtml(editor, {
      projection: 'proposed',
    });
    const review = await renderAuthoredHtml(editor, {
      projection: 'review',
    });

    expect(accepted.data).toContain('Base');
    expect(accepted.data).not.toContain('draft');
    expect(proposed.data).toContain('Base draft');
    expect(accepted.diagnostics[0]?.code).toBe('authored-lossy-projection');
    expect(review.data).toContain('application/vnd.editor.authored+json');
    expect(review.diagnostics).toEqual([]);
    expect(deserializeAuthoredHtml(editor, review.data)).toEqual(
      editor.read.value()
    );
    expect(() =>
      deserializeAuthoredHtml(
        editor,
        '<script type="application/vnd.editor.authored+json" data-editor-authored="v1"></script>'
      )
    ).toThrow('Invalid authored HTML envelope.');
  });
});

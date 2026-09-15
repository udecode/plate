/** @jsx jsxt */

import { jsxt, type TestEditorFixture } from '@platejs/test';
import { DefaultAuthoredPlugin } from 'platejs/authored';
import { createEditor as createProductEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import { SuggestionKit } from '@/registry/components/editor/suggestion';

jsxt;

const createEditor = (input: TestEditorFixture) =>
  createProductEditor({
    plugins: [...BaseEditorKit, ...SuggestionKit],
    userId: 'alice',
    selection: input.selection,
    initialValue: input.children,
  });

describe('native authored link integration', () => {
  it('proposes only the previous link character when deleting backward after a link', () => {
    const input = (
      <editor>
        <hp>
          <htext>before </htext>
          <ha url="https://example.com">link</ha>
          <htext>
            <cursor />
            {' after'}
          </htext>
        </hp>
      </editor>
    ) as TestEditorFixture;
    const editor = createEditor(input);

    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    editor.update.text.deleteBackward({ unit: 'character' });

    const change = editor.plugin(DefaultAuthoredPlugin).read.changes({
      status: 'pending',
    }).items[0];
    const link = editor.read.children()[0].children[1] as unknown as {
      children: Array<{ text: string }>;
    };

    expect(editor.read.value().children).toEqual(input.children);
    expect(link.children.map(({ text }) => text).join('')).toBe('lin');
    expect(change).toMatchObject({
      authorId: 'alice',
      kind: 'delete',
      status: 'pending',
    });
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 1, 0] },
      focus: { offset: 3, path: [0, 1, 0] },
    });
  });

  it('removes an empty link after accepting its last-character deletion', () => {
    const input = (
      <editor>
        <hp>
          before <ha url="https://reactjs.org">t</ha>
          <htext />
        </hp>
      </editor>
    ) as TestEditorFixture;
    const editor = createEditor(input);
    const authored = editor.plugin(DefaultAuthoredPlugin);

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 1, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
    });
    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    editor.update.text.deleteBackward({ unit: 'character' });
    const selection = authored.read.select({
      status: 'pending',
    });

    expect(authored.update.decide({ action: 'accept', selection }).status).toBe(
      'applied'
    );
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'before ' }], type: 'paragraph' },
    ]);
  });

  it('restores a removed inline link when rejecting its proposal', () => {
    const input = (
      <editor>
        <hp>
          before <ha url="https://example.com">link</ha> after
        </hp>
      </editor>
    ) as TestEditorFixture;
    const editor = createEditor(input);
    const authored = editor.plugin(DefaultAuthoredPlugin);

    editor.plugin(SuggestionPlugin).api.setMode('suggesting');
    editor.update.nodes.remove({ at: [0, 1] });
    const selection = authored.read.select({
      status: 'pending',
    });

    expect(authored.update.decide({ action: 'reject', selection }).status).toBe(
      'applied'
    );
    expect(editor.read.children()).toEqual(input.children);
  });
});

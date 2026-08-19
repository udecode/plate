/** @jsx jsxt */

import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { jsxt, type TestEditorFixture } from '@platejs/test-utils';
import { type BaseEditor, createBaseEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

jsxt;

const createEditor = (input: TestEditorFixture) =>
  createBaseEditor({
    plugins: BaseEditorKit,
    selection: input.selection,
    initialValue: input.children,
  } as any);

const deleteBackwardCharacter = (editor: ReturnType<typeof createEditor>) => {
  editor.update.text.deleteBackward({ unit: 'character' });
};

describe('suggestion link integration', () => {
  it('marks only the previous link character when deleting backward after a link', () => {
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

    const output = (
      <editor>
        <hp>
          <htext>before </htext>
          <ha url="https://example.com">
            <htext>lin</htext>
            <htext
              suggestion
              suggestion_1={{
                id: 'placeholder',
                createdAt: 0,
                type: 'remove',
                userId: 'alice',
              }}
            >
              <cursor />k
            </htext>
          </ha>
          <htext>{' after'}</htext>
        </hp>
      </editor>
    ) as TestEditorFixture;

    const editor = createEditor(input);
    editor.plugin(BaseSuggestionPlugin).store.set({ isSuggesting: true });

    deleteBackwardCharacter(editor);

    const outputLinkNode = output.children[0].children[1] as any;
    const linkNode = editor.read.children()[0].children[1] as any;
    const suggestionLeaf = linkNode.children[1] as any;
    const suggestionData = editor
      .plugin(BaseSuggestionPlugin)
      .api.suggestionData(suggestionLeaf) as any;

    expect(editor.read.children()[0].children[0]).toEqual(
      output.children[0].children[0]
    );
    expect(linkNode.children[0]).toEqual(outputLinkNode.children[0]);
    expect(suggestionLeaf.text).toBe(outputLinkNode.children[1].text);
    expect(suggestionData?.type).toBe('remove');
    expect(suggestionData?.userId).toBe('alice');
    expect(linkNode.suggestion).toBeUndefined();
    expect(
      Object.keys(linkNode).filter((key) => key.startsWith('suggestion_'))
    ).toHaveLength(0);
    expect(editor.read.children()[0].children[2]).toEqual(
      output.children[0].children[2]
    );
    expect(editor.read.selection()).toEqual(output.selection);
  });

  it('removes an empty link after accepting the last removed character', () => {
    const removeData = {
      id: '1',
      createdAt: Date.now(),
      type: 'remove',
      userId: 'alice',
    };

    const input = (
      <editor>
        <hp>
          before{' '}
          <ha url="https://reactjs.org">
            <htext suggestion_1={removeData} suggestion>
              t
            </htext>
          </ha>
          <htext />
        </hp>
      </editor>
    ) as TestEditorFixture;

    const output = (
      <editor>
        <hp>before </hp>
      </editor>
    ) as TestEditorFixture;

    const editor = createEditor(input);
    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 1, path: [0, 1, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
    });

    (
      editor as BaseEditor<readonly [typeof BaseSuggestionPlugin]>
    ).update.suggestion.accept({
      keyId: editor.plugin(BaseSuggestionPlugin).api.key('1'),
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });

  it('rejects remove suggestion on inline link elements', () => {
    const removeData = {
      id: '1',
      createdAt: Date.now(),
      type: 'remove',
      userId: 'alice',
    };

    const input = (
      <editor>
        <hp>
          before{' '}
          <ha suggestion suggestion_1={removeData} url="https://example.com">
            link
          </ha>{' '}
          after
        </hp>
      </editor>
    ) as TestEditorFixture;

    const output = (
      <editor>
        <hp>
          before <ha url="https://example.com">link</ha> after
        </hp>
      </editor>
    ) as TestEditorFixture;

    const editor = createEditor(input);

    (
      editor as BaseEditor<readonly [typeof BaseSuggestionPlugin]>
    ).update.suggestion.reject({
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.read.children()).toEqual(output.children);
  });
});

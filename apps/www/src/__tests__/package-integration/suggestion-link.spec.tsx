/** @jsx jsxt */

import {
  acceptSuggestion,
  BaseSuggestionPlugin,
  getSuggestionKey,
  rejectSuggestion,
} from '@platejs/suggestion';
import { jsxt } from '@platejs/test-utils';
import type { SlateEditor } from 'platejs';
import { createSlateEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

jsxt;

const createEditor = (input: SlateEditor) =>
  createSlateEditor({
    plugins: BaseEditorKit,
    selection: input.selection,
    value: input.children,
  } as any);

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
    ) as any as SlateEditor;

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
    ) as any as SlateEditor;

    const editor = createEditor(input);
    editor.setOption(BaseSuggestionPlugin, 'isSuggesting', true);

    editor.tf.deleteBackward();

    const outputLinkNode = output.children[0].children[1] as any;
    const linkNode = editor.children[0].children[1] as any;
    const suggestionLeaf = linkNode.children[1] as any;
    const suggestionData = editor
      .getApi(BaseSuggestionPlugin)
      .suggestion.suggestionData(suggestionLeaf) as any;

    expect(editor.children[0].children[0]).toEqual(
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
    expect(editor.children[0].children[2]).toEqual(
      output.children[0].children[2]
    );
    expect(editor.selection).toEqual(output.selection);
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
        </hp>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>before </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);
    editor.selection = {
      anchor: { offset: 1, path: [0, 1, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
    };

    acceptSuggestion(editor, {
      keyId: getSuggestionKey('1'),
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
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
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          before <ha url="https://example.com">link</ha> after
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    rejectSuggestion(editor, {
      keyId: 'suggestion_1',
      suggestionId: '1',
    } as any);

    expect(editor.children).toEqual(output.children);
  });
});

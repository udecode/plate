/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin } from '../BaseLinkPlugin';
import { upsertLinkText } from './upsertLinkText';

jsxt;

describe('upsertLinkText', () => {
  const createEditor = (input: SlateEditor) =>
    createSlateEditor({
      plugins: [BaseLinkPlugin],
      selection: input.selection,
      value: input.children,
    });

  it('replaces link children when the text changes and keeps the first leaf marks', () => {
    const input = (
      <editor>
        <hp>
          <ha url="https://example.com">
            <htext bold>
              old
              <cursor />
            </htext>
            tail
          </ha>
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    upsertLinkText(editor, {
      text: 'new value',
      url: 'https://example.com',
    });

    expect(editor.children).toEqual(
      (
        <editor>
          <hp>
            <htext />
            <ha url="https://example.com">
              <htext bold>new value</htext>
            </ha>
            <htext />
          </hp>
        </editor>
      ).children
    );
  });

  it('does nothing when the requested text matches the current link text', () => {
    const input = (
      <editor>
        <hp>
          <ha url="https://example.com">
            same
            <cursor />
          </ha>
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    upsertLinkText(editor, {
      text: 'same',
      url: 'https://example.com',
    });

    expect(editor.children).toEqual(input.children);
  });

  it('does nothing when no replacement text is provided', () => {
    const input = (
      <editor>
        <hp>
          <ha url="https://example.com">
            keep
            <cursor />
          </ha>
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor(input);

    upsertLinkText(editor, {
      url: 'https://example.com',
    });

    expect(editor.children).toEqual(input.children);
  });
});

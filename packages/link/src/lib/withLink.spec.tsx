/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { BaseLinkPlugin } from './BaseLinkPlugin';

jsxt;

const createClipboardData = (text: string) =>
  ({
    getData: () => text,
  }) as any;

const createLinkEditor = (input: SlateEditor, options?: Record<string, any>) =>
  createSlateEditor({
    plugins: [
      options
        ? BaseLinkPlugin.configure({
            options,
          })
        : BaseLinkPlugin,
    ],
    selection: input.selection,
    value: input.children,
  });

describe('withLink', () => {
  describe('insertData', () => {
    it('inserts a link when plain url text is pasted into a paragraph', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);
      editor.tf.insertData(createClipboardData('http://google.com'));

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              test
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });

    it('keeps the selected text by default when a url is pasted over a selection', () => {
      const input = (
        <editor>
          <hp>
            start <anchor />
            of regular text
            <focus />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);
      editor.tf.insertData(createClipboardData('https://google.com'));

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              start <ha url="https://google.com">of regular text</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });

    it('can replace the selected text with the pasted url when configured', () => {
      const input = (
        <editor>
          <hp>
            start <anchor />
            of regular text
            <focus />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input, {
        keepSelectedTextOnPaste: false,
      });
      editor.tf.insertData(createClipboardData('https://google.com'));

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              start <ha url="https://google.com">https://google.com</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });
  });

  describe('insertText', () => {
    it('wraps a plain url when the trailing space is inserted', () => {
      const input = (
        <editor>
          <hp>
            link: http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);
      editor.tf.insertText(' ');

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              link: <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ).children
      );
    });

    it('uses getUrlHref when the visible text is not itself a valid href', () => {
      const input = (
        <editor>
          <hp>
            google.com
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input, {
        getUrlHref: () => 'http://google.com',
      });
      editor.tf.insertText(' ');

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">google.com</ha>{' '}
            </hp>
          </editor>
        ).children
      );
    });
  });

  describe('insertBreak', () => {
    it('finalizes an autolink before creating the next block', () => {
      const input = (
        <editor>
          <hp>
            http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);
      editor.tf.insertBreak();

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
            <hp>
              <cursor />
            </hp>
          </editor>
        ).children
      );
    });
  });

  describe('removeEmpty', () => {
    it('removes an empty link after its full contents are deleted', () => {
      const input = (
        <editor>
          <hp>
            Before <ha url="http://example.com">link text</ha> after
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);

      editor.tf.select({
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 9, path: [0, 1, 0] },
      });
      editor.tf.deleteFragment();

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>Before {` `}after</hp>
          </editor>
        ).children
      );
    });

    it('keeps the link node when it still contains a zero-width space', () => {
      const input = (
        <editor>
          <hp>
            Before <ha url="http://example.com">link text</ha> after
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = createLinkEditor(input);

      editor.tf.select({
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 9, path: [0, 1, 0] },
      });
      editor.tf.insertText('\u200B');
      editor.tf.normalize();

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>
              Before <ha url="http://example.com">{'\u200B'}</ha> after
            </hp>
          </editor>
        ).children
      );
    });
  });
});

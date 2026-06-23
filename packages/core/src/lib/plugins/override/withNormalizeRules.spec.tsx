/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createBasePlateEditor } from '../../editor';
import { createEditorPlugin } from '../../plugin/createEditorPlugin';

jsxt;

const createElementPlugin = ({
  key,
  match,
  normalizeRules,
  type = key,
}: {
  key: string;
  match?: ({ node }: any) => boolean;
  normalizeRules?: Record<string, unknown>;
  type?: string;
}) =>
  createEditorPlugin({
    key,
    node: {
      isElement: true,
      type,
    },
    ...(normalizeRules || match
      ? {
          rules: {
            ...(normalizeRules ? { normalize: normalizeRules } : {}),
            ...(match ? { match } : {}),
          },
        }
      : {}),
  });

const getNormalizedEditor = ({
  input,
  plugins,
  times = 1,
}: {
  input: any;
  plugins: any[];
  times?: number;
}) => {
  const editor = createBasePlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

  for (let i = 0; i < times; i++) {
    editor.tf.normalize({ force: true });
  }

  return editor;
};

describe('withNormalizeRules', () => {
  describe('remove-empty normalization', () => {
    it('removes an empty inline element during normalization', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
            </element>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'link',
            normalizeRules: { removeEmpty: true },
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });

    it('keeps an inline element with content during normalization', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              Link text
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext />
            <element type="link" url="http://google.com">
              Link text
              <cursor />
            </element>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'link',
            normalizeRules: { removeEmpty: true },
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('default normalization behavior', () => {
    it.each([
      ['without normalize rules', undefined],
      ['with removeEmpty disabled', { removeEmpty: false }],
    ])('%s keeps an empty inline element intact', (_label, normalizeRules) => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext />
            <element type="link" url="http://google.com">
              <cursor />
            </element>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'link',
            normalizeRules: normalizeRules as
              | Record<string, unknown>
              | undefined,
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });

    it('keeps an empty inline element when the node only contains htext', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <htext />
            <element type="link" url="http://google.com">
              <htext />
              <cursor />
            </element>
            <htext />
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [createElementPlugin({ key: 'link' })],
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('match overrides', () => {
    it('uses the matching override instead of the base normalize behavior', () => {
      const input = (
        <editor>
          <element customProperty="customValue" type="paragraph">
            <htext />
          </element>
          <hp>after</hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>after</hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'paragraph',
          }),
          createElementPlugin({
            key: 'customOverride',
            match: ({ node }) => Boolean(node.customProperty) as any,
            normalizeRules: { removeEmpty: true },
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });

    it('falls back to the base normalize behavior when the override does not match', () => {
      const input = (
        <editor>
          <hp>
            <element type="paragraph">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <element type="paragraph">
              <cursor />
            </element>
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'paragraph',
          }),
          createElementPlugin({
            key: 'customOverride',
            match: ({ node }) => Boolean(node.customProperty) as any,
            normalizeRules: { removeEmpty: true },
            type: 'override',
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('multiple empty elements', () => {
    it('removes multiple empty elements of the same type', () => {
      const input = (
        <editor>
          <hp>
            <element type="link" url="http://google.com">
              <htext />
            </element>
            <element type="link" url="http://example.com">
              <htext />
            </element>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'link',
            normalizeRules: { removeEmpty: true },
          }),
        ],
        times: 2,
      });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('nested empty elements', () => {
    it('removes an empty paragraph without removing a sibling blockquote', () => {
      const input = (
        <editor>
          <element type="paragraph">
            <htext />
          </element>
          <element type="blockquote">quote</element>
        </editor>
      ) as any;

      const output = (
        <editor>
          <element type="blockquote">quote</element>
        </editor>
      ) as any;

      const editor = getNormalizedEditor({
        input,
        plugins: [
          createElementPlugin({
            key: 'blockquote',
          }),
          createElementPlugin({
            key: 'paragraph',
            normalizeRules: { removeEmpty: true },
          }),
        ],
      });

      expect(editor.children).toEqual(output.children);
    });
  });
});

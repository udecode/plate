/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';
import { ParagraphPlugin } from '@udecode/plate/react';

import { NormalizeTypesPlugin } from './NormalizeTypesPlugin';

jsxt;

describe('empty', () => {
  const input = createEditor(
    (
      <editor>
        <element />
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <element>
        <hh1>
          <htext />
        </hh1>
        <hp>
          <htext />
        </hp>
      </element>
    </editor>
  ) as any;

  it('should be', () => {
    const editor = createSlateEditor({
      plugins: [
        NormalizeTypesPlugin.configure({
          options: {
            rules: [
              {
                path: [0, 0],
                strictType: 'h1',
              },
              { path: [0, 1], type: ParagraphPlugin.key },
            ],
          },
        }),
      ],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalizeNode([input, []]);

    expect(editor.children).toEqual(output.children);
  });

  describe('type insert', () => {
    const input = createEditor(
      (
        <editor>
          <hh1>test</hh1>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hh1>test</hh1>
        <hh2>
          <htext />
        </hh2>
      </editor>
    ) as any;

    it('should be', () => {
      const editor = createSlateEditor({
        plugins: [
          NormalizeTypesPlugin.configure({
            options: {
              rules: [{ path: [1], type: 'h2' }],
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalizeNode([input, []]);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('type set', () => {
    const input = createEditor(
      (
        <editor>
          <hh2>test</hh2>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hh2>test</hh2>
        <hh2>test</hh2>
        <hh2>test</hh2>
      </editor>
    ) as any;

    it('should be', () => {
      const editor = createSlateEditor({
        plugins: [
          NormalizeTypesPlugin.configure({
            options: {
              rules: [{ path: [0], type: 'h1' }],
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalizeNode([input, []]);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('strictType insert', () => {
    const input = createEditor(
      (
        <editor>
          <hh1>test</hh1>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hh1>test</hh1>
        <hh2>
          <htext />
        </hh2>
      </editor>
    ) as any;

    it('should be', () => {
      const editor = createSlateEditor({
        plugins: [
          NormalizeTypesPlugin.configure({
            options: {
              rules: [{ path: [1], strictType: 'h2' }],
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalizeNode([input, []]);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('strictType set', () => {
    const input = createEditor(
      (
        <editor>
          <hh2>test</hh2>
          <hh2>test</hh2>
          <hh2>test</hh2>
        </editor>
      ) as any
    );

    const output = (
      <editor>
        <hh1>test</hh1>
        <hh2>test</hh2>
        <hh2>test</hh2>
      </editor>
    ) as any;

    it('should be', () => {
      const editor = createSlateEditor({
        plugins: [
          NormalizeTypesPlugin.configure({
            options: {
              rules: [{ path: [0], strictType: 'h1' }],
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.normalizeNode([input, []]);

      expect(editor.children).toEqual(output.children);
    });
  });
});

/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import type { Editor, LegacyEditorMethods } from '../interfaces';
import { syncLegacyMethods } from './assignLegacyTransforms';
import { deleteMerge } from './deleteMerge';

jsxt;

const withInlineVoid = (editor: Editor & LegacyEditorMethods) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => element.type === 'img' || isInline(element);
  editor.isVoid = (element) => element.type === 'img' || isVoid(element);
  syncLegacyMethods(editor);

  return editor;
};

describe('deleteMerge', () => {
  it('returns early when there is no selection and no explicit location', () => {
    const editor: any = createEditor({
      children: [{ children: [{ text: 'one' }], type: 'p' }] as any,
    });

    editor.selection = null;

    deleteMerge(editor);

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
    ]);
  });

  it('removes the node at a path location', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    deleteMerge(editor, { at: [1] });

    expect(editor.children).toEqual(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ).children
    );
  });

  it('deletes the next character from a collapsed point and keeps the cursor in place', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    deleteMerge(editor);

    const output = (
      <editor>
        <hp>
          wo
          <cursor />d
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('deletes the previous character when reverse is true', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    deleteMerge(editor, { reverse: true });

    const output = (
      <editor>
        <hp>
          w
          <cursor />
          rd
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('merges blocks when deleting an expanded cross-block selection', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <anchor />
            rd
          </hp>
          <hp>
            an
            <focus />
            other
          </hp>
        </editor>
      ) as any
    );

    deleteMerge(editor);

    const output = (
      <editor>
        <hp>
          wo
          <cursor />
          other
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('treats an explicitly collapsed range like its anchor point', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    deleteMerge(editor, { at: editor.selection });

    expect(editor.children).toEqual([
      { children: [{ text: 'wod' }], type: 'p' },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
  });

  it('removes fully covered middle blocks before merging the edges', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            one
            <anchor />
          </hp>
          <hp>middle</hp>
          <hp>
            <focus />
            three
          </hp>
        </editor>
      ) as any
    );

    deleteMerge(editor);

    const output = (
      <editor>
        <hp>
          one
          <cursor />
          three
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('removes an inline void when given a point inside it', () => {
    const editor = withInlineVoid(
      createEditor(
        (
          <editor>
            <hp>
              <htext>one</htext>
              <himg>
                <htext />
              </himg>
              <htext>two</htext>
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods
    );

    deleteMerge(editor, { at: { offset: 0, path: [0, 1, 0] } });

    expect(editor.children).toEqual([
      {
        children: [{ text: 'onetwo' }],
        type: 'p',
      },
    ]);
  });

  it('nudges a start point out of an inline void before deleting', () => {
    const editor = withInlineVoid(
      createEditor({
        children: [
          {
            children: [
              { text: 'one' },
              { children: [{ text: '' }], type: 'img' },
              { text: 'two' },
              { text: 'three' },
            ],
            type: 'p',
          },
        ] as any,
        selection: {
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 3, path: [0, 2] },
        },
      }) as Editor & LegacyEditorMethods
    );

    deleteMerge(editor);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'onethree' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('nudges an end point out of an inline void before deleting', () => {
    const editor = withInlineVoid(
      createEditor({
        children: [
          {
            children: [
              { text: 'one' },
              { text: 'two' },
              { children: [{ text: '' }], type: 'img' },
              { text: 'three' },
            ],
            type: 'p',
          },
        ] as any,
        selection: {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 0, path: [0, 2, 0] },
        },
      }) as Editor & LegacyEditorMethods
    );

    deleteMerge(editor);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'onethree' }],
        type: 'p',
      },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });
});

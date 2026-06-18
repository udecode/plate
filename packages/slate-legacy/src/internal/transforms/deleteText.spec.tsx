/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';
import type { Editor, LegacyEditorMethods } from '../../interfaces';
import { syncLegacyMethods } from '../../utils/assignLegacyTransforms';

jsxt;

const withInlineVoid = (editor: Editor & LegacyEditorMethods) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => element.type === 'img' || isInline(element);
  editor.isVoid = (element) => element.type === 'img' || isVoid(element);
  syncLegacyMethods(editor);

  return editor;
};

const withReadOnlyInline = (editor: Editor & LegacyEditorMethods) => {
  const { isElementReadOnly, isInline } = editor;

  editor.isInline = (element) =>
    element.type === 'mention' || isInline(element);
  editor.isElementReadOnly = (element) =>
    element.type === 'mention' || isElementReadOnly(element);
  syncLegacyMethods(editor);

  return editor;
};

describe('deleteText', () => {
  it('deletes one character forward from a collapsed text selection', () => {
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

    editor.delete();

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

  it('removes the node at a path location', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    editor.delete({ at: [1] });

    expect(editor.children).toEqual(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ).children
    );
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

    editor.delete();

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

  it('deletes an inline void when moving forward from before it', () => {
    const editor = withInlineVoid(
      createEditor(
        (
          <editor>
            <hp>
              <htext>
                <cursor />
              </htext>
              <himg>
                <htext />
              </himg>
              <htext />
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods
    );

    editor.delete();

    const output = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('removes an inline void when deleting from a point inside it', () => {
    const editor = withInlineVoid(
      createEditor(
        (
          <editor>
            <hp>
              <himg>
                <htext>
                  <cursor />
                </htext>
              </himg>
              <htext>after</htext>
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods
    );

    editor.delete();

    expect(editor.children).toEqual(
      (
        <editor>
          <hp>
            <htext>after</htext>
          </hp>
        </editor>
      ).children
    );
  });

  it('nudges backward around a read-only inline before deleting it', () => {
    const editor = withReadOnlyInline(
      createEditor(
        (
          <editor>
            <hp>
              <htext />
              <hmention>read-only inline</hmention>
              <htext>
                <cursor />
              </htext>
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods
    );

    editor.delete({ reverse: true });

    const output = (
      <editor>
        <hp>
          <htext>
            <cursor />
          </htext>
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('re-inserts remaining Thai code points after backward character deletion', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            พี่
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.delete({ distance: 2, reverse: true, unit: 'character' });

    const output = (
      <editor>
        <hp>
          พ
          <cursor />
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('no-ops when deleting forward from the end of the document', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            word
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    editor.delete();

    const output = (
      <editor>
        <hp>
          word
          <cursor />
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });
});

/** @jsx jsx */

import { type PlateEditor, createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createListPlugin } from './createListPlugin';

jsx;

describe('p (empty) + list when selection not in list', () => {
  it('should remove the p', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('p /w text + list when selection not in list', () => {
  it('should merge the texts', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>onetwo</hp>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });

  it('should merge the texts but keep the rest of the list', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
        <hul>
          <hli>
            <hlic>two</hlic>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>onetwo</hp>
        <hul>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });

  it('should merge the texts and move up its first child', () => {
    const input = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
        <hul>
          <hli>
            <hlic>two</hlic>
            <hul>
              <hli>
                <hlic>twoone</hlic>
              </hli>
              <hli>
                <hlic>twotwo</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>onetwo</hp>
        <hul>
          <hli>
            <hlic>twoone</hlic>
            <hul>
              <hli>
                <hlic>twotwo</hlic>
              </hli>
            </hul>
          </hli>
          <hli>
            <hlic>three</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('list + list when selection is at the end of the first list', () => {
  it('should merge the two list together', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>oneone</hlic>
          </hli>
          <hli>
            <hlic>
              onetwo
              <cursor />
            </hlic>
          </hli>
        </hul>
        <hul>
          <hli>
            <hlic>twoone</hlic>
          </hli>
          <hli>
            <hlic>twotwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>oneone</hlic>
          </hli>
          <hli>
            <hlic>onetwo</hlic>
          </hli>
          <hli>
            <hlic>twoone</hlic>
          </hli>
          <hli>
            <hlic>twotwo</hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('list where second item has multiple children', () => {
  it('should merge all text into first list item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <htext />
              <cursor />
            </hlic>
          </hli>
          <hli>
            <hlic>
              <htext>one</htext>
              <htext bold>two</htext>
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>
              <htext>
                <cursor />
                one
              </htext>
              <htext bold>two</htext>
            </hlic>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('list + sublist where second item has multiple children', () => {
  it('should merge all text into first sublist item', () => {
    const input = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>
                  <htext />
                  <cursor />
                  <hul>
                    <hli>
                      <hlic>
                        <htext>two</htext>
                        <htext bold>three</htext>
                      </hlic>
                    </hli>
                  </hul>
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hul>
          <hli>
            <hlic>one</hlic>
            <hul>
              <hli>
                <hlic>
                  <htext>
                    <cursor />
                    two
                  </htext>
                  <htext bold>three</htext>
                </hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createListPlugin()],
    });

    editor.deleteForward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

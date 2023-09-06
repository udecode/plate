/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createTodoListPlugin } from './todo-list';

jsx;

describe('two checkboxes with selection at the start of the second', () => {
  it('should merge the children', () => {
    const input = (
      <editor>
        <htodoli>one</htodoli>
        <htodoli>
          <cursor />
          two
        </htodoli>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <htodoli>onetwo</htodoli>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createTodoListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('checkbox with selection at start', () => {
  it('should remove the list item', () => {
    const input = (
      <editor>
        <htodoli>
          <cursor />
          one
        </htodoli>
        <htodoli>two</htodoli>
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <hp>one</hp>
        <htodoli>two</htodoli>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createTodoListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

describe('empty todoli followed by text node with content, selection at start of text node', () => {
  it('should move content into todo list item', () => {
    const input = (
      <editor>
        <htodoli>one</htodoli>
        <htodoli>
          <htext />
        </htodoli>
        <cursor />
        two
      </editor>
    ) as any as PlateEditor;

    const expected = (
      <editor>
        <htodoli>one</htodoli>
        <htodoli>two</htodoli>
      </editor>
    ) as any as PlateEditor;

    const editor = createPlateEditor({
      editor: input,
      plugins: [createTodoListPlugin()],
    });

    editor.deleteBackward('character');

    expect(editor.children).toEqual(expected.children);
  });
});

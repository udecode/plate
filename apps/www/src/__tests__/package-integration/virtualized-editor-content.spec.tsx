import { render } from '@testing-library/react';
import {
  createEditor,
  definePlugin,
  EditorContent,
  EditorRoot,
  ParagraphPlugin,
} from 'platejs/react';
import { VirtualizedEditorContent } from 'platejs/react/virtualized';
import React from 'react';

test('an editor nested in a slot of a virtualized editor renders its own unvirtualized editable', () => {
  const inner = createEditor({
    initialValue: [{ children: [{ text: 'inner' }], type: 'paragraph' }],
    plugins: [ParagraphPlugin],
  });
  const NestedEditor = definePlugin('nestedEditor', {
    slots: {
      afterEditable: () => (
        <EditorRoot editor={inner}>
          <EditorContent data-testid="inner" />
        </EditorRoot>
      ),
    },
  });
  const outer = createEditor({
    initialValue: [{ children: [{ text: 'outer' }], type: 'paragraph' }],
    plugins: [ParagraphPlugin, NestedEditor],
  });

  const { getByTestId } = render(
    <EditorRoot editor={outer}>
      <VirtualizedEditorContent data-testid="outer" />
    </EditorRoot>
  );
  const virtualized = (testId: string) =>
    getByTestId(testId).querySelector('[data-editor-virtualized-viewport]') !==
    null;

  expect({ inner: virtualized('inner'), outer: virtualized('outer') }).toEqual({
    inner: false,
    outer: true,
  });
});

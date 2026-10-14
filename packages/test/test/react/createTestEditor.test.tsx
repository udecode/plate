/// <reference types="@testing-library/jest-dom" />

import {
  createEditor,
  definePlugin,
  EditorContent,
  EditorRoot,
} from 'platejs/react';
import React from 'react';

import { createTestEditor } from '../../src/react';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

describe('createTestEditor', () => {
  it('finds the editable element when the editable takes another role', async () => {
    const result = await createTestEditor(
      { initialValue: [paragraph('one')] },
      { componentProps: { editableProps: { role: 'document' } } }
    );
    const rendered = result[2];

    expect(rendered.getByRole('document')).toHaveTextContent('one');
  });

  it('types into its own editor when a plugin renders another editor first', async () => {
    const inner = createEditor({ initialValue: [paragraph('inner')] });
    const NestedView = () => (
      <EditorRoot editor={inner}>
        <EditorContent />
      </EditorRoot>
    );
    const [editor, actions] = await createTestEditor({
      initialValue: [paragraph('outer')],
      plugins: [
        definePlugin('nested', { slots: { beforeEditable: NestedView } }),
      ],
    });

    await actions.selectAll();
    await actions.type('typed');

    expect(editor.read.children()).toEqual([paragraph('typed')]);
    expect(inner.read.children()).toEqual([paragraph('inner')]);
  });

  it('types into its own editor while another harness stays mounted', async () => {
    const [first] = await createTestEditor({
      initialValue: [paragraph('first')],
    });
    const [second, actions] = await createTestEditor({
      initialValue: [paragraph('second')],
    });

    await actions.selectAll();
    await actions.type('typed');

    expect(second.read.children()).toEqual([paragraph('typed')]);
    expect(first.read.children()).toEqual([paragraph('first')]);
  });

  it("keeps the caller's test id and ref on the editable", async () => {
    const callerRef = React.createRef<HTMLDivElement>();
    const result = await createTestEditor(
      { initialValue: [paragraph('one')] },
      {
        componentProps: {
          editableProps: { 'data-testid': 'caller', ref: callerRef },
        },
      }
    );
    const rendered = result[2];

    expect(callerRef.current).toBe(rendered.getByTestId('caller'));
  });
});

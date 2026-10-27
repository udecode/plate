import { act, render } from '@testing-library/react';
import React from 'react';

import { EditorRoot } from '../../components/Plate';
import { EditorContent } from '../../components/PlateContent';
import { createEditor } from '../../editor';
import { ParagraphPlugin } from '../../plugins/paragraph/ParagraphPlugin';
import { BoldPlugin } from '../basic-nodes/BasicNodesPlugins';
import { LinkPlugin } from './LinkPlugin';

const mountAtBoldLinkEnd = () => {
  const caret = { offset: 2, path: [0, 1, 0] };
  const editor = createEditor({
    initialValue: [
      {
        children: [
          { text: 'a ' },
          {
            children: [{ bold: true, text: 'ln' }],
            type: 'link',
            url: 'https://example.com',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ],
    plugins: [ParagraphPlugin, BoldPlugin, LinkPlugin],
    selection: { anchor: caret, focus: caret, kind: 'text' },
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      <EditorContent />
    </EditorRoot>
  );
  const editable = rendered.container.querySelector<HTMLElement>(
    '[contenteditable="true"]'
  )!;

  return { editable, editor };
};

it('a yank at a bold link’s end lands inside the link', async () => {
  const { editable, editor } = mountAtBoldLinkEnd();

  await act(async () => {
    editable.focus();
    editable.dispatchEvent(
      new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: 'Y',
        inputType: 'insertFromYank',
      })
    );
  });

  expect(editor.read.children()[0]).toMatchObject({
    children: [
      { text: 'a ' },
      { children: [{ bold: true, text: 'lnY' }] },
      { text: '' },
    ],
  });
});

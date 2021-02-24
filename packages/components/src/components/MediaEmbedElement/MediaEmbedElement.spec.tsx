import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { ELEMENT_MEDIA_EMBED } from '@udecode/slate-plugins';
import { Editor } from 'slate';
import * as SlateReact from 'slate-react';
import { ReactEditor } from 'slate-react';
import { MediaEmbedElement } from './MediaEmbedElement';

export const input = ((
  <editor>
    <hembed url="test" />
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hembed url="change">
      <cursor />
    </hembed>
  </editor>
) as any;

it('should render', () => {
  const editor = input;

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

  const { getByTestId } = render(
    <MediaEmbedElement
      data-testid="MediaEmbedUrlInput"
      attributes={{} as any}
      element={{
        type: ELEMENT_MEDIA_EMBED,
        url: 'test',
        children: [{ text: '' }],
      }}
    >
      test
    </MediaEmbedElement>
  );

  const element = getByTestId('MediaEmbedUrlInput');
  fireEvent.change(element, { target: { value: 'change' } });

  expect(editor.children).toEqual(output.children);
});

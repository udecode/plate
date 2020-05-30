import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { pipe } from 'common';
import { withToggleType } from 'element';
import { MEDIA_EMBED } from 'elements/media-embed';
import { MediaEmbedElement } from 'elements/media-embed/components';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';
import { input, output } from './onChange.fixture';

it('should render', () => {
  const editor = pipe(input, withToggleType());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

  const { getByTestId } = render(
    <MediaEmbedElement
      data-testid="MediaEmbedUrlInput"
      attributes={{} as any}
      element={{
        type: MEDIA_EMBED,
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

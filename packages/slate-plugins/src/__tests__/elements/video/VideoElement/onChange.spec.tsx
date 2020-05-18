import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { pipe } from 'common';
import { withBlock } from 'element';
import { VIDEO } from 'elements/video';
import { VideoElement } from 'elements/video/components';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';
import { input, output } from './onChange.fixture';

it('should render', () => {
  const editor = pipe(input, withBlock());

  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0]);

  const { getByTestId } = render(
    <VideoElement
      data-testid="VideoUrlInput"
      attributes={{} as any}
      element={{
        type: VIDEO,
        url: 'test',
        children: [{ text: '' }],
      }}
    >
      test
    </VideoElement>
  );

  const element = getByTestId('VideoUrlInput');
  fireEvent.change(element, { target: { value: 'change' } });

  expect(editor.children).toEqual(output.children);
});

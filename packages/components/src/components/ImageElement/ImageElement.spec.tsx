import * as React from 'react';
import { render } from '@testing-library/react';
import { ELEMENT_IMAGE } from '@udecode/slate-plugins';
import * as SlateReact from 'slate-react';
import { ImageElement } from './ImageElement';

it('should render', () => {
  jest.spyOn(SlateReact, 'useSelected').mockReturnValue(true);
  jest.spyOn(SlateReact, 'useFocused').mockReturnValue(true);

  const { getByTestId } = render(
    <ImageElement
      attributes={{} as any}
      element={{
        type: ELEMENT_IMAGE,
        children: [{ text: '' }],
        url: 'test',
      }}
    >
      test
    </ImageElement>
  );

  expect(getByTestId('ImageElementImage')).toBeVisible();
});

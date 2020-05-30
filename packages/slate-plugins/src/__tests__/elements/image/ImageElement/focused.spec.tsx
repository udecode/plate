import * as React from 'react';
import { render } from '@testing-library/react';
import { IMAGE } from 'elements/image';
import { ImageElement } from 'elements/image/components';
import * as SlateReact from 'slate-react';

it('should render', () => {
  jest.spyOn(SlateReact, 'useSelected').mockReturnValue(true);
  jest.spyOn(SlateReact, 'useFocused').mockReturnValue(true);

  const { getByTestId } = render(
    <ImageElement
      attributes={{} as any}
      element={{
        type: IMAGE,
        children: [{ text: '' }],
        url: 'test',
      }}
    >
      test
    </ImageElement>
  );

  expect(getByTestId('ImageElementImage')).toBeVisible();
});

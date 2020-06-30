import * as React from 'react';
import { render } from '@testing-library/react';
import * as SlateReact from 'slate-react';
import { IMAGE } from '../../../../elements/image';
import { ImageElement } from '../../../../elements/image/components';

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

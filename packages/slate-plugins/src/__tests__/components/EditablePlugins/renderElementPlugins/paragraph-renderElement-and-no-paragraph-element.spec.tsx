import * as React from 'react';
import { render } from '@testing-library/react';
import { HeadingType } from 'elements/heading';
import { renderElementParagraph } from 'elements/paragraph';
import { renderElementPlugins } from 'components/EditablePlugins/utils';

const elementAttributes = {
  'data-testid': 'Element',
  'data-slate-node': 'element',
  ref: null as any,
} as any;

const h1Element = { type: HeadingType.H1, children: [] };

it('should render the default element without data-slate-type', () => {
  const Element = renderElementPlugins([], [renderElementParagraph()]);

  const { getByTestId } = render(
    <Element attributes={elementAttributes} element={h1Element}>
      test
    </Element>
  );

  expect(getByTestId('Element')).not.toHaveAttribute('data-slate-type');
});

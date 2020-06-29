import * as React from 'react';
import { render } from '@testing-library/react';
import { renderElementParagraph } from '../../../../slate-plugins/src/elements/paragraph/renderElementParagraph';
import { PARAGRAPH } from '../../../../slate-plugins/src/elements/paragraph/types';
import { renderElementPlugins } from '../../utils/renderElementPlugins';

const elementAttributes = {
  'data-testid': 'Element',
  'data-slate-node': 'element',
  ref: null as any,
} as any;

const pElement = { type: PARAGRAPH, children: [] };

it('should render a paragraph component', () => {
  const Element = renderElementPlugins([], [renderElementParagraph()]);

  const { getByTestId } = render(
    <Element attributes={elementAttributes} element={pElement}>
      test
    </Element>
  );

  expect(getByTestId('Element')).toHaveAttribute('data-slate-type', PARAGRAPH);
});

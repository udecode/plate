import * as React from 'react';
import { render } from '@testing-library/react';
import { PARAGRAPH, ParagraphPlugin } from 'elements/paragraph';
import { renderElementPlugins } from 'components/EditablePlugins/utils';

const elementAttributes = {
  'data-testid': 'Element',
  'data-slate-node': 'element',
  ref: null as any,
} as any;

const pElement = { type: PARAGRAPH, children: [] };

it('should render a paragraph component', () => {
  const Element = renderElementPlugins([ParagraphPlugin()], []);

  const { getByTestId } = render(
    <Element attributes={elementAttributes} element={pElement}>
      test
    </Element>
  );

  expect(getByTestId('Element')).toHaveAttribute('data-slate-type', PARAGRAPH);
});

import React from 'react';
import { render } from '@testing-library/react';
import { EditablePlugins, SlatePlugins } from '@udecode/slate-plugins-core';
import { initialValuePreview } from '../../../../../../stories/config/initialValues';
import { HeadingPlugin } from '../../../elements/heading/HeadingPlugin';
import { ParagraphPlugin } from '../../../elements/paragraph/ParagraphPlugin';
import { PreviewPlugin } from '../PreviewPlugin';

const Editor = () => {
  return (
    <SlatePlugins initialValue={initialValuePreview}>
      <EditablePlugins
        data-testid="EditablePlugins"
        plugins={[ParagraphPlugin(), HeadingPlugin(), PreviewPlugin()]}
      />
    </SlatePlugins>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<Editor />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});

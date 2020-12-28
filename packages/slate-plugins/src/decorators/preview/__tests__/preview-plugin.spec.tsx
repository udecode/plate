import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { EditablePlugins, pipe } from '@udecode/slate-plugins-core';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValuePreview } from '../../../../../../stories/config/initialValues';
import { HeadingPlugin } from '../../../elements/heading/HeadingPlugin';
import { ParagraphPlugin } from '../../../elements/paragraph/ParagraphPlugin';
import { PreviewPlugin } from '../PreviewPlugin';

const Editor = () => {
  const [value, setValue] = useState<Node[]>(initialValuePreview);

  const withPlugins = [withReact, withHistory] as const;

  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), [
    withPlugins,
  ]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <EditablePlugins
        data-testid="EditablePlugins"
        plugins={[ParagraphPlugin(), HeadingPlugin(), PreviewPlugin()]}
      />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<Editor />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});

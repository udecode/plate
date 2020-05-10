import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { EditablePlugins } from 'components';

const EditorEmpty = () => {
  const [value, setValue] = useState<Node[]>([]);

  const editor = withHistory(withReact(createEditor()));

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <EditablePlugins data-testid="EditablePlugins" />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<EditorEmpty />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});

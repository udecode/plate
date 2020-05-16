import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import * as isSelecting from 'components/queries';
import { HoveringToolbar } from 'components/Toolbar';

const Editor = () => {
  const [value, setValue] = useState<Node[]>([
    { children: [{ text: 'test' }] },
  ]);

  const editor = withHistory(withReact(createEditor()));

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <HoveringToolbar data-testid="Toolbar">test</HoveringToolbar>
    </Slate>
  );
};

it('should render', () => {
  jest.spyOn(isSelecting, 'isSelecting').mockReturnValue(true);

  const { getByTestId } = render(<Editor />);

  expect(getByTestId('Toolbar')).not.toBeVisible();
});

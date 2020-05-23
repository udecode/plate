import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import * as isSelecting from 'components/queries';
import { BalloonToolbar } from 'components/Toolbar';

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
      <BalloonToolbar data-testid="Toolbar">test</BalloonToolbar>
    </Slate>
  );
};

it('should render', () => {
  jest.spyOn(isSelecting, 'isSelecting').mockReturnValue(true);

  const { getByTestId } = render(<Editor />);

  expect(getByTestId('Toolbar')).not.toBeVisible();
});

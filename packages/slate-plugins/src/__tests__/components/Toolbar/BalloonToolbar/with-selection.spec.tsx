import React, { useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
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
      <BalloonToolbar>test</BalloonToolbar>
    </Slate>
  );
};

it('should not be visible', () => {
  const { getByTestId } = render(<Editor />);

  expect(getByTestId('Toolbar')).not.toBeVisible();
});

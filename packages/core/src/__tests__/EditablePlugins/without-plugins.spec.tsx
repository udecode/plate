import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe } from '../../../../slate-plugins/src/common/utils/pipe';
import { EditablePlugins } from '../../components';

const EditorEmpty = () => {
  const [value, setValue] = useState<Node[]>([]);

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
      <EditablePlugins data-testid="EditablePlugins" />
    </Slate>
  );
};

it('should render', () => {
  const { getAllByTestId } = render(<EditorEmpty />);

  expect(getAllByTestId('EditablePlugins').length).toBeGreaterThan(0);
});

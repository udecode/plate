import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node, Point } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { Decorate, UseEditableOptions } from '../..';
import { EditablePlugins } from '../../components';
import { pipe } from '../../utils/pipe';

const EditorWithDecorateDeps = ({
  decorate,
  decorateDeps,
}: {
  decorate: UseEditableOptions['decorate'];
  decorateDeps: UseEditableOptions['decorateDeps'];
}) => {
  const [value, setValue] = useState<Node[]>([]);

  const editor = useMemo(() => {
    const withPlugins = [withReact, withHistory] as const;

    return pipe(createEditor(), ...withPlugins);
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
      }}
    >
      <EditablePlugins
        data-testid="DecorateDepsWithoutPlugin"
        decorate={decorate}
        decorateDeps={decorateDeps}
      />
    </Slate>
  );
};

it('should decorate with deps', () => {
  const point: Point = { path: [0, 0], offset: 0 };
  const range = { anchor: point, focus: point };
  const decorate: Decorate = jest.fn(() => [range]);
  const { getAllByTestId } = render(
    <EditorWithDecorateDeps decorate={[decorate]} decorateDeps={[1]} />
  );
  // make sure everything rendered
  expect(getAllByTestId('DecorateDepsWithoutPlugin').length).toBeGreaterThan(0);
  expect(decorate).toHaveBeenCalledTimes(1);
});

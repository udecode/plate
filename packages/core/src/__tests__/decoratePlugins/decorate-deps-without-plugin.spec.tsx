import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node, Point } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe } from '../../../../slate-plugins/src/common/utils/pipe';
import { Decorate } from '../..';
import { EditablePlugins, EditablePluginsProps } from '../../components';

const EditorWithDecorateDeps = ({
  decorate,
  decorateDeps,
}: {
  decorate: EditablePluginsProps['decorate'];
  decorateDeps: EditablePluginsProps['decorateDeps'];
}) => {
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

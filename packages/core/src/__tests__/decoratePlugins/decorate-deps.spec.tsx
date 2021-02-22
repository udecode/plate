import React, { useMemo, useState } from 'react';
import { render } from '@testing-library/react';
import { createEditor, Node, Point } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { pipe } from '../../../../slate-plugins/src/common/utils/pipe';
import { Decorate, SlatePlugin } from '../..';
import { EditablePlugins, EditablePluginsProps } from '../../components';

const EditorWithDecorateDeps = ({
  decorate,
  decorateDeps,
  plugins,
}: {
  decorate: EditablePluginsProps['decorate'];
  decorateDeps: EditablePluginsProps['decorateDeps'];
  plugins: EditablePluginsProps['plugins'];
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
        data-testid="DecorateDeps"
        decorate={decorate}
        decorateDeps={decorateDeps}
        plugins={plugins}
      />
    </Slate>
  );
};

it('should decorate with deps', () => {
  const point: Point = { path: [0, 0], offset: 0 };
  const range = { anchor: point, focus: point };
  const decorate: Decorate = jest.fn(() => [range]);

  const plugins: SlatePlugin[] = [
    {
      decorateDeps: [1],
    },
  ];

  const { getAllByTestId } = render(
    <EditorWithDecorateDeps
      decorate={[decorate]}
      decorateDeps={[1]}
      plugins={plugins}
    />
  );
  // make sure everything rendered
  expect(getAllByTestId('DecorateDeps').length).toBeGreaterThan(0);
  expect(decorate).toHaveBeenCalledTimes(1);
});

import React from 'react';

import { NodeApi } from '@platejs/slate';
import { act, render } from '@testing-library/react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { PlateContent } from '../../components';
import { createPlateEditor } from '../../editor';
import { createPlatePlugin } from '../../plugin';
import { useElement } from './useElement';

describe('useElement', () => {
  const cellTexts: string[] = [];

  const CellText = () => {
    const element = useElement();
    const text = NodeApi.string(element);

    cellTexts.push(text);

    return null;
  };

  const layoutTexts: string[] = [];

  const CellLayoutText = () => {
    const element = useElement();

    React.useLayoutEffect(() => {
      layoutTexts.push(NodeApi.string(element));
    });

    return null;
  };

  const block =
    (Tag: 'div' | 'section') =>
    ({ attributes, children }: any) => <Tag {...attributes}>{children}</Tag>;

  const createEditor = () =>
    createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'table',
          node: { component: block('section'), isElement: true },
        }),
        createPlatePlugin({
          key: 'tr',
          node: { component: block('div'), isElement: true },
        }),
        createPlatePlugin({
          key: 'td',
          node: {
            component: ({ attributes, children }: any) => (
              <div {...attributes}>
                <CellText />
                <CellLayoutText />
                {children}
              </div>
            ),
            isElement: true,
          },
        }),
      ],
      value: [
        {
          children: Array.from({ length: 3 }, () => ({
            children: Array.from({ length: 3 }, () => ({
              children: [{ text: '' }],
              type: 'td',
            })),
            type: 'tr',
          })),
          type: 'table',
        },
      ],
    });

  const renderTable = () => {
    const editor = createEditor();

    render(
      <Plate editor={editor}>
        <PlateContent />
      </Plate>
    );

    cellTexts.length = 0;
    layoutTexts.length = 0;

    return editor;
  };

  it('re-renders only the cell whose element changed', async () => {
    const editor = renderTable();

    await act(async () => {
      editor.tf.insertText('a', { at: { offset: 0, path: [0, 1, 1, 0] } });
    });

    expect(new Set(cellTexts)).toEqual(new Set(['a']));
  });

  it('gives a changed cell its new element in the first render', async () => {
    const editor = renderTable();

    await act(async () => {
      editor.tf.insertText('a', { at: { offset: 0, path: [0, 1, 1, 0] } });
    });

    expect(layoutTexts).toEqual(['a']);
  });
});

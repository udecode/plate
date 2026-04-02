/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { render } from '@testing-library/react';

import { createSlatePlugin } from '../../lib';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateSlate } from '../components/PlateSlate';
import { createPlateEditor } from '../editor/withPlate';
import { useElement } from '../stores/element/useElement';
import { pluginRenderElement } from './pluginRenderElement';

const createValue = () =>
  [
    {
      children: [{ text: 'Body' }],
      marker: 'yes',
      type: 'p',
    },
  ] as any;

const renderPlugin = (editor: ReturnType<typeof createPlateEditor>) => {
  const element = editor.children[0] as any;
  const plugin = editor.getPlugin({ key: element.type })!;
  const renderElement = pluginRenderElement(editor, plugin as any);

  const RenderProbe = () =>
    renderElement({
      attributes: {} as any,
      children: 'Body',
      element,
      path: [0],
    } as any);

  return render(
    <Plate editor={editor}>
      <PlateSlate>
        <RenderProbe />
      </PlateSlate>
    </Plate>
  );
};

describe('pluginRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      plugins: [],
      value: createValue(),
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('slate-p');
  });

  it('keeps element context available for custom node components', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'p',
          node: {
            isElement: true,
            type: 'p',
          },
          render: {
            node: ({ attributes, children }) => {
              const element = useElement<any>();

              return (
                <p
                  {...attributes}
                  data-marker={element.marker}
                  data-testid="paragraph"
                >
                  {children}
                </p>
              );
            },
          },
        }),
      ],
      value: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('paragraph')).toHaveAttribute('data-marker', 'yes');
  });

  it('does not pass children into void render.as tags', () => {
    const editor = createPlateEditor({
      plugins: [
        createSlatePlugin({
          key: 'hr',
          node: {
            isElement: true,
            isVoid: true,
            type: 'hr',
          },
          render: {
            as: 'hr',
          },
        }),
      ],
      value: [
        {
          children: [{ text: '' }],
          type: 'hr',
        },
      ] as any,
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('hr[data-slate-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toBeEmptyDOMElement();
  });
});

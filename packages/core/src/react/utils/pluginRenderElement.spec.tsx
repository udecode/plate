/// <reference types="@testing-library/jest-dom" />

import React from 'react';

import { property, schema, target, type Element } from '@platejs/plite';
import { render } from '@testing-library/react';

import { BaseParagraphPlugin, defineBasePlugin } from '../../lib';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { TestPlate as Plate } from '../__tests__/TestPlate';
import { PlateRoot } from '../components/PlateRoot';
import type { PlateEditor } from '../editor/PlateEditor';
import { createPlateEditor } from '../editor/withPlate';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { useElement } from '../stores/element/useElement';
import { pluginRenderElement } from './pluginRenderElement';

const createValue = () =>
  [
    {
      children: [{ text: 'Body' }],
      marker: 'yes',
      type: 'paragraph',
    },
  ] as any;

const MarkerPlugin = defineBasePlugin('marker', {
  schema: () => ({
    properties: {
      marker: schema.elementProperty(property.string(), {
        target: target.element(BaseParagraphPlugin),
      }),
    },
  }),
});

const renderPlugin = (
  editor: PlateEditor,
  name: string = ParagraphPlugin.name
) => {
  const element = editor.read.children()[0] as any;
  const plugin = getCompiledPlatePlugin(editor, name)!;
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
      <PlateRoot>
        <RenderProbe />
      </PlateRoot>
    </Plate>
  );
};

describe('pluginRenderElement', () => {
  it('renders the default paragraph element with the paragraph plugin class', () => {
    const editor = createPlateEditor({
      plugins: [MarkerPlugin],
      initialValue: createValue(),
    });

    const { container } = renderPlugin(editor);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('plite-paragraph');
  });

  it('keeps element context available for custom node components', () => {
    const editor = createPlateEditor({
      plugins: [
        MarkerPlugin,
        ParagraphPlugin.configure({
          component: ({ attributes, children }) => {
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
        }),
      ],
      initialValue: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('paragraph')).toHaveAttribute('data-marker', 'yes');
  });

  it('passes each wrapper its own plugin API', () => {
    const WrapperPlugin = defineBasePlugin('wrapper', {
      api: () => ({
        isMarked: (element: Element) => element.marker === 'yes',
      }),
    }).extend({
      render: {
        belowNodes: ({ api, element }) =>
          api.isMarked(element)
            ? ({ children }) => (
                <section data-testid="wrapper">{children}</section>
              )
            : undefined,
      },
    });
    const editor = createPlateEditor({
      plugins: [MarkerPlugin, WrapperPlugin],
      initialValue: createValue(),
    });

    const { getByTestId } = renderPlugin(editor);

    expect(getByTestId('wrapper')).toHaveTextContent('Body');
  });

  it('preserves Plite children for void render.as tags', () => {
    const HorizontalRulePlugin = defineBasePlugin('horizontalRule', {
      schema: { element: { void: 'block' } },
      render: {
        as: 'hr',
      },
    });
    const editor = createPlateEditor({
      plugins: [HorizontalRulePlugin],
      initialValue: [
        {
          children: [{ text: '' }],
          type: 'horizontalRule',
        },
      ] as any,
    });

    const { container } = renderPlugin(editor, HorizontalRulePlugin.name);
    const element = container.querySelector('[data-plite-node="element"]');

    expect(element).toBeInTheDocument();
    expect(element?.tagName).toBe('DIV');
    expect(
      element?.querySelector('hr[contenteditable="false"]')
    ).toBeInTheDocument();
    expect(element).toHaveTextContent('Body');
  });
});

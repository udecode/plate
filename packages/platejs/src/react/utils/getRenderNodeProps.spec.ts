import { property, schema, target } from 'plitejs';

import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { BaseParagraphPlugin, defineBasePlugin } from '../../lib';
import { createEditor } from '../editor/withPlate';
import { ParagraphPlugin } from '../plugins/paragraph/ParagraphPlugin';
import { getRenderNodeProps } from './getRenderNodeProps';

describe('getRenderNodeProps', () => {
  it('keeps plain paragraph class merging on the fast path', () => {
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [],
      initialValue: [
        {
          children: [{ text: 'hello' }],
          type: 'paragraph',
        },
      ],
    });
    const element = editor.read.children()[0] as any;

    const result = getRenderNodeProps({
      disableInjectNodeProps: true,
      editor,
      plugin: getCompiledPlatePlugin(editor, 'paragraph') as any,
      props: {
        attributes: {
          className: 'attr-class',
          style: {},
        },
        children: null,
        className: 'user-class',
        element,
      } as any,
      readOnly: false,
    });

    expect(result.api).toBe(editor.api);
    expect(result.editor).toBe(editor);
    expect(result.attributes?.className).toContain('plite-paragraph');
    expect(result.attributes?.className).toContain('attr-class');
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes).not.toHaveProperty('style');
  });

  it('keeps plugin props, allowed attrs, and injected node props on the full path', () => {
    const CustomParagraphPlugin = ParagraphPlugin.extend(() => ({
      render: {
        nodeProps: (({ editor, element }: any) => {
          const innerTarget = element.attributes?.target;

          return {
            'data-has-editor': editor ? 'yes' : 'no',
            target: typeof innerTarget === 'string' ? innerTarget : undefined,
            title: undefined,
          };
        }) as any,
      },
    }));
    const AttributesPlugin = defineBasePlugin('paragraphAttributes', {
      schema: () => ({
        properties: {
          attributes: schema.elementProperty(property.json(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
    });
    const AlignPlugin = defineBasePlugin('align', {
      targetPlugins: [BaseParagraphPlugin],
      schema: () => ({
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      inject: {
        nodeProps: {
          nodeKey: 'align',
          styleKey: 'textAlign',
        },
      },
    });
    const editor = createEditor({
      navigationFeedback: false,
      plugins: [CustomParagraphPlugin, AttributesPlugin, AlignPlugin],
      initialValue: [
        {
          align: 'center',
          attributes: { ignored: 'nope', target: '_blank' },
          children: [{ text: 'hello' }],
          type: 'paragraph',
        },
      ],
    });
    const element = editor.read.children()[0] as any;

    const result = getRenderNodeProps({
      editor,
      plugin: getCompiledPlatePlugin(editor, CustomParagraphPlugin) as any,
      props: {
        attributes: { 'data-plite-align': 'center' },
        children: null,
        className: 'user-class',
        element,
      } as any,
      readOnly: false,
    });

    expect(result.attributes).toMatchObject({
      'data-has-editor': 'yes',
      style: { textAlign: 'center' },
      target: '_blank',
    });
    expect(result.attributes?.ignored).toBeUndefined();
    expect(result.attributes?.title).toBeUndefined();
    expect(result.attributes?.className).toContain('plite-paragraph');
    expect(result.attributes?.className).toContain('user-class');
    expect(result.attributes?.className).toContain('plite-align-center');
  });
});

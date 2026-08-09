/** @jsx jsxt */

import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  HeadingRules,
} from './BaseHeadingPlugins';
import { createBaseEditor, defineEditor } from '@platejs/core';
import { getPlateRuntime } from '@platejs/core/internal';
import { schema, SelectionApi } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

jsxt;

const headingPlugins = [
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
] as const;
const headingKeys = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
const headingNames = [
  PLUGINS.h1,
  PLUGINS.h2,
  PLUGINS.h3,
  PLUGINS.h4,
  PLUGINS.h5,
  PLUGINS.h6,
] as const;

describe('base heading plugins', () => {
  it('registers, decodes, and encodes every heading schema', () => {
    const editor = createBaseEditor({
      plugins: headingPlugins,
    });

    headingPlugins.forEach((plugin, index) => {
      const level = headingKeys[index]!;
      const resolvedPlugin = editor.plugin(plugin);
      const headingType = resolvedPlugin.schema.type;

      expect(resolvedPlugin.name).toBe(headingNames[index]);
      expect(editor.read.schema.element(headingType)).toBeDefined();
      expect(editor.read.schema.isElementTypeInGroup(level, 'block')).toBe(
        true
      );
      expect(editor.read.schema.create(headingType)).toMatchObject({
        children: [{ text: '' }],
        type: headingType,
      });
      expect(
        editor.api.html.deserialize({
          element: `<h${index + 1}>Heading</h${index + 1}>`,
        })
      ).toEqual([
        {
          children: [{ text: 'Heading' }],
          type: headingType,
        },
      ]);

      const point = { offset: 0, path: [0, 0] };
      const codecEditor = createBaseEditor({
        plugins: [plugin],
        selection: SelectionApi.node([0], { anchor: point, focus: point }),
        initialValue: [
          {
            children: [{ text: 'Heading' }],
            type: headingType,
          },
        ],
      });
      const data = new DataTransfer();

      codecEditor.api.dom.clipboard.writeSelection(data);

      const body = new DOMParser().parseFromString(
        data.getData('text/html'),
        'text/html'
      ).body;

      expect(body.querySelector(`h${index + 1}`)?.textContent).toBe('Heading');
    });
  });

  it('supports ordinary subset composition', () => {
    const editor = createBaseEditor({
      plugins: [BaseH1Plugin, BaseH3Plugin, BaseH5Plugin],
    });

    [BaseH1Plugin, BaseH3Plugin, BaseH5Plugin].forEach((plugin) => {
      expect(editor.plugin(plugin).name).toBe(plugin.name);
      expect(
        editor.read.schema.element(editor.plugin(plugin).schema.type)
      ).toBeDefined();
    });

    [BaseH2Plugin, BaseH4Plugin, BaseH6Plugin].forEach((plugin) => {
      expect(editor.plugin(plugin).installed).toBe(false);
      expect(editor.read.schema.element(plugin.name)).toBeNull();
    });
  });

  it('binds heading tx groups to block toggles', () => {
    const h1 = createBaseEditor({
      plugins: [BaseH1Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const h2 = createBaseEditor({
      plugins: [BaseH2Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const h3 = createBaseEditor({
      plugins: [BaseH3Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const h4 = createBaseEditor({
      plugins: [BaseH4Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const h5 = createBaseEditor({
      plugins: [BaseH5Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const h6 = createBaseEditor({
      plugins: [BaseH6Plugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    h1.update.blocks.toggle(h1.plugin(BaseH1Plugin).schema.type);
    h2.update.blocks.toggle(h2.plugin(BaseH2Plugin).schema.type);
    h3.update.blocks.toggle(h3.plugin(BaseH3Plugin).schema.type);
    h4.update.blocks.toggle(h4.plugin(BaseH4Plugin).schema.type);
    h5.update.blocks.toggle(h5.plugin(BaseH5Plugin).schema.type);
    h6.update.blocks.toggle(h6.plugin(BaseH6Plugin).schema.type);

    expect(h1.read.children()[0]).toMatchObject({ type: 'h1' });
    expect(h2.read.children()[0]).toMatchObject({ type: 'h2' });
    expect(h3.read.children()[0]).toMatchObject({ type: 'h3' });
    expect(h4.read.children()[0]).toMatchObject({ type: 'h4' });
    expect(h5.read.children()[0]).toMatchObject({ type: 'h5' });
    expect(h6.read.children()[0]).toMatchObject({ type: 'h6' });
  });
});

describe('heading input rules', () => {
  it('keeps markdown depth bound to the heading capability when its persisted type changes', () => {
    const definition = defineEditor('customHeadingType', {
      plugins: [
        BaseH2Plugin.configure({ inputRules: [HeadingRules.markdown()] }),
      ],
      schema: {
        overrides: [
          schema.override(BaseH2Plugin, {
            element: { type: 'sectionHeading' },
          }),
        ],
      },
    });
    const input = (
      <editor>
        <hp>
          ##
          <cursor />
          hello
        </hp>
      </editor>
    );
    const editor = createBaseEditor({
      plugins: definition.plugins,
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello' }], type: 'sectionHeading' },
    ]);
  });

  it('registers only the configured heading shorthand rules', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseH1Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
        BaseH3Plugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
    });
    const inputRules = getPlateRuntime(editor).inputRules;

    expect(inputRules.plugins.h1.rules.map((rule) => rule.id)).toEqual([
      'h1.0',
    ]);
    expect(inputRules.plugins.h3.rules.map((rule) => rule.id)).toEqual([
      'h3.0',
    ]);
    expect(inputRules.insertText.byTrigger[' '].map((rule) => rule.id)).toEqual(
      ['h1.0', 'h3.0']
    );
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            #
            <cursor />
            hello
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hh1>hello</hh1>
        </editor>
      ),
      title: 'promotes # into h1 on space',
      plugin: BaseH1Plugin.configure({
        inputRules: [HeadingRules.markdown()],
      }),
    },
    {
      input: (
        <editor>
          <hp>
            ##
            <cursor />
            hello
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hh2>hello</hh2>
        </editor>
      ),
      title: 'promotes ## into h2 on space',
      plugin: BaseH2Plugin.configure({
        inputRules: [HeadingRules.markdown()],
      }),
    },
  ])('$title', ({ input, output, plugin }) => {
    const editor = createBaseEditor({
      plugins: [plugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual(output.children);
  });
});

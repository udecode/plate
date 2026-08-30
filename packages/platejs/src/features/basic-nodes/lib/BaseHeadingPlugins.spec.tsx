/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  createEditor,
  getPlateRuntime,
  schema,
  SelectionApi,
  PLUGINS,
} from '../../../core';
import { BaseHeadingPlugin, HeadingRules } from './BaseHeadingPlugins';

jsxt;

describe('base heading plugin', () => {
  it('owns one heading capability with six semantic levels', () => {
    const editor = createEditor({ plugins: [BaseHeadingPlugin] });
    const plugin = editor.plugin(BaseHeadingPlugin);

    expect(plugin.name).toBe(PLUGINS.heading);
    expect(plugin.schema.type).toBe('heading');
    expect(editor.read.schema.element('heading')).toBeDefined();

    for (let level = 1; level <= 6; level++) {
      expect(
        editor.api.html.deserialize({
          element: `<h${level}>Heading ${level}</h${level}>`,
        })
      ).toEqual([
        {
          children: [{ text: `Heading ${level}` }],
          level,
          type: 'heading',
        },
      ]);
    }
  });

  it('encodes every heading level to its matching HTML element', () => {
    for (let level = 1; level <= 6; level++) {
      const editor = createEditor({
        plugins: [BaseHeadingPlugin],
        selection: SelectionApi.nodes([[0]]),
        initialValue: [
          {
            children: [{ text: 'Heading' }],
            level,
            type: 'heading',
          },
        ],
      });
      const data = new DataTransfer();

      editor.api.dom.clipboard.writeSelection(data);

      const { body } = new DOMParser().parseFromString(
        data.getData('text/html'),
        'text/html'
      );

      expect(body.querySelector(`h${level}`)?.textContent).toBe('Heading');
    }
  });

  it('toggles and switches heading levels through one update', () => {
    const editor = createEditor({
      plugins: [BaseHeadingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.heading.toggle({ level: 2 });
    expect(editor.read.children()[0]).toMatchObject({
      level: 2,
      type: 'heading',
    });

    editor.update.heading.toggle({ level: 5 });
    expect(editor.read.children()[0]).toMatchObject({
      level: 5,
      type: 'heading',
    });

    editor.update.heading.toggle({ level: 5 });
    expect(editor.read.children()[0]).toEqual({
      children: [{ text: 'text' }],
      type: 'paragraph',
    });
  });
});

describe('heading input rules', () => {
  it('keeps markdown depth bound to the heading capability when its persisted type changes', () => {
    const plugin = BaseHeadingPlugin.configure({
      inputRules: [HeadingRules.markdown()],
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
    const editor = createEditor({
      plugins: [plugin],
      schema: {
        overrides: [
          schema.override(BaseHeadingPlugin, {
            element: { type: 'sectionHeading' },
          }),
        ],
      },
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'hello' }],
        level: 2,
        type: 'sectionHeading',
      },
    ]);
  });

  it('registers one markdown rule for the heading capability', () => {
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
    });
    const { inputRules } = getPlateRuntime(editor);

    expect(inputRules.plugins.heading.rules.map((rule) => rule.id)).toEqual([
      'heading.0',
    ]);
    expect(inputRules.insertText.byTrigger[' '].map((rule) => rule.id)).toEqual(
      ['heading.0']
    );
  });

  it.each([
    ['#', 1],
    ['##', 2],
    ['###', 3],
    ['####', 4],
    ['#####', 5],
    ['######', 6],
  ])('promotes %s into level %s on space', (prefix, level) => {
    const input = (
      <editor>
        <hp>
          {prefix}
          <cursor />
          hello
        </hp>
      </editor>
    );
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin.configure({
          inputRules: [HeadingRules.markdown()],
        }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'hello' }], level, type: 'heading' },
    ]);
  });
});

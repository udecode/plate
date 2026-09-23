/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import { createEditor, schema, SelectionApi, PLUGINS } from '../../../core';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { BaseHeadingPlugin, HeadingRules } from './BaseHeadingPlugins';

jsxt;

const checkPrefixTypes = () => {
  schema.content.prefix(
    [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
    schema.content.group('block')
  );
  // @ts-expect-error Heading levels must come from the descriptor.
  schema.content.prefix(
    [{ element: BaseHeadingPlugin, properties: { level: 7 } }],
    schema.content.group('block')
  );
  // @ts-expect-error The heading descriptor does not own this property.
  schema.content.prefix(
    [{ element: BaseHeadingPlugin, properties: { unknown: true } }],
    schema.content.group('block')
  );
};
void checkPrefixTypes;

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

  it('declines a heading toggle that would violate a required title', () => {
    const initialValue = [
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ];
    const editor = createEditor({
      plugins: [BaseHeadingPlugin],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    expect(() => editor.update.heading.toggle({ level: 2 })).not.toThrow();
    expect(() =>
      editor.update((tx) => tx.blocks.set({ level: 2, type: 'heading' }))
    ).not.toThrow();
    expect(editor.read.children()).toEqual(initialValue);
  });

  it('resolves required title slots through schema overrides and checks raw values', () => {
    const root = schema.content.prefix(
      [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
      schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      })
    );
    const editor = createEditor({
      plugins: [BaseHeadingPlugin],
      schema: {
        overrides: [
          schema.override(BaseHeadingPlugin, {
            element: { type: 'sectionHeading' },
          }),
        ],
        root,
      },
      initialValue: [
        { children: [{ text: 'Title' }], level: 1, type: 'sectionHeading' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
    });

    expect(editor.read.children()[0]).toMatchObject({
      level: 1,
      type: 'sectionHeading',
    });
    expect(() =>
      createEditor({
        plugins: [BaseHeadingPlugin],
        schema: {
          root: schema.content.prefix(
            [{ element: 'heading', properties: { level: 7 } }],
            schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            })
          ),
        },
      })
    ).toThrow();
  });
});

describe('heading input rules', () => {
  it('promotes markdown in the body after a required title', () => {
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin.configure({ inputRules: [HeadingRules.markdown()] }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue: [
        { children: [{ text: 'Title' }], level: 1, type: 'heading' },
        { children: [{ text: '##' }], type: 'paragraph' },
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [1, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      { children: [{ text: '' }], level: 2, type: 'heading' },
    ]);
  });

  it('keeps markdown syntax and the space when a required title cannot become H2', () => {
    const initialValue = [
      { children: [{ text: '##' }], level: 1, type: 'heading' },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ];
    const editor = createEditor({
      plugins: [
        BaseHeadingPlugin.configure({ inputRules: [HeadingRules.markdown()] }),
      ],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue,
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
    });

    editor.update.text.insert(' ');

    expect(editor.read.children()).toEqual([
      { children: [{ text: '## ' }], level: 1, type: 'heading' },
      initialValue[1],
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

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

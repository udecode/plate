import { defineEditorSchema, schema, property } from '../../../facade';
import { BaseBlockquotePlugin } from '../../../features/basic-nodes/lib/BaseBlockPlugins';
import { BaseHeadingPlugin } from '../../../features/basic-nodes/lib/BaseHeadingPlugins';
import { BaseCalloutPlugin } from '../../../features/callout/lib/BaseCalloutPlugin';
import { deleteBackward, deleteForward, insertBreak } from '../../../testing';
import { createEditor } from '../../editor';
import { definePlugin } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

describe('OverridePlugin', () => {
  it('publishes a closed Plate schema for elements and text properties', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const TonePlugin = definePlugin('tone', {
      schema: { mark: { property: property.string() } },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin, TonePlugin],
      initialValue: [
        {
          children: [{ text: 'typed', tone: 'quiet' }],
          type: 'callout',
        },
      ],
    });

    expect(
      editor.read.schema.isBlock({
        children: [{ text: '' }],
        type: 'callout',
      })
    ).toBe(true);
    expect(() =>
      createEditor({
        plugins: [CalloutPlugin],
        initialValue: [{ children: [{ text: 'unknown' }], type: 'missing' }],
      })
    ).toThrow(/unknown editor element type "missing"/i);
    expect(() =>
      createEditor({
        plugins: [TonePlugin],
        initialValue: [
          { children: [{ text: 'invalid', tone: true }], type: 'paragraph' },
        ],
      })
    ).toThrow(/text property "tone".*string/i);
  });

  it('selects a previous block void before deleting it [EDIT-ATOMIC-BS-START-001]', () => {
    const VoidPlugin = definePlugin('void', {
      schema: { element: { void: 'block' } },
    });
    const editor = createEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.value().children).toEqual([
      { children: [{ text: '' }], type: 'void' },
      { children: [{ text: 'after' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('removes a selected block void without merging the next block into it', () => {
    const VoidPlugin = definePlugin('void', {
      schema: { element: { void: 'block' } },
    });
    const editor = createEditor({
      plugins: [VoidPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'void' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteForward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('applies the empty delete rule when a forward line deletion empties a heading', () => {
    const editor = createEditor({
      plugins: [BaseHeadingPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'Heading' }],
          level: 2,
          type: 'heading',
        },
        { children: [{ text: 'After' }], type: 'paragraph' },
      ],
    });

    deleteForward(editor, { unit: 'line' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });

    editor.api.history.undo();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Heading' }],
        level: 2,
        type: 'heading',
      },
      { children: [{ text: 'After' }], type: 'paragraph' },
    ]);
  });

  it('handles deleteExit through OverridePlugin command policy', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: {
          content: schema.content.open({ default: 'text', min: 1 }),
          ownsExit: true,
        },
      },
      rules: {
        break: {
          emptyLineEnd: 'deleteExit',
        },
      },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'foo\n' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'foo' }], type: 'callout' },
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
  });

  it('exits only the callout when Enter leaves its empty last line inside a quote [EDIT-GLOBAL-003]', () => {
    const editor = createEditor({
      plugins: [BaseBlockquotePlugin, BaseCalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'foo\n' }], icon: '💡', type: 'callout' },
          ],
          type: 'blockquote',
        },
      ],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'foo' }], icon: '💡', type: 'callout' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'blockquote',
      },
    ]);
  });

  it('keeps the line break when deleteExit has no room to land a block', () => {
    const CalloutPlugin = definePlugin('fullRootCallout', {
      schema: { element: schema.element.textBlock({ ownsExit: true }) },
      rules: { break: { emptyLineEnd: 'deleteExit' } },
    });
    const selection = {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    const editor = createEditor({
      plugins: [CalloutPlugin],
      schema: {
        root: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
          max: 1,
        }),
      },
      selection: { kind: 'text', ...selection },
      initialValue: [
        { children: [{ text: 'foo\n' }], type: 'fullRootCallout' },
      ],
    });

    insertBreak(editor);

    expect({
      children: editor.read.children(),
      selection: editor.read.selection(),
    }).toEqual({
      children: [{ children: [{ text: 'foo\n' }], type: 'fullRootCallout' }],
      selection,
    });
  });

  it('leaves an expanded selection to ordinary Enter under an exit rule', () => {
    const ExitPlugin = definePlugin('defaultExitBlock', {
      schema: { element: schema.element.textBlock() },
      rules: { break: { default: 'exit' } },
    });
    const editor = createEditor({
      plugins: [ExitPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'abcd' }], type: 'defaultExitBlock' },
      ],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a' }], type: 'defaultExitBlock' },
      { children: [{ text: 'd' }], type: 'defaultExitBlock' },
    ]);
  });

  it('exits only the callout inside a structural application root, in one undo step [EDIT-GLOBAL-003]', () => {
    const CalloutPlugin = definePlugin('structuralExitCallout', {
      schema: { element: schema.element.textBlock({ ownsExit: true }) },
      rules: { break: { emptyLineEnd: 'deleteExit' } },
    });
    const SectionPlugin = definePlugin('structuralExitSection', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, CalloutPlugin],
            { min: 1 }
          ),
        },
      },
    });
    const initialValue = [
      {
        children: [
          { children: [{ text: 'foo\n' }], type: 'structuralExitCallout' },
        ],
        type: 'structuralExitSection',
      },
    ];
    const editor = createEditor({
      plugins: [CalloutPlugin, SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 1 }),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      initialValue,
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'foo' }], type: 'structuralExitCallout' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'structuralExitSection',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });

    editor.api.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
  });

  it('leaves document-start deletion inside nested blocks to their owner', () => {
    const WrapperPlugin = definePlugin('wrapper', {
      schema: {
        element: {
          content: schema.content.open({
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    });
    const editor = createEditor({
      plugins: [WrapperPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
          type: 'wrapper',
        },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
        type: 'wrapper',
      },
    ]);
  });

  it('resets the empty block inserted at the start of a splitReset block', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      rules: { break: { splitReset: true } },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'foo' }], type: 'callout' }],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: 'foo' }], type: 'callout' },
    ]);
  });

  it('resets a nested block to its parent content default', () => {
    const CalloutPlugin = definePlugin('nestedResetCallout', {
      schema: { element: schema.element.textBlock() },
      rules: { break: { splitReset: true } },
    });
    const SectionPlugin = definePlugin('nestedResetSection', {
      schema: {
        element: {
          content: schema.content.elements(
            [BaseParagraphPlugin, CalloutPlugin],
            { min: 1 }
          ),
        },
      },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin, SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 1 }),
      },
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'foo' }], type: 'nestedResetCallout' },
          ],
          type: 'nestedResetSection',
        },
      ],
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'paragraph' },
          {
            children: [{ text: 'foo' }],
            type: 'nestedResetCallout',
          },
        ],
        type: 'nestedResetSection',
      },
    ]);
  });

  it('keeps the split when Enter at the end of a heading leaves a block with no default to reset to', () => {
    const SectionPlugin = definePlugin('optionalSection', {
      schema: {
        element: {
          content: schema.content.types(['paragraph', 'heading'], {
            min: 0,
          }),
        },
      },
    });
    const initialValue = [
      {
        children: [
          { children: [{ text: 'Title' }], level: 2, type: 'heading' },
        ],
        type: 'optionalSection',
      },
    ];
    const editor = createEditor({
      initialValue,
      plugins: [BaseHeadingPlugin, SectionPlugin],
      schema: { root: schema.content.element(SectionPlugin, { min: 1 }) },
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
      },
    });

    insertBreak(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: 'Title' }], level: 2, type: 'heading' },
          { children: [{ text: '' }], level: 2, type: 'heading' },
        ],
        type: 'optionalSection',
      },
    ]);

    editor.api.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
  });

  it('keeps the deletion when Backspace empties a heading with no default to reset to', () => {
    const SectionPlugin = definePlugin('optionalSection', {
      schema: {
        element: {
          content: schema.content.types(['paragraph', 'heading'], {
            min: 0,
          }),
        },
      },
    });
    const initialValue = [
      {
        children: [{ children: [{ text: 'A' }], level: 2, type: 'heading' }],
        type: 'optionalSection',
      },
    ];
    const editor = createEditor({
      initialValue,
      plugins: [BaseHeadingPlugin, SectionPlugin],
      schema: { root: schema.content.element(SectionPlugin, { min: 1 }) },
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
    });

    deleteBackward(editor);

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: '' }], level: 2, type: 'heading' }],
        type: 'optionalSection',
      },
    ]);

    editor.api.history.undo();

    expect(editor.read.children()).toEqual(initialValue);
  });

  it('preserves an empty merge target when its plugin disables removal', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
      rules: { merge: { removeEmpty: false } },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('stops at the first exact-leaf resolver decision, including false', () => {
    let laterCalls = 0;
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const PreserveCalloutPlugin = definePlugin('preserveCallout', {
      rules: {
        merge: {
          removeEmpty: ({ node }) =>
            node.type === CalloutPlugin.name ? false : undefined,
        },
      },
    });
    const RemoveEmptyPlugin = definePlugin('removeEmpty', {
      rules: {
        merge: {
          removeEmpty: () => {
            laterCalls += 1;

            return true;
          },
        },
      },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin, PreserveCalloutPlugin, RemoveEmptyPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(laterCalls).toBe(0);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('preserves plugin-owned empty merge targets by default', () => {
    const CalloutPlugin = definePlugin('callout', {
      schema: {
        element: { content: schema.content.open({ default: 'text', min: 1 }) },
      },
    });
    const MergeAwarePlugin = definePlugin('mergeAware', {
      rules: { merge: { removeEmpty: true } },
    });
    const editor = createEditor({
      plugins: [CalloutPlugin, MergeAwarePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: '' }], type: 'callout' },
        { children: [{ text: 'after' }], type: 'paragraph' },
      ],
    });

    deleteBackward(editor, { unit: 'character' });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'after' }], type: 'callout' },
    ]);
  });

  it('preserves schema-owned structural merge targets without a Plate plugin', () => {
    const ListSchema = defineEditorSchema('schema:schema-owned-list-merge', {
      elements: {
        'bulleted-list': {
          content: schema.content.type('list-item', {
            default: { type: 'list-item' },
            min: 1,
          }),
        },
        'list-item': {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      root: schema.content.type('bulleted-list', {
        default: { type: 'bulleted-list' },
        min: 1,
      }),
    });
    const editor = createEditor({
      plugins: [ListSchema],
      initialValue: [
        {
          children: [{ children: [{ text: '' }], type: 'list-item' }],
          type: 'bulleted-list',
        },
        {
          children: [{ children: [{ text: 'one' }], type: 'list-item' }],
          type: 'bulleted-list',
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.merge({ at: [1] });
    });

    expect(editor.read.children()).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'list-item' },
          { children: [{ text: 'one' }], type: 'list-item' },
        ],
        type: 'bulleted-list',
      },
    ]);
  });
});
